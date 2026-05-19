import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveMatchdays } from '../services/api'
import { useSession } from '../context/SessionContext'
import { useCompetition } from '../context/CompetitionsContext'

export default function LiveListPage() {
  const [matchdays, setMatchdays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getActiveMatchdays()
      .then(setMatchdays)
      .catch(() => setError('No se pudo cargar las convocatorias'))
      .finally(() => setLoading(false))
  }, [])

  const live = matchdays.filter(m => m.status === 'LIVE')
  const closed = matchdays.filter(m => m.status === 'CLOSED')

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-center text-daylight-red pt-20">{error}</p>

  return (
    <div className="pb-24">
      <div className="px-5 pt-1 pb-2">
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 38, lineHeight: 0.95, letterSpacing: '-1.3px' }}
        >
          Marcador<br />
          <span className="text-daylight-red">en directo.</span>
        </h1>
      </div>

      {live.length > 0 && (
        <div className="px-5 pt-3">
          <div className="eyebrow mb-2 text-daylight-red">🔴 EN DIRECTO AHORA · {live.length}</div>
          <div className="flex flex-col gap-3">
            {live.map(m => (
              <LiveRow key={m.id} matchday={m} onClick={() => navigate(`/live/${m.id}`)} />
            ))}
          </div>
        </div>
      )}

      {session?.isAdmin && closed.length > 0 && (
        <div className="px-5 pt-5">
          <div className="eyebrow mb-2">LISTAS PARA EMPEZAR · {closed.length}</div>
          <div className="flex flex-col gap-3">
            {closed.map(m => (
              <LiveRow key={m.id} matchday={m} onClick={() => navigate(`/live/${m.id}`)} ready />
            ))}
          </div>
        </div>
      )}

      {live.length === 0 && (!session?.isAdmin || closed.length === 0) && (
        <EmptyState isAdmin={session?.isAdmin} />
      )}
    </div>
  )
}

function LiveRow({ matchday, onClick, ready }) {
  const competition = useCompetition(matchday.competition)
  const competitionLabel = competition?.name ?? matchday.competition

  const formattedDate = matchday.date
    ? new Date(matchday.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    : null

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer transition-colors active:bg-daylight-cream/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={'badge ' + (ready ? 'badge-closed' : 'badge-live')}>
              {ready ? '● CERRADA' : '● EN DIRECTO'}
            </span>
            {competitionLabel && (
              <span className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-daylight-ink-sub">
                {competitionLabel}{matchday.round ? ` · ${matchday.round}` : ''}
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-[19px] leading-tight tracking-[-0.4px] text-daylight-ink truncate">
            {matchday.title || 'Convocatoria'}
          </h2>
          {(formattedDate || matchday.time || matchday.venue) && (
            <p className="text-xs text-daylight-ink-sub mt-1.5 truncate">
              {formattedDate && (
                <span className="font-semibold text-daylight-ink">{formattedDate}</span>
              )}
              {matchday.time && <> · {matchday.time}</>}
              {matchday.venue && <> · {matchday.venue}</>}
            </p>
          )}
        </div>
        <div className="shrink-0 self-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-daylight-ink-sub">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ isAdmin }) {
  return (
    <div className="text-center pt-12 px-6 text-daylight-ink-sub">
      <div className="font-display font-bold text-daylight-ink text-xl">
        Ningún partido en directo
      </div>
      <p className="text-sm mt-2">
        {isAdmin
          ? 'Cierra una convocatoria para empezar a retransmitir.'
          : 'Cuando un admin abra un partido en directo, aparecerá aquí.'}
      </p>
    </div>
  )
}
