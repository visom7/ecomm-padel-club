import { useSession } from '../context/SessionContext'
import { useNavigate } from 'react-router-dom'
import { clearAdminPin } from '../context/adminPin'

export default function Header() {
  const { session, logout } = useSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAdminPin()
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo text mark */}
        <div className="flex items-center gap-2">
          <span className="text-padel-pink font-bold text-lg tracking-tight">
            p<span className="italic">ä</span>del
          </span>
          <span className="text-gray-400 text-xs font-light uppercase tracking-widest">club</span>
          <span className="w-2 h-2 rounded-full bg-padel-pink ml-1" />
        </div>

        {session && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {session.name}
              {session.isAdmin && (
                <span className="ml-1 text-xs bg-padel-pink text-white px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 underline"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
