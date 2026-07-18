/**
 * 가상 지하철 접근성 그래프
 * 순수 JS BFS — AI 판단 절대 사용 금지
 *
 * 네트워크 구조:
 *   1호선(파랑): 신도림A ─ 구로B ─ 대림C1 ─ 영등포D ─ 여의도E
 *   2호선(초록): 합정F ─ 홍대G ─ 대림C2 ─ 노들H
 *   환승: C1 ↔ C2 (대림역 환승통로, 엘리베이터 없음 ← BLOCKER 포인트)
 *
 * 접근 불가 요소:
 *   - 영등포D: 엘리베이터 없음 (역 자체 진입 불가)
 *   - 대림 환승통로: 엘리베이터 없음 (1↔2호선 환승 불가)
 */

export const STATIONS = {
  A:  { id: 'A',  name: '신도림역',   line: 1, hasElevator: true,  x: 60,  y: 80  },
  B:  { id: 'B',  name: '구로역',     line: 1, hasElevator: true,  x: 175, y: 80  },
  C1: { id: 'C1', name: '대림역',     line: 1, hasElevator: true,  x: 290, y: 80,  isTransfer: true },
  D:  { id: 'D',  name: '영등포역',   line: 1, hasElevator: false, x: 405, y: 80  },
  E:  { id: 'E',  name: '여의도역',   line: 1, hasElevator: true,  x: 520, y: 80  },
  F:  { id: 'F',  name: '합정역',     line: 2, hasElevator: true,  x: 60,  y: 210 },
  G:  { id: 'G',  name: '홍대입구역', line: 2, hasElevator: true,  x: 175, y: 210 },
  C2: { id: 'C2', name: '대림역',     line: 2, hasElevator: true,  x: 290, y: 210, isTransfer: true },
  H:  { id: 'H',  name: '노들역',     line: 2, hasElevator: true,  x: 405, y: 210 },
}

export const EDGES = [
  // 1호선
  { id: 'e1', from: 'A',  to: 'B',  line: 1,          minutes: 3 },
  { id: 'e2', from: 'B',  to: 'C1', line: 1,          minutes: 4 },
  { id: 'e3', from: 'C1', to: 'D',  line: 1,          minutes: 3 },
  { id: 'e4', from: 'D',  to: 'E',  line: 1,          minutes: 5 },
  // 2호선
  { id: 'e5', from: 'F',  to: 'G',  line: 2,          minutes: 4 },
  { id: 'e6', from: 'G',  to: 'C2', line: 2,          minutes: 5 },
  { id: 'e7', from: 'C2', to: 'H',  line: 2,          minutes: 6 },
  // 대림역 환승통로 — transferElevator: false ← 핵심 BLOCKER
  { id: 't1', from: 'C1', to: 'C2', line: 'transfer', minutes: 5, isTransfer: true, transferElevator: false },
]

// ─── 인접 리스트 빌드 (양방향) ───────────────────────────────────────

function buildAdj(edges) {
  const adj = {}
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = []
    if (!adj[e.to])   adj[e.to]   = []
    adj[e.from].push({ to: e.to,   edge: e })
    adj[e.to].push(  { to: e.from, edge: e })
  }
  return adj
}

// ─── BFS ─────────────────────────────────────────────────────────────

function bfs(start, end, { wheelchair = false, brokenElevators = [] } = {}) {
  const adj = buildAdj(EDGES)

  const isNodeOk = (id) => {
    const s = STATIONS[id]
    return s.hasElevator && !brokenElevators.includes(id)
  }

  if (wheelchair && !isNodeOk(start)) return { path: null, minutes: null }
  if (wheelchair && !isNodeOk(end))   return { path: null, minutes: null }

  const queue   = [{ node: start, path: [start], minutes: 0 }]
  const visited = new Set([start])

  while (queue.length > 0) {
    const { node, path, minutes } = queue.shift()
    if (node === end) return { path, minutes }

    for (const { to, edge } of (adj[node] || [])) {
      if (visited.has(to)) continue

      if (wheelchair) {
        if (!isNodeOk(to)) continue                               // 역 접근 불가
        if (edge.isTransfer && !edge.transferElevator) continue   // 환승 불가
      }

      visited.add(to)
      queue.push({ node: to, path: [...path, to], minutes: minutes + edge.minutes })
    }
  }

  return { path: null, minutes: null }
}

// ─── 블로커 원인 분석 ──────────────────────────────────────────────

function detectBlocker(normalPath, brokenElevators) {
  if (!normalPath) return { reason: '일반 경로 자체가 없음', nodeId: null, edgeId: null }

  for (let i = 0; i < normalPath.length; i++) {
    const nodeId = normalPath[i]
    const s = STATIONS[nodeId]

    // 역 자체 접근 불가
    if (!s.hasElevator) {
      return { reason: `${s.name} 역 엘리베이터 없음 — 휠체어 진입 불가`, nodeId, edgeId: null }
    }
    if (brokenElevators.includes(nodeId)) {
      return { reason: `${s.name} 역 엘리베이터 고장 (시뮬레이션)`, nodeId, edgeId: null }
    }

    // 다음 역으로 가는 엣지 접근 불가
    if (i < normalPath.length - 1) {
      const nextId = normalPath[i + 1]
      const edge   = EDGES.find(e =>
        (e.from === nodeId && e.to === nextId) ||
        (e.from === nextId && e.to === nodeId)
      )
      if (edge?.isTransfer && !edge.transferElevator) {
        return {
          reason: `${s.name} 환승통로 엘리베이터 없음 — 환승 불가`,
          nodeId,
          edgeId: edge.id,
        }
      }
    }
  }

  return { reason: '알 수 없는 차단 원인', nodeId: null, edgeId: null }
}

// ─── 공개 API ─────────────────────────────────────────────────────

/**
 * @param {string} startId
 * @param {string} endId
 * @param {string[]} brokenElevators - 고장난 역 id 목록
 * @returns {{
 *   normal:       { path: string[]|null, minutes: number|null },
 *   wheelchair:   { path: string[]|null, minutes: number|null },
 *   severity:     'OK' | 'DETOUR' | 'BLOCKER' | 'NO_ROUTE',
 *   extraMinutes: number,
 *   blocker:      { reason: string, nodeId: string|null, edgeId: string|null } | null,
 * }}
 */
export function findRoute(startId, endId, brokenElevators = []) {
  if (startId === endId) {
    return { normal: { path: [startId], minutes: 0 }, wheelchair: { path: [startId], minutes: 0 }, severity: 'OK', extraMinutes: 0, blocker: null }
  }

  const normal     = bfs(startId, endId, { wheelchair: false, brokenElevators })
  const wheelchair = bfs(startId, endId, { wheelchair: true,  brokenElevators })

  if (!normal.path && !wheelchair.path) {
    return { normal, wheelchair, severity: 'NO_ROUTE', extraMinutes: 0, blocker: { reason: '노선 연결 없음', nodeId: null, edgeId: null } }
  }

  if (wheelchair.path === null) {
    const blocker = detectBlocker(normal.path, brokenElevators)
    return { normal, wheelchair, severity: 'BLOCKER', extraMinutes: 0, blocker }
  }

  const extraMinutes = wheelchair.minutes - (normal.minutes ?? wheelchair.minutes)
  const severity = extraMinutes > 0 ? 'DETOUR' : 'OK'

  return { normal, wheelchair, severity, extraMinutes, blocker: null }
}
