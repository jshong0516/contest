import { useState, useMemo } from 'react'
import { STATIONS, EDGES, findRoute } from '../lib/graph'

const LINE_COLOR  = { 1: '#3b82f6', 2: '#22c55e', transfer: '#9ca3af' }
const LINE_LABEL  = { 1: '1호선', 2: '2호선' }

const STATION_OPTIONS = Object.values(STATIONS).map(s => ({
  value: s.id,
  label: `${s.name} (${LINE_LABEL[s.line] ?? '환승'})`,
}))

// ── SVG 노선도 ──────────────────────────────────────────────────────

const SVG_W = 600
const SVG_H = 300

function SubwaySVG({ result, brokenElevators }) {
  const highlightedNodes = new Set(result?.wheelchair?.path ?? [])
  const normalNodes      = new Set(result?.normal?.path ?? [])
  const blockerNodeId    = result?.blocker?.nodeId
  const blockerEdgeId    = result?.blocker?.edgeId

  const highlightedEdges = useMemo(() => {
    const path = result?.wheelchair?.path
    if (!path) return new Set()
    const ids = new Set()
    for (let i = 0; i < path.length - 1; i++) {
      const f = path[i], t = path[i + 1]
      const e = EDGES.find(e =>
        (e.from === f && e.to === t) || (e.from === t && e.to === f)
      )
      if (e) ids.add(e.id)
    }
    return ids
  }, [result])

  const normalEdges = useMemo(() => {
    const path = result?.normal?.path
    if (!path) return new Set()
    const ids = new Set()
    for (let i = 0; i < path.length - 1; i++) {
      const f = path[i], t = path[i + 1]
      const e = EDGES.find(e =>
        (e.from === f && e.to === t) || (e.from === t && e.to === f)
      )
      if (e) ids.add(e.id)
    }
    return ids
  }, [result])

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-xl mx-auto">
      {/* 호선 레이블 */}
      <text x="12" y="84"  fontSize="11" fill="#3b82f6" fontFamily="monospace">1호선</text>
      <text x="12" y="214" fontSize="11" fill="#22c55e" fontFamily="monospace">2호선</text>

      {/* 엣지 */}
      {EDGES.map(edge => {
        const s = STATIONS[edge.from], e2 = STATIONS[edge.to]
        if (!s || !e2) return null

        const isHighlighted = highlightedEdges.has(edge.id)
        const isNormal      = normalEdges.has(edge.id)
        const isBlocker     = edge.id === blockerEdgeId
        const isTransfer    = edge.isTransfer

        let stroke = LINE_COLOR[edge.line]
        let strokeWidth = 3
        let strokeDash = 'none'

        if (isBlocker)      { stroke = '#ef4444'; strokeWidth = 3; strokeDash = '6 3' }
        else if (isHighlighted) { stroke = '#4ade80'; strokeWidth = 4 }
        else if (isNormal && !isHighlighted) { stroke = '#f97316'; strokeWidth = 2; strokeDash = '4 3' }
        else { stroke = isTransfer ? '#6b7280' : LINE_COLOR[edge.line]; strokeWidth = 2 }

        return (
          <g key={edge.id}>
            <line
              x1={s.x} y1={s.y} x2={e2.x} y2={e2.y}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              strokeLinecap="round"
            />
            {/* 환승통로 엘리베이터 없음 표시 */}
            {isTransfer && !edge.transferElevator && (
              <text
                x={(s.x + e2.x) / 2 + 6}
                y={(s.y + e2.y) / 2}
                fontSize="13"
                fill={isBlocker ? '#ef4444' : '#9ca3af'}
                textAnchor="middle"
              >
                {isBlocker ? '🚫' : '⚡'}
              </text>
            )}
            {/* 소요시간 */}
            {!isTransfer && (
              <text
                x={(s.x + e2.x) / 2}
                y={s.y - 8}
                fontSize="9"
                fill="#6b7280"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {edge.minutes}m
              </text>
            )}
          </g>
        )
      })}

      {/* 역 노드 */}
      {Object.values(STATIONS).map(s => {
        const isHighlight = highlightedNodes.has(s.id)
        const isNormal    = normalNodes.has(s.id)
        const isBlocker   = s.id === blockerNodeId
        const isBroken    = brokenElevators.includes(s.id)
        const noElevator  = !s.hasElevator || isBroken

        let fill   = '#1f2937'
        let stroke2 = LINE_COLOR[s.line]
        let strokeW = 2

        if (isBlocker)      { fill = '#450a0a'; stroke2 = '#ef4444'; strokeW = 3 }
        else if (isHighlight) { fill = '#14532d'; stroke2 = '#4ade80'; strokeW = 3 }
        else if (isNormal)    { fill = '#431407'; stroke2 = '#f97316'; strokeW = 2 }

        return (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={18} fill={fill} stroke={stroke2} strokeWidth={strokeW} />
            {/* 엘리베이터 없음/고장 아이콘 */}
            {noElevator && (
              <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="12">
                {isBroken ? '🔧' : '❌'}
              </text>
            )}
            {/* 역 ID */}
            {!noElevator && (
              <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="11" fill="#d1fae5" fontFamily="monospace" fontWeight="bold">
                {s.id.replace('C1','C').replace('C2','C')}
              </text>
            )}
            {/* 역 이름 */}
            <text
              x={s.x}
              y={s.y + (s.y < 150 ? -26 : 34)}
              textAnchor="middle"
              fontSize="10"
              fill={isBlocker ? '#fca5a5' : '#9ca3af'}
              fontFamily="monospace"
            >
              {s.name}
            </text>
            {/* 환승 표시 */}
            {s.isTransfer && (
              <text x={s.x} y={s.y + (s.y < 150 ? -15 : 45)} textAnchor="middle" fontSize="9" fill="#a78bfa">
                환승
              </text>
            )}
          </g>
        )
      })}

      {/* 범례 */}
      <g transform={`translate(12, ${SVG_H - 58})`}>
        <line x1="0" y1="8" x2="20" y2="8" stroke="#4ade80" strokeWidth="3"/><text x="24" y="12" fontSize="9" fill="#6b7280">휠체어 경로</text>
        <line x1="0" y1="24" x2="20" y2="24" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3"/><text x="24" y="28" fontSize="9" fill="#6b7280">일반 경로</text>
        <line x1="0" y1="40" x2="20" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3"/><text x="24" y="44" fontSize="9" fill="#6b7280">BLOCKER</text>
      </g>
    </svg>
  )
}

// ── 결과 카드 ──────────────────────────────────────────────────────

function ResultCard({ result }) {
  if (!result) return null

  const { severity, normal, wheelchair, extraMinutes, blocker } = result

  if (severity === 'OK') return (
    <div className="border border-green-700 bg-green-950 rounded-xl p-5">
      <p className="text-green-400 font-mono font-bold text-lg mb-2">✅ 접근 가능</p>
      <p className="text-gray-300 text-sm">
        휠체어 경로: {wheelchair.path.map(id => STATIONS[id].name).join(' → ')}
      </p>
      <p className="text-gray-400 text-sm mt-1 font-mono">{wheelchair.minutes}분 소요</p>
    </div>
  )

  if (severity === 'DETOUR') return (
    <div className="border border-orange-600 bg-orange-950 rounded-xl p-5">
      <p className="text-orange-400 font-mono font-bold text-lg mb-2">🔄 우회 경로 있음</p>
      <p className="text-gray-300 text-sm">
        휠체어 경로: {wheelchair.path.map(id => STATIONS[id].name).join(' → ')}
      </p>
      <p className="text-orange-300 text-sm mt-1 font-mono">
        일반 경로보다 +{extraMinutes}분 추가 소요
      </p>
    </div>
  )

  if (severity === 'BLOCKER') return (
    <div className="border-2 border-red-600 bg-red-950 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🚫</span>
        <div>
          <p className="text-red-400 font-mono font-bold text-lg">BLOCKER — 완주 불가능</p>
          <p className="text-xs text-red-500 font-mono">이 여정은 휠체어로 혼자서 도착할 수 없습니다</p>
        </div>
      </div>
      <div className="bg-red-900/50 rounded-lg px-4 py-3 font-mono text-sm">
        <p className="text-red-300 font-bold mb-1">// 차단 원인</p>
        <p className="text-red-200">{blocker.reason}</p>
      </div>
      <div className="mt-3 text-xs text-gray-500 font-mono">
        <p>일반 경로: {normal.path?.map(id => STATIONS[id].name).join(' → ')} ({normal.minutes}분)</p>
        <p className="mt-1">휠체어 경로: 없음 — 대체 수단 0개</p>
      </div>
    </div>
  )

  return (
    <div className="border border-gray-600 bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 font-mono">노선 연결 없음</p>
    </div>
  )
}

// ── 메인 화면 ──────────────────────────────────────────────────────

export default function PatchSuggestion() {
  const [startId, setStartId] = useState('F')
  const [endId,   setEndId]   = useState('E')
  const [brokenElevators, setBrokenElevators] = useState([])
  const [result, setResult] = useState(null)

  const toggleBroken = (id) => {
    setBrokenElevators(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setResult(null)
  }

  const handleSearch = () => {
    setResult(findRoute(startId, endId, brokenElevators))
  }

  const breakableStations = Object.values(STATIONS).filter(s => s.hasElevator)

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg px-4 py-2 mb-8 flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <p className="text-yellow-300 text-xs font-mono">예시 데이터 — 가상 노선 시뮬레이션입니다.</p>
        </div>

        <p className="text-xs tracking-widest text-green-400 uppercase mb-2 font-mono">화면 4 / 5</p>
        <h1 className="text-4xl font-black mb-1">📝 여정 분석</h1>
        <p className="text-gray-400 mb-8">출발→도착 전체 여정이 휠체어로 완주 가능한지 그래프로 계산합니다.</p>

        {/* 노선도 SVG */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <SubwaySVG result={result} brokenElevators={brokenElevators} />
        </div>

        {/* 출발/도착 선택 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-widest">출발역</label>
            <select
              value={startId}
              onChange={e => { setStartId(e.target.value); setResult(null) }}
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 rounded-lg px-3 py-2 text-white text-sm outline-none"
            >
              {STATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-widest">도착역</label>
            <select
              value={endId}
              onChange={e => { setEndId(e.target.value); setResult(null) }}
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 rounded-lg px-3 py-2 text-white text-sm outline-none"
            >
              {STATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 엘리베이터 고장 시뮬레이션 토글 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 font-mono mb-3">
            🔧 만약 엘리베이터가 고장난다면? <span className="text-gray-600">(토글하면 해당 역 제외 후 재탐색)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {breakableStations.map(s => (
              <button
                key={s.id}
                onClick={() => toggleBroken(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  brokenElevators.includes(s.id)
                    ? 'bg-red-900 border-red-600 text-red-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {brokenElevators.includes(s.id) ? '🔧 ' : ''}{s.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl text-lg mb-6 transition"
        >
          여정 탐색
        </button>

        <ResultCard result={result} />

        {/* 설명 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-5 font-mono text-xs space-y-2 text-gray-500">
          <p className="text-gray-400 font-bold">// 판정 기준</p>
          <p>🟢 OK       — 휠체어 경로 = 일반 경로 (동일 소요시간)</p>
          <p>🟠 DETOUR   — 우회 경로 있음, 추가 시간 발생</p>
          <p>🚫 BLOCKER  — 여정 전체에 휠체어 접근 가능한 경로 0개</p>
          <p className="pt-2 text-gray-600">* BFS(너비 우선 탐색)로 계산 — AI 판단 없음</p>
        </div>
      </div>
    </div>
  )
}
