import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, getPlayers, submitResult, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'

const EMPTY_PAIR = { sets: [{ gamesHome: '', gamesAway: '' }, { gamesHome: '', gamesAway: '' }, { gamesHome: '', gamesAway: '' }] }

const OUTCOMES = [
  { value: 'WIN',  label: 'Ganamos',   emoji: '🏆', active: 'bg-daylight-mint text-white border-daylight-mint',           inactive: 'border-daylight-mint-soft text-daylight-mint bg-daylight-mint-soft/50' },
  { value: 'LOSS', label: 'Perdimos',  emoji: '😔', active: 'bg-daylight-red text-white border-daylight-red',             inactive: 'border-daylight-red-soft text-daylight-red bg-daylight-red-soft/50' },
  { value: 'DRAW', label: 'Empate',    emoji: '🤝', active: 'bg-daylight-ink text-white border-daylight-ink',             inactive: 'border-daylight-hair text-daylight-ink-sub' },
  { value: 'WO',   label: 'No jugado', emoji: '⛔', active: 'bg-daylight-ink-sub text-white border-daylight-ink-sub',     inactive: 'border-daylight-hair text-daylight-ink-sub bg-daylight-cream/50' },
]

function initials(name) {
  if (!name) return '··'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

export default function ResultFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [matchday, setMatchday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [allPlayers, setAllPlayers] = useState([])
  const [outcome, setOutcome] = useState(null)
  const [finalPlayers, setFinalPlayers] = useState([])
  const [beerRoundPlayers, setBeerRoundPlayers] = useState([])
  const [showBeerSection, setShowBeerSection] = useState(false)
  const [pairs, setPairs] = useState([
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
  ])

  useEffect(() => {
    getMatchday(id).then(async data => {
      setMatchday(data)

      if (data.registrations.length > 0) {
        setAllPlayers(data.registrations.map(r => r.name))
      } else {
        const players = await getPlayers()
        setAllPlayers(players.map(p => p.name))
      }

      const existing = data.matchResult
      if (existing) {
        setOutcome(existing.outcome || null)
        setFinalPlayers(existing.finalPlayers || [])
        const existingBeer = existing.beerRoundPlayers || []
        setBeerRoundPlayers(existingBeer)
        setShowBeerSection(existingBeer.length > 0)
        const pairToForm = (pair) => pair
          ? { sets: [0, 1, 2].map(i => pair.sets?.[i]
              ? { gamesHome: pair.sets[i].gamesHome, gamesAway: pair.sets[i].gamesAway }
              : { gamesHome: '', gamesAway: '' }) }
          : structuredClone(EMPTY_PAIR)
        setPairs([pairToForm(existing.pair1), pairToForm(existing.pair2), pairToForm(existing.pair3)])
      } else {
        const avail = data.registrations.filter(r => r.availability === 'AVAILABLE').map(r => r.name)
        setFinalPlayers(avail)
      }
      setLoading(false)
    })
  }, [id])

  const togglePlayer = (name) => {
    setFinalPlayers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
    setBeerRoundPlayers(prev => prev.filter(n => n !== name))
  }

  const toggleBeerPlayer = (name) => {
    setBeerRoundPlayers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const setScore = (pairIdx, setIdx, field, value) => {
    setPairs(prev => prev.map((p, i) =>
      i === pairIdx
        ? { sets: p.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
        : p
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isWO = outcome === 'WO'
    if (!isWO && finalPlayers.length !== 6) {
      setError('Debes seleccionar exactamente 6 jugadores')
      return
    }
    setSaving(true)
    try {
      const buildPair = (pair) => ({
        sets: pair.sets
          .filter(s => s.gamesHome !== '' && s.gamesAway !== '')
          .map(s => ({ gamesHome: Number(s.gamesHome), gamesAway: Number(s.gamesAway) }))
      })
      const payload = isWO
        ? {
            outcome: 'WO',
            finalPlayers: [],
            beerRoundPlayers: [],
            pair1: { sets: [] },
            pair2: { sets: [] },
            pair3: { sets: [] },
          }
        : {
            outcome,
            finalPlayers,
            beerRoundPlayers: showBeerSection ? beerRoundPlayers : [],
            pair1: buildPair(pairs[0]),
            pair2: buildPair(pairs[1]),
            pair3: buildPair(pairs[2]),
          }
      await submitResult(id, payload, getAdminPin())
      navigate(`/matchdays/${id}`)
    } catch (err) {
      handleAdminError(err, navigate, setError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isEditing = Boolean(matchday?.matchResult)
  const isWO = outcome === 'WO'
  const finalsComplete = finalPlayers.length === 6
  const finalsRemaining = 6 - finalPlayers.length

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
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub">
          Resultado
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="px-5 pt-2 pb-1">
        <div className="eyebrow mb-1">{(matchday?.title || 'Partido').toUpperCase()}</div>
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 30, lineHeight: 0.95, letterSpacing: '-1.1px' }}
        >
          {isEditing ? <>Editar<br /><span className="text-daylight-pink">resultado.</span></> : <>Registrar<br /><span className="text-daylight-pink">resultado.</span></>}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 flex flex-col gap-4">
        {/* Outcome */}
        <div className="card">
          <div className="eyebrow mb-3">RESULTADO</div>
          <div className="flex gap-2">
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
        </div>

        {/* Final players */}
        {!isWO && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">¿QUIÉN JUGÓ?</div>
            <span
              className={`font-mono text-[10px] font-bold tracking-[0.1em] px-2 py-0.5 rounded-full ${
                finalsComplete
                  ? 'bg-daylight-mint-soft text-daylight-mint'
                  : 'bg-daylight-cream text-daylight-ink-sub'
              }`}
            >
              {finalPlayers.length}/6
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPlayers.map(name => {
              const selected = finalPlayers.includes(name)
              const maxReached = !selected && finalPlayers.length >= 6
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => !maxReached && togglePlayer(name)}
                  disabled={maxReached}
                  className={
                    'inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ' +
                    (selected
                      ? 'bg-daylight-ink text-white border-daylight-ink'
                      : maxReached
                        ? 'bg-transparent text-daylight-ink-sub/50 border-daylight-hair cursor-not-allowed'
                        : 'bg-daylight-surface text-daylight-ink border-daylight-hair')
                  }
                >
                  <span
                    className={
                      'w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ' +
                      (selected ? 'bg-daylight-pink text-white' : 'bg-daylight-cream text-daylight-ink')
                    }
                  >
                    {initials(name)}
                  </span>
                  {name}
                </button>
              )
            })}
          </div>
          {finalPlayers.length > 0 && !finalsComplete && (
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-amber mt-3 font-semibold">
              Faltan {finalsRemaining} jugador{finalsRemaining !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        )}

        {/* Pairs */}
        {!isWO && pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="card">
            <div className="eyebrow mb-3">PAREJA {pairIdx + 1}</div>
            <div className="flex flex-col gap-2">
              {pair.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-daylight-ink-sub w-10 shrink-0">
                    Set {setIdx + 1}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={set.gamesHome}
                    onChange={e => setScore(pairIdx, setIdx, 'gamesHome', e.target.value)}
                    placeholder="0"
                    className="input-field w-14 text-center font-mono text-base py-2"
                  />
                  <span className="text-daylight-ink-sub font-mono text-sm">–</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={set.gamesAway}
                    onChange={e => setScore(pairIdx, setIdx, 'gamesAway', e.target.value)}
                    placeholder="0"
                    className="input-field w-14 text-center font-mono text-base py-2"
                  />
                  {setIdx === 2 && (
                    <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-daylight-ink-sub ml-1">
                      Opc.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Beer round */}
        {!isWO && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="eyebrow">🍺 ¿ALGUIEN PAGA CUBO?</div>
            <button
              type="button"
              onClick={() => {
                setShowBeerSection(v => !v)
                if (showBeerSection) setBeerRoundPlayers([])
              }}
              className={
                'font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full transition-colors ' +
                (showBeerSection
                  ? 'bg-daylight-amber text-daylight-ink'
                  : 'border border-daylight-hair text-daylight-ink-sub')
              }
            >
              {showBeerSection ? 'Sí' : 'No'}
            </button>
          </div>

          {showBeerSection && finalsComplete && (
            <div className="mt-3">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub mb-2">
                Marca a quien debe un cubo
              </p>
              <div className="flex flex-wrap gap-2">
                {finalPlayers.map(name => {
                  const selected = beerRoundPlayers.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleBeerPlayer(name)}
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ' +
                        (selected
                          ? 'bg-daylight-amber text-daylight-ink border-daylight-amber'
                          : 'bg-daylight-surface text-daylight-ink-sub border-daylight-hair')
                      }
                    >
                      {selected && <span>🍺</span>}
                      {name}
                    </button>
                  )
                })}
              </div>
              {beerRoundPlayers.length > 0 && (
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-amber mt-3 font-semibold">
                  {beerRoundPlayers.length} cubo{beerRoundPlayers.length !== 1 ? 's' : ''} pendiente{beerRoundPlayers.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {showBeerSection && !finalsComplete && (
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub mt-3">
              Selecciona primero los 6 jugadores
            </p>
          )}
        </div>
        )}

        {error && (
          <p className="text-daylight-red text-sm font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving || (!isWO && !finalsComplete)}
          className="btn-pink w-full"
        >
          {saving ? 'Guardando…' : 'Guardar resultado'}
        </button>
      </form>
    </div>
  )
}
