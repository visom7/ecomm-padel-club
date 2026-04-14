import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayedMatchdays } from '../services/api'

export default function PlayedMatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getPlayedMatchdays()
      .then(data => setMatches(data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-gray-800 mb-5">Partidos jugados</h1>

      {matches.length === 0 ? (
        <div className="text-center pt-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="font-medium">Sin partidos jugados aún</p>
          <p className="text-sm mt-1">Aquí aparecerán los resultados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(m => <PlayedMatchCard key={m.id} match={m} onClick={() => navigate(`/matchdays/${m.id}`)} />)}
        </div>
      )}
    </div>
  )
}

const OUTCOME_BADGE = {
  WIN:  { label: 'Victoria', cls: 'bg-green-100 text-green-700' },
  LOSS: { label: 'Derrota',  cls: 'bg-red-100 text-red-600' },
  DRAW: { label: 'Empate',   cls: 'bg-gray-100 text-gray-500' },
}

function PlayedMatchCard({ match, onClick }) {
  const { title, date, venue, competition, matchResult } = match
  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const outcome = matchResult?.outcome ? OUTCOME_BADGE[matchResult.outcome] : null

  return (
    <div onClick={onClick} className="card cursor-pointer active:bg-gray-50">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-played">Jugado</span>
            {outcome && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${outcome.cls}`}>
                {outcome.label}
              </span>
            )}
          </div>
          <h2 className="font-bold text-gray-800 mt-1">{title || 'Partido'}</h2>
          {(formattedDate || venue) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[formattedDate, venue].filter(Boolean).join(' · ')}
            </p>
          )}
          {competition && <p className="text-xs text-gray-400 mt-0.5">{competition}</p>}
        </div>
        <svg className="w-5 h-5 text-gray-300 shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {matchResult && (
        <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
          {[matchResult.pair1, matchResult.pair2, matchResult.pair3]
            .filter(Boolean)
            .map((pair, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 w-16 text-xs">Pareja {i + 1}</span>
                <span className="font-mono text-gray-700">
                  {(pair.sets || []).map(s => `${s.gamesHome}–${s.gamesAway}`).join(' · ')}
                </span>
              </div>
            ))}
          {matchResult.finalPlayers?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Jugaron: {matchResult.finalPlayers.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
