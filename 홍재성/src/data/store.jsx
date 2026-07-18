import { useState, useEffect, createContext, useContext } from 'react'
import { BUGS as SEED_BUGS } from './bugs'

const LS_KEY         = 'city_debugger_bugs'
const LS_PATCHES_KEY = 'city_debugger_patches'

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

  // patches: { [bugId]: { score: number, planId: string } }
  const [patches, setPatches] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_PATCHES_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(bugs))
  }, [bugs])

  useEffect(() => {
    localStorage.setItem(LS_PATCHES_KEY, JSON.stringify(patches))
  }, [patches])

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

  function addPatch(bugId, score, planId) {
    setPatches(prev => {
      if (prev[bugId]) return prev
      return { ...prev, [bugId]: { score, planId } }
    })
  }

  function removePatch(bugId) {
    setPatches(prev => {
      if (!prev[bugId]) return prev
      const next = { ...prev }
      delete next[bugId]
      return next
    })
  }

  return (
    <BugContext.Provider value={{ bugs, addBug, patches, addPatch, removePatch }}>
      {children}
    </BugContext.Provider>
  )
}

export function useBugs() {
  return useContext(BugContext)
}
