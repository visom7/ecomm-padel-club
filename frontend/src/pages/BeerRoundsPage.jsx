import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBeerRounds } from '../services/api'

export default function BeerRoundsPage() {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getBeerRounds()
      .then(data => setRounds(data))
      .catch(() => setError('No se pudo cargar los cubos pendientes'))
      .finally(() => setLoading(false))
  }, [])

  // Group by player name
  const byPlayer = rounds.reduce((acc, r) => {
    if (!acc[r.playerName]) acc[r.playerName] = []
    acc[r.playerName].push(r)
    return acc
  }, {})

  const players = Object.keys(byPlayer).sort((a, b) => a.localeCompare(b, 'es'))

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
          <h1 className="text-xl font-bold text-gray-800">Cubos pendientes 🍺</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400">{rounds.length} cubo{rounds.length !== 1 ? 's' : ''} en total</p>
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
          <p className="font-medium text-gray-600">¡Sin cubos pendientes!</p>
          <p className="text-sm mt-1">Todo el mundo está al día</p>
        </div>
      )}

      {!loading && !error && players.length > 0 && (
        <div className="space-y-3">
          {players.map(playerName => {
            const playerRounds = byPlayer[playerName]
            return (
              <div key={playerName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Player header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-b border-amber-100">
                  <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{playerName}</p>
                    <p className="text-xs text-amber-600 font-medium">
                      {playerRounds.length} cubo{playerRounds.length !== 1 ? 's' : ''} pendiente{playerRounds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                    {playerRounds.length}
                  </span>
                </div>

                {/* Match details */}
                <ul className="divide-y divide-gray-50">
                  {playerRounds.map(r => (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-lg">🍺</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">
                          {r.matchdayTitle || 'Partido desconocido'}
                        </p>
                        {r.createdAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
