const STATUS_LABELS = { OPEN: 'Abierta', CLOSED: 'Cerrada', PLAYED: 'Jugada' }
const STATUS_BADGE = { OPEN: 'badge-open', CLOSED: 'badge-closed', PLAYED: 'badge-played' }

export default function MatchdayCard({ matchday, isAdmin, onClick, onEdit, onDelete }) {
  const { title, status, date, time, venue, competition, round } = matchday
  const available = (matchday.registrations || []).filter(r => r.availability === 'AVAILABLE').length

  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    : null

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</span>
            {competition && (
              <span className="text-xs text-gray-400 truncate">{competition}{round ? ` · ${round}` : ''}</span>
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
          <span className="text-2xl font-bold text-padel-pink">{available}</span>
          <span className="text-xs text-gray-400 leading-none">pueden</span>
        </div>
      </div>

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
