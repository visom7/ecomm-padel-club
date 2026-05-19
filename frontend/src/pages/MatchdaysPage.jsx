import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveMatchdays, deleteMatchday, getBeerRoundsHistory, handleAdminError } from '../services/api'
import { useSession } from '../context/SessionContext'
import { useCompetitions } from '../context/CompetitionsContext'
import { getAdminPin } from '../context/adminPin'
import MatchdayCard from '../components/MatchdayCard'
import LcdCounter from '../components/LcdCounter'

const ALL_FILTER = '__ALL__'

export default function MatchdaysPage() {
  const [matchdays, setMatchdays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [beerPending, setBeerPending] = useState(0)
  const [filter, setFilter] = useState(ALL_FILTER)
  const { session } = useSession()
  const competitions = useCompetitions()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    Promise.all([
      getActiveMatchdays(),
      getBeerRoundsHistory(),
    ])
      .then(([data, beers]) => {
        setMatchdays(data.sort((a, b) => {
          if (!a.date) return 1
          if (!b.date) return -1
          return new Date(a.date) - new Date(b.date)
        }))
        setBeerPending(beers.filter(b => !b.paid).length)
      })
      .catch(() => setError('No se pudo cargar las convocatorias'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const competitionOptions = useMemo(() => {
    const seen = new Map()
    matchdays.forEach(m => {
      if (!m.competition) return
      if (!seen.has(m.competition)) {
        const data = competitions?.find(c => c.id === m.competition)
        seen.set(m.competition, data?.name ?? m.competition)
      }
    })
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }))
  }, [matchdays, competitions])

  const visibleMatchdays = filter === ALL_FILTER
    ? matchdays
    : matchdays.filter(m => m.competition === filter)

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta convocatoria?')) return
    try {
      await deleteMatchday(id, getAdminPin())
      load()
    } catch (err) {
      handleAdminError(err, navigate)
    }
  }

  const handleRespond = (updatedMatchday) => {
    setMatchdays(prev => prev.map(m => m.id === updatedMatchday.id ? updatedMatchday : m))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMsg msg={error} />

  return (
    <div className="pb-24">
      <Greeting count={matchdays.length} />

      <CubosStrip pending={beerPending} onClick={() => navigate('/cubos')} />

      {competitionOptions.length > 1 && (
        <FilterChips
          options={competitionOptions}
          value={filter}
          onChange={setFilter}
        />
      )}

      {session?.isAdmin && (
        <div className="px-5 pt-3 flex justify-end">
          <button
            onClick={() => navigate('/matchdays/new')}
            className="btn-pink text-sm py-2.5 px-4 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva
          </button>
        </div>
      )}

      <div className="px-5 pt-3 flex flex-col gap-3">
        {visibleMatchdays.length === 0 ? (
          <EmptyState filtered={filter !== ALL_FILTER} />
        ) : (
          visibleMatchdays.map(m => (
            <MatchdayCard
              key={m.id}
              matchday={m}
              isAdmin={session?.isAdmin}
              onDelete={() => handleDelete(m.id)}
              onEdit={() => navigate(`/matchdays/${m.id}/edit`)}
              onClick={() => navigate(`/matchdays/${m.id}`)}
              onRespond={handleRespond}
            />
          ))
        )}
      </div>
    </div>
  )
}

function Greeting({ count }) {
  let trailing
  if (count === 0) {
    trailing = <span className="text-daylight-ink">nada en pista.</span>
  } else if (count === 1) {
    trailing = <span className="text-daylight-pink">1 partido.</span>
  } else {
    trailing = <span className="text-daylight-pink">{count} partidos.</span>
  }
  return (
    <div className="px-5 pt-1 pb-2">
      <h1
        className="font-display font-extrabold text-daylight-ink"
        style={{ fontSize: 38, lineHeight: 0.95, letterSpacing: '-1.3px', margin: 0 }}
      >
        Esta semana,<br />
        {trailing}
      </h1>
    </div>
  )
}

function CubosStrip({ pending, onClick }) {
  return (
    <div className="px-5 pt-3.5 pb-1.5">
      <div
        onClick={onClick}
        className="bg-daylight-ink rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer active:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-2.5">
          <LcdCounter value={pending} size="sm" />
          <span
            className="font-mono text-[10px] tracking-[0.15em] uppercase"
            style={{ color: '#9C9AA5' }}
          >
            Cubos pendientes
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          className="bg-daylight-amber text-daylight-ink font-display font-bold text-xs px-3 py-2 rounded-[10px]"
          style={{ letterSpacing: 0.2 }}
        >
          Ver →
        </button>
      </div>
    </div>
  )
}

function FilterChips({ options, value, onChange }) {
  return (
    <div className="px-5 pt-3.5 pb-1.5 flex gap-2 overflow-x-auto scrollbar-none">
      <button
        onClick={() => onChange(ALL_FILTER)}
        className={'chip ' + (value === ALL_FILTER ? 'chip-selected' : '')}
      >
        Todas
      </button>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={'chip whitespace-nowrap ' + (value === opt.id ? 'chip-selected' : '')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ErrorMsg({ msg }) {
  return <p className="text-center text-daylight-red pt-20">{msg}</p>
}

function EmptyState({ filtered }) {
  return (
    <div className="text-center pt-12 text-daylight-ink-sub">
      <svg className="w-16 h-16 mx-auto mb-4 text-daylight-hair" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="font-display font-bold text-daylight-ink">
        {filtered ? 'Sin convocatorias para este filtro' : 'No hay convocatorias abiertas'}
      </p>
      <p className="text-sm mt-1">
        {filtered ? 'Prueba con "Todas"' : 'Los administradores pueden crear una nueva'}
      </p>
    </div>
  )
}
