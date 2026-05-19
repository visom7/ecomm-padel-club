import { NavLink } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

function NavIcon({ kind }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (kind === 'calendar') return (
    <svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
  if (kind === 'trophy') return (
    <svg {...props}>
      <path d="M7 4h10v4a5 5 0 1 1-10 0V4z" />
      <path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3M9 21h6M12 17v4" />
    </svg>
  )
  if (kind === 'chart') return (
    <svg {...props}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  )
  if (kind === 'live') return (
    <svg {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M7.05 7.05a7 7 0 0 0 0 9.9M16.95 7.05a7 7 0 0 1 0 9.9M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17" />
    </svg>
  )
  // user / admin fallback
  return (
    <svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function NavTab({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center gap-1 flex-1"
    >
      {({ isActive }) => (
        <>
          <div
            className={
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors ' +
              (isActive
                ? 'bg-daylight-pink text-white'
                : 'bg-transparent text-daylight-ink-sub')
            }
          >
            <NavIcon kind={icon} />
          </div>
          <span
            className={
              'font-sans text-[9px] font-bold tracking-wider uppercase ' +
              (isActive ? 'text-daylight-ink' : 'text-daylight-ink-sub')
            }
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav() {
  const { session } = useSession()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-daylight-surface border-t border-daylight-hair z-10">
      <div className="max-w-lg mx-auto pt-2.5 pb-5 px-4 flex justify-around">
        <NavTab to="/matchdays" icon="calendar" label="Convocatorias" />
        <NavTab to="/live" icon="live" label="Directo" />
        <NavTab to="/played" icon="trophy" label="Partidos" />
        <NavTab to="/players/stats" icon="chart" label="Stats" />
        {session?.isAdmin && <NavTab to="/admin" icon="user" label="Admin" />}
      </div>
    </nav>
  )
}
