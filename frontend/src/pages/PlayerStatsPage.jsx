import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerGlobalStats } from '../services/api'
import { useSession } from '../context/SessionContext'

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState('jugados')
  const navigate = useNavigate()
  const { session } = useSession()

  useEffect(() => {
    if (!session?.isAdmin) {
      navigate('/')
      return
    }
    getPlayerGlobalStats()
      .then(setPlayers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const sorted = [...players].sort((a, b) => {
    if (sortField === 'pctGanados') return b.pctGanados - a.pctGanados
    if (sortField === 'pctJugados') return b.pctJugados - a.pctJugados
    return b[sortField] - a[sortField]
  })

  const totalJugados = players.reduce((s, p) => s + p.jugados, 0)

  return (
    <div className="px-4 py-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 mb-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">Récord general</h1>
      <p className="text-sm text-gray-400 mb-5">Todos los partidos del club</p>

      {players.length === 0 ? (
        <div className="text-center pt-16 text-gray-400">
          <p className="font-medium">Sin datos todavía</p>
          <p className="text-sm mt-1">Los datos aparecerán cuando se registren resultados</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{players.length} jugadores</p>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
            >
              <option value="jugados">Ordenar: jugados</option>
              <option value="apuntados">Ordenar: apuntados</option>
              <option value="ganados">Ordenar: ganados</option>
              <option value="pctJugados">Ordenar: % asistencia</option>
              <option value="pctGanados">Ordenar: % victorias</option>
            </select>
          </div>

          <div className="space-y-2">
            {sorted.map((p, i) => (
              <PlayerRow key={p.playerId} player={p} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerRow({ player, rank }) {
  const { name, apuntados, jugados, ganados, perdidos, pctJugados, pctGanados } = player

  return (
    <div className="card py-3">
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span className={`text-sm font-bold w-6 text-center shrink-0 ${rank <= 3 ? 'text-padel-pink' : 'text-gray-300'}`}>
          {rank}
        </span>

        {/* Name + bars */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-gray-800 truncate">{name}</span>
            <span className="text-xs text-gray-400 shrink-0">{jugados} partido{jugados !== 1 ? 's' : ''}</span>
          </div>

          {/* Attendance bar */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 w-20 shrink-0">Asistencia</span>
            <div className="flex-1 bg-indigo-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(pctJugados, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-bold w-10 text-right shrink-0 ${pctJugados >= 75 ? 'text-indigo-700' : pctJugados >= 50 ? 'text-indigo-500' : 'text-gray-400'}`}>
              {pctJugados}%
            </span>
          </div>

          {/* Win rate bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-20 shrink-0">Victorias</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${pctGanados >= 50 ? 'bg-green-500' : 'bg-red-400'}`}
                style={{ width: `${Math.min(pctGanados, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-bold w-10 text-right shrink-0 ${pctGanados >= 50 ? 'text-green-600' : 'text-red-500'}`}>
              {pctGanados}%
            </span>
          </div>
        </div>

        {/* W/L pill */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 text-xs">
          <span className="font-bold text-green-600">{ganados}G</span>
          <span className="text-gray-300">·</span>
          <span className="font-bold text-red-400">{perdidos}P</span>
        </div>
      </div>
    </div>
  )
}
