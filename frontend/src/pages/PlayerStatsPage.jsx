import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerGlobalStats } from '../services/api'
import { useSession } from '../context/SessionContext'

const LEADER_COLORS = ['#FF2D72', '#8B5CF6', '#F4B400']

function initials(name) {
  if (!name) return '··'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

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
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const sorted = [...players].sort((a, b) => {
    if (sortField === 'pctGanados') return b.pctGanados - a.pctGanados
    if (sortField === 'pctJugados') return b.pctJugados - a.pctJugados
    return b[sortField] - a[sortField]
  })

  return (
    <div className="pb-24">
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
          Récord general
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="px-5 pt-2 pb-2">
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 32, lineHeight: 0.95, letterSpacing: '-1.1px' }}
        >
          Récord del<br />
          <span className="text-daylight-pink">club.</span>
        </h1>
        <p className="text-sm text-daylight-ink-sub mt-2">
          {players.length} jugador{players.length !== 1 ? 'es' : ''} · todos los partidos
        </p>
      </div>

      {players.length === 0 ? (
        <div className="text-center pt-16 text-daylight-ink-sub">
          <p className="font-display font-bold text-daylight-ink">Sin datos todavía</p>
          <p className="text-sm mt-1">Los datos aparecerán cuando se registren resultados</p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-3">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="input-field text-sm py-2"
            >
              <option value="jugados">Ordenar: jugados</option>
              <option value="apuntados">Ordenar: apuntados</option>
              <option value="ganados">Ordenar: ganados</option>
              <option value="pctJugados">Ordenar: % asistencia</option>
              <option value="pctGanados">Ordenar: % victorias</option>
            </select>
          </div>

          <div className="px-5 pt-3 flex flex-col gap-2.5">
            {sorted.map((p, i) => (
              <PlayerRow key={p.playerId} player={p} rank={i + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PlayerRow({ player, rank }) {
  const { name, jugados, ganados, perdidos, pctJugados, pctGanados } = player
  const isPodium = rank <= 3
  const accent = LEADER_COLORS[rank - 1] || '#16131A'

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div
          className="font-display font-extrabold w-7 text-center shrink-0"
          style={{
            fontSize: 22,
            letterSpacing: '-1px',
            color: isPodium ? accent : '#6B5F6A',
          }}
        >
          {rank}
        </div>
        <div
          className="w-9 h-9 rounded-full text-white font-display font-bold text-sm flex items-center justify-center shrink-0"
          style={{ backgroundColor: isPodium ? accent : '#16131A' }}
        >
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-display font-bold text-[15px] text-daylight-ink truncate tracking-[-0.2px]">
              {name}
            </span>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub shrink-0">
              {jugados} JUG.
            </span>
          </div>

          <Bar
            label="Asistencia"
            value={pctJugados}
            track="bg-daylight-cream"
            fill="bg-daylight-ink"
          />
          <Bar
            label="Victorias"
            value={pctGanados}
            track="bg-daylight-cream"
            fill={pctGanados >= 50 ? 'bg-daylight-mint' : 'bg-daylight-red'}
          />
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="font-display font-extrabold text-daylight-mint" style={{ fontSize: 20, letterSpacing: '-0.5px' }}>
            {ganados}
          </span>
          <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-daylight-ink-sub">G</span>
          <span className="font-display font-extrabold text-daylight-red" style={{ fontSize: 14, letterSpacing: '-0.3px' }}>
            {perdidos}
          </span>
          <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-daylight-ink-sub">P</span>
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, track, fill }) {
  const pct = Math.min(Math.max(0, value || 0), 100)
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-daylight-ink-sub w-16 shrink-0">
        {label}
      </span>
      <div className={`flex-1 rounded-full h-1.5 ${track}`}>
        <div className={`${fill} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[10px] font-semibold text-daylight-ink w-9 text-right shrink-0">
        {pct}%
      </span>
    </div>
  )
}
