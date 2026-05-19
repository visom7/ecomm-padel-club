import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCompetitions, createCompetition, updateCompetition, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'

const PRESET_COLORS = [
  '#FF2D72', // daylight pink
  '#0EBE89', // mint
  '#F4B400', // amber
  '#E2434B', // red
  '#16131A', // ink
  '#8B5CF6', // purple accent
  '#0EA5E9', // sky accent
  '#A16207', // bronze
]

export default function CompetitionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({ name: '', color: '#FF2D72', active: true })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEditing) return
    getCompetitions().then(list => {
      const comp = list.find(c => c.id === id)
      if (comp) {
        setForm({ name: comp.name || '', color: comp.color || '#FF2D72', active: comp.active !== false })
      }
      setLoading(false)
    })
  }, [id, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const pin = getAdminPin()
      const payload = { name: form.name.trim(), color: form.color, active: form.active }
      if (isEditing) {
        await updateCompetition(id, payload, pin)
      } else {
        await createCompetition(payload, pin)
      }
      navigate('/admin')
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
        <div className="eyebrow mb-1">COMPETICIÓN</div>
        <h1
          className="font-display font-extrabold text-daylight-ink"
          style={{ fontSize: 30, lineHeight: 0.95, letterSpacing: '-1.1px' }}
        >
          {isEditing ? <>Editar<br /><span className="text-daylight-pink">competición.</span></> : <>Nueva<br /><span className="text-daylight-pink">competición.</span></>}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-daylight-ink-sub mb-1.5">
            Nombre <span className="text-daylight-pink ml-1">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Liga Municipal"
            className="input-field"
          />
        </div>

        {/* Live preview card */}
        <div className="card flex items-center gap-3">
          <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: form.color }} />
          <span className="font-display font-bold text-daylight-ink flex-1 tracking-[-0.2px] truncate" style={{ fontSize: 16 }}>
            {form.name || 'Nombre de la competición'}
          </span>
          <span className={`badge ${form.active ? 'badge-open' : 'badge-closed'}`}>
            {form.active ? '● ABIERTA' : '● CERRADA'}
          </span>
        </div>

        {/* Color picker */}
        <div>
          <label className="block font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-daylight-ink-sub mb-2.5">
            Color
          </label>
          <div className="flex flex-wrap gap-2.5 mb-3">
            {PRESET_COLORS.map(c => {
              const selected = form.color === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-9 h-9 rounded-lg transition-transform active:scale-95"
                  style={{
                    backgroundColor: c,
                    boxShadow: selected
                      ? '0 0 0 2px #F6F1EA, 0 0 0 4px #16131A'
                      : '0 0 0 1px rgba(0,0,0,0.06)',
                  }}
                  aria-label={`Color ${c}`}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded-lg cursor-pointer border border-daylight-hair bg-daylight-surface p-0.5"
            />
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-daylight-ink-sub">
              Personalizado · {form.color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-3 border-t border-daylight-hair">
          <div>
            <div className="font-display font-bold text-daylight-ink" style={{ fontSize: 15 }}>Estado</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-daylight-ink-sub mt-0.5">
              {form.active ? 'LA COMPETICIÓN ESTÁ ACTIVA' : 'LA COMPETICIÓN ESTÁ CERRADA'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-daylight-mint' : 'bg-daylight-hair'}`}
            aria-label={form.active ? 'Cerrar competición' : 'Reabrir competición'}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {error && (
          <p className="text-daylight-red text-sm font-semibold">{error}</p>
        )}

        <button type="submit" disabled={saving} className="btn-pink w-full">
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear competición'}
        </button>
      </form>
    </div>
  )
}
