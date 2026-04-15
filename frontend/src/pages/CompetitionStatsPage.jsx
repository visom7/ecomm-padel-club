import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCompetitionStats } from '../services/api'

export default function CompetitionStatsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState('jugados')

  useEffect(() => {
    getCompetitionStats(id)
      .then(setData)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="px-4 py-5 text-center text-gray-400">Competición no encontrada</div>
  )

  const { competition, players, totalWins, totalLosses, totalDraws } = data
  const totalPlayed = totalWins + totalLosses + totalDraws

  const sorted = [...players].sort((a, b) => {
    if (sortField === 'jugados') return b.jugados - a.jugados
    if (sortField === 'apuntados') return b.apuntados - a.apuntados
    if (sortField === 'ganados') return b.ganados - a.ganados
    if (sortField === 'pctGanados') return b.pctGanados - a.pctGanados
    return b[sortField] - a[sortField]
  })

  return (
    <div className="px-4 py-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 mb-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-5 h-5 rounded-full shrink-0"
          style={{ backgroundColor: competition.color || '#9ca3af' }}
        />
        <h1 className="text-xl font-bold text-gray-800">{competition.name}</h1>
      </div>

      {/* Global record */}
      <div className="card mb-5">
        <p className="text-xs text-gray-400 font-medium mb-2">Récord global</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{totalWins}</p>
            <p className="text-xs text-gray-400">Victorias</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{totalLosses}</p>
            <p className="text-xs text-gray-400">Derrotas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{totalDraws}</p>
            <p className="text-xs text-gray-400">Empates</p>
          </div>
          <div className="text-center ml-auto">
            <p className="text-2xl font-bold text-gray-700">{totalPlayed}</p>
            <p className="text-xs text-gray-400">Partidos</p>
          </div>
        </div>
      </div>

      {/* Player stats table */}
      {players.length === 0 ? (
        <div className="text-center pt-8 text-gray-400">
          <p className="font-medium">Sin datos todavía</p>
          <p className="text-sm mt-1">Los datos aparecerán cuando haya convocatorias en esta competición</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Por jugador</p>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
            >
              <option value="jugados">Ordenar: jugados</option>
              <option value="apuntados">Ordenar: apuntados</option>
              <option value="ganados">Ordenar: ganados</option>
              <option value="pctGanados">Ordenar: % ganados</option>
            </select>
          </div>

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-2">Jugador</th>
                  <th className="text-center px-2 py-2">Apt.</th>
                  <th className="text-center px-2 py-2">Jug.</th>
                  <th className="text-center px-2 py-2">%Jug.</th>
                  <th className="text-center px-2 py-2">Gan.</th>
                  <th className="text-center px-2 py-2">Per.</th>
                  <th className="text-center px-2 py-2">%Gan.</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={p.playerId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="text-center px-2 py-2.5 text-gray-500">{p.apuntados}</td>
                    <td className="text-center px-2 py-2.5 font-semibold text-gray-700">{p.jugados}</td>
                    <td className="text-center px-2 py-2.5 text-gray-500">{p.pctJugados}%</td>
                    <td className="text-center px-2 py-2.5 text-green-600 font-semibold">{p.ganados}</td>
                    <td className="text-center px-2 py-2.5 text-red-500">{p.perdidos}</td>
                    <td className="text-center px-2 py-2.5 font-semibold">
                      <span className={p.pctGanados >= 50 ? 'text-green-600' : 'text-red-500'}>
                        {p.pctGanados}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-3 px-1">
            Apt. = apuntados · Jug. = jugados · Gan. = ganados · Per. = perdidos
          </p>
        </div>
      )}
    </div>
  )
}
