import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayedMatchdays } from '../services/api'
import { useCompetition } from '../context/CompetitionsContext'
import { useSession } from '../context/SessionContext'

const OUTCOME_BADGE = {
  WIN:  { label: 'VICTORIA',  cls: 'bg-daylight-mint-soft text-daylight-mint' },
  LOSS: { label: 'DERROTA',   cls: 'bg-daylight-red-soft text-daylight-red' },
  DRAW: { label: 'EMPATE',    cls: 'bg-gray-100 text-daylight-ink-sub' },
  WO:   { label: 'NO JUGADO', cls: 'bg-gray-100 text-daylight-ink-sub' },
}

export default function PlayedMatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { session } = useSession()

  useEffect(() => {
    getPlayedMatchdays()
      .then(data => setMatches(data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const wins = matches.filter(m => m.matchResult?.outcome === 'WIN').length
  const losses = matches.filter(m => m.matchResult?.outcome === 'LOSS').length

  return (
    <div className="pb-24">
      <div className="px-5 pt-1 pb-2 flex items-end justify-between">
        <div>
          <div className="eyebrow mb-1">JUGADOS · {matches.length}</div>
          <h1
            className="font-display font-extrabold text-daylight-ink"
            style={{ fontSize: 32, lineHeight: 0.95, letterSpacing: '-1.1px' }}
          >
            Partidos<br />
            <span className="text-daylight-pink">jugados.</span>
          </h1>
        </div>
        {session?.isAdmin && (
          <button
            onClick={() => navigate('/players/stats')}
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub underline"
          >
            Récord →
          </button>
        )}
      </div>

      {matches.length > 0 && (
        <div className="px-5 pt-3">
          <div className="bg-daylight-ink text-white rounded-2xl px-4 py-3 flex items-center justify-around">
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl tracking-[-0.5px] text-daylight-mint">{wins}</div>
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-70 mt-0.5">Ganados</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl tracking-[-0.5px] text-daylight-red">{losses}</div>
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-70 mt-0.5">Perdidos</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl tracking-[-0.5px]">{matches.length}</div>
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-70 mt-0.5">Totales</div>
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center pt-16 text-daylight-ink-sub">
          <svg className="w-16 h-16 mx-auto mb-4 text-daylight-hair" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="font-display font-bold text-daylight-ink">Sin partidos jugados aún</p>
          <p className="text-sm mt-1">Aquí aparecerán los resultados</p>
        </div>
      ) : (
        <div className="px-5 pt-4 flex flex-col gap-3">
          {matches.map(m => (
            <PlayedMatchCard key={m.id} match={m} onClick={() => navigate(`/matchdays/${m.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayedMatchCard({ match, onClick }) {
  const { title, date, venue, competition, rivalTeam, matchResult } = match
  const competitionData = useCompetition(competition)
  const competitionLabel = competitionData?.name
    ?? (competition && !competition.includes('-') ? competition : null)
  const competitionColor = competitionData?.color || '#FF2D72'
  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    : null

  const outcome = matchResult?.outcome ? OUTCOME_BADGE[matchResult.outcome] : null

  return (
    <div onClick={onClick} className="card cursor-pointer active:bg-daylight-cream/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {outcome && (
              <span className={`badge ${outcome.cls}`}>{outcome.label}</span>
            )}
            {competitionLabel && (
              <span className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-daylight-ink-sub flex items-center gap-1.5">
                <span
                  className="inline-block w-[7px] h-[7px] rounded-sm shrink-0"
                  style={{ backgroundColor: competitionColor }}
                />
                {competitionLabel}
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-[19px] leading-tight tracking-[-0.4px] text-daylight-ink truncate">
            {title || 'Partido'}
          </h2>
          {rivalTeam && (
            <p className="text-xs font-semibold text-daylight-ink-sub mt-0.5 truncate">
              vs {rivalTeam}
            </p>
          )}
          {(formattedDate || venue) && (
            <p className="text-xs text-daylight-ink-sub mt-1.5 truncate">
              {formattedDate && <span className="font-semibold text-daylight-ink">{formattedDate}</span>}
              {venue && <> · {venue}</>}
            </p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-daylight-ink-sub shrink-0 mt-1.5"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {matchResult && [matchResult.pair1, matchResult.pair2, matchResult.pair3].some(Boolean) && (
        <div className="mt-3.5 pt-3.5 border-t border-dashed border-daylight-hair space-y-1.5">
          {[matchResult.pair1, matchResult.pair2, matchResult.pair3]
            .filter(Boolean)
            .map((pair, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub w-16 shrink-0">
                  Pareja {i + 1}
                </span>
                <span className="font-mono text-[13px] font-semibold text-daylight-ink">
                  {(pair.sets || []).map(s => `${s.gamesHome}–${s.gamesAway}`).join('  ·  ') || '—'}
                </span>
              </div>
            ))}
          {matchResult.finalPlayers?.length > 0 && (
            <p className="font-mono text-[10px] tracking-[0.08em] text-daylight-ink-sub mt-1">
              Jugaron: <span className="text-daylight-ink font-semibold">{matchResult.finalPlayers.join(', ')}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
