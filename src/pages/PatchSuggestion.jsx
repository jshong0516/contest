import { useState, useMemo, useEffect, useRef } from 'react'
import { STATIONS, EDGES, findRoute } from '../lib/graph'
import { SEVERITY_META } from '../lib/severity'
import { TYPE_LABEL } from '../data/bugs'
import { useBugs } from '../data/store.jsx'

// ── 패치 제안 데이터 ────────────────────────────────────────────────

const PATCH_PLANS = {
  threshold: [
    { id: 'th1', title: '이동식 경사판 설치',       difficulty: 1, cost: '30~50만원',    weeks: 1,  effect: 'MINOR → 해결',        score: 10, note: '탈부착 가능, 즉시 설치' },
    { id: 'th2', title: '고무 경사로 부착',         difficulty: 1, cost: '5~15만원',     weeks: 1,  effect: 'MINOR → 해결',        score: 8,  note: '접착식, 소규모 턱에 적합' },
    { id: 'th3', title: '콘크리트 경사로 시공',     difficulty: 3, cost: '100~250만원',  weeks: 3,  effect: 'MAJOR → 해결',        score: 25, note: '영구 설치, 내구성 높음' },
    { id: 'th4', title: '자동 접이식 램프 시스템',  difficulty: 4, cost: '300~600만원',  weeks: 6,  effect: 'MAJOR → 완전 해결',   score: 35, note: '버튼 작동, 원격 호출 가능' },
  ],
  stairs: [
    { id: 'st1', title: '접이식 휴대용 경사로',     difficulty: 1, cost: '50~100만원',   weeks: 1,  effect: 'MAJOR → 임시 해결',   score: 15, note: '보관 후 필요 시 전개' },
    { id: 'st2', title: '고정형 경사로 시공',       difficulty: 3, cost: '150~350만원',  weeks: 3,  effect: 'MAJOR → 해결',        score: 28, note: '1:12 기울기 기준 적용' },
    { id: 'st3', title: '수직 리프트 설치',         difficulty: 4, cost: '500~900만원',  weeks: 8,  effect: 'CRITICAL → 해결',     score: 42, note: '공간 협소 시 계단 옆 설치' },
    { id: 'st4', title: '엘리베이터 신규 설치',     difficulty: 5, cost: '1,500만원~',   weeks: 24, effect: 'CRITICAL → 완전 해결', score: 55, note: '근본 해결책, 예산·공간 필요' },
  ],
  elevator: [
    { id: 'el1', title: '긴급 수리 (단순 고장)',    difficulty: 1, cost: '30~80만원',    weeks: 1,  effect: 'MAJOR → 해결',        score: 15, note: '센서·버튼 등 소부품 교체' },
    { id: 'el2', title: '구동 시스템 수리',         difficulty: 2, cost: '80~250만원',   weeks: 2,  effect: 'MAJOR → 해결',        score: 22, note: '모터·케이블 등 핵심 부품' },
    { id: 'el3', title: '제어반 전면 교체',         difficulty: 3, cost: '250~600만원',  weeks: 4,  effect: 'CRITICAL → 해결',     score: 35, note: '노후 제어 시스템 현대화' },
    { id: 'el4', title: '엘리베이터 전면 교체',     difficulty: 5, cost: '3,000만원~',   weeks: 12, effect: 'CRITICAL → 완전 해결', score: 50, note: '기준 미달 설비 신규 교체' },
  ],
  doorWidth: [
    { id: 'dw1', title: '도어 스토퍼 최대 개방',   difficulty: 1, cost: '0~5만원',      weeks: 1,  effect: 'MINOR → 해결',        score: 8,  note: '기존 문 개방각 조절, 즉시 가능' },
    { id: 'dw2', title: '문짝 교체 (폭 확장)',      difficulty: 2, cost: '50~120만원',   weeks: 2,  effect: 'MAJOR → 해결',        score: 22, note: '60 → 80cm 이상으로 확장' },
    { id: 'dw3', title: '자동 슬라이딩 도어 교체', difficulty: 3, cost: '200~450만원',  weeks: 3,  effect: 'CRITICAL → 해결',     score: 35, note: '터치리스·원격 작동 가능' },
    { id: 'dw4', title: '벽체 개구부 확장 공사',   difficulty: 5, cost: '500~1,200만원', weeks: 6, effect: 'CRITICAL → 완전 해결', score: 48, note: '구조벽 여부 사전 확인 필수' },
  ],
}

const DIFFICULTY_LABEL = ['', '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★']

// ── 카운트업 훅 ────────────────────────────────────────────────────

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    const from = prev.current
    prev.current = target
    if (from === target) return
    const start = Date.now()
    const diff  = target - from
    const tick  = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setVal(Math.round(from + diff * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return val
}

// ── 개선 전/후 SVG ──────────────────────────────────────────────────

function BeforeAfterSVG({ type, after, planId }) {
  const W = 280, H = 155

  // ── 턱 (threshold): 측면 단면도 ──
  if (type === 'threshold') {
    const gndLeft = H - 28
    const gndRight = H - 58
    const rampX = W/2 - 70

    // 적용 후: 옵션별 분기
    const renderThresholdAfter = () => {
      if (planId === 'th4') {
        // 자동 접이식 램프: 경첩(힌지) 표시 + 기어 아이콘
        return (
          <>
            <polygon points={`${rampX},${gndLeft} ${W/2},${gndRight} ${W/2},${gndLeft}`} fill="#14532d" stroke="#4ade80" strokeWidth="2"/>
            {/* 힌지 점 */}
            <circle cx={W/2} cy={gndLeft} r={5} fill="#4ade80"/>
            <circle cx={rampX} cy={gndLeft} r={4} fill="#166534"/>
            {/* 자동 표시 */}
            <text x={rampX + 18} y={gndLeft - 18} fontSize="13" textAnchor="middle">⚙️</text>
            <text x={W/2 - 38} y={gndLeft - 10} fontSize="18" textAnchor="middle">♿</text>
            <text x={W/2 - 16} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">자동 접이식 램프 ✓</text>
          </>
        )
      }
      if (planId === 'th3') {
        // 콘크리트 경사로: 두꺼운 채움 + 해칭
        return (
          <>
            <polygon points={`${rampX},${gndLeft} ${W/2},${gndRight} ${W/2},${gndLeft}`} fill="#374151" stroke="#4ade80" strokeWidth="2.5"/>
            {/* 콘크리트 해칭 */}
            {[0,1,2].map(n => (
              <line key={n}
                x1={rampX + n * 22} y1={gndLeft}
                x2={W/2} y2={gndRight + n * 14}
                stroke="#4ade80" strokeWidth="0.7" opacity="0.4"
              />
            ))}
            <text x={W/2 - 38} y={gndLeft - 10} fontSize="18" textAnchor="middle">♿</text>
            <text x={W/2 - 14} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">콘크리트 경사로 ✓</text>
          </>
        )
      }
      if (planId === 'th1') {
        // 이동식 경사판: 얇고 밝은 색, 점선 테두리
        return (
          <>
            <polygon points={`${rampX + 10},${gndLeft} ${W/2},${gndRight + 8} ${W/2},${gndLeft}`} fill="#1c2e1c" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 3"/>
            <text x={rampX + 30} y={gndLeft - 12} fontSize="9" fill="#86efac" fontFamily="monospace">이동식</text>
            <text x={W/2 - 38} y={gndLeft - 10} fontSize="18" textAnchor="middle">♿</text>
            <text x={W/2 - 16} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">이동식 경사판 설치 ✓</text>
          </>
        )
      }
      // th2 (고무 경사로) + 기본
      return (
        <>
          <polygon points={`${rampX},${gndLeft} ${W/2},${gndRight} ${W/2},${gndLeft}`} fill="#14532d" stroke="#4ade80" strokeWidth="2"/>
          <text x={W/2 - 38} y={gndLeft - 10} fontSize="18" textAnchor="middle">♿</text>
          <text x={W/2 - 20} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">경사로 설치 — 진입 가능 ✓</text>
        </>
      )
    }

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
        <rect x={W/2 - 4} y={20} width={8} height={H - 40} fill="#4b5563"/>
        <rect x={W/2 + 4} y={gndRight} width={W/2 - 4} height={H - gndRight} fill="#374151"/>
        <rect x={0} y={gndLeft} width={W/2 - 4} height={H - gndLeft} fill="#374151"/>
        <text x={W/2 + 18} y={(gndLeft + gndRight) / 2 + 4} fontSize="9" fill="#6b7280" fontFamily="monospace">30cm</text>
        {after ? renderThresholdAfter() : (
          <>
            <rect x={W/2 - 8} y={gndRight} width={4} height={gndLeft - gndRight} fill="#991b1b" stroke="#ef4444" strokeWidth="1"/>
            <text x={W/2 - 50} y={gndLeft - 10} fontSize="18" textAnchor="middle">♿</text>
            <line x1={W/2 - 18} y1={gndLeft - 38} x2={W/2 - 12} y2={gndLeft - 5} stroke="#ef4444" strokeWidth="2.5"/>
            <text x={W/2 - 18} y={H - 6} textAnchor="middle" fontSize="10" fill="#f87171">단차 30cm — 경사로 없음 ✗</text>
          </>
        )}
      </svg>
    )
  }

  // ── 계단 (stairs): 측면 단면도 ──
  if (type === 'stairs') {
    const steps = 4
    const stepW = 46, stepH = 22
    const baseX = 18, baseY = H - 28
    const totalW = steps * stepW
    const totalH = steps * stepH

    const StairsBefore = () => (
      <>
        {Array.from({ length: steps }).map((_, i) => (
          <rect key={i}
            x={baseX + i * stepW} y={baseY - (i + 1) * stepH}
            width={(steps - i) * stepW} height={stepH}
            fill={`hsl(220,12%,${18 + i * 5}%)`} stroke="#4b5563" strokeWidth="1"
          />
        ))}
        <rect x={0} y={baseY} width={W} height={H - baseY} fill="#374151"/>
        <text x={baseX + totalW / 2} y={baseY - totalH - 8} textAnchor="middle" fontSize="10" fill="#f87171" fontFamily="monospace">{steps}칸</text>
        <text x={W/2} y={H - 6} textAnchor="middle" fontSize="10" fill="#f87171">계단 {steps}칸 — 휠체어 통행 불가 ✗</text>
      </>
    )

    // st3: 수직 리프트
    if (after && planId === 'st3') {
      const lx = baseX + 52, lw = 72, lh = totalH + 8, ly = baseY - lh
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
          <rect x={0} y={baseY} width={W} height={H - baseY} fill="#374151"/>
          {/* 왼쪽 레일 */}
          <rect x={lx} y={ly} width={7} height={lh} fill="#1f2937" stroke="#4ade80" strokeWidth="1.5"/>
          {/* 오른쪽 레일 */}
          <rect x={lx + lw - 7} y={ly} width={7} height={lh} fill="#1f2937" stroke="#4ade80" strokeWidth="1.5"/>
          {/* 플랫폼 */}
          <rect x={lx} y={baseY - 38} width={lw} height={10} fill="#14532d" stroke="#4ade80" strokeWidth="2"/>
          {/* 사람 아이콘 */}
          <text x={lx + lw/2} y={baseY - 44} textAnchor="middle" fontSize="22">♿</text>
          {/* 상승 화살표 */}
          <text x={lx + lw + 12} y={baseY - totalH/2} textAnchor="middle" fontSize="16" fill="#4ade80">↑</text>
          {/* 레일 눈금 */}
          {[0,1,2,3].map(n => (
            <line key={n} x1={lx} y1={ly + n * (lh/4)} x2={lx + 7} y2={ly + n * (lh/4)} stroke="#4ade80" strokeWidth="1" opacity="0.5"/>
          ))}
          <text x={W/2} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">수직 리프트 설치 ✓</text>
        </svg>
      )
    }

    // st4: 엘리베이터 신규
    if (after && planId === 'st4') {
      const ex = baseX + 30, ew = 90, eh = totalH + 12, ey = baseY - eh
      const emx = ex + ew / 2
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
          <rect x={0} y={baseY} width={W} height={H - baseY} fill="#374151"/>
          {/* 엘리베이터 외곽 */}
          <rect x={ex} y={ey} width={ew} height={eh} rx="3" fill="#111827" stroke="#4ade80" strokeWidth="2"/>
          {/* 문 */}
          <rect x={ex + 4} y={ey + 4} width={ew/2 - 6} height={eh - 8} fill="#14532d" stroke="#4ade80" strokeWidth="1"/>
          <rect x={emx + 2} y={ey + 4} width={ew/2 - 6} height={eh - 8} fill="#14532d" stroke="#4ade80" strokeWidth="1"/>
          {/* 내부 */}
          <text x={emx} y={ey + eh/2 + 8} textAnchor="middle" fontSize="24">♿</text>
          {/* NEW 뱃지 */}
          <rect x={ex + ew - 24} y={ey - 8} width={28} height={14} rx="3" fill="#15803d"/>
          <text x={ex + ew - 10} y={ey + 2} textAnchor="middle" fontSize="8" fill="white" fontFamily="monospace">NEW</text>
          {/* 버튼 패널 */}
          <rect x={ex + ew + 5} y={ey + 20} width={16} height={30} rx="2" fill="#1f2937" stroke="#374151"/>
          <circle cx={ex + ew + 13} cy={ey + 30} r={3} fill="#4ade80"/>
          <circle cx={ex + ew + 13} cy={ey + 42} r={3} fill="#4ade80"/>
          <text x={W/2} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">엘리베이터 신규 설치 ✓</text>
        </svg>
      )
    }

    // st1 / st2: 경사로
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
        {after ? (
          <>
            <polygon
              points={`${baseX},${baseY} ${baseX + totalW},${baseY} ${baseX + totalW},${baseY - totalH}`}
              fill="#14532d"
            />
            <line x1={baseX} y1={baseY} x2={baseX + totalW} y2={baseY - totalH} stroke="#4ade80" strokeWidth="3"/>
            {planId === 'st1' && (
              <text x={baseX + totalW + 10} y={baseY - 12} fontSize="9" fill="#86efac" fontFamily="monospace">접이식</text>
            )}
            <rect x={0} y={baseY} width={W} height={H - baseY} fill="#374151"/>
            <text x={W/2} y={H - 6} textAnchor="middle" fontSize="10" fill="#4ade80">
              {planId === 'st1' ? '접이식 휴대용 경사로 ✓' : '고정형 경사로 (1:12) ✓'}
            </text>
          </>
        ) : <StairsBefore />}
      </svg>
    )
  }

  // ── 엘리베이터 (elevator): 정면도 ──
  if (type === 'elevator') {
    const ex = 70, ey = 18, ew = 140, eh = 110
    const midX = ex + ew / 2

    // 수리 아이콘/텍스트 맵
    const repairMeta = {
      el1: { icon: '🔧', label: '긴급 수리 완료', sub: '소부품 교체' },
      el2: { icon: '⚙️', label: '구동 시스템 수리', sub: '모터·케이블' },
      el3: { icon: '🖥️', label: '제어반 전면 교체', sub: '최신 시스템' },
      el4: { icon: '🆕', label: '엘리베이터 신규 교체', sub: '기준 충족 설비' },
    }
    const rm = repairMeta[planId] ?? { icon: '✓', label: '수리 완료', sub: '' }

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
        <rect x={ex} y={ey} width={ew} height={eh} rx="3"
          fill="#111827" stroke={after ? '#4ade80' : '#ef4444'} strokeWidth="2"/>
        <line x1={midX} y1={ey} x2={midX} y2={ey + eh}
          stroke={after ? '#4ade80' : '#ef4444'} strokeWidth="1.5" strokeDasharray="5 3"/>

        {after ? (
          <>
            <rect x={ex} y={ey} width={24} height={eh} fill="#14532d" stroke="#4ade80" strokeWidth="1"/>
            <rect x={ex + ew - 24} y={ey} width={24} height={eh} fill="#14532d" stroke="#4ade80" strokeWidth="1"/>
            <text x={midX} y={ey + eh/2 - 12} textAnchor="middle" fontSize="20">{rm.icon}</text>
            <text x={midX} y={ey + eh/2 + 8} textAnchor="middle" fontSize="24">♿</text>
            <text x={midX} y={ey + eh/2 + 24} textAnchor="middle" fontSize="8" fill="#86efac" fontFamily="monospace">{rm.sub}</text>
            <circle cx={ex + ew + 14} cy={ey + 20} r={5} fill="#4ade80"/>
            <text x={ex + ew + 14} y={ey + 38} textAnchor="middle" fontSize="8" fill="#4ade80">운행</text>
          </>
        ) : (
          <>
            <rect x={ex + 2} y={ey + 2} width={ew/2 - 3} height={eh - 4} fill="#1f1f2e" stroke="#991b1b" strokeWidth="1"/>
            <rect x={midX + 1} y={ey + 2} width={ew/2 - 3} height={eh - 4} fill="#1f1f2e" stroke="#991b1b" strokeWidth="1"/>
            <text x={midX} y={ey + eh/2 - 6} textAnchor="middle" fontSize="28" fill="#ef4444">✖</text>
            <text x={midX} y={ey + eh/2 + 18} textAnchor="middle" fontSize="10" fill="#f87171">운행 중단</text>
            <circle cx={ex + ew + 14} cy={ey + 20} r={5} fill="#ef4444"/>
            <text x={ex + ew + 14} y={ey + 38} textAnchor="middle" fontSize="8" fill="#f87171">고장</text>
          </>
        )}

        <rect x={ex + ew + 6} y={ey + 48} width={18} height={34} rx="2" fill="#1f2937" stroke="#374151"/>
        <circle cx={ex + ew + 15} cy={ey + 58} r={4} fill={after ? '#4ade80' : '#374151'}/>
        <circle cx={ex + ew + 15} cy={ey + 72} r={4} fill={after ? '#4ade80' : '#374151'}/>

        <text x={W/2} y={H - 6} textAnchor="middle" fontSize="10" fill={after ? '#4ade80' : '#f87171'}>
          {after ? `${rm.label} ✓` : '엘리베이터 고장 — 이용 불가 ✗'}
        </text>
      </svg>
    )
  }

  // ── 문폭 (doorWidth): 정면도 ──
  if (type === 'doorWidth') {
    const wallH = 115, wallY = 20
    const narrow = { left: 95, w: 90 }    // 60cm
    const wide   = { left: 76, w: 128 }   // 80cm
    const wider  = { left: 60, w: 160 }   // 90cm+ (벽 확장)

    // 옵션별 "적용 후" 문 규격
    const afterSpec = () => {
      if (planId === 'dw4') return { ...wider,  label: '← 90cm+ →', note: '벽체 개구부 확장',    fc: '#4ade80' }
      if (planId === 'dw3') return { ...wide,   label: '← 80cm →',  note: '슬라이딩 도어',        fc: '#4ade80' }
      if (planId === 'dw2') return { ...wide,   label: '← 80cm →',  note: '문짝 교체 (폭 확장)',   fc: '#4ade80' }
      return                        { ...wide,   label: '← 80cm →',  note: '도어 최대 개방',        fc: '#4ade80' }
    }
    const fc = after ? '#4ade80' : '#ef4444'
    const d  = after ? afterSpec() : { ...narrow, label: '← 60cm →', note: '', fc }

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
        {/* 왼쪽 벽 */}
        <rect x={0} y={wallY} width={d.left} height={wallH} fill={after && planId === 'dw4' ? '#2d1f0a' : '#374151'}/>
        {/* 오른쪽 벽 */}
        <rect x={d.left + d.w} y={wallY} width={W - d.left - d.w} height={wallH} fill={after && planId === 'dw4' ? '#2d1f0a' : '#374151'}/>
        {/* 벽 확장 공사 표시 (dw4 only) */}
        {after && planId === 'dw4' && (
          <>
            <rect x={0} y={wallY} width={d.left} height={wallH} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"/>
            <rect x={d.left + d.w} y={wallY} width={W - d.left - d.w} height={wallH} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"/>
            <text x={d.left / 2} y={wallY + wallH/2} textAnchor="middle" fontSize="14" fill="#f59e0b">🔨</text>
          </>
        )}
        {/* 문틀 */}
        <rect x={d.left - 3} y={wallY - 3} width={d.w + 6} height={wallH + 3} rx="2"
          fill="none" stroke={d.fc} strokeWidth="2.5"/>

        {/* 슬라이딩 도어 (dw3) */}
        {after && planId === 'dw3' ? (
          <>
            <rect x={d.left} y={wallY} width={d.w * 0.35} height={wallH} fill="#1a2e1a" stroke="#4ade80" strokeWidth="1"/>
            <rect x={d.left + d.w * 0.65} y={wallY} width={d.w * 0.35} height={wallH} fill="#1a2e1a" stroke="#4ade80" strokeWidth="1"/>
            <text x={d.left + d.w * 0.18} y={wallY + wallH/2} textAnchor="middle" fontSize="9" fill="#4ade80">◀</text>
            <text x={d.left + d.w * 0.82} y={wallY + wallH/2} textAnchor="middle" fontSize="9" fill="#4ade80">▶</text>
          </>
        ) : null}

        {/* 폭 치수선 */}
        <line x1={d.left} y1={wallY + wallH + 12} x2={d.left + d.w} y2={wallY + wallH + 12} stroke={d.fc} strokeWidth="1.5"/>
        <line x1={d.left}       y1={wallY + wallH + 7} x2={d.left}       y2={wallY + wallH + 17} stroke={d.fc} strokeWidth="1.5"/>
        <line x1={d.left + d.w} y1={wallY + wallH + 7} x2={d.left + d.w} y2={wallY + wallH + 17} stroke={d.fc} strokeWidth="1.5"/>
        <text x={d.left + d.w/2} y={wallY + wallH + 26} textAnchor="middle" fontSize="10" fill={d.fc} fontFamily="monospace">
          {d.label}
        </text>

        {/* 휠체어 */}
        {!(after && planId === 'dw3') && (
          <text x={d.left + d.w/2} y={wallY + wallH/2 + 10} textAnchor="middle"
            fontSize={after ? 26 : 20} fill={after ? '#4ade80' : '#f87171'}>♿</text>
        )}
        {after && planId === 'dw3' && (
          <text x={d.left + d.w/2} y={wallY + wallH/2 + 10} textAnchor="middle" fontSize="26" fill="#4ade80">♿</text>
        )}

        {/* 적용 전: X 표시 */}
        {!after && (
          <>
            <line x1={d.left + 6} y1={wallY + 12} x2={d.left + d.w - 6} y2={wallY + wallH - 12} stroke="#ef4444" strokeWidth="2.5"/>
            <line x1={d.left + d.w - 6} y1={wallY + 12} x2={d.left + 6} y2={wallY + wallH - 12} stroke="#ef4444" strokeWidth="2.5"/>
          </>
        )}
        <text x={W/2} y={H - 4} textAnchor="middle" fontSize="10" fill={d.fc}>
          {after ? `${d.note} — 통과 가능 ✓` : '문 폭 부족 — 통과 불가 ✗'}
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
      <text x={W/2} y={H/2} textAnchor="middle" fill="#6b7280" fontSize="12">시각화 없음</text>
    </svg>
  )
}

// ── 버그 상세/패치 뷰 ───────────────────────────────────────────────

function BugDetail({ bug, onBack, appliedPatches, onApply, onRemove }) {
  const meta          = SEVERITY_META[bug.severity]
  const plans         = PATCH_PLANS[bug.type] ?? []
  const existingPatch = appliedPatches.get(bug.id)   // { score, planId } | undefined
  const applied       = !!existingPatch

  const [showAfter, setShowAfter]       = useState(() => applied)
  const [showModal, setShowModal]       = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(() =>
    existingPatch ? (plans.find(p => p.id === existingPatch.planId) ?? null) : null
  )

  const handleApply = (plan) => {
    if (applied) return
    setSelectedPlan(plan)
    setShowAfter(true)
    onApply(bug.id, plan.score, plan.id)
  }

  const handleCancel = () => {
    setSelectedPlan(null)
    setShowAfter(false)
    onRemove(bug.id)
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
        ← 목록으로
      </button>

      {/* 버그 헤더 */}
      <div className={`border ${meta.borderColor} rounded-xl p-5`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <span className={`font-mono font-black text-lg ${meta.textColor === 'text-purple-100' ? 'text-purple-300' : meta.textColor}`}>
              {meta.label}
            </span>
            <p className="text-xs text-gray-500 font-mono mt-0.5">// {meta.description}</p>
          </div>
        </div>
        <p className="text-white font-semibold">{bug.location}</p>
        <p className="text-gray-400 text-sm mt-1">{TYPE_LABEL[bug.type]} · {bug.reportedAt}</p>
      </div>

      {/* 개선 옵션 */}
      <div>
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-3">개선 옵션</p>
        <div className="space-y-3">
          {plans.map(plan => {
            const isApplied = existingPatch?.planId === plan.id
            return (
              <div key={plan.id} className={`border rounded-xl p-4 transition ${isApplied ? 'border-green-600 bg-green-950' : 'border-gray-700 bg-gray-900'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{plan.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono text-gray-400">
                      <span>난이도 {DIFFICULTY_LABEL[plan.difficulty]}</span>
                      <span>💰 {plan.cost}</span>
                      <span>🗓️ 약 {plan.weeks}주</span>
                      <span className="text-green-400">{plan.effect}</span>
                    </div>
                  </div>
                  {isApplied ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-green-400 text-xs font-mono">✓ 적용됨</span>
                      <button
                        onClick={handleCancel}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-950 hover:border-red-600 transition"
                      >
                        취소
                      </button>
                    </div>
                  ) : applied ? (
                    <span className="text-gray-600 text-xs font-mono shrink-0 mt-1">— 미선택</span>
                  ) : (
                    <button
                      onClick={() => handleApply(plan)}
                      className="shrink-0 bg-green-600 hover:bg-green-500 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      적용 시뮬레이션
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SVG 개선 시각화 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">개선 시각화</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs font-mono">
            <button
              onClick={() => setShowAfter(false)}
              className={`px-3 py-1.5 transition ${!showAfter ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              적용 전
            </button>
            <button
              onClick={() => setShowAfter(true)}
              className={`px-3 py-1.5 transition ${showAfter ? 'bg-green-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              적용 후
            </button>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <BeforeAfterSVG type={bug.type} after={showAfter} planId={selectedPlan?.id} />
        </div>
      </div>

      {/* 주민센터 요청 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full border border-blue-600 hover:bg-blue-950 text-blue-400 font-bold py-3 rounded-xl transition text-sm"
      >
        📋 주민센터 확인 요청
      </button>

      {/* 접수 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-green-700 rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-black text-green-400 mb-2">접수 시뮬레이션 완료</h2>
            <p className="text-gray-300 text-sm mb-1">{bug.location}</p>
            <p className="text-gray-400 text-sm mb-4">패치 요청이 접수됐습니다.</p>
            <p className="text-xs text-gray-600 mb-6">* 실제 주민센터 API 연동 아님 · 연동 가능한 구조로 시연 중</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-500 hover:bg-green-400 text-black font-black px-8 py-2.5 rounded-xl"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 버그 목록 뷰 ────────────────────────────────────────────────────

const SEVERITY_ORDER = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR']
const SEVERITY_WEIGHT = { BLOCKER: 4, CRITICAL: 3, MAJOR: 2, MINOR: 1 }

function BugList({ bugs, onSelect, appliedPatches }) {
  const sorted = useMemo(() =>
    [...bugs].sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]),
    [bugs]
  )

  return (
    <div className="space-y-2">
      {sorted.map(bug => {
        const meta    = SEVERITY_META[bug.severity]
        const applied = appliedPatches.has(bug.id)
        return (
          <button
            key={bug.id}
            onClick={() => onSelect(bug)}
            className={`w-full text-left border rounded-xl px-4 py-3 flex items-center gap-3 transition ${
              applied
                ? 'border-green-800 bg-green-950/30 opacity-60'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
            }`}
          >
            <span className="text-lg shrink-0">{meta.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{bug.location}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {TYPE_LABEL[bug.type]} · {bug.reportedAt}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {applied && <span className="text-green-400 text-xs font-mono">✓ 패치됨</span>}
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                bug.severity === 'BLOCKER'  ? 'bg-purple-900 text-purple-300' :
                bug.severity === 'CRITICAL' ? 'bg-red-900 text-red-300' :
                bug.severity === 'MAJOR'    ? 'bg-orange-900 text-orange-300' :
                                              'bg-yellow-900 text-yellow-300'
              }`}>{bug.severity}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── 패치 탭 ────────────────────────────────────────────────────────

function PatchTab() {
  const { bugs, patches, addPatch, removePatch } = useBugs()
  const [selectedBug, setSelectedBug] = useState(null)

  // patches object → Map for BugDetail/BugList compatibility
  const appliedPatches = useMemo(
    () => new Map(Object.entries(patches)),
    [patches]
  )

  const totalScore = Object.values(patches).reduce((a, b) => a + b.score, 0)
  const animScore  = useCountUp(totalScore)
  const animCount  = useCountUp(appliedPatches.size)

  const handleApply  = (bugId, score, planId) => addPatch(bugId, score, planId)
  const handleRemove = (bugId) => removePatch(bugId)

  return (
    <div className="space-y-6">
      {/* 요약 바 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-white font-mono">{bugs.length}</p>
          <p className="text-xs text-gray-400 mt-1">총 버그</p>
        </div>
        <div className="bg-green-950 border border-green-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-green-300 font-mono">{animCount}</p>
          <p className="text-xs text-green-500 mt-1">패치 적용</p>
        </div>
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-300 font-mono">{animScore}</p>
          <p className="text-xs text-blue-400 mt-1">개선 점수</p>
        </div>
      </div>

      {selectedBug ? (
        <BugDetail
          key={selectedBug.id}
          bug={selectedBug}
          onBack={() => setSelectedBug(null)}
          appliedPatches={appliedPatches}
          onApply={handleApply}
          onRemove={handleRemove}
        />
      ) : (
        <BugList
          bugs={bugs}
          onSelect={setSelectedBug}
          appliedPatches={appliedPatches}
        />
      )}
    </div>
  )
}

// ── 여정 분석 탭 (기존 BLOCKER BFS) ────────────────────────────────

const LINE_COLOR  = { 1: '#3b82f6', 2: '#22c55e', transfer: '#9ca3af' }
const LINE_LABEL  = { 1: '1호선', 2: '2호선' }
const STATION_OPTIONS = Object.values(STATIONS).map(s => ({
  value: s.id,
  label: `${s.name} (${LINE_LABEL[s.line] ?? '환승'})`,
}))

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
      const e = EDGES.find(e => (e.from===f&&e.to===t)||(e.from===t&&e.to===f))
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
      const e = EDGES.find(e => (e.from===f&&e.to===t)||(e.from===t&&e.to===f))
      if (e) ids.add(e.id)
    }
    return ids
  }, [result])

  return (
    <svg viewBox="0 0 600 300" className="w-full max-w-xl mx-auto">
      <text x="12" y="84"  fontSize="11" fill="#3b82f6" fontFamily="monospace">1호선</text>
      <text x="12" y="214" fontSize="11" fill="#22c55e" fontFamily="monospace">2호선</text>

      {EDGES.map(edge => {
        const s = STATIONS[edge.from], e2 = STATIONS[edge.to]
        if (!s || !e2) return null
        const isHL      = highlightedEdges.has(edge.id)
        const isNormal  = normalEdges.has(edge.id)
        const isBlocker = edge.id === blockerEdgeId
        let stroke = LINE_COLOR[edge.line], sw = 2, dash = 'none'
        if (isBlocker)    { stroke = '#ef4444'; sw = 3; dash = '6 3' }
        else if (isHL)    { stroke = '#4ade80'; sw = 4 }
        else if (isNormal){ stroke = '#f97316'; sw = 2; dash = '4 3' }
        else { stroke = edge.isTransfer ? '#6b7280' : LINE_COLOR[edge.line] }
        return (
          <g key={edge.id}>
            <line x1={s.x} y1={s.y} x2={e2.x} y2={e2.y} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round"/>
            {edge.isTransfer && !edge.transferElevator && (
              <text x={(s.x+e2.x)/2+6} y={(s.y+e2.y)/2} fontSize="13" fill={isBlocker?'#ef4444':'#9ca3af'} textAnchor="middle">
                {isBlocker ? '🚫' : '⚡'}
              </text>
            )}
            {!edge.isTransfer && (
              <text x={(s.x+e2.x)/2} y={s.y-8} fontSize="9" fill="#6b7280" textAnchor="middle" fontFamily="monospace">{edge.minutes}m</text>
            )}
          </g>
        )
      })}

      {Object.values(STATIONS).map(s => {
        const isHL      = highlightedNodes.has(s.id)
        const isNormal  = normalNodes.has(s.id)
        const isBlocker = s.id === blockerNodeId
        const isBroken  = brokenElevators.includes(s.id)
        const noElev    = !s.hasElevator || isBroken
        let fill = '#1f2937', stroke = LINE_COLOR[s.line], sw = 2
        if (isBlocker)   { fill = '#450a0a'; stroke = '#ef4444'; sw = 3 }
        else if (isHL)   { fill = '#14532d'; stroke = '#4ade80'; sw = 3 }
        else if (isNormal){ fill = '#431407'; stroke = '#f97316'; sw = 2 }
        return (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={18} fill={fill} stroke={stroke} strokeWidth={sw}/>
            {noElev
              ? <text x={s.x} y={s.y+5} textAnchor="middle" fontSize="12">{isBroken?'🔧':'❌'}</text>
              : <text x={s.x} y={s.y+5} textAnchor="middle" fontSize="11" fill="#d1fae5" fontFamily="monospace" fontWeight="bold">{s.id.replace('C1','C').replace('C2','C')}</text>
            }
            <text x={s.x} y={s.y+(s.y<150?-26:34)} textAnchor="middle" fontSize="10" fill={isBlocker?'#fca5a5':'#9ca3af'} fontFamily="monospace">{s.name}</text>
            {s.isTransfer && <text x={s.x} y={s.y+(s.y<150?-15:45)} textAnchor="middle" fontSize="9" fill="#a78bfa">환승</text>}
          </g>
        )
      })}

      <g transform="translate(12,242)">
        <line x1="0" y1="8"  x2="20" y2="8"  stroke="#4ade80" strokeWidth="3"/><text x="24" y="12" fontSize="9" fill="#6b7280">휠체어 경로</text>
        <line x1="0" y1="24" x2="20" y2="24" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3"/><text x="24" y="28" fontSize="9" fill="#6b7280">일반 경로</text>
        <line x1="0" y1="40" x2="20" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3"/><text x="24" y="44" fontSize="9" fill="#6b7280">BLOCKER</text>
      </g>
    </svg>
  )
}

function ResultCard({ result }) {
  if (!result) return null
  const { severity, normal, wheelchair, extraMinutes, blocker } = result
  if (severity === 'OK') return (
    <div className="border border-green-700 bg-green-950 rounded-xl p-5">
      <p className="text-green-400 font-mono font-bold text-lg mb-2">✅ 접근 가능</p>
      <p className="text-gray-300 text-sm">{wheelchair.path.map(id=>STATIONS[id].name).join(' → ')}</p>
      <p className="text-gray-400 text-sm mt-1 font-mono">{wheelchair.minutes}분 소요</p>
    </div>
  )
  if (severity === 'DETOUR') return (
    <div className="border border-orange-600 bg-orange-950 rounded-xl p-5">
      <p className="text-orange-400 font-mono font-bold text-lg mb-2">🔄 우회 경로 있음</p>
      <p className="text-gray-300 text-sm">{wheelchair.path.map(id=>STATIONS[id].name).join(' → ')}</p>
      <p className="text-orange-300 text-sm mt-1 font-mono">일반 경로보다 +{extraMinutes}분 추가 소요</p>
    </div>
  )
  if (severity === 'BLOCKER') return (
    <div className="border-2 border-red-600 bg-red-950 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🚫</span>
        <div>
          <p className="text-red-400 font-mono font-bold text-lg">BLOCKER — 완주 불가능</p>
          <p className="text-xs text-red-500 font-mono">휠체어로 혼자서 도착할 수 없습니다</p>
        </div>
      </div>
      <div className="bg-red-900/50 rounded-lg px-4 py-3 font-mono text-sm mb-3">
        <p className="text-red-300 font-bold mb-1">// 차단 원인</p>
        <p className="text-red-200">{blocker.reason}</p>
      </div>
      <p className="text-xs text-gray-500 font-mono">일반 경로: {normal.path?.map(id=>STATIONS[id].name).join(' → ')} ({normal.minutes}분)</p>
    </div>
  )
  return <div className="border border-gray-600 bg-gray-900 rounded-xl p-5"><p className="text-gray-400 font-mono">노선 연결 없음</p></div>
}

function JourneyTab() {
  const [startId, setStartId]         = useState('F')
  const [endId,   setEndId]           = useState('E')
  const [brokenElevators, setBroken]  = useState([])
  const [result,  setResult]          = useState(null)
  const toggleBroken = id => { setBroken(p => p.includes(id)?p.filter(x=>x!==id):[...p,id]); setResult(null) }
  const breakable = Object.values(STATIONS).filter(s => s.hasElevator)

  return (
    <div className="space-y-5">
      <div className="bg-gray-900 rounded-xl p-4">
        <SubwaySVG result={result} brokenElevators={brokenElevators}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[['출발역', startId, setStartId], ['도착역', endId, setEndId]].map(([label, val, setter]) => (
          <div key={label}>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-widest">{label}</label>
            <select value={val} onChange={e=>{setter(e.target.value);setResult(null)}}
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 rounded-lg px-3 py-2 text-white text-sm outline-none">
              {STATION_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 font-mono mb-3">🔧 엘리베이터 고장 시뮬레이션</p>
        <div className="flex flex-wrap gap-2">
          {breakable.map(s => (
            <button key={s.id} onClick={()=>toggleBroken(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${brokenElevators.includes(s.id)?'bg-red-900 border-red-600 text-red-300':'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {brokenElevators.includes(s.id)?'🔧 ':''}{s.name}
            </button>
          ))}
        </div>
      </div>
      <button onClick={()=>setResult(findRoute(startId,endId,brokenElevators))}
        className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl text-lg transition">
        여정 탐색
      </button>
      <ResultCard result={result}/>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs space-y-1 text-gray-500">
        <p className="text-gray-400 font-bold">// 판정 기준</p>
        <p>✅ OK · 🔄 DETOUR · 🚫 BLOCKER · BFS 계산 — AI 판단 없음</p>
      </div>
    </div>
  )
}

// ── 메인 ───────────────────────────────────────────────────────────

export default function PatchSuggestion() {
  const [tab, setTab] = useState('patch')

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg px-4 py-2 mb-8 flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <p className="text-yellow-300 text-xs font-mono">예시 데이터 · 가상 시나리오 시연</p>
        </div>

        <p className="text-xs tracking-widest text-green-400 uppercase mb-2 font-mono">화면 4 / 5</p>
        <h1 className="text-4xl font-black mb-6">📝 패치 제안</h1>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-8">
          {[['patch', '🛠️ 패치 제안'], ['journey', '🗺️ 여정 분석']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${tab===key?'bg-green-500 text-black':'text-gray-400 hover:text-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'patch'   ? <PatchTab/>   : <JourneyTab/>}
      </div>
    </div>
  )
}
