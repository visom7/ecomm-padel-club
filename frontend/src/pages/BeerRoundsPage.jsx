import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBeerRoundsHistory } from '../services/api'
import LcdCounter from '../components/LcdCounter'

const LEADER_COLORS = ['#FF2D72', '#8B5CF6', '#F4B400']

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()
}

function fullDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
}

function initials(name) {
  if (!name) return '··'
  return name.slice(0, 2).toUpperCase()
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

  const { pending, paidThisWeek, leaderboard, sortedRounds } = useMemo(() => {
    const pending = rounds.filter(r => !r.paid).length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const paidThisWeek = rounds.filter(r => {
      if (!r.paid) return false
      const at = r.paidAt ? new Date(r.paidAt).getTime() : NaN
      return !isNaN(at) && at >= weekAgo
    }).length

    const tally = new Map()
    rounds.forEach(r => {
      const key = r.playerName || '—'
      tally.set(key, (tally.get(key) || 0) + 1)
    })
    const leaderboard = Array.from(tally.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const sortedRounds = [...rounds].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    return { pending, paidThisWeek, leaderboard, sortedRounds }
  }, [rounds])

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
          El Banco de Cubos
        </span>
        <div className="w-9 h-9" />
      </div>

      {loading && (
        <div className="flex justify-center pt-16">
          <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-center text-daylight-red pt-10">{error}</p>}

      {!loading && !error && (
        <>
          {/* Hero counter card */}
          <div className="px-4 mt-2.5">
            <div className="bg-daylight-ink text-white rounded-[28px] p-6 relative overflow-hidden">
              <div
                className="absolute"
                style={{
                  right: -20, top: -20, fontSize: 140, opacity: 0.06,
                  fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                  fontWeight: 800, color: '#fff', letterSpacing: '-8px',
                  lineHeight: 1, pointerEvents: 'none',
                }}
              >
                🍺
              </div>
              <div className="relative">
                <div className="font-mono text-[10px] tracking-[0.2em] mb-2.5"
                  style={{ color: '#F4B400' }}
                >
                  CONTADOR · CUBOS PENDIENTES
                </div>
                <div className="mb-4.5" style={{ marginBottom: 18 }}>
                  <LcdCounter value={pending} size="lg" />
                </div>
                <div className="flex justify-between items-end gap-3">
                  <div>
                    <div className="font-display font-extrabold text-2xl tracking-[-0.5px]">
                      {pending} ronda{pending === 1 ? '' : 's'}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#9C9AA5' }}>
                      debe el equipo · {paidThisWeek} pagada{paidThisWeek === 1 ? '' : 's'} esta semana
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="px-4 pt-5">
              <div className="font-display font-bold text-[18px] tracking-[-0.3px] text-daylight-ink mb-2.5">
                Ranking de la vergüenza
              </div>
              <div className="flex flex-col gap-2">
                {leaderboard.slice(0, 3).map((p, i) => (
                  <div
                    key={p.name + i}
                    className="flex items-center gap-3 bg-daylight-surface border border-daylight-hair rounded-2xl px-3.5 py-2.5"
                  >
                    <div className="font-display font-extrabold text-[22px] tracking-[-1px] w-6 text-daylight-ink-sub">
                      {i + 1}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full text-white font-display font-bold text-[13px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: LEADER_COLORS[i] || '#16131A' }}
                    >
                      {initials(p.name)}
                    </div>
                    <div className="flex-1 font-semibold text-daylight-ink truncate">{p.name}</div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="font-display font-extrabold text-[22px] tracking-[-0.5px] text-daylight-ink">
                        {p.count}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-daylight-ink-sub">
                        Cubos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {leaderboard.length > 3 && (
                <div className="flex flex-col mt-2 px-1">
                  {leaderboard.slice(3).map((p, i) => (
                    <div
                      key={p.name + (i + 3)}
                      className="flex items-center gap-3 py-2 border-b border-daylight-hair last:border-b-0"
                    >
                      <div className="font-mono text-[11px] text-daylight-ink-sub w-6 tabular-nums">
                        {i + 4}.
                      </div>
                      <div className="flex-1 text-[13px] font-semibold text-daylight-ink truncate">
                        {p.name}
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span className="font-display font-bold text-[15px] text-daylight-ink tabular-nums">
                          {p.count}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-daylight-ink-sub">
                          Cubos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent history */}
          <div className="px-4 pt-5">
            <div className="eyebrow mb-2">ÚLTIMOS APUNTES</div>
            {sortedRounds.length === 0 ? (
              <div className="text-center pt-10 text-daylight-ink-sub">
                <span className="text-5xl block mb-3">🍻</span>
                <p className="font-display font-bold text-daylight-ink">¡Sin cubos registrados!</p>
                <p className="text-sm mt-1">Aquí aparecerá el historial</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {sortedRounds.map(r => (
                  <div
                    key={r.id}
                    className="flex items-start gap-2.5 py-2.5 border-b border-daylight-hair last:border-b-0"
                  >
                    <div
                      className={
                        'w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ' +
                        (r.paid
                          ? 'bg-daylight-mint-soft text-daylight-mint'
                          : 'bg-daylight-pink-soft text-daylight-pink')
                      }
                    >
                      {r.paid ? '✓' : '🍺'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-daylight-ink">
                        <span className="text-daylight-pink">{r.playerName}</span>
                        {r.matchdayTitle ? <> — {r.matchdayTitle}</> : null}
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.1em] text-daylight-ink-sub mt-0.5">
                        {fullDate(r.createdAt) || formatDate(r.createdAt)} · {r.paid ? 'PAGADO' : 'PENDIENTE'}
                        {r.paid && r.paidAt && <> · {formatDate(r.paidAt)}</>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
