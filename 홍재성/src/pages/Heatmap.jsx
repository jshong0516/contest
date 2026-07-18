import { useState, useMemo } from 'react'
import { DISTRICTS, SEVERITY_WEIGHT, TYPE_LABEL } from '../data/bugs'
import { SEVERITY_META } from '../lib/severity'
import { useBugs } from '../data/store.jsx'

const SEVERITY_ORDER = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR']

const FILTER_OPTIONS = [
  { value: 'ALL', label: '전체' },
  ...SEVERITY_ORDER.map(s => ({ value: s, label: SEVERITY_META[s].emoji + ' ' + s })),
]

function severityBar(counts, total) {
  return SEVERITY_ORDER.map(s => {
    const pct = total ? (counts[s] || 0) / total * 100 : 0
    const colors = {
      BLOCKER:  'bg-purple-600',
      CRITICAL: 'bg-red-500',
      MAJOR:    'bg-orange-400',
      MINOR:    'bg-yellow-400',
    }
    return pct > 0
      ? <div key={s} className={`${colors[s]} h-full`} style={{ width: `${pct}%` }} title={`${s}: ${counts[s]}`} />
      : null
  })
}

function DistrictCard({ district, bugs, isOpen, onToggle }) {
  const counts = useMemo(() => {
    const c = {}
    bugs.forEach(b => { c[b.severity] = (c[b.severity] || 0) + 1 })
    return c
  }, [bugs])

  const worstSeverity = SEVERITY_ORDER.find(s => counts[s])
  const meta = worstSeverity ? SEVERITY_META[worstSeverity] : null

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      worstSeverity === 'BLOCKER' ? 'border-purple-600' :
      worstSeverity === 'CRITICAL' ? 'border-red-600' :
      'border-gray-700'
    }`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 bg-gray-900 hover:bg-gray-800 transition"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {meta && <span className="text-sm">{meta.emoji}</span>}
              <span className="font-bold text-white">{district.name}</span>
              {worstSeverity === 'BLOCKER' && (
                <span className="text-xs bg-purple-700 text-purple-100 px-2 py-0.5 rounded font-mono">BLOCKER 포함</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{district.alias}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-white font-mono">{bugs.length}</p>
            <p className="text-xs text-gray-500">개 버그</p>
          </div>
        </div>

        {/* 심각도 스택 바 */}
        <div className="mt-3 h-2 rounded-full overflow-hidden bg-gray-800 flex">
          {severityBar(counts, bugs.length)}
        </div>
        <div className="flex gap-3 mt-2">
          {SEVERITY_ORDER.filter(s => counts[s]).map(s => (
            <span key={s} className="text-xs text-gray-400 font-mono">
              {SEVERITY_META[s].emoji} {counts[s]}
            </span>
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-gray-800 border-t border-gray-800">
          {[...bugs]
            .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
            .map(bug => {
              const m = SEVERITY_META[bug.severity]
              return (
                <div key={bug.id} className="px-5 py-3 flex items-start gap-3 bg-gray-950">
                  <span className="text-base mt-0.5">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{bug.location}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {TYPE_LABEL[bug.type]} · {bug.reportedAt}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-mono font-bold px-2 py-1 rounded ${
                    bug.severity === 'BLOCKER'  ? 'bg-purple-900 text-purple-300' :
                    bug.severity === 'CRITICAL' ? 'bg-red-900 text-red-300' :
                    bug.severity === 'MAJOR'    ? 'bg-orange-900 text-orange-300' :
                                                  'bg-yellow-900 text-yellow-300'
                  }`}>
                    {bug.severity}
                  </span>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default function Heatmap() {
  const [filter, setFilter] = useState('ALL')
  const [openId, setOpenId] = useState(null)
  const { bugs: BUGS } = useBugs()

  const districtStats = useMemo(() => {
    return DISTRICTS.map(d => {
      const bugs = BUGS.filter(b => b.districtId === d.id)
      const score = bugs.reduce((sum, b) => sum + SEVERITY_WEIGHT[b.severity], 0)
      return { district: d, bugs, score }
    }).sort((a, b) => b.score - a.score)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'ALL') return districtStats
    return districtStats
      .map(ds => ({ ...ds, bugs: ds.bugs.filter(b => b.severity === filter) }))
      .filter(ds => ds.bugs.length > 0)
  }, [districtStats, filter])

  const totalBugs = BUGS.length
  const blockerCount = BUGS.filter(b => b.severity === 'BLOCKER').length
  const criticalCount = BUGS.filter(b => b.severity === 'CRITICAL').length

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* 예시 데이터 배너 */}
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg px-4 py-2 mb-8 flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <p className="text-yellow-300 text-xs font-mono">예시 데이터 — 실제 지역·시설과 무관한 가상 시나리오입니다.</p>
        </div>

        <p className="text-xs tracking-widest text-green-400 uppercase mb-2 font-mono">화면 3 / 5</p>
        <h1 className="text-4xl font-black mb-1">🗺️ 버그 히트맵</h1>
        <p className="text-gray-400 mb-8">지역별 도시 버그 누적 현황</p>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-white font-mono">{totalBugs}</p>
            <p className="text-xs text-gray-400 mt-1">총 버그</p>
          </div>
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-red-300 font-mono">{criticalCount}</p>
            <p className="text-xs text-red-400 mt-1">CRITICAL</p>
          </div>
          <div className="bg-purple-950 border border-purple-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-purple-300 font-mono">{blockerCount}</p>
            <p className="text-xs text-purple-400 mt-1">BLOCKER</p>
          </div>
        </div>

        {/* 심각도 필터 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                filter === opt.value
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 지역 카드 목록 */}
        <div className="space-y-3">
          {filtered.map(({ district, bugs }) => (
            <DistrictCard
              key={district.id}
              district={district}
              bugs={bugs}
              isOpen={openId === district.id}
              onToggle={() => setOpenId(openId === district.id ? null : district.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-12 font-mono">해당 심각도의 버그가 없습니다.</p>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center mt-10 font-mono">
          * 심각도 점수 높은 순 정렬 · 클릭하면 개별 버그 목록 펼침
        </p>
      </div>
    </div>
  )
}
