/**
 * 버그 심각도 분류 — 순수 규칙 기반 (AI 판단 절대 배제)
 *
 * MINOR    : 계단 1~2칸, 대체 진입로 있음
 * MAJOR    : 경사로/엘리베이터 없음, 우회 가능
 * CRITICAL : 해당 지점 진입 자체 불가, 우회에 큰 비용
 * BLOCKER  : 여정 전체(환승 포함)에 대체수단 없어 혼자서는 도착 불가 (그래프 탐색)
 */

export const SEVERITY = {
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  CRITICAL: 'CRITICAL',
  BLOCKER: 'BLOCKER',
}

export const SEVERITY_META = {
  MINOR: {
    label: 'MINOR',
    color: 'bg-yellow-400',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-400',
    description: '불편하지만 우회 가능',
    emoji: '🟡',
  },
  MAJOR: {
    label: 'MAJOR',
    color: 'bg-orange-500',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-500',
    description: '우회 가능하나 큰 불편',
    emoji: '🟠',
  },
  CRITICAL: {
    label: 'CRITICAL',
    color: 'bg-red-600',
    textColor: 'text-red-900',
    borderColor: 'border-red-600',
    description: '진입 불가, 우회 비용 매우 큼',
    emoji: '🔴',
  },
  BLOCKER: {
    label: 'BLOCKER',
    color: 'bg-purple-700',
    textColor: 'text-purple-100',
    borderColor: 'border-purple-700',
    description: '여정 전체 완주 불가능',
    emoji: '🚫',
  },
}

/**
 * 제보 데이터 기반 심각도 계산
 *
 * @param {object} report
 * @param {string} report.type       - 장애물 유형: 'threshold'|'stairs'|'elevator'|'doorWidth'
 * @param {number} report.stairCount - 계단 수 (type==='stairs'일 때)
 * @param {boolean} report.hasAlternative - 대체 진입로 존재 여부
 * @param {boolean} report.alternativeFar   - 우회로가 멀거나 비용이 큰지
 * @returns {{ severity: string, reason: string }}
 */
export function classifySeverity({ type, stairCount = 0, hasAlternative = false, alternativeFar = false }) {
  // 엘리베이터 고장 — 대체 없으면 CRITICAL, 있으면 MAJOR
  if (type === 'elevator') {
    if (!hasAlternative) return { severity: SEVERITY.CRITICAL, reason: '엘리베이터 고장 + 대체 수단 없음' }
    return { severity: SEVERITY.MAJOR, reason: '엘리베이터 고장, 계단 우회 가능' }
  }

  // 계단
  if (type === 'stairs') {
    if (stairCount <= 2 && hasAlternative)
      return { severity: SEVERITY.MINOR, reason: `계단 ${stairCount}칸 + 대체 진입로 있음` }
    if (stairCount <= 2 && !hasAlternative)
      return { severity: SEVERITY.MAJOR, reason: `계단 ${stairCount}칸, 우회로 없음` }
    if (!hasAlternative)
      return { severity: SEVERITY.CRITICAL, reason: `계단 ${stairCount}칸 + 대체 수단 없음 — 진입 불가` }
    if (alternativeFar)
      return { severity: SEVERITY.CRITICAL, reason: `계단 ${stairCount}칸, 우회로 있으나 매우 멀거나 비용 큼` }
    return { severity: SEVERITY.MAJOR, reason: `계단 ${stairCount}칸, 우회 가능` }
  }

  // 문 폭 부족
  if (type === 'doorWidth') {
    if (!hasAlternative)
      return { severity: SEVERITY.CRITICAL, reason: '문 폭 부족 + 다른 출입구 없음 — 진입 불가' }
    return { severity: SEVERITY.MAJOR, reason: '문 폭 부족, 다른 출입구로 우회 가능' }
  }

  // 턱 (threshold)
  if (type === 'threshold') {
    if (hasAlternative)
      return { severity: SEVERITY.MINOR, reason: '턱 있음, 경사 처리된 대체 진입로 있음' }
    return { severity: SEVERITY.MAJOR, reason: '턱 있음, 우회로 없음' }
  }

  return { severity: SEVERITY.MAJOR, reason: '알 수 없는 장애물 유형' }
}
