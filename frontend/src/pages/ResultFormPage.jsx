import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, submitResult } from '../services/api'
import { getAdminPin } from '../context/adminPin'

const EMPTY_PAIR = { sets: [{ gamesHome: '', gamesAway: '' }, { gamesHome: '', gamesAway: '' }, { gamesHome: '', gamesAway: '' }] }

const OUTCOMES = [
  { value: 'WIN',  label: 'Ganamos',  emoji: '🏆', active: 'bg-green-500 border-green-500 text-white', inactive: 'border-green-400 text-green-600' },
  { value: 'LOSS', label: 'Perdimos', emoji: '😔', active: 'bg-red-400 border-red-400 text-white',     inactive: 'border-red-300 text-red-500' },
  { value: 'DRAW', label: 'Empate',   emoji: '🤝', active: 'bg-gray-400 border-gray-400 text-white',   inactive: 'border-gray-300 text-gray-500' },
]

export default function ResultFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [matchday, setMatchday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [outcome, setOutcome] = useState(null)
  const [finalPlayers, setFinalPlayers] = useState([])
  const [pairs, setPairs] = useState([
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
  ])

  useEffect(() => {
    getMatchday(id).then(data => {
      setMatchday(data)

      const existing = data.matchResult
      if (existing) {
        // Pre-populate from existing result
        setOutcome(existing.outcome || null)
        setFinalPlayers(existing.finalPlayers || [])
        const pairToForm = (pair) => pair
          ? { sets: [0, 1, 2].map(i => pair.sets?.[i]
              ? { gamesHome: pair.sets[i].gamesHome, gamesAway: pair.sets[i].gamesAway }
              : { gamesHome: '', gamesAway: '' }) }
          : structuredClone(EMPTY_PAIR)
        setPairs([pairToForm(existing.pair1), pairToForm(existing.pair2), pairToForm(existing.pair3)])
      } else {
        const avail = data.registrations.filter(r => r.availability === 'AVAILABLE').map(r => r.name)
        setFinalPlayers(avail)
      }
      setLoading(false)
    })
  }, [id])

  const togglePlayer = (name) => {
    setFinalPlayers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const setScore = (pairIdx, setIdx, field, value) => {
    setPairs(prev => {
      const next = prev.map((p, i) =>
        i === pairIdx
          ? { sets: p.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
          : p
      )
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const buildPair = (pair) => ({
        sets: pair.sets
          .filter(s => s.gamesHome !== '' && s.gamesAway !== '')
          .map(s => ({ gamesHome: Number(s.gamesHome), gamesAway: Number(s.gamesAway) }))
      })
      await submitResult(id, {
        outcome,
        finalPlayers,
        pair1: buildPair(pairs[0]),
        pair2: buildPair(pairs[1]),
        pair3: buildPair(pairs[2]),
      }, getAdminPin())
      navigate(`/matchdays/${id}`)
    } catch (err) {
      setError('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const allPlayers = matchday?.registrations.map(r => r.name) || []

  return (
    <div className="px-4 py-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 mb-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">
        {matchday?.matchResult ? 'Editar resultado' : 'Registrar resultado'}
      </h1>
      <p className="text-sm text-gray-500 mb-5">{matchday?.title || 'Partido'}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Outcome */}
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Resultado del partido</p>
          <div className="flex gap-2">
            {OUTCOMES.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOutcome(o.value)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
                  outcome === o.value ? o.active : o.inactive
                }`}
              >
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Final players */}
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">¿Quién jugó finalmente?</p>
          <div className="flex flex-wrap gap-2">
            {allPlayers.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => togglePlayer(name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  finalPlayers.includes(name)
                    ? 'bg-padel-pink border-padel-pink text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Pairs */}
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">Pareja {pairIdx + 1}</p>
            <div className="space-y-2">
              {pair.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-10">Set {setIdx + 1}</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={set.gamesHome}
                    onChange={e => setScore(pairIdx, setIdx, 'gamesHome', e.target.value)}
                    placeholder="0"
                    className="w-16 text-center border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:border-padel-pink"
                  />
                  <span className="text-gray-400 text-sm">–</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={set.gamesAway}
                    onChange={e => setScore(pairIdx, setIdx, 'gamesAway', e.target.value)}
                    placeholder="0"
                    className="w-16 text-center border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:border-padel-pink"
                  />
                  {setIdx === 2 && (
                    <span className="text-xs text-gray-400">(3er set, opcional)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-pink w-full py-3 disabled:opacity-50">
          {saving ? 'Guardando…' : 'Guardar resultado'}
        </button>
      </form>
    </div>
  )
}
