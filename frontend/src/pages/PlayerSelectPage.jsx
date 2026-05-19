import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers, verifyAdminPin } from '../services/api'
import { useSession } from '../context/SessionContext'
import { setAdminPin } from '../context/adminPin'
import EcommLogo from '../components/EcommLogo'

function initials(name) {
  if (!name) return '··'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

export default function PlayerSelectPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pinModal, setPinModal] = useState(null) // player object
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const { login, session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) { navigate('/matchdays'); return }
    getPlayers()
      .then(setPlayers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session, navigate])

  const handleSelect = (player) => {
    if (player.role === 'ADMIN') {
      setPinModal(player)
      setPin('')
      setPinError('')
    } else {
      login(player, false)
      navigate('/matchdays')
    }
  }

  const handlePinSubmit = async (e) => {
    e.preventDefault()
    setPinLoading(true)
    setPinError('')
    const ok = await verifyAdminPin(pin)
    setPinLoading(false)
    if (ok) {
      setAdminPin(pin)
      login(pinModal, true)
      navigate('/matchdays')
    } else {
      setPinError('PIN incorrecto')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-daylight-cream">
        <div className="w-8 h-8 border-4 border-daylight-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const admins = players.filter(p => p.role === 'ADMIN')
  const regularPlayers = players.filter(p => p.role === 'PLAYER')

  return (
    <div className="min-h-screen bg-daylight-cream flex flex-col">
      {/* Hero */}
      <div className="px-5 pt-10 pb-6 flex flex-col items-center text-center">
        <EcommLogo height={72} />
        <div className="eyebrow mt-5">DAYLIGHT · CLUB</div>
        <h1
          className="font-display font-extrabold text-daylight-ink mt-2"
          style={{ fontSize: 36, lineHeight: 0.95, letterSpacing: '-1.2px' }}
        >
          ¿Quién <span className="text-daylight-pink">eres</span>?
        </h1>
        <p className="text-sm text-daylight-ink-sub mt-2 max-w-xs">
          Selecciona tu nombre para apuntarte a la próxima.
        </p>
      </div>

      <div className="flex-1 px-5 pb-10">
        {regularPlayers.length > 0 && (
          <>
            <div className="eyebrow mb-3">JUGADORES · {regularPlayers.length}</div>
            <div className="grid grid-cols-2 gap-3">
              {regularPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="card flex items-center gap-2.5 text-left active:bg-daylight-cream transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-daylight-cream text-daylight-ink font-display font-bold text-sm flex items-center justify-center shrink-0">
                    {initials(player.name)}
                  </div>
                  <span className="font-display font-bold text-[15px] text-daylight-ink truncate">
                    {player.name}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {admins.length > 0 && (
          <>
            <div className="eyebrow mb-3 mt-6">ADMINISTRADORES · {admins.length}</div>
            <div className="grid grid-cols-2 gap-3">
              {admins.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="bg-daylight-ink text-white rounded-2xl p-4 flex items-center gap-2.5 text-left active:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-daylight-pink text-white font-display font-bold text-sm flex items-center justify-center shrink-0">
                    {initials(player.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-[15px] truncate">{player.name}</div>
                    <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-daylight-amber mt-0.5">
                      Admin
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PIN bottom sheet */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setPinModal(null)}>
          <div
            className="bg-daylight-surface w-full rounded-t-3xl p-6 pb-10 max-w-lg mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-daylight-hair mx-auto mb-5" />

            <div className="eyebrow mb-2">ACCESO ADMIN</div>
            <h2
              className="font-display font-extrabold text-daylight-ink"
              style={{ fontSize: 26, lineHeight: 1, letterSpacing: '-0.8px' }}
            >
              Hola, <span className="text-daylight-pink">{pinModal.name}</span>
            </h2>
            <p className="text-sm text-daylight-ink-sub mt-2 mb-5">
              Introduce el PIN para entrar como administrador.
            </p>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="• • • •"
                autoFocus
                className="input-field text-center font-mono text-2xl tracking-[0.4em]"
              />
              {pinError && (
                <p className="text-daylight-red text-sm text-center font-semibold">{pinError}</p>
              )}
              <button
                type="submit"
                disabled={pinLoading || !pin}
                className="btn-pink w-full"
              >
                {pinLoading ? 'Verificando…' : 'Entrar como admin'}
              </button>
              <button
                type="button"
                onClick={() => setPinModal(null)}
                className="w-full font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub underline pt-1"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
