import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, submitLiveSnapshot, submitResult, handleAdminError } from '../services/api'
import { useSession } from '../context/SessionContext'
import { useCompetition } from '../context/CompetitionsContext'
import { getAdminPin } from '../context/adminPin'
import LcdCounter from '../components/LcdCounter'

const POLL_MS = 2500

const OUTCOMES = [
  { value: 'WIN',  label: 'Ganamos',  emoji: '🏆', active: 'bg-daylight-mint text-white border-daylight-mint',  inactive: 'border-daylight-mint-soft text-daylight-mint bg-daylight-mint-soft/50' },
  { value: 'LOSS', label: 'Perdimos', emoji: '😔', active: 'bg-daylight-red text-white border-daylight-red',    inactive: 'border-daylight-red-soft text-daylight-red bg-daylight-red-soft/50' },
  { value: 'DRAW', label: 'Empate',   emoji: '🤝', active: 'bg-daylight-ink text-white border-daylight-ink',    inactive: 'border-daylight-hair text-daylight-ink-sub' },
]

const emptyPair = () => ({ sets: [{ gamesHome: 0, gamesAway: 0 }] })

function pairFromResult(pair) {
  if (!pair || !pair.sets || pair.sets.length === 0) return emptyPair()
  return {
    sets: pair.sets.map(s => ({
      gamesHome: Number(s.gamesHome) || 0,
      gamesAway: Number(s.gamesAway) || 0,
    })),
  }
}

// Padel set rules:
// - First to 6 with ≥2 game margin → winner (6-0..6-4)
// - 5-5 / 6-5 continues; 7-5 → winner
// - 6-6 → tiebreak; 7-6 → winner
function setWinner(set) {
  const h = set.gamesHome, a = set.gamesAway
  if (h === 7 && a >= 5) return 'home'
  if (a === 7 && h >= 5) return 'away'
  if (h >= 6 && h - a >= 2) return 'home'
  if (a >= 6 && a - h >= 2) return 'away'
  return null
}

function countSetsWon(sets) {
  let home = 0, away = 0
  sets.forEach(s => {
    const w = setWinner(s)
    if (w === 'home') home++
    else if (w === 'away') away++
  })
  return { home, away }
}

function pairWinner(pair) {
  const { home, away } = countSetsWon(pair.sets)
  if (home >= 2) return 'home'
  if (away >= 2) return 'away'
  return null
}

function inferOutcome(pairs) {
  let won = 0, lost = 0
  pairs.forEach(p => {
    const w = pairWinner(p)
    if (w === 'home') won++
    else if (w === 'away') lost++
  })
  if (won > lost) return 'WIN'
  if (lost > won) return 'LOSS'
  return 'DRAW'
}

export default function LiveScorePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const isAdmin = !!session?.isAdmin

  const [matchday, setMatchday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Live state (3 pairs + 6 player names ordered)
  const [pairs, setPairs] = useState([emptyPair(), emptyPair(), emptyPair()])
  const [finalPlayers, setFinalPlayers] = useState([])
  const [playersOpen, setPlayersOpen] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)

  const competition = useCompetition(matchday?.competition)

  // Coalescing sender refs (admin only)
  const inFlightRef = useRef(false)
  const pendingPayloadRef = useRef(null)
  const hasLocalEditsRef = useRef(false)

  const hydrate = (data) => {
    const r = data.matchResult
    if (r) {
      setPairs([pairFromResult(r.pair1), pairFromResult(r.pair2), pairFromResult(r.pair3)])
      setFinalPlayers(r.finalPlayers || [])
    } else {
      setPairs([emptyPair(), emptyPair(), emptyPair()])
      setFinalPlayers([])
    }
  }

  // Initial load
  useEffect(() => {
    let cancelled = false
    getMatchday(id)
      .then(data => {
        if (cancelled) return
        setMatchday(data)
        hydrate(data)
        if (data.status === 'CLOSED' && isAdmin) setPlayersOpen(true)
      })
      .catch(() => !cancelled && setError('No se pudo cargar la convocatoria'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, isAdmin])

  // Polling: viewers and admins-as-spectators hydrate from server.
  // Once an admin starts marking (hasLocalEditsRef=true), they become the source
  // of truth and stop hydrating — otherwise the server would clobber in-flight edits.
  useEffect(() => {
    if (!matchday) return
    let cancelled = false
    let timeoutId = null

    const tick = async () => {
      if (cancelled) return
      if (document.hidden) return
      if (hasLocalEditsRef.current) {
        timeoutId = setTimeout(tick, POLL_MS)
        return
      }
      try {
        const data = await getMatchday(id)
        if (cancelled) return
        if (!hasLocalEditsRef.current) {
          setMatchday(data)
          hydrate(data)
        }
      } catch {
        // silent: next tick will retry
      }
      if (!cancelled) timeoutId = setTimeout(tick, POLL_MS)
    }

    timeoutId = setTimeout(tick, POLL_MS)

    const onVis = () => {
      if (!document.hidden) {
        clearTimeout(timeoutId)
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [id, matchday])

  const flushSnapshot = async () => {
    if (inFlightRef.current) return
    if (!pendingPayloadRef.current) return
    const payload = pendingPayloadRef.current
    pendingPayloadRef.current = null
    inFlightRef.current = true
    try {
      const updated = await submitLiveSnapshot(id, payload, getAdminPin())
      setMatchday(updated)
    } catch (err) {
      handleAdminError(err, navigate, setError)
    } finally {
      inFlightRef.current = false
      if (pendingPayloadRef.current) flushSnapshot()
    }
  }

  const queueSnapshot = (nextPairs, nextFinalPlayers) => {
    hasLocalEditsRef.current = true
    pendingPayloadRef.current = {
      outcome: null,
      finalPlayers: nextFinalPlayers,
      pair1: nextPairs[0],
      pair2: nextPairs[1],
      pair3: nextPairs[2],
    }
    flushSnapshot()
  }

  const togglePlayer = (name) => {
    setFinalPlayers(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 6 ? [...prev, name] : prev
      return next
    })
  }

  const movePlayer = (idx, dir) => {
    setFinalPlayers(prev => {
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }

  const adjustGames = (pairIdx, side, delta) => {
    if (finalPlayers.length !== 6) {
      setPlayersOpen(true)
      setError('Asigna los 6 jugadores antes de empezar')
      return
    }
    setError(null)
    setPairs(prev => {
      const next = prev.map((p, i) => {
        if (i !== pairIdx) return p

        // Block + if pair already won 2 sets (pista finished)
        if (delta > 0 && pairWinner(p)) return p

        const sets = p.sets.map(s => ({ ...s }))
        const lastIdx = sets.length - 1
        const key = side === 'home' ? 'gamesHome' : 'gamesAway'
        const v = (sets[lastIdx][key] || 0) + delta
        if (v < 0 || v > 99) return p
        sets[lastIdx] = { ...sets[lastIdx], [key]: v }

        // After +, auto-advance set if won and pair not finished
        if (delta > 0 && setWinner(sets[lastIdx])) {
          const tally = countSetsWon(sets)
          if (tally.home < 2 && tally.away < 2) {
            sets.push({ gamesHome: 0, gamesAway: 0 })
          }
        }

        return { sets }
      })
      queueSnapshot(next, finalPlayers)
      return next
    })
  }

  const undoLast = (pairIdx) => {
    setPairs(prev => {
      const next = prev.map((p, i) => {
        if (i !== pairIdx) return p
        const lastIdx = p.sets.length - 1
        const last = p.sets[lastIdx]

        // If current set is empty (0-0) and there's a previous set, pop the empty
        // so the previous becomes editable again.
        if (last.gamesHome === 0 && last.gamesAway === 0 && p.sets.length > 1) {
          return { sets: p.sets.slice(0, -1) }
        }

        // If pair is finished, decrement the winning side of the last set to unfinish it.
        const winner = setWinner(last)
        if (winner && pairWinner(p)) {
          const sets = p.sets.map(s => ({ ...s }))
          const key = winner === 'home' ? 'gamesHome' : 'gamesAway'
          sets[lastIdx] = { ...sets[lastIdx], [key]: sets[lastIdx][key] - 1 }
          return { sets }
        }

        return p
      })
      queueSnapshot(next, finalPlayers)
      return next
    })
  }

  const handleFinalize = async (outcome) => {
    try {
      await submitResult(id, {
        outcome,
        finalPlayers,
        beerRoundPlayers: [],
        pair1: pairs[0],
        pair2: pairs[1],
        pair3: pairs[2],
      }, getAdminPin())
      navigate(`/matchdays/${id}`)
    } catch (err) {
      handleAdminError(err, navigate, setError)
    }
  }

  const availablePlayerNames = useMemo(() => {
    if (!matchday) return []
    const fromAvail = (matchday.registrations || [])
      .filter(r => r.availability === 'AVAILABLE')
      .map(r => r.name)
    // Include already-selected even if no longer in registrations
    const set = new Set(fromAvail)
    finalPlayers.forEach(n => set.add(n))
    return Array.from(set)
  }, [matchday, finalPlayers])

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!matchday) return <p className="text-center pt-20 text-daylight-ink-sub">Convocatoria no encontrada</p>

  const isLive = matchday.status === 'LIVE'
  const isClosed = matchday.status === 'CLOSED'
  const isPlayed = matchday.status === 'PLAYED'
  const canEdit = isAdmin && !isPlayed
  const compName = competition?.name ?? matchday.competition ?? 'Convocatoria'

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="px-4 pt-1 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-daylight-surface border border-daylight-hair rounded-xl"
          aria-label="Volver"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-daylight-ink">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub flex items-center gap-1.5">
          {isLive && (
            <span className="inline-block w-2 h-2 rounded-full bg-daylight-red animate-pulse" />
          )}
          {isLive ? 'EN DIRECTO' : isClosed ? 'PREPARANDO' : isPlayed ? 'JUGADO' : 'MARCADOR'}
        </span>
        <div className="w-9 h-9" />
      </div>

      {/* Hero */}
      <div className="px-4 mt-1.5">
        <div className="bg-daylight-ink text-white rounded-3xl p-5 relative overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              right: -40, top: -40, width: 160, height: 160,
              background: isLive ? '#E2434B' : '#FF2D72', opacity: 0.95,
            }}
          />
          <div className="relative">
            <div className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-75 mb-1">
              {compName}{matchday.round ? ` · ${matchday.round}` : ''}
            </div>
            <div
              className="font-display font-extrabold text-white"
              style={{ fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.8px' }}
            >
              {matchday.title || 'Marcador'}
            </div>
          </div>
        </div>
      </div>

      {/* Player selector (collapsible) */}
      {canEdit && (
        <div className="px-4 pt-4">
          <button
            onClick={() => setPlayersOpen(o => !o)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="eyebrow">
              JUGADORES · {finalPlayers.length}/6
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={'text-daylight-ink-sub transition-transform ' + (playersOpen ? 'rotate-180' : '')}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {playersOpen && (
            <div className="card mt-1">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub mb-3">
                Toca para añadir/quitar. El orden marca la pista: 1·2 → Pista 1, 3·4 → Pista 2, 5·6 → Pista 3.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {availablePlayerNames.map(name => {
                  const idx = finalPlayers.indexOf(name)
                  const selected = idx >= 0
                  const pistaNum = selected ? Math.floor(idx / 2) + 1 : null
                  const maxReached = !selected && finalPlayers.length >= 6
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => togglePlayer(name)}
                      disabled={maxReached}
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ' +
                        (selected
                          ? 'bg-daylight-ink text-white border-daylight-ink'
                          : maxReached
                            ? 'bg-transparent text-daylight-ink-sub/50 border-daylight-hair cursor-not-allowed'
                            : 'bg-daylight-surface text-daylight-ink border-daylight-hair')
                      }
                    >
                      {pistaNum && (
                        <span className="font-mono text-[9px] bg-daylight-pink text-white rounded px-1.5 py-0.5">
                          P{pistaNum}
                        </span>
                      )}
                      {name}
                    </button>
                  )
                })}
              </div>
              {finalPlayers.length > 0 && (
                <div className="border-t border-daylight-hair pt-3 flex flex-col gap-1.5">
                  {finalPlayers.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub w-14 shrink-0">
                        P{Math.floor(i / 2) + 1}·J{(i % 2) + 1}
                      </span>
                      <span className="flex-1 font-semibold text-daylight-ink truncate">{name}</span>
                      <button
                        onClick={() => movePlayer(i, -1)}
                        disabled={i === 0}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-daylight-hair text-daylight-ink-sub disabled:opacity-30"
                        aria-label="Subir"
                      >↑</button>
                      <button
                        onClick={() => movePlayer(i, +1)}
                        disabled={i === finalPlayers.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-daylight-hair text-daylight-ink-sub disabled:opacity-30"
                        aria-label="Bajar"
                      >↓</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="px-4 pt-3">
          <p className="text-daylight-red text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Pista cards */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {pairs.map((pair, pairIdx) => (
          <PistaCard
            key={pairIdx}
            pairIdx={pairIdx}
            pair={pair}
            players={[finalPlayers[pairIdx * 2], finalPlayers[pairIdx * 2 + 1]]}
            canEdit={canEdit}
            onAdjust={adjustGames}
            onUndo={undoLast}
          />
        ))}
      </div>

      {/* Finalize */}
      {canEdit && isLive && (() => {
        const allDone = pairs.every(p => pairWinner(p))
        return (
          <div className="px-4 pt-5">
            <button
              onClick={() => setShowFinalize(true)}
              className={'w-full ' + (allDone ? 'btn-pink animate-pulse' : 'btn-pink')}
            >
              {allDone ? '🏁 Confirmar resultado del partido' : '🏁 Finalizar partido'}
            </button>
          </div>
        )
      })()}

      {showFinalize && (
        <FinalizeDialog
          inferredOutcome={inferOutcome(pairs)}
          onClose={() => setShowFinalize(false)}
          onConfirm={handleFinalize}
        />
      )}

      {isPlayed && (
        <div className="px-4 pt-5">
          <button
            onClick={() => navigate(`/matchdays/${id}`)}
            className="btn-ghost w-full"
          >
            Ver detalle del partido →
          </button>
        </div>
      )}
    </div>
  )
}

function PistaCard({ pairIdx, pair, players, canEdit, onAdjust, onUndo }) {
  const winner = pairWinner(pair)
  const finished = !!winner
  const wonByHome = winner === 'home'

  // When finished, the last set IS the winning set; otherwise it's the current (possibly empty) set.
  const lastIdx = pair.sets.length - 1
  const currentSet = pair.sets[lastIdx]
  const completedSets = finished ? pair.sets : pair.sets.slice(0, -1)
  const { home: setsHome, away: setsAway } = countSetsWon(completedSets)

  return (
    <div className={'card relative ' + (finished ? (wonByHome ? 'ring-2 ring-daylight-mint' : 'ring-2 ring-daylight-red') : '')}>
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow">PISTA {pairIdx + 1}</div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {completedSets.map((s, i) => {
            const w = setWinner(s)
            return (
              <span
                key={i}
                className={
                  'font-mono text-[10px] font-bold tracking-[0.05em] px-1.5 py-0.5 rounded ' +
                  (w === 'home'
                    ? 'bg-daylight-mint-soft text-daylight-mint'
                    : w === 'away'
                      ? 'bg-daylight-red-soft text-daylight-red'
                      : 'bg-daylight-cream text-daylight-ink')
                }
              >
                {s.gamesHome}-{s.gamesAway}
              </span>
            )
          })}
        </div>
      </div>

      {/* Players */}
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub">Nosotros</div>
          <div className="font-display font-bold text-daylight-ink truncate text-sm">
            {players[0] || '—'}{players[1] ? ` · ${players[1]}` : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub">Rivales</div>
          <div className="font-display font-bold text-daylight-ink-sub text-sm">··</div>
        </div>
      </div>

      {/* Big sets indicator */}
      <div
        className="flex items-center justify-center gap-4 py-3 rounded-xl mb-3"
        style={{ background: '#0A0810' }}
      >
        <SetsCount value={setsHome} highlight={finished && wonByHome} />
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: '#9C9AA5' }}>
          SETS
        </div>
        <SetsCount value={setsAway} highlight={finished && !wonByHome} />
      </div>

      {/* Finished badge OR current set controls */}
      {finished ? (
        <div
          className="text-center py-5 rounded-2xl"
          style={{ background: wonByHome ? '#D8F3E8' : '#FBE3E3' }}
        >
          <div
            className="font-display font-extrabold tracking-[-0.5px]"
            style={{ fontSize: 28, color: wonByHome ? '#086D4F' : '#E2434B' }}
          >
            {wonByHome ? '🏆 VICTORIA' : '💀 DERROTA'}
          </div>
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub mt-1">
            Pista finalizada · {currentSet.gamesHome}-{currentSet.gamesAway}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SideControls
            label="NOSOTROS"
            value={currentSet.gamesHome}
            canEdit={canEdit}
            onMinus={() => onAdjust(pairIdx, 'home', -1)}
            onPlus={() => onAdjust(pairIdx, 'home', +1)}
          />
          <SideControls
            label="RIVALES"
            value={currentSet.gamesAway}
            canEdit={canEdit}
            onMinus={() => onAdjust(pairIdx, 'away', -1)}
            onPlus={() => onAdjust(pairIdx, 'away', +1)}
          />
        </div>
      )}

      {/* Undo */}
      {canEdit && pair.sets.length > 0 && (currentSet.gamesHome > 0 || currentSet.gamesAway > 0 || pair.sets.length > 1) && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onUndo(pairIdx)}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub px-3 py-1.5 border border-daylight-hair rounded-lg"
          >
            ↶ Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

function SetsCount({ value, highlight }) {
  return (
    <div
      className="font-display font-extrabold"
      style={{
        fontSize: 44,
        lineHeight: 1,
        letterSpacing: '-1.5px',
        color: highlight ? '#F4B400' : '#FFFFFF',
        textShadow: highlight ? '0 0 14px rgba(244,180,0,0.55)' : 'none',
      }}
    >
      {value}
    </div>
  )
}

function SideControls({ label, value, canEdit, onMinus, onPlus }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub">{label}</div>
      <LcdCounter value={value} size="lg" minDigits={2} />
      {canEdit && (
        <div className="flex gap-2 w-full">
          <button
            onClick={onMinus}
            className="flex-1 min-h-14 bg-daylight-surface border-2 border-daylight-hair text-daylight-ink font-display font-extrabold text-2xl rounded-xl"
            aria-label="Restar juego"
          >
            −
          </button>
          <button
            onClick={onPlus}
            className="flex-1 min-h-14 btn-mint-hero text-3xl py-0 flex items-center justify-center"
            aria-label="Sumar juego"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

function FinalizeDialog({ inferredOutcome, onClose, onConfirm }) {
  const [outcome, setOutcome] = useState(inferredOutcome)
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm(outcome)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-daylight-surface w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display font-extrabold text-daylight-ink text-2xl tracking-[-0.5px] mb-1">
          ¿Cómo terminó?
        </h2>
        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub mb-4">
          Sugerido por el marcador. Confirma o cambia.
        </p>
        <div className="flex gap-2 mb-5">
          {OUTCOMES.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOutcome(o.value)}
              className={`flex-1 py-3 rounded-xl font-display font-bold text-[14px] border-2 transition-colors ${
                outcome === o.value ? o.active : o.inactive
              }`}
            >
              <span className="block text-base">{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 btn-ghost"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 btn-pink"
          >
            {saving ? 'Guardando…' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
