import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { BugProvider } from './data/store.jsx'
import Landing from './pages/Landing'
import Report from './pages/Report'
import Heatmap from './pages/Heatmap'
import PatchSuggestion from './pages/PatchSuggestion'
import PatchNotes from './pages/PatchNotes'

const NAV = [
  { to: '/',           label: '🏠 랜딩' },
  { to: '/report',     label: '🐛 제보' },
  { to: '/heatmap',    label: '🗺️ 히트맵' },
  { to: '/patch',      label: '📝 패치 제안' },
  { to: '/patchnotes', label: '📋 패치 노트' },
]

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
        <span className="text-green-400 font-mono text-xs font-bold shrink-0 pr-4 py-3 border-r border-gray-800 mr-2">
          CITY<br />DEBUGGER
        </span>
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `shrink-0 px-3 py-3 text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BugProvider>
      <NavBar />
      <div className="pt-12">
        <Routes>
          <Route path="/"           element={<Landing />} />
          <Route path="/report"     element={<Report />} />
          <Route path="/heatmap"    element={<Heatmap />} />
          <Route path="/patch"      element={<PatchSuggestion />} />
          <Route path="/patchnotes" element={<PatchNotes />} />
        </Routes>
      </div>
      </BugProvider>
    </BrowserRouter>
  )
}
