import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, respondToMatchday, closeMatchday, deleteMatchday } from '../services/api'
import { useSession } from '../context/SessionContext'
import { getAdminPin } from '../context/adminPin'

const STATUS_LABELS = { OPEN: 'Abierta', CLOSED: 'Cerrada', PLAYED: 'Jugada' }
const STATUS_BADGE = { OPEN: 'badge-open', CLOSED: 'badge-closed', PLAYED: 'badge-played' }
const OUTCOME_CONFIG = {
  WIN:  { label: 'Victoria 🏆', cls: 'bg-green-100 text-green-700 border border-green-200' },
  LOSS: { label: 'Derrota 😔',  cls: 'bg-red-100 text-red-600 border border-red-200' },
  DRAW: { label: 'Empate 🤝',   cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

export default function MatchdayDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [matchday, setMatchday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)

  const myResponse = matchday?.registrations?.find(r => r.playerId === session?.playerId)?.availability

  const load = () => {
    setLoading(true)
    getMatchday(id).then(setMatchday).finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleResponse = async (availability) => {
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
    const updated = await closeMatchday(id, getAdminPin())
    setMatchday(updated)
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta convocatoria?')) return
    await deleteMatchday(id, getAdminPin())
    navigate('/matchdays')
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!matchday) return <p className="text-center pt-20 text-gray-400">Convocatoria no encontrada</p>

  const available = matchday.registrations.filter(r => r.availability === 'AVAILABLE')
  const unavailable = matchday.registrations.filter(r => r.availability === 'UNAVAILABLE')
  const isOpen = matchday.status === 'OPEN'

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Info card */}
      <div className="card">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={STATUS_BADGE[matchday.status]}>{STATUS_LABELS[matchday.status]}</span>
              {matchday.matchResult?.outcome && OUTCOME_CONFIG[matchday.matchResult.outcome] && (
                <span className={`text-sm font-semibold px-3 py-0.5 rounded-full ${OUTCOME_CONFIG[matchday.matchResult.outcome].cls}`}>
                  {OUTCOME_CONFIG[matchday.matchResult.outcome].label}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mt-1">{matchday.title || 'Convocatoria'}</h1>
          </div>
          <div className="text-center shrink-0">
            <span className="text-3xl font-bold text-padel-pink">{available.length}</span>
            <p className="text-xs text-gray-400 leading-none">pueden</p>
          </div>
        </div>

        <dl className="space-y-1.5 text-sm">
          {matchday.date && (
            <InfoRow icon="📅" label="Fecha"
              value={new Date(matchday.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          )}
          {matchday.time && <InfoRow icon="🕐" label="Hora" value={matchday.time} />}
          {matchday.venue && <InfoRow icon="📍" label="Lugar" value={matchday.venue} />}
          {matchday.competition && <InfoRow icon="🏆" label="Competición" value={matchday.competition} />}
          {matchday.round && <InfoRow icon="🔢" label="Ronda" value={matchday.round} />}
        </dl>
      </div>

      {/* Response buttons — only for open matchdays */}
      {isOpen && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Tu disponibilidad</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleResponse('AVAILABLE')}
              disabled={responding}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border-2 ${
                myResponse === 'AVAILABLE'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-green-400 text-green-600 active:bg-green-50'
              }`}
            >
              ✅ Puedo
            </button>
            <button
              onClick={() => handleResponse('UNAVAILABLE')}
              disabled={responding}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border-2 ${
                myResponse === 'UNAVAILABLE'
                  ? 'bg-red-400 border-red-400 text-white'
                  : 'border-red-300 text-red-500 active:bg-red-50'
              }`}
            >
              ❌ No puedo
            </button>
          </div>
        </div>
      )}

      {/* Player lists */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">Inscritos ({matchday.registrations.length})</h2>
        {available.length > 0 && (
          <>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-2">
              Pueden ({available.length})
            </p>
            <ul className="space-y-1 mb-4">
              {available.map(r => (
                <li key={r.playerId} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  {r.name}
                  {r.playerId === session?.playerId && <span className="text-xs text-gray-400">(tú)</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {unavailable.length > 0 && (
          <>
            <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-2">
              No pueden ({unavailable.length})
            </p>
            <ul className="space-y-1">
              {unavailable.map(r => (
                <li key={r.playerId} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-red-300 shrink-0" />
                  {r.name}
                  {r.playerId === session?.playerId && <span className="text-xs text-gray-400">(tú)</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {matchday.registrations.length === 0 && (
          <p className="text-sm text-gray-400">Nadie se ha apuntado todavía</p>
        )}
      </div>

      {/* Admin actions */}
      {session?.isAdmin && (
        <div className="card space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Acciones de admin</p>
          <button
            onClick={() => navigate(`/matchdays/${id}/edit`)}
            className="btn-outline w-full py-2.5 text-sm"
          >
            ✏️ Editar convocatoria
          </button>
          {isOpen && (
            <button onClick={handleClose} className="btn-outline w-full py-2.5 text-sm">
              🔒 Cerrar convocatoria
            </button>
          )}
          {matchday.status !== 'PLAYED' && (
            <button
              onClick={() => navigate(`/matchdays/${id}/result`)}
              className="btn-pink w-full py-2.5 text-sm"
            >
              🏅 Registrar resultado
            </button>
          )}
          <button onClick={handleDelete} className="w-full py-2.5 text-sm text-red-400 font-semibold">
            🗑️ Eliminar convocatoria
          </button>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-800 font-medium capitalize">{value}</span>
    </div>
  )
}
