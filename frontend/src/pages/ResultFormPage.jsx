import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatchday, getPlayers, submitResult, handleAdminError } from '../services/api'
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

  const [allPlayers, setAllPlayers] = useState([])
  const [outcome, setOutcome] = useState(null)
  const [finalPlayers, setFinalPlayers] = useState([])
  const [beerRoundPlayers, setBeerRoundPlayers] = useState([])
  const [showBeerSection, setShowBeerSection] = useState(false)
  const [pairs, setPairs] = useState([
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
    structuredClone(EMPTY_PAIR),
  ])

  useEffect(() => {
    getMatchday(id).then(async data => {
      setMatchday(data)

      // Player list: registrations if any, otherwise all club players
      if (data.registrations.length > 0) {
        setAllPlayers(data.registrations.map(r => r.name))
      } else {
        const players = await getPlayers()
        setAllPlayers(players.map(p => p.name))
      }

      const existing = data.matchResult
      if (existing) {
        setOutcome(existing.outcome || null)
        setFinalPlayers(existing.finalPlayers || [])
        const existingBeer = existing.beerRoundPlayers || []
        setBeerRoundPlayers(existingBeer)
        setShowBeerSection(existingBeer.length > 0)
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
    // Remove from beer round if deselected as final player
    setBeerRoundPlayers(prev => prev.filter(n => n !== name))
  }

  const toggleBeerPlayer = (name) => {
    setBeerRoundPlayers(prev =>
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
    if (finalPlayers.length !== 6) {
      setError('Debes seleccionar exactamente 6 jugadores')
      return
    }
    setSaving(true)
    try {
      const buildPair = (pair) => ({
        sets: pair.sets
          .filter(s => s.gamesHome !== '' && s.gamesAway !== '')
          .map(s => ({ gamesHome: Number(s.gamesHome), gamesAway: Number(s.gamesAway) }))
      })
      await submitResult(id, {
        outcome,
        finalPlayers,
        beerRoundPlayers: showBeerSection ? beerRoundPlayers : [],
        pair1: buildPair(pairs[0]),
        pair2: buildPair(pairs[1]),
        pair3: buildPair(pairs[2]),
      }, getAdminPin())
      navigate(`/matchdays/${id}`)
    } catch (err) {
      handleAdminError(err, navigate, setError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

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
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">¿Quién jugó finalmente?</p>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
              finalPlayers.length === 6
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {finalPlayers.length}/6
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPlayers.map(name => {
              const selected = finalPlayers.includes(name)
              const maxReached = !selected && finalPlayers.length >= 6
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => !maxReached && togglePlayer(name)}
                  disabled={maxReached}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-padel-pink border-padel-pink text-white'
                      : maxReached
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
          {finalPlayers.length > 0 && finalPlayers.length !== 6 && (
            <p className="text-xs text-amber-500 mt-2">
              Selecciona exactamente 6 jugadores ({6 - finalPlayers.length} restante{6 - finalPlayers.length !== 1 ? 's' : ''})
            </p>
          )}
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

        {/* Beer round section */}
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">🍺 ¿Alguien paga un cubo?</p>
            <button
              type="button"
              onClick={() => {
                setShowBeerSection(v => !v)
                if (showBeerSection) setBeerRoundPlayers([])
              }}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                showBeerSection
                  ? 'bg-amber-400 border-amber-400 text-white'
                  : 'border-amber-300 text-amber-600'
              }`}
            >
              {showBeerSection ? 'Sí' : 'No'}
            </button>
          </div>

          {showBeerSection && finalPlayers.length === 6 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Selecciona quién debe un cubo</p>
              <div className="flex flex-wrap gap-2">
                {finalPlayers.map(name => {
                  const selected = beerRoundPlayers.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleBeerPlayer(name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selected
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'border-amber-200 text-amber-700'
                      }`}
                    >
                      {selected ? '🍺 ' : ''}{name}
                    </button>
                  )
                })}
              </div>
              {beerRoundPlayers.length > 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  {beerRoundPlayers.length} cubo{beerRoundPlayers.length !== 1 ? 's' : ''} pendiente{beerRoundPlayers.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {showBeerSection && finalPlayers.length !== 6 && (
            <p className="text-xs text-gray-400 mt-2">Selecciona primero los 6 jugadores</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving || finalPlayers.length !== 6} className="btn-pink w-full py-3 disabled:opacity-50">
          {saving ? 'Guardando…' : 'Guardar resultado'}
        </button>
      </form>
    </div>
  )
}
