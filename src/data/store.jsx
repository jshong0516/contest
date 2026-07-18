import { useState, useEffect, createContext, useContext } from 'react'
import { BUGS as SEED_BUGS } from './bugs'

const LS_KEY = 'city_debugger_bugs'

const BugContext = createContext(null)

export function BugProvider({ children }) {
  const [bugs, setBugs] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      return saved ? JSON.parse(saved) : SEED_BUGS
    } catch {
      return SEED_BUGS
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(bugs))
  }, [bugs])

  function addBug(report) {
    const newBug = {
      id: `U${Date.now()}`,
      districtId: report.districtId || 'D1',
      type: report.type,
      location: report.location,
      severity: report.severity,
      reportedAt: new Date().toISOString().slice(0, 10),
      userSubmitted: true,
    }
    setBugs(prev => [newBug, ...prev])
    return newBug
  }

  return <BugContext.Provider value={{ bugs, addBug }}>{children}</BugContext.Provider>
}

export function useBugs() {
  return useContext(BugContext)
}
