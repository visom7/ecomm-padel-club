import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompetitions, deleteCompetition, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'
import { useSession } from '../context/SessionContext'

export default function AdminPage() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()
  const { session } = useSession()

  useEffect(() => {
    if (!session?.isAdmin) {
      navigate('/')
      return
    }
    load()
  }, [])

  const load = () => {
    setLoading(true)
    getCompetitions()
      .then(data => setCompetitions(data))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la competición "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    try {
      const pin = getAdminPin()
      await deleteCompetition(id, pin)
      setCompetitions(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      handleAdminError(err, navigate)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Competiciones</h1>
        <button
          onClick={() => navigate('/admin/competitions/new')}
          className="btn-pink px-4 py-2 text-sm"
        >
          + Nueva
        </button>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center pt-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">Sin competiciones</p>
          <p className="text-sm mt-1">Crea la primera competición</p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: c.color || '#9ca3af' }}
                />
                <span className="font-semibold text-gray-800 flex-1">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => navigate(`/admin/competitions/${c.id}/stats`)}
                  className="flex-1 text-center text-xs font-medium text-blue-600 bg-blue-50 rounded-lg py-2 active:bg-blue-100"
                >
                  Estadísticas
                </button>
                <button
                  onClick={() => navigate(`/admin/competitions/${c.id}/edit`)}
                  className="flex-1 text-center text-xs font-medium text-gray-600 bg-gray-100 rounded-lg py-2 active:bg-gray-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={deletingId === c.id}
                  className="flex-1 text-center text-xs font-medium text-red-600 bg-red-50 rounded-lg py-2 active:bg-red-100 disabled:opacity-40"
                >
                  {deletingId === c.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
