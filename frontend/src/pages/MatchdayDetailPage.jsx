import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, getPlayers, respondToMatchday, closeMatchday, reopenMatchday, deleteMatchday, handleAdminError } from '../services/api'
import { useSession } from '../context/SessionContext'
import { useCompetition } from '../context/CompetitionsContext'
import { getAdminPin } from '../context/adminPin'

const OUTCOME_CONFIG = {
  WIN:  { label: 'Victoria 🏆',  cls: 'bg-daylight-mint-soft text-daylight-mint' },
  LOSS: { label: 'Derrota 😔',   cls: 'bg-daylight-red-soft text-daylight-red' },
  DRAW: { label: 'Empate 🤝',    cls: 'bg-gray-100 text-daylight-ink-sub' },
  WO:   { label: 'No jugado ⛔', cls: 'bg-gray-100 text-daylight-ink-sub' },
}

function initials(name) {
  if (!name) return '··'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

function etaFromDate(targetIso) {
  if (!targetIso) return null
  const target = new Date(targetIso)
  if (isNaN(target.getTime())) return null
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return null
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  if (days >= 1) return `${days}D ${String(hours).padStart(2, '0')}H`
  return `${hours}H ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}M`
}

export default function MatchdayDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [matchday, setMatchday] = useState(null)
  const [allPlayers, setAllPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const competitionData = useCompetition(matchday?.competition)

  const myResponse = matchday?.registrations?.find(r => r.playerId === session?.playerId)?.availability

  const load = () => {
    setLoading(true)
    Promise.all([getMatchday(id), getPlayers()])
      .then(([matchdayData, playersData]) => {
        setMatchday(matchdayData)
        setAllPlayers(playersData)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const handleResponse = async (availability) => {
    if (responding) return
    setResponding(true)
    try {
      const updated = await respondToMatchday(id, {
        playerId: session.playerId,
        name: session.name,
        availability,
      })
      setMatchday(updated)
    } finally {
      setResponding(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('¿Cerrar esta convocatoria?')) return
    try {
      const updated = await closeMatchday(id, getAdminPin())
      setMatchday(updated)
    } catch (err) {
      handleAdminError(err, navigate)
    }
  }

  const handleReopen = async () => {
    if (!confirm('¿Reabrir esta convocatoria? Los jugadores podrán volver a apuntarse.')) return
    try {
      const updated = await reopenMatchday(id, getAdminPin())
      setMatchday(updated)
    } catch (err) {
      handleAdminError(err, navigate)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta convocatoria?')) return
    try {
      await deleteMatchday(id, getAdminPin())
      navigate('/matchdays')
    } catch (err) {
      handleAdminError(err, navigate)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!matchday) return <p className="text-center pt-20 text-daylight-ink-sub">Convocatoria no encontrada</p>

  const available = matchday.registrations.filter(r => r.availability === 'AVAILABLE')
  const unavailable = matchday.registrations.filter(r => r.availability === 'UNAVAILABLE')
  const respondedIds = new Set(matchday.registrations.map(r => r.playerId))
  const noResponse = allPlayers.filter(p => !respondedIds.has(p.id))
  const isOpen = matchday.status === 'OPEN'
  const isLive = matchday.status === 'LIVE'
  const isPlayed = matchday.status === 'PLAYED'
  const isClosed = matchday.status === 'CLOSED'
  const finalPlayers = matchday.matchResult?.finalPlayers || []

  const compName = competitionData?.name ?? matchday.competition ?? 'Convocatoria'
  const roundLabel = matchday.round
    ? (/^\d+$/.test(matchday.round) ? `Jornada ${matchday.round}` : matchday.round)
    : null
  const shortRound = matchday.round
    ? (/^\d+$/.test(matchday.round) ? `J${matchday.round}` : matchday.round)
    : null
  const eta = isOpen ? etaFromDate(matchday.closesAt || matchday.date) : null

  const formattedDate = matchday.date
    ? new Date(matchday.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).toUpperCase()
    : null

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
          Convocatoria{shortRound ? ` · ${shortRound}` : ''}
        </span>
        <div className="relative" ref={menuRef}>
          {session?.isAdmin ? (
            <>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="w-9 h-9 flex items-center justify-center bg-daylight-surface border border-daylight-hair rounded-xl"
                aria-label="Acciones"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-daylight-ink">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-20 bg-daylight-surface border border-daylight-hair rounded-xl shadow-lg p-1.5 min-w-[200px] flex flex-col">
                  <AdminAction onClick={() => { setMenuOpen(false); navigate(`/matchdays/${id}/edit`) }}>
                    ✏️ Editar
                  </AdminAction>
                  {isOpen && (
                    <AdminAction onClick={() => { setMenuOpen(false); handleClose() }}>
                      🔒 Cerrar convocatoria
                    </AdminAction>
                  )}
                  {isClosed && (
                    <AdminAction onClick={() => { setMenuOpen(false); navigate(`/live/${id}`) }}>
                      ▶ Empezar directo
                    </AdminAction>
                  )}
                  {isClosed && (
                    <AdminAction onClick={() => { setMenuOpen(false); handleReopen() }}>
                      🔓 Reabrir convocatoria
                    </AdminAction>
                  )}
                  {isLive && (
                    <AdminAction onClick={() => { setMenuOpen(false); navigate(`/live/${id}`) }}>
                      ▶ Continuar directo
                    </AdminAction>
                  )}
                  {!isPlayed && (
                    <AdminAction onClick={() => { setMenuOpen(false); navigate(`/matchdays/${id}/result`) }}>
                      {isLive ? '🏁 Finalizar partido' : '🏅 Registrar resultado'}
                    </AdminAction>
                  )}
                  {isPlayed && (
                    <AdminAction onClick={() => { setMenuOpen(false); navigate(`/matchdays/${id}/result`) }}>
                      ✏️ Editar resultado
                    </AdminAction>
                  )}
                  <AdminAction onClick={() => { setMenuOpen(false); handleDelete() }} destructive>
                    🗑️ Eliminar
                  </AdminAction>
                </div>
              )}
            </>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="px-4 mt-1.5">
        <div className="bg-daylight-ink text-white rounded-3xl p-6 relative overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              right: -40, top: -40, width: 180, height: 180,
              background: '#FF2D72', opacity: 0.95,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: 14, top: 18, width: 64, height: 64,
              border: '2px dashed rgba(255,255,255,0.35)',
              mixBlendMode: 'overlay',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={'inline-block w-2 h-2 rounded-full' + (isLive ? ' animate-pulse' : '')}
                style={{ background: isOpen ? '#0EBE89' : isPlayed ? '#9C9AA5' : isLive ? '#E2434B' : '#FF2D72' }}
              />
              <span className={'font-mono text-[10px] tracking-[0.15em] uppercase' + (isLive ? ' opacity-100 font-bold' : ' opacity-75')}>
                {isOpen
                  ? (eta ? `ABIERTA — CIERRA EN ${eta}` : 'ABIERTA')
                  : isLive ? 'EN DIRECTO' : isPlayed ? 'JUGADA' : 'CERRADA'}
              </span>
            </div>
            <div
              className="font-display font-extrabold text-white"
              style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-1.2px' }}
            >
              {compName}
              {roundLabel && (<><br />{roundLabel}</>)}
            </div>
            {matchday.rivalTeam && (
              <div className="text-sm font-semibold text-white/85 mt-1.5">
                vs {matchday.rivalTeam}
              </div>
            )}
            {matchday.matchResult?.outcome && OUTCOME_CONFIG[matchday.matchResult.outcome] && (
              <div className={`inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full ${OUTCOME_CONFIG[matchday.matchResult.outcome].cls}`}>
                {OUTCOME_CONFIG[matchday.matchResult.outcome].label}
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <HeroStat label="FECHA" value={formattedDate || '—'} sub={matchday.time || ''} />
              <HeroStat label="PISTA" value={matchday.venue || '—'} sub="" />
              <HeroStat
                label="ESTADO"
                value={isOpen ? 'Abierta' : isLive ? 'En directo' : isPlayed ? 'Jugada' : 'Cerrada'}
                sub={`${available.length} apuntados`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apuntarse — the moment */}
      {isOpen && session?.playerId && (
        <div className="px-4 pt-5 pb-1.5">
          <div className="eyebrow mb-2">¿VAS A IR?</div>
          {myResponse === 'AVAILABLE' ? (
            <button
              disabled={responding}
              onClick={() => handleResponse('UNAVAILABLE')}
              className="w-full bg-daylight-mint text-white rounded-[18px] px-5 py-5 flex items-center justify-between disabled:opacity-50"
              style={{ boxShadow: '0 6px 0 #086D4F' }}
            >
              <span className="font-display font-extrabold text-2xl tracking-[-0.5px]">✓ Apuntado</span>
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase opacity-90">
                Cambiar
              </span>
            </button>
          ) : myResponse === 'UNAVAILABLE' ? (
            <button
              disabled={responding}
              onClick={() => handleResponse('AVAILABLE')}
              className="w-full bg-daylight-red-soft text-daylight-red border border-daylight-red/20 rounded-[18px] px-5 py-5 flex items-center justify-between disabled:opacity-50"
            >
              <span className="font-display font-extrabold text-2xl tracking-[-0.5px]">✕ No puedo</span>
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase opacity-90">
                Cambiar
              </span>
            </button>
          ) : (
            <div className="flex gap-2.5">
              <button
                disabled={responding}
                onClick={() => handleResponse('AVAILABLE')}
                className="btn-mint-hero flex items-center justify-between"
                style={{ flex: 2 }}
              >
                <span>PUEDO</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </button>
              <button
                disabled={responding}
                onClick={() => handleResponse('UNAVAILABLE')}
                className="bg-daylight-surface text-daylight-ink border-2 border-daylight-hair font-display font-bold text-lg rounded-[18px] px-3.5 py-5 disabled:opacity-50"
                style={{ flex: 1 }}
              >
                No puedo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final players — only for played matchdays */}
      {isPlayed && finalPlayers.length > 0 && (
        <div className="px-4 pt-5">
          <div className="eyebrow mb-2">JUGARON · {finalPlayers.length}</div>
          <div className="flex flex-wrap gap-2">
            {finalPlayers.map(name => {
              const isMe = name === session?.name
              return (
                <div key={name} className={'player-chip' + (isMe ? ' player-chip-me' : '')}>
                  <div className="player-chip-avatar">{initials(name)}</div>
                  {name}
                  {isMe && (
                    <span className="font-mono text-[8px] bg-daylight-pink text-white px-1.5 py-0.5 rounded ml-0.5 tracking-wider">
                      TÚ
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Roster */}
      <div className="px-4 pt-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="font-display font-bold text-[22px] tracking-[-0.4px] text-daylight-ink">
              Apuntados
            </div>
            <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub mt-0.5">
              {available.length} DE {matchday.registrations.length || 0} · NECESITAMOS 4 EN PISTA
            </div>
          </div>
          <div className="font-display font-extrabold text-daylight-pink leading-none"
            style={{ fontSize: 40, letterSpacing: '-1.5px' }}
          >
            {available.length}
          </div>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-daylight-ink-sub">Aún no se ha apuntado nadie.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {available.map(r => {
              const isMe = r.playerId === session?.playerId
              return (
                <div key={r.playerId} className={'player-chip' + (isMe ? ' player-chip-me' : '')}>
                  <div className="player-chip-avatar">{initials(r.name)}</div>
                  {r.name}
                  {isMe && (
                    <span className="font-mono text-[8px] bg-daylight-pink text-white px-1.5 py-0.5 rounded ml-0.5 tracking-wider">
                      TÚ
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {unavailable.length > 0 && (
          <>
            <div className="eyebrow mt-5 mb-2">NO PUEDEN · {unavailable.length}</div>
            <div className="flex flex-wrap gap-2">
              {unavailable.map(r => (
                <div key={r.playerId} className="player-chip player-chip-out">
                  <div className="player-chip-avatar">{initials(r.name)}</div>
                  {r.name}
                </div>
              ))}
            </div>
          </>
        )}

        {isOpen && noResponse.length > 0 && (
          <>
            <div className="eyebrow mt-5 mb-2">PENDIENTES · {noResponse.length}</div>
            <div className="flex flex-wrap gap-2">
              {noResponse.map(p => (
                <div key={p.id} className="player-chip player-chip-pending">
                  <div className="player-chip-avatar">{initials(p.name)}</div>
                  {p.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function HeroStat({ label, value, sub }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-60">{label}</div>
      <div className="font-display font-bold text-[17px] tracking-[-0.3px] mt-1 truncate">{value}</div>
      {sub && <div className="text-[11px] opacity-60 mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

function AdminAction({ onClick, children, destructive }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-left text-sm font-semibold px-3 py-2 rounded-lg transition-colors ' +
        (destructive
          ? 'text-daylight-red hover:bg-daylight-red-soft'
          : 'text-daylight-ink hover:bg-daylight-cream')
      }
    >
      {children}
    </button>
  )
}
