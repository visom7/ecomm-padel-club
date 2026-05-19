import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompetitions, getCompetitionStats, deleteCompetition, updateCompetition, getBeerRounds, getBeerRoundStats, markBeerRoundPaid, handleAdminError } from '../services/api'
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
  const [togglingId, setTogglingId] = useState(null)
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
      getBeerRoundStats().then(setBeerStats).catch(() => {})
    } catch (err) {
      handleAdminError(err, navigate)
    } finally {
      setPayingId(null)
    }
  }

  const handleToggleActive = async (c) => {
    setTogglingId(c.id)
    try {
      const updated = await updateCompetition(c.id, { name: c.name, color: c.color, active: !c.active }, getAdminPin())
      setCompetitions(prev => prev.map(x => x.id === c.id ? { ...x, active: updated?.active ?? !c.active } : x))
    } catch (err) {
      handleAdminError(err, navigate)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la competición "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    try {
      await deleteCompetition(id, getAdminPin())
      setCompetitions(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      handleAdminError(err, navigate)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const openCompetitions = competitions.filter(c => c.active !== false)
  const closedCompetitions = competitions.filter(c => c.active === false)

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="px-5 pt-1 pb-2">
        <div className="eyebrow mb-1">PANEL · ADMIN</div>
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 32, lineHeight: 0.95, letterSpacing: '-1.1px' }}
        >
          Administración<br />
          <span className="text-daylight-pink">del club.</span>
        </h1>
      </div>

      {/* Competitions section */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-bold text-daylight-ink" style={{ fontSize: 18, letterSpacing: '-0.3px' }}>
            Competiciones
          </div>
          <button
            onClick={() => navigate('/admin/competitions/new')}
            className="btn-pink text-sm py-2.5 px-4"
          >
            + Nueva
          </button>
        </div>

        {competitions.length === 0 ? (
          <div className="card text-center py-8 text-daylight-ink-sub">
            <p className="font-display font-bold text-daylight-ink">Sin competiciones</p>
            <p className="text-sm mt-1">Crea la primera competición</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {openCompetitions.length > 0 && (
              <div>
                <div className="eyebrow mb-2 text-daylight-mint">● ABIERTAS · {openCompetitions.length}</div>
                <div className="flex flex-col gap-2.5">
                  {openCompetitions.map(c => (
                    <CompetitionCard
                      key={c.id}
                      c={c}
                      rec={records[c.id]}
                      onStats={() => navigate(`/admin/competitions/${c.id}/stats`)}
                      onEdit={() => navigate(`/admin/competitions/${c.id}/edit`)}
                      onDelete={() => handleDelete(c.id, c.name)}
                      deleting={deletingId === c.id}
                      onToggleActive={() => handleToggleActive(c)}
                      toggling={togglingId === c.id}
                    />
                  ))}
                </div>
              </div>
            )}
            {closedCompetitions.length > 0 && (
              <div>
                <div className="eyebrow mb-2">● CERRADAS · {closedCompetitions.length}</div>
                <div className="flex flex-col gap-2.5">
                  {closedCompetitions.map(c => (
                    <CompetitionCard
                      key={c.id}
                      c={c}
                      rec={records[c.id]}
                      onStats={() => navigate(`/admin/competitions/${c.id}/stats`)}
                      onEdit={() => navigate(`/admin/competitions/${c.id}/edit`)}
                      onDelete={() => handleDelete(c.id, c.name)}
                      deleting={deletingId === c.id}
                      onToggleActive={() => handleToggleActive(c)}
                      toggling={togglingId === c.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Beer rounds section */}
      <div className="px-5 pt-7">
        <div className="flex items-center gap-2 mb-3">
          <div className="font-display font-bold text-daylight-ink" style={{ fontSize: 18, letterSpacing: '-0.3px' }}>
            🍺 Cubos pendientes
          </div>
          {beerRounds.length > 0 && (
            <span className="bg-daylight-amber text-daylight-ink font-mono text-[10px] font-bold tracking-[0.1em] px-2 py-0.5 rounded-full">
              {beerRounds.length}
            </span>
          )}
        </div>

        {beerRounds.length === 0 ? (
          <div className="card text-center py-6 text-daylight-ink-sub">
            <p className="text-2xl mb-1">🍻</p>
            <p className="font-display font-bold text-daylight-ink text-sm">Sin cubos pendientes</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {beerRounds.map(b => (
              <div key={b.id} className="card flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-lg bg-daylight-pink-soft text-daylight-pink flex items-center justify-center shrink-0 text-base">
                  🍺
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[14px] text-daylight-ink truncate tracking-[-0.2px]">
                    {b.playerName}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.08em] text-daylight-ink-sub truncate">
                    {b.matchdayTitle}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkPaid(b.id)}
                  disabled={payingId === b.id}
                  className="shrink-0 font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg bg-daylight-mint-soft text-daylight-mint disabled:opacity-40 transition-colors active:bg-daylight-mint active:text-white"
                >
                  {payingId === b.id ? '…' : '✓ Pagado'}
                </button>
              </div>
            ))}
          </div>
        )}

        {beerStats.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowBeerStats(v => !v)}
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub underline"
            >
              {showBeerStats ? '▲ Ocultar' : '▼ Historial'} por jugador
            </button>
            {showBeerStats && (
              <div className="mt-2 card overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="font-mono text-[9px] font-bold tracking-[0.15em] uppercase text-daylight-ink-sub border-b border-daylight-hair">
                      <th className="text-left py-2 px-3">Jugador</th>
                      <th className="text-center py-2 px-2">Total</th>
                      <th className="text-center py-2 px-2 text-daylight-mint">Pag.</th>
                      <th className="text-center py-2 px-2 text-daylight-pink">Pend.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beerStats.map((s, i) => (
                      <tr key={s.playerId} className={i % 2 === 0 ? 'bg-daylight-surface' : 'bg-daylight-cream/50'}>
                        <td className="py-2 px-3 font-semibold text-daylight-ink">{s.playerName}</td>
                        <td className="text-center py-2 px-2 text-daylight-ink-sub">{s.total}</td>
                        <td className="text-center py-2 px-2 font-display font-bold text-daylight-mint">{s.paid}</td>
                        <td className="text-center py-2 px-2 font-display font-bold text-daylight-pink">{s.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CompetitionCard({ c, rec, onStats, onEdit, onDelete, deleting, onToggleActive, toggling }) {
  const totalPlayed = rec ? rec.totalWins + rec.totalLosses + rec.totalDraws : 0
  const isOpen = c.active !== false
  const color = c.color || '#FF2D72'
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
        <span className="font-display font-bold text-daylight-ink flex-1 tracking-[-0.2px]" style={{ fontSize: 16 }}>
          {c.name}
        </span>
      </div>
      {rec !== undefined && totalPlayed > 0 && (
        <div className="flex items-center gap-3 mb-3 pl-6">
          <span className="font-display font-extrabold text-daylight-mint" style={{ fontSize: 16, letterSpacing: '-0.3px' }}>
            {rec.totalWins}V
          </span>
          <span className="font-display font-extrabold text-daylight-red" style={{ fontSize: 16, letterSpacing: '-0.3px' }}>
            {rec.totalLosses}D
          </span>
          {rec.totalDraws > 0 && (
            <span className="font-display font-extrabold text-daylight-ink-sub" style={{ fontSize: 16, letterSpacing: '-0.3px' }}>
              {rec.totalDraws}E
            </span>
          )}
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub">
            · {totalPlayed} jug.
          </span>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        <ActionButton onClick={onStats} tone="ink">Stats</ActionButton>
        <ActionButton onClick={onEdit} tone="cream">Editar</ActionButton>
        <ActionButton onClick={onToggleActive} disabled={toggling} tone={isOpen ? 'amber' : 'mint'}>
          {toggling ? '…' : isOpen ? '🔒 Cerrar' : '🔓 Abrir'}
        </ActionButton>
        <ActionButton onClick={onDelete} disabled={deleting} tone="red">
          {deleting ? '…' : 'Borrar'}
        </ActionButton>
      </div>
    </div>
  )
}

function ActionButton({ onClick, disabled, tone, children }) {
  const toneCls = {
    ink:   'bg-daylight-ink text-white',
    cream: 'bg-daylight-cream text-daylight-ink border border-daylight-hair',
    amber: 'bg-daylight-amber text-daylight-ink',
    mint:  'bg-daylight-mint-soft text-daylight-mint',
    red:   'bg-daylight-red-soft text-daylight-red',
  }[tone]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-mono text-[10px] font-bold tracking-[0.08em] uppercase rounded-lg py-2 disabled:opacity-40 transition-opacity active:opacity-80 ${toneCls}`}
    >
      {children}
    </button>
  )
}
