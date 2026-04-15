import { createContext, useContext, useState, useEffect } from 'react'
import { getCompetitions } from '../services/api'

const CompetitionsContext = createContext([])

export function CompetitionsProvider({ children }) {
  const [competitions, setCompetitions] = useState([])

  useEffect(() => {
    getCompetitions().then(setCompetitions).catch(() => {})
  }, [])

  return (
    <CompetitionsContext.Provider value={competitions}>
      {children}
    </CompetitionsContext.Provider>
  )
}

export function useCompetitions() {
  return useContext(CompetitionsContext)
}

/** Returns { name, color } for a given competition ID, or null if not found */
export function useCompetition(id) {
  const competitions = useCompetitions()
  if (!id) return null
  return competitions.find(c => c.id === id) ?? null
}
