import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompetitions, getCompetitionStats, deleteCompetition, getBeerRounds, getBeerRoundStats, markBeerRoundPaid, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'
import { useSession } from '../context/SessionContext'

export default function AdminPage() {
  const [competitions, setCompetitions] = useState([])
  const [records, setRecords] = useState({})
  const [beerRounds, setBeerRounds] = useState([])
  const [beerStats, setBeerStats] = useState([])
  const [showBeerStats, setShowBeerStats] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const navigate = useNavigate()
  const { session } = useSession()

  useEffect(() => {
    if (!session?.isAdmin) {
      navigate('/')
      return
    }
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [list, beers, stats] = await Promise.all([getCompetitions(), getBeerRounds(), getBeerRoundStats()])
      setCompetitions(list)
      setBeerRounds(beers)
      setBeerStats(stats)
      const statsResults = await Promise.allSettled(list.map(c => getCompetitionStats(c.id)))
      const rec = {}
      statsResults.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          const { totalWins, totalLosses, totalDraws } = res.value
          rec[list[i].id] = { totalWins, totalLosses, totalDraws }
        }
      })
      setRecords(rec)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (id) => {
    setPayingId(id)
    try {
      await markBeerRoundPaid(id, getAdminPin())
      setBeerRounds(prev => prev.filter(b => b.id !== id))
      // refresh stats
      getBeerRoundStats().then(setBeerStats).catch(() => {})
    } catch (err) {
      handleAdminError(err, navigate)
    } finally {
      setPayingId(null)
    }
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
    <div className="px-4 py-5 space-y-6">

      {/* Beer rounds section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-800">🍺 Cubos pendientes</h2>
          {beerRounds.length > 0 && (
            <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {beerRounds.length}
            </span>
          )}
        </div>

        {beerRounds.length === 0 ? (
          <div className="card text-center py-6 text-gray-400">
            <p className="text-2xl mb-1">🍺</p>
            <p className="font-medium text-sm">Sin cubos pendientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {beerRounds.map(b => (
              <div key={b.id} className="card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{b.playerName}</p>
                  <p className="text-xs text-gray-400 truncate">{b.matchdayTitle}</p>
                </div>
                <button
                  onClick={() => handleMarkPaid(b.id)}
                  disabled={payingId === b.id}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 active:bg-amber-200 disabled:opacity-40 transition-colors"
                >
                  {payingId === b.id ? '…' : '✅ Pagado'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Beer round stats / history */}
        {beerStats.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowBeerStats(v => !v)}
              className="text-xs text-amber-600 font-semibold flex items-center gap-1"
            >
              {showBeerStats ? '▲' : '▼'} Historial por jugador
            </button>
            {showBeerStats && (
              <div className="mt-2 card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left py-2 pr-3">Jugador</th>
                      <th className="text-center py-2 px-2">Total</th>
                      <th className="text-center py-2 px-2 text-green-600">Pagados</th>
                      <th className="text-center py-2 px-2 text-amber-600">Pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beerStats.map((s, i) => (
                      <tr key={s.playerId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 pr-3 font-medium text-gray-800">{s.playerName}</td>
                        <td className="text-center py-2 px-2 text-gray-500">{s.total}</td>
                        <td className="text-center py-2 px-2 font-semibold text-green-600">{s.paid}</td>
                        <td className="text-center py-2 px-2 font-bold text-amber-600">{s.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Competitions section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Competiciones</h2>
          <button
            onClick={() => navigate('/admin/competitions/new')}
            className="btn-pink px-4 py-2 text-sm"
          >
            + Nueva
          </button>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center pt-8 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Sin competiciones</p>
            <p className="text-sm mt-1">Crea la primera competición</p>
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map(c => {
              const rec = records[c.id]
              const totalPlayed = rec ? rec.totalWins + rec.totalLosses + rec.totalDraws : 0
              return (
                <div key={c.id} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || '#9ca3af' }}
                    />
                    <span className="font-semibold text-gray-800 flex-1">{c.name}</span>
                  </div>

                  {rec !== undefined && (
                    <div className="flex items-center gap-3 mb-3 pl-7">
                      <span className="text-sm font-bold text-green-600">{rec.totalWins}V</span>
                      <span className="text-sm font-bold text-red-500">{rec.totalLosses}D</span>
                      {rec.totalDraws > 0 && (
                        <span className="text-sm font-bold text-gray-400">{rec.totalDraws}E</span>
                      )}
                      <span className="text-xs text-gray-400">· {totalPlayed} partido{totalPlayed !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
