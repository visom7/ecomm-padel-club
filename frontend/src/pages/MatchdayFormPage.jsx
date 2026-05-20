import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createMatchday, updateMatchday, getMatchday, getCompetitions, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'

export default function MatchdayFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    title: '', date: '', time: '', venue: '', competition: '', round: '', rivalTeam: ''
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
            rivalTeam: data.rivalTeam || '',
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
        rivalTeam: form.rivalTeam || null,
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
      <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

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
          {isEditing ? 'Editar' : 'Nueva'}
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="px-5 pt-2 pb-1">
        <div className="eyebrow mb-1">CONVOCATORIA</div>
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 30, lineHeight: 0.95, letterSpacing: '-1.1px' }}
        >
          {isEditing ? <>Editar<br /><span className="text-daylight-pink">convocatoria.</span></> : <>Nueva<br /><span className="text-daylight-pink">convocatoria.</span></>}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 flex flex-col gap-4">
        <Field label="Título" hint="Opcional">
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="Ej: Liga Municipal — Jornada 5"
            className="input-field"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" hint="Opcional">
            <input type="date" value={form.date} onChange={set('date')} className="input-field" />
          </Field>
          <Field label="Hora" hint="Opcional">
            <input type="time" value={form.time} onChange={set('time')} className="input-field" />
          </Field>
        </div>
        <Field label="Lugar" hint="Opcional">
          <input
            type="text"
            value={form.venue}
            onChange={set('venue')}
            placeholder="Ej: Pistas Retiro, Pista 3"
            className="input-field"
          />
        </Field>
        <Field label="Equipo rival" hint="Opcional">
          <input
            type="text"
            value={form.rivalTeam}
            onChange={set('rivalTeam')}
            placeholder="Ej: Padel Club Rivas"
            className="input-field"
          />
        </Field>
        <Field label="Competición" hint="Opcional">
          <div className="relative">
            {selectedCompetition && (
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm pointer-events-none"
                style={{ backgroundColor: selectedCompetition.color || '#FF2D72' }}
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
          <input
            type="text"
            value={form.round}
            onChange={set('round')}
            placeholder="Ej: 7 ó Cuartos de final"
            className="input-field"
          />
        </Field>

        {error && (
          <p className="text-daylight-red text-sm font-semibold">{error}</p>
        )}

        <button type="submit" disabled={saving} className="btn-pink w-full mt-2">
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear convocatoria'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-daylight-ink-sub mb-1.5">
        {label}{hint && <span className="text-daylight-ink-sub/60 normal-case ml-1">· {hint}</span>}
      </label>
      {children}
    </div>
  )
}
