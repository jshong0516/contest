import { useState, useEffect, useMemo } from 'react'
import { useBugs } from '../data/store.jsx'

// ── 하드코딩 데이터 ───────────────────────────────────────────────

const PATCH_LOG = [
  {
    version: 'v1.3.0',
    date: '2026-07-15',
    title: '신도림A구역 엘리베이터 패치',
    severity: 'BLOCKER',
    resolved: 2,
    changes: [
      '신도림A역 B출구 엘리베이터 신규 설치',
      'A구역 복지관 정문 경사로 보수',
    ],
    bugIds: ['B01', 'B03'],
  },
  {
    version: 'v1.2.3',
    date: '2026-06-28',
    title: '녹천B구역 접근로 개선',
    severity: 'CRITICAL',
    resolved: 3,
    changes: [
      '녹천B역 3번 출구 수직 리프트 설치',
      'B구역 주민센터 화장실 문 폭 확장 (60cm → 90cm)',
      'B구역 약국 앞 이동식 경사판 지급',
    ],
    bugIds: ['B07', 'B09', 'B10'],
  },
  {
    version: 'v1.2.0',
    date: '2026-05-10',
    title: '한솔C구역 전통시장 진입로 개선',
    severity: 'MAJOR',
    resolved: 2,
    changes: [
      'C구역 재래시장 입구 고정형 경사로 설치',
      'C구역 지하상가 연결부 단차 제거',
    ],
    bugIds: ['B11', 'B13'],
  },
  {
    version: 'v1.1.0',
    date: '2026-03-22',
    title: '미성E구역 신축 접근성 기준 강화',
    severity: 'MAJOR',
    resolved: 1,
    changes: [
      'E구역 신축 건물 접근성 설계 기준 적용 의무화',
      '단지 내 소공원 경사로 추가',
    ],
    bugIds: ['B21'],
  },
  {
    version: 'v1.0.0',
    date: '2026-01-01',
    title: 'City Debugger 서비스 시작',
    severity: 'MINOR',
    resolved: 0,
    changes: [
      '시민 버그 제보 시스템 구축',
      '규칙 기반 심각도 분류 엔진 v1.0 배포 (AI 판단 배제)',
      '25개 초기 버그 데이터 수집 완료',
      'BLOCKER 여정 그래프 탐색 엔진 가동',
    ],
    bugIds: [],
  },
]

const COMPAT_ITEMS = [
  { icon: '♿', label: 'Wheelchair',        pct: 38, note: 'BLOCKER 2건 포함 — 완주 불가 경로 존재' },
  { icon: '🍼', label: 'Stroller',          pct: 65, note: '엘리베이터 의존도 중간, 계단 일부 통행 가능' },
  { icon: '👁️', label: 'Visual Impairment', pct: 45, note: '점자블록·음향신호 미설치 구간 다수' },
  { icon: '🚲', label: 'Bicycle',           pct: 78, note: '경사로 위주 문제, 하드 블로커 없음' },
  { icon: '👴', label: 'Elderly',           pct: 56, note: '계단·장거리 우회 부담, 리프트 부재' },
]

const SEVERITY_COLOR = {
  BLOCKER:  'text-purple-400',
  CRITICAL: 'text-red-400',
  MAJOR:    'text-orange-400',
  MINOR:    'text-yellow-400',
}

const SEVERITY_BG = {
  BLOCKER:  'bg-purple-900 border-purple-700',
  CRITICAL: 'bg-red-900 border-red-700',
  MAJOR:    'bg-orange-900 border-orange-700',
  MINOR:    'bg-yellow-900 border-yellow-700',
}

// ── 공통 컴포넌트 ─────────────────────────────────────────────────

function TerminalWindow({ filename, children }) {
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-700">
        <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
        <span className="ml-3 text-gray-400 text-xs font-mono">{filename}</span>
      </div>
      <div className="bg-gray-950 p-6 font-mono text-sm">
        {children}
      </div>
    </div>
  )
}

// ── CITY README.md ────────────────────────────────────────────────

function ReadmeSection({ bugs }) {
  const { patches } = useBugs()

  const counts = useMemo(() => {
    const c = { BLOCKER: 0, CRITICAL: 0, MAJOR: 0, MINOR: 0 }
    bugs.forEach(b => { if (c[b.severity] !== undefined) c[b.severity]++ })
    return c
  }, [bugs])

  const logResolved = PATCH_LOG.reduce((s, p) => s + p.resolved, 0)
  const simResolved = Object.keys(patches).length
  const totalResolved = logResolved + simResolved
  const barMax = Math.max(...Object.values(counts), 1)

  const MdH1 = ({ children }) => (
    <p className="text-green-400 font-black text-xl mb-4"># {children}</p>
  )
  const MdH2 = ({ children }) => (
    <p className="text-blue-400 font-bold mt-6 mb-2">## {children}</p>
  )
  const MdQuote = ({ children }) => (
    <p className="text-gray-400 border-l-2 border-gray-600 pl-3 my-2 italic">&gt; {children}</p>
  )
  const MdCode = ({ children }) => (
    <span className="bg-gray-800 text-green-300 px-1.5 py-0.5 rounded text-xs">{children}</span>
  )

  return (
    <TerminalWindow filename="CITY_README.md">
      <MdH1>City Debugger</MdH1>

      <MdQuote>도시는 아직 개발 중이다. 우리 모두가 도시의 개발자다.</MdQuote>

      <MdH2>Overview</MdH2>
      <p className="text-gray-300 leading-relaxed">
        A civic bug tracker for urban accessibility issues.<br/>
        교통약자를 <MdCode>피해자</MdCode>가 아닌 <MdCode>버그를 발견하는 디버거</MdCode>로 재정의합니다.
      </p>

      <MdH2>Version</MdH2>
      <div className="space-y-1 text-gray-300">
        <p><span className="text-purple-400">version</span>: <span className="text-yellow-300">1.3.0</span></p>
        <p><span className="text-purple-400">build</span>:   <span className="text-yellow-300">2026.07.18</span></p>
        <p><span className="text-purple-400">status</span>:  <span className="text-green-400 animate-pulse">● ACTIVE DEVELOPMENT</span></p>
        <p>
          <span className="text-purple-400">patches</span>:{' '}
          <span className="text-yellow-300">{totalResolved} bugs resolved</span>
          {simResolved > 0 && (
            <span className="text-green-400 text-xs ml-2">(+{simResolved} simulation)</span>
          )}
        </p>
      </div>

      <MdH2>Known Bugs</MdH2>
      <div className="space-y-2">
        {['BLOCKER','CRITICAL','MAJOR','MINOR'].map(sev => {
          const n   = counts[sev]
          const pct = Math.round(n / barMax * 100)
          const colors = {
            BLOCKER:  { bar: 'bg-purple-600', text: 'text-purple-300' },
            CRITICAL: { bar: 'bg-red-600',    text: 'text-red-300' },
            MAJOR:    { bar: 'bg-orange-500', text: 'text-orange-300' },
            MINOR:    { bar: 'bg-yellow-500', text: 'text-yellow-300' },
          }
          const c = colors[sev]
          return (
            <div key={sev} className="flex items-center gap-3">
              <span className={`w-20 text-xs ${c.text} shrink-0`}>{sev}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-xs ${c.text} w-4 text-right`}>{n}</span>
            </div>
          )
        })}
        <p className="text-gray-500 text-xs mt-2">Total: {bugs.length} open issues</p>
      </div>

      <MdH2>TODO</MdH2>
      <div className="space-y-1 text-gray-400 text-xs">
        <p className="text-green-400">- [x] 신도림A역 엘리베이터 설치 (v1.3.0)</p>
        <p className="text-green-400">- [x] 녹천B구역 접근로 개선 (v1.2.3)</p>
        <p className="text-gray-500">- [ ] 대림역 환승통로 엘리베이터 <MdCode>BLOCKER</MdCode></p>
        <p className="text-gray-500">- [ ] 영등포역 접근로 개선 <MdCode>CRITICAL</MdCode></p>
        <p className="text-gray-500">- [ ] 하늘F구역 전통시장 경사로 <MdCode>CRITICAL</MdCode></p>
      </div>

      <MdH2>Contributors</MdH2>
      <div className="text-gray-400 text-xs space-y-1">
        <p><span className="text-cyan-400">@citizens</span>       — {bugs.length} bug reports filed</p>
        <p><span className="text-cyan-400">@severity_engine</span> — rule-based classifier, no AI bias</p>
        <p><span className="text-cyan-400">@graph_tracer</span>   — BFS/DFS route analyzer</p>
      </div>

      <MdH2>License</MdH2>
      <p className="text-gray-500 text-xs">Public Domain — 도시는 모두의 것입니다.</p>

      <div className="mt-6 pt-4 border-t border-gray-800 text-gray-600 text-xs">
        <p>$ git log --oneline | head -3</p>
        {PATCH_LOG.slice(0, 3).map(p => (
          <p key={p.version} className="text-gray-500">
            <span className="text-yellow-600">{p.version.slice(1).replace(/\./g, '')}</span> {p.title}
          </p>
        ))}
      </div>
    </TerminalWindow>
  )
}

// ── Compatibility Test ─────────────────────────────────────────────

function CompatSection() {
  const [started, setStarted] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStarted(true), 200)
    const t2 = setTimeout(() => setDone(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const pctColor = (p) =>
    p >= 70 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  const pctText = (p) =>
    p >= 70 ? 'text-green-400' : p >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <TerminalWindow filename="$ run compatibility-test --all">
      <p className="text-gray-500 mb-4 text-xs">
        Running accessibility compatibility scan...
        {done && <span className="text-green-400 ml-2">DONE</span>}
      </p>

      <div className="space-y-5">
        {COMPAT_ITEMS.map((item, i) => {
          const delay  = i * 200
          const target = started ? item.pct : 0

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-200 text-sm">
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </span>
                <span className={`text-sm font-black ${pctText(item.pct)}`}>
                  {started ? `${item.pct}%` : '---'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ease-out ${pctColor(item.pct)}`}
                  style={{
                    width: `${target}%`,
                    transitionDuration: `${800 + i * 150}ms`,
                    transitionDelay: `${delay}ms`,
                  }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">{item.note}</p>
            </div>
          )
        })}
      </div>

      {done && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            <span className="text-red-400">FAIL</span> — Wheelchair, Visual Impairment 기준 미달 (70% 이하)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            BLOCKER 해소 시 Wheelchair 점수 +38p 예상
          </p>
        </div>
      )}
    </TerminalWindow>
  )
}

// ── 패치 노트 ─────────────────────────────────────────────────────

function PatchNotesSection() {
  const [expanded, setExpanded] = useState('v1.3.0')

  return (
    <TerminalWindow filename="CHANGELOG.md">
      <p className="text-blue-400 font-bold text-base mb-6"># Changelog</p>

      <div className="relative">
        {/* 타임라인 세로선 */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-700" />

        <div className="space-y-1">
          {PATCH_LOG.map((log, idx) => {
            const isOpen   = expanded === log.version
            const isLatest = idx === 0

            return (
              <div key={log.version} className="relative pl-8">
                {/* 타임라인 점 */}
                <div className={`absolute left-0 top-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isLatest ? 'border-green-500 bg-green-950' : 'border-gray-600 bg-gray-900'}`}>
                  <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-green-400' : 'bg-gray-600'}`} />
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : log.version)}
                  className="w-full text-left py-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-yellow-300 font-black text-sm">[{log.version}]</span>
                        <span className="text-gray-500 text-xs">{log.date}</span>
                        {isLatest && (
                          <span className="text-xs bg-green-900 text-green-300 px-1.5 py-0.5 rounded">LATEST</span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_BG[log.severity]} ${SEVERITY_COLOR[log.severity]}`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm mt-1 group-hover:text-white transition">
                        {log.title}
                      </p>
                    </div>
                    <span className="text-gray-600 text-xs shrink-0 mt-1">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-4 pl-1 space-y-1.5">
                    {log.changes.map((change, i) => (
                      <p key={i} className="text-gray-400 text-xs flex gap-2">
                        <span className="text-green-500 shrink-0">✓</span>
                        {change}
                      </p>
                    ))}
                    {log.resolved > 0 && (
                      <p className="text-gray-600 text-xs mt-2">
                        📋 관련 제보 <span className="text-gray-400">{log.resolved}건</span> 해결
                        {log.bugIds.length > 0 && (
                          <span className="ml-1 text-gray-600">
                            ({log.bugIds.map(id => `#${id}`).join(', ')})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </TerminalWindow>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────

export default function PatchNotes() {
  const { bugs } = useBugs()

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <p className="text-xs tracking-widest text-green-400 uppercase mb-2 font-mono">화면 5 / 5</p>
          <h1 className="text-4xl font-black mb-1">📋 City Status</h1>
          <p className="text-gray-400 font-mono text-sm">
            도시 소프트웨어의 현재 상태를 보고합니다.
          </p>
        </div>

        <ReadmeSection bugs={bugs} />
        <CompatSection />
        <PatchNotesSection />

        <div className="text-center font-mono text-xs text-gray-700 pb-8">
          <p>$ city-debugger --version</p>
          <p className="text-gray-600 mt-1">city-debugger/1.3.0 win32 node/20.0.0</p>
          <p className="mt-3 text-gray-800">
            * 이 화면의 모든 데이터는 예시 시나리오입니다. 주민센터·정부기관 연동은 시연 구조입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
