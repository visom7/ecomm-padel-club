import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers, verifyAdminPin } from '../services/api'
import { useSession } from '../context/SessionContext'
import { setAdminPin } from '../context/adminPin'

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
      <div className="min-h-screen flex items-center justify-center bg-padel-pink-bg">
        <div className="w-8 h-8 border-4 border-padel-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const admins = players.filter(p => p.role === 'ADMIN')
  const regularPlayers = players.filter(p => p.role === 'PLAYER')

  return (
    <div className="min-h-screen bg-padel-pink-bg flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-baseline gap-1 mb-1">
          <span className="text-4xl font-bold text-padel-pink tracking-tight">
            p<em>ä</em>del
          </span>
          <span className="text-padel-pink w-2.5 h-2.5 rounded-full bg-padel-pink inline-block mb-1" />
        </div>
        <p className="text-sm text-gray-400 uppercase tracking-widest font-light">club</p>
        <h1 className="mt-6 text-xl font-bold text-gray-800">¿Quién eres?</h1>
        <p className="text-sm text-gray-500 mt-1">Selecciona tu nombre para continuar</p>
      </div>

      {/* Player list */}
      <div className="flex-1 bg-white rounded-t-3xl px-5 pt-6 pb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Jugadores</p>
        <div className="grid grid-cols-2 gap-3">
          {regularPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => handleSelect(player)}
              className="bg-gray-50 hover:bg-padel-pink-bg active:bg-padel-pink/10 border border-gray-200 
                         rounded-2xl py-4 px-3 text-center font-semibold text-gray-700 transition-colors"
            >
              {player.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 mt-6">Administradores</p>
        <div className="grid grid-cols-2 gap-3">
          {admins.map(player => (
            <button
              key={player.id}
              onClick={() => handleSelect(player)}
              className="bg-padel-pink-bg hover:bg-padel-pink/20 active:bg-padel-pink/30 border border-padel-pink/30
                         rounded-2xl py-4 px-3 text-center font-semibold text-padel-pink-dark transition-colors 
                         flex flex-col items-center gap-1"
            >
              {player.name}
              <span className="text-xs font-normal text-padel-pink">Admin</span>
            </button>
          ))}
        </div>
      </div>

      {/* PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setPinModal(null)}>
          <div
            className="bg-white w-full rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Hola, {pinModal.name} 👋
            </h2>
            <p className="text-sm text-gray-500 mb-5">Introduce el PIN de administrador</p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="PIN"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl 
                           tracking-widest focus:outline-none focus:border-padel-pink"
              />
              {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}
              <button
                type="submit"
                disabled={pinLoading || !pin}
                className="btn-pink w-full py-3 disabled:opacity-50"
              >
                {pinLoading ? 'Verificando…' : 'Entrar como admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
