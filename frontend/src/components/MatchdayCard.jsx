import { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { useCompetition } from '../context/CompetitionsContext'
import { respondToMatchday } from '../services/api'

const STATUS_BADGE = {
  OPEN:   { cls: 'badge badge-open',   label: '● ABIERTA' },
  CLOSED: { cls: 'badge badge-closed', label: '● CERRADA' },
  LIVE:   { cls: 'badge badge-live',   label: '● EN DIRECTO' },
  PLAYED: { cls: 'badge badge-played', label: 'JUGADA' },
}

export default function MatchdayCard({ matchday, isAdmin, onClick, onEdit, onDelete, onRespond }) {
  const { title, status, date, time, venue, competition, round, rivalTeam } = matchday
  const registrations = matchday.registrations || []
  const available = registrations.filter(r => r.availability === 'AVAILABLE').length
  const totalResponded = registrations.length
  const { session } = useSession()
  const competitionData = useCompetition(competition)
  const [responding, setResponding] = useState(false)

  const isExcluded = session?.playerId
    ? (competitionData?.excludedPlayerIds || []).includes(session.playerId)
    : false

  const myResponse = session?.playerId
    ? registrations.find(r => r.playerId === session.playerId)?.availability
    : null

  const isOpen = status === 'OPEN'
  const badge = STATUS_BADGE[status] || STATUS_BADGE.OPEN

  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    : null

  const handleQuickResponse = async (e, availability) => {
    e.stopPropagation()
    if (!session?.playerId || responding) return
    setResponding(true)
    try {
      const updated = await respondToMatchday(matchday.id, {
        playerId: session.playerId,
        name: session.name,
        availability,
      })
      onRespond?.(updated)
    } finally {
      setResponding(false)
    }
  }

  const competitionLabel = competitionData?.name
    ?? (competition && !competition.includes('-') ? competition : null)
  const competitionColor = competitionData?.color || '#FF2D72'

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer transition-colors active:bg-daylight-cream/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={badge.cls}>{badge.label}</span>
            {competitionLabel && (
              <span className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-daylight-ink-sub flex items-center gap-1.5">
                <span
                  className="inline-block w-[7px] h-[7px] rounded-sm shrink-0"
                  style={{ backgroundColor: competitionColor }}
                />
                {competitionLabel}{round ? ` · ${round}` : ''}
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-[19px] leading-tight tracking-[-0.4px] text-daylight-ink truncate">
            {title || 'Convocatoria'}
          </h2>
          {rivalTeam && (
            <p className="text-xs font-semibold text-daylight-ink-sub mt-0.5 truncate">
              vs {rivalTeam}
            </p>
          )}
          {(formattedDate || time || venue) && (
            <p className="text-xs text-daylight-ink-sub mt-1.5 truncate">
              {formattedDate && (
                <span className="font-semibold text-daylight-ink">{formattedDate}</span>
              )}
              {time && <> · {time}</>}
              {venue && <> · {venue}</>}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="font-display font-extrabold text-[32px] leading-none tracking-[-1.5px]">
            <span className="text-daylight-pink">{available}</span>
            <span className="text-base text-daylight-ink-sub font-semibold">/{totalResponded}</span>
          </div>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub mt-1">
            {available === 1 ? 'Apuntado' : 'Apuntados'}
          </span>
        </div>
      </div>

      {isOpen && session?.playerId && !isExcluded && (
        <div
          className="mt-3.5 pt-3.5 border-t border-dashed border-daylight-hair"
          onClick={e => e.stopPropagation()}
        >
          {myResponse === 'AVAILABLE' ? (
            <button
              disabled={responding}
              onClick={e => handleQuickResponse(e, 'UNAVAILABLE')}
              className="w-full bg-daylight-mint text-white rounded-xl px-3.5 py-3 flex items-center justify-between disabled:opacity-50"
              style={{ boxShadow: '0 4px 0 #086D4F' }}
            >
              <span className="font-display font-bold text-[15px]">✓ Apuntado</span>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase opacity-85">
                Cambiar
              </span>
            </button>
          ) : myResponse === 'UNAVAILABLE' ? (
            <button
              disabled={responding}
              onClick={e => handleQuickResponse(e, 'AVAILABLE')}
              className="w-full bg-daylight-red-soft text-daylight-red border border-daylight-red/20 rounded-xl px-3.5 py-3 flex items-center justify-between disabled:opacity-50"
            >
              <span className="font-display font-bold text-[15px]">✕ No puedo</span>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase opacity-85">
                Cambiar
              </span>
            </button>
          ) : (
            <div className="flex gap-2.5">
              <button
                disabled={responding}
                onClick={e => handleQuickResponse(e, 'AVAILABLE')}
                className="btn-ink-card flex-1"
              >
                ✓ Puedo
              </button>
              <button
                disabled={responding}
                onClick={e => handleQuickResponse(e, 'UNAVAILABLE')}
                className="w-[90px] bg-transparent border-[1.5px] border-daylight-hair text-daylight-ink font-display font-semibold text-sm rounded-xl py-3 transition-colors"
              >
                No puedo
              </button>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="flex gap-2 mt-3.5 pt-3 border-t border-daylight-hair">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub"
          >
            Editar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-red ml-auto"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
