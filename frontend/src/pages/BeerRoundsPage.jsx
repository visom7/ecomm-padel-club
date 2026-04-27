import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBeerRoundsHistory } from '../services/api'

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BeerRoundsPage() {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getBeerRoundsHistory()
      .then(data => setRounds(data))
      .catch(() => setError('No se pudo cargar el historial de cubos'))
      .finally(() => setLoading(false))
  }, [])

  const pending = rounds.filter(r => !r.paid).length

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Historial de cubos 🍺</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400">
              {rounds.length} cubo{rounds.length !== 1 ? 's' : ''} · {pending} pendiente{pending !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center pt-16">
          <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-center text-red-500 pt-10">{error}</p>}

      {!loading && !error && rounds.length === 0 && (
        <div className="text-center pt-16 text-gray-400">
          <span className="text-6xl block mb-4">🍻</span>
          <p className="font-medium text-gray-600">¡Sin cubos registrados!</p>
          <p className="text-sm mt-1">Aquí aparecerá el historial</p>
        </div>
      )}

      {!loading && !error && rounds.length > 0 && (
        <ul className="space-y-2">
          {rounds.map(r => (
            <li key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🍺</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{r.playerName}</p>
                <p className="text-xs text-gray-400 truncate">{r.matchdayTitle || 'Partido desconocido'} · {formatDate(r.createdAt)}</p>
              </div>
              {r.paid ? (
                <div className="text-right shrink-0">
                  <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2.5 py-0.5">Pagado</span>
                  {r.paidAt && <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.paidAt)}</p>}
                </div>
              ) : (
                <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5 shrink-0">Pendiente</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
