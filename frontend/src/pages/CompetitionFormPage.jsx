import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCompetitions, createCompetition, updateCompetition, handleAdminError } from '../services/api'
import { getAdminPin } from '../context/adminPin'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#64748b', '#000000',
]

export default function CompetitionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({ name: '', color: '#3b82f6', active: true })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEditing) return
    getCompetitions().then(list => {
      const comp = list.find(c => c.id === id)
      if (comp) {
        setForm({ name: comp.name || '', color: comp.color || '#3b82f6', active: comp.active !== false })
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
        {isEditing ? 'Editar competición' : 'Nueva competición'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Liga Municipal"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>

          {/* Preview */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-10 h-10 rounded-full border-4 border-white shadow-md"
              style={{ backgroundColor: form.color }}
            />
            <span className="text-sm font-medium text-gray-700">{form.name || 'Nombre de la competición'}</span>
          </div>

          {/* Preset colors */}
          <div className="flex flex-wrap gap-3 mb-3">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(f => ({ ...f, color: c }))}
                className="w-8 h-8 rounded-full border-2 transition-transform active:scale-95"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? '#1f2937' : 'transparent',
                  transform: form.color === c ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <span className="text-sm text-gray-500">Color personalizado</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Active/closed toggle */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">{form.active ? 'La competición está activa' : 'La competición está cerrada'}</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <button type="submit" disabled={saving} className="btn-pink w-full py-3 disabled:opacity-50">
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear competición'}
        </button>
      </form>
    </div>
  )
}
