import { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { useCompetition } from '../context/CompetitionsContext'
import { respondToMatchday } from '../services/api'

const STATUS_LABELS = { OPEN: 'Abierta', CLOSED: 'Cerrada', PLAYED: 'Jugada' }
const STATUS_BADGE = { OPEN: 'badge-open', CLOSED: 'badge-closed', PLAYED: 'badge-played' }

export default function MatchdayCard({ matchday, isAdmin, onClick, onEdit, onDelete, onRespond }) {
  const { title, status, date, time, venue, competition, round } = matchday
  const available = (matchday.registrations || []).filter(r => r.availability === 'AVAILABLE').length
  const totalResponded = (matchday.registrations || []).length
  const { session } = useSession()
  const competitionData = useCompetition(competition)
  const [responding, setResponding] = useState(false)

  const myResponse = session?.playerId
    ? (matchday.registrations || []).find(r => r.playerId === session.playerId)?.availability
    : null

  const isOpen = status === 'OPEN'

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

  const competitionLabel = competitionData?.name ?? (competition && !competition.includes('-') ? competition : null)

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</span>
            {competitionLabel && (
              <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                {competitionData?.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: competitionData.color }}
                  />
                )}
                {competitionLabel}{round ? ` · ${round}` : ''}
              </span>
            )}
          </div>
          <h2 className="font-bold text-gray-800 text-base leading-tight truncate">
            {title || 'Convocatoria'}
          </h2>
          {(formattedDate || venue) && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {[formattedDate, time, venue].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Available count */}
        <div className="flex flex-col items-center shrink-0">
          <span className="text-2xl font-bold text-padel-pink">
            {available}<span className="text-base text-gray-400 font-normal">/{totalResponded}</span>
          </span>
          <span className="text-xs text-gray-400 leading-none">pueden</span>
        </div>
      </div>

      {/* Quick response buttons for open matchdays */}
      {isOpen && session?.playerId && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50" onClick={e => e.stopPropagation()}>
          <button
            disabled={responding}
            onClick={e => handleQuickResponse(e, 'AVAILABLE')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
              myResponse === 'AVAILABLE'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-green-400 text-green-600 active:bg-green-50'
            }`}
          >
            ✅ Puedo
          </button>
          <button
            disabled={responding}
            onClick={e => handleQuickResponse(e, 'UNAVAILABLE')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
              myResponse === 'UNAVAILABLE'
                ? 'bg-red-400 border-red-400 text-white'
                : 'border-red-300 text-red-500 active:bg-red-50'
            }`}
          >
            ❌ No puedo
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="text-xs text-padel-pink font-medium"
          >
            Editar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="text-xs text-red-400 font-medium ml-auto"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
