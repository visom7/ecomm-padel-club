import { createContext, useContext, useState, useEffect } from 'react'

const SESSION_KEY = 'padel_session'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (player, isAdmin) => {
    const s = { playerId: player.id, name: player.name, role: player.role, isAdmin }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
