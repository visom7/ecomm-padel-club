import { useSession } from '../context/SessionContext'
import { useNavigate } from 'react-router-dom'
import { clearAdminPin } from '../context/adminPin'
import EcommLogo from './EcommLogo'

function initials(name) {
  if (!name) return '··'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')
}

export default function Header() {
  const { session, logout } = useSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAdminPin()
    logout()
    navigate('/')
  }

  return (
    <header className="bg-daylight-cream sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <EcommLogo height={34} />

        {session && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-daylight-surface border border-daylight-hair rounded-full pl-1.5 pr-2.5 py-1">
              <div className="w-[26px] h-[26px] rounded-full bg-daylight-pink text-white font-display font-bold text-xs flex items-center justify-center">
                {initials(session.name)}
              </div>
              <span className="text-xs font-semibold text-daylight-ink truncate max-w-[110px]">
                {session.name}
              </span>
              {session.isAdmin && (
                <span className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase bg-daylight-pink text-white px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-daylight-ink-sub underline"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
