import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveMatchdays, deleteMatchday, getBeerRoundsHistory, handleAdminError } from '../services/api'
import { useSession } from '../context/SessionContext'
import { getAdminPin } from '../context/adminPin'
import MatchdayCard from '../components/MatchdayCard'

export default function MatchdaysPage() {
  const [matchdays, setMatchdays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [beerCount, setBeerCount] = useState(0)
  const [beerPending, setBeerPending] = useState(0)
  const { session } = useSession()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    Promise.all([
      getActiveMatchdays(),
      getBeerRoundsHistory(),
    ])
      .then(([data, beers]) => {
        setMatchdays(data.sort((a, b) => {
          if (!a.date) return 1
          if (!b.date) return -1
          return new Date(a.date) - new Date(b.date)
        }))
        setBeerCount(beers.length)
        setBeerPending(beers.filter(b => !b.paid).length)
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
    } catch (err) {
      handleAdminError(err, navigate)
    }
  }

  const handleRespond = (updatedMatchday) => {
    setMatchdays(prev => prev.map(m => m.id === updatedMatchday.id ? updatedMatchday : m))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMsg msg={error} />

  return (
    <div className="px-4 py-5">
      {/* Beer round counter */}
      <BeerCounter count={beerCount} pending={beerPending} navigate={navigate} />

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
              onRespond={handleRespond}
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

function BeerCounter({ count, pending, navigate }) {
  const digits = String(Math.min(count, 99)).padStart(2, '0').split('')
  return (
    <div className="flex justify-end mb-5">
      <div
        onClick={() => navigate('/cubos')}
        className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3 shadow-inner w-1/2 cursor-pointer hover:bg-gray-700 transition-colors active:scale-95"
      >
        {/* Digit display */}
        <div className="flex gap-1">
          {digits.map((d, i) => (
            <div
              key={i}
              className="w-9 h-12 bg-gray-900 border border-gray-600 rounded-md flex items-center justify-center"
              style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7)' }}
            >
              <span
                className="text-2xl font-bold text-amber-400 leading-none"
                style={{ fontFamily: "'Courier New', monospace", textShadow: '0 0 8px rgba(251,191,36,0.6)' }}
              >
                {d}
              </span>
            </div>
          ))}
        </div>
        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5 truncate">Contador de</p>
          <p className="text-sm font-bold text-amber-400 leading-none">cubos 🍺</p>
          {pending === 0 ? (
            <p className="text-xs text-gray-500 mt-1 truncate">Sin pendientes</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">{pending} pendiente{pending !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </div>
  )
}
