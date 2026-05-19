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
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="px-4 py-5 text-center text-daylight-ink-sub">Competición no encontrada</div>
  )

  const { competition, players, totalWins, totalLosses, totalDraws } = data
  const totalPlayed = totalWins + totalLosses + totalDraws
  const competitionColor = competition.color || '#FF2D72'

  const sorted = [...players].sort((a, b) => {
    if (sortField === 'jugados') return b.jugados - a.jugados
    if (sortField === 'apuntados') return b.apuntados - a.apuntados
    if (sortField === 'ganados') return b.ganados - a.ganados
    if (sortField === 'pctGanados') return b.pctGanados - a.pctGanados
    return b[sortField] - a[sortField]
  })

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="px-4 pt-1 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-daylight-surface border border-daylight-hair rounded-xl"
          aria-label="Volver"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-daylight-ink">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub">
          Estadísticas
        </span>
        <div className="w-9 h-9" />
      </div>

      {/* Hero card */}
      <div className="px-4 mt-1.5">
        <div className="bg-daylight-ink text-white rounded-3xl p-5 relative overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              right: -50, top: -50, width: 180, height: 180,
              background: competitionColor, opacity: 0.85,
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: competitionColor }}
              />
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-75">
                Competición
              </span>
            </div>
            <h1
              className="font-display font-extrabold text-white"
              style={{ fontSize: 30, lineHeight: 1, letterSpacing: '-1.1px' }}
            >
              {competition.name}
            </h1>

            <div className="flex gap-4 mt-5">
              <HeroNum value={totalWins} label="VICTORIAS" color="#0EBE89" />
              <HeroNum value={totalLosses} label="DERROTAS" color="#E2434B" />
              {totalDraws > 0 && <HeroNum value={totalDraws} label="EMPATES" color="#9C9AA5" />}
              <HeroNum value={totalPlayed} label="TOTALES" color="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>

      {/* Player stats */}
      {players.length === 0 ? (
        <div className="px-5 pt-10 text-center text-daylight-ink-sub">
          <p className="font-display font-bold text-daylight-ink">Sin datos todavía</p>
          <p className="text-sm mt-1">Los datos aparecerán con la primera convocatoria</p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow">POR JUGADOR · {players.length}</div>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value)}
                className="input-field text-xs py-1.5 px-2 w-auto"
              >
                <option value="jugados">jugados</option>
                <option value="apuntados">apuntados</option>
                <option value="ganados">ganados</option>
                <option value="pctGanados">% ganados</option>
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              {sorted.map(p => (
                <PlayerStatCard key={p.playerId} p={p} />
              ))}
            </div>

            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-daylight-ink-sub mt-3 px-1">
              Apt. = apuntados · Jug. = jugados · Gan. = ganados · Per. = perdidos
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function HeroNum({ value, label, color }) {
  return (
    <div className="flex-1 min-w-0">
      <div
        className="font-display font-extrabold"
        style={{ fontSize: 28, lineHeight: 1, letterSpacing: '-1px', color }}
      >
        {value}
      </div>
      <div className="font-mono text-[9px] tracking-[0.15em] uppercase opacity-70 mt-1 truncate">
        {label}
      </div>
    </div>
  )
}

function PlayerStatCard({ p }) {
  const pctGanados = Math.min(Math.max(0, p.pctGanados || 0), 100)
  const pctJugados = Math.min(Math.max(0, p.pctJugados || 0), 100)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-display font-bold text-[15px] text-daylight-ink truncate tracking-[-0.2px]">
          {p.name}
        </span>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="font-display font-extrabold text-daylight-ink" style={{ fontSize: 18, letterSpacing: '-0.4px' }}>
            {p.jugados}
          </span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-ink-sub">
            JUG.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        <Mini label="APT" value={p.apuntados} />
        <Mini label="GAN" value={p.ganados} accent="mint" />
        <Mini label="PER" value={p.perdidos} accent="red" />
        <Mini label="%G" value={`${pctGanados}%`} accent={pctGanados >= 50 ? 'mint' : 'red'} />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-daylight-ink-sub w-16 shrink-0">
          % Asist.
        </span>
        <div className="flex-1 bg-daylight-cream rounded-full h-1.5">
          <div
            className="bg-daylight-ink h-1.5 rounded-full transition-all"
            style={{ width: `${pctJugados}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-semibold text-daylight-ink w-9 text-right shrink-0">
          {pctJugados}%
        </span>
      </div>
    </div>
  )
}

function Mini({ label, value, accent }) {
  const colorCls = accent === 'mint'
    ? 'text-daylight-mint'
    : accent === 'red'
      ? 'text-daylight-red'
      : 'text-daylight-ink'
  return (
    <div className="text-center">
      <div className={`font-display font-extrabold ${colorCls}`} style={{ fontSize: 16, letterSpacing: '-0.3px' }}>
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-daylight-ink-sub mt-0.5">
        {label}
      </div>
    </div>
  )
}
