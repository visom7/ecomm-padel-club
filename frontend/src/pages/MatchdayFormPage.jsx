import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createMatchday, updateMatchday, getMatchday, getCompetitions, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'

export default function MatchdayFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    title: '', date: '', time: '', venue: '', competition: '', round: ''
  })
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loads = [getCompetitions().then(setCompetitions)]
    if (isEditing) {
      loads.push(
        getMatchday(id).then(data => {
          setForm({
            title: data.title || '',
            date: data.date || '',
            time: data.time || '',
            venue: data.venue || '',
            competition: data.competition || '',
            round: data.round || '',
          })
        })
      )
    }
    Promise.all(loads).finally(() => setLoading(false))
  }, [id, isEditing])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const selectedCompetition = competitions.find(c => c.id === form.competition)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const pin = getAdminPin()
      const payload = {
        title: form.title || null,
        date: form.date || null,
        time: form.time || null,
        venue: form.venue || null,
        competition: form.competition || null,
        round: form.round || null,
      }
      if (isEditing) {
        await updateMatchday(id, payload, pin)
      } else {
        await createMatchday(payload, pin)
      }
      navigate('/matchdays')
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

      <h1 className="text-xl font-bold text-gray-800 mb-5">
        {isEditing ? 'Editar convocatoria' : 'Nueva convocatoria'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" hint="Opcional">
          <input type="text" value={form.title} onChange={set('title')}
            placeholder="Ej: Liga Municipal — Jornada 5"
            className="input-field" />
        </Field>
        <Field label="Fecha" hint="Opcional">
          <input type="date" value={form.date} onChange={set('date')} className="input-field" />
        </Field>
        <Field label="Hora" hint="Opcional">
          <input type="time" value={form.time} onChange={set('time')} className="input-field" />
        </Field>
        <Field label="Lugar" hint="Opcional">
          <input type="text" value={form.venue} onChange={set('venue')}
            placeholder="Ej: Pistas Retiro, Pista 3"
            className="input-field" />
        </Field>
        <Field label="Competición" hint="Opcional">
          <div className="relative">
            {selectedCompetition && (
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCompetition.color || '#9ca3af' }}
              />
            )}
            <select
              value={form.competition}
              onChange={set('competition')}
              className={`input-field ${selectedCompetition ? 'pl-8' : ''}`}
            >
              <option value="">— Sin competición —</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Ronda" hint="Opcional">
          <input type="text" value={form.round} onChange={set('round')}
            placeholder="Ej: Cuartos de final"
            className="input-field" />
        </Field>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-pink w-full py-3 disabled:opacity-50">
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear convocatoria'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {hint && <span className="text-xs font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
