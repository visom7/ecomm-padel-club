import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveMatchdays, deleteMatchday } from '../services/api'
import { useSession } from '../context/SessionContext'
import { getAdminPin } from '../context/adminPin'
import MatchdayCard from '../components/MatchdayCard'

export default function MatchdaysPage() {
  const [matchdays, setMatchdays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useSession()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getActiveMatchdays()
      .then(data => {
        setMatchdays(data.sort((a, b) => {
          if (!a.date) return 1
          if (!b.date) return -1
          return new Date(a.date) - new Date(b.date)
        }))
      })
      .catch(() => setError('No se pudo cargar las convocatorias'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta convocatoria?')) return
    try {
      await deleteMatchday(id, getAdminPin())
      load()
    } catch {
      alert('Error al eliminar')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMsg msg={error} />

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Convocatorias</h1>
        {session?.isAdmin && (
          <button
            onClick={() => navigate('/matchdays/new')}
            className="btn-pink flex items-center gap-1.5 text-sm py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva
          </button>
        )}
      </div>

      {matchdays.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {matchdays.map(m => (
            <MatchdayCard
              key={m.id}
              matchday={m}
              isAdmin={session?.isAdmin}
              onDelete={() => handleDelete(m.id)}
              onEdit={() => navigate(`/matchdays/${m.id}/edit`)}
              onClick={() => navigate(`/matchdays/${m.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ErrorMsg({ msg }) {
  return <p className="text-center text-red-500 pt-20">{msg}</p>
}

function EmptyState() {
  return (
    <div className="text-center pt-16 text-gray-400">
      <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="font-medium">No hay convocatorias abiertas</p>
      <p className="text-sm mt-1">Los administradores pueden crear una nueva</p>
    </div>
  )
}
