import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { classifySeverity, SEVERITY_META } from '../lib/severity'
import { DISTRICTS } from '../data/bugs'
import { useBugs } from '../data/store.jsx'

const BUG_TYPES = [
  { value: 'threshold', label: '🪨 턱', desc: '입구·보도 등의 단차' },
  { value: 'stairs',    label: '🪜 계단', desc: '경사로 없는 계단' },
  { value: 'elevator',  label: '🛗 엘리베이터 고장', desc: '운행 중단·장기 점검' },
  { value: 'doorWidth', label: '🚪 문 폭 부족', desc: '휠체어 통과 불가 폭' },
]

const initialForm = {
  type: '',
  location: '',
  districtId: 'D1',
  stairCount: 1,
  hasAlternative: false,
  alternativeFar: false,
  photoFile: null,
  photoPreview: null,
}

export default function Report() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef()
  const { addBug } = useBugs()
  const navigate = useNavigate()

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, photoFile: file, photoPreview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.type) return alert('장애물 유형을 선택해주세요.')
    if (!form.location.trim()) return alert('위치를 입력해주세요.')

    const { severity, reason } = classifySeverity({
      type: form.type,
      stairCount: Number(form.stairCount),
      hasAlternative: form.hasAlternative,
      alternativeFar: form.alternativeFar,
    })

    addBug({ type: form.type, location: form.location, districtId: form.districtId, severity })
    setResult({ severity, reason })
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(initialForm)
    setResult(null)
    setSubmitted(false)
  }

  const meta = result ? SEVERITY_META[result.severity] : null

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full">
          <p className="text-xs tracking-widest text-green-400 uppercase mb-6 font-mono">버그 제보 완료</p>

          <div className={`border-2 ${meta.borderColor} rounded-xl p-8 mb-8`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{meta.emoji}</span>
              <div>
                <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">심각도 등급</p>
                <p className={`text-3xl font-black font-mono ${meta.textColor === 'text-purple-100' ? 'text-purple-300' : meta.textColor}`}>
                  {meta.label}
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-2">{meta.description}</p>
            <p className="text-gray-500 font-mono text-sm">
              // 판정 근거: {result.reason}
            </p>
          </div>

          {form.photoPreview && (
            <div className="mb-6">
              <img src={form.photoPreview} alt="제보 사진" className="w-full rounded-lg object-cover max-h-48" />
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4 mb-8 font-mono text-sm space-y-1">
            <p className="text-gray-500">// 제보 정보</p>
            <p><span className="text-green-400">type</span>: {BUG_TYPES.find(t => t.value === form.type)?.label}</p>
            <p><span className="text-green-400">location</span>: "{form.location}"</p>
            {form.type === 'stairs' && (
              <p><span className="text-green-400">stairCount</span>: {form.stairCount}</p>
            )}
            <p><span className="text-green-400">hasAlternative</span>: {String(form.hasAlternative)}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={handleReset}
              className="flex-1 border border-gray-600 hover:border-gray-400 text-gray-300 font-bold py-3 rounded-lg transition">
              새 버그 제보
            </button>
            <button
              onClick={() => navigate('/heatmap')}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition">
              히트맵에서 보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-16">
      <div className="max-w-lg mx-auto">
        <p className="text-xs tracking-widest text-green-400 uppercase mb-4 font-mono">화면 2 / 5</p>
        <h1 className="text-4xl font-black mb-2">🐛 버그 제보</h1>
        <p className="text-gray-400 mb-10">도시의 버그를 발견했나요? 제보해주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 사진 업로드 (목업) */}
          <div>
            <label className="block font-bold mb-3 text-sm uppercase tracking-widest text-gray-300">
              📷 사진 첨부 <span className="text-gray-500 normal-case font-normal">(선택)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-green-500 rounded-xl cursor-pointer transition overflow-hidden"
            >
              {form.photoPreview ? (
                <img src={form.photoPreview} alt="미리보기" className="w-full object-cover max-h-48" />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <span className="text-4xl mb-2">📁</span>
                  <p className="text-sm">클릭하여 사진 선택</p>
                  <p className="text-xs mt-1">JPG, PNG, HEIC</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          {/* 위치 */}
          <div>
            <label className="block font-bold mb-3 text-sm uppercase tracking-widest text-gray-300">
              📍 위치
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="예: 홍대입구역 2번 출구 앞"
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition"
              required
            />
          </div>

          {/* 지역 선택 */}
          <div>
            <label className="block font-bold mb-3 text-sm uppercase tracking-widest text-gray-300">
              🏘️ 구역
            </label>
            <select
              value={form.districtId}
              onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-500 rounded-lg px-4 py-3 text-white outline-none transition"
            >
              {DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 유형 선택 */}
          <div>
            <label className="block font-bold mb-3 text-sm uppercase tracking-widest text-gray-300">
              🔍 장애물 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BUG_TYPES.map(bt => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: bt.value }))}
                  className={`border-2 rounded-xl p-4 text-left transition ${
                    form.type === bt.value
                      ? 'border-green-500 bg-green-950'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <p className="font-bold text-sm">{bt.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{bt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 계단 수 (계단 선택 시에만) */}
          {form.type === 'stairs' && (
            <div>
              <label className="block font-bold mb-3 text-sm uppercase tracking-widest text-gray-300">
                🔢 계단 수
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={form.stairCount}
                  onChange={e => setForm(f => ({ ...f, stairCount: Number(e.target.value) }))}
                  className="flex-1 accent-green-500"
                />
                <span className="w-16 text-center text-2xl font-black text-green-400 font-mono">
                  {form.stairCount}칸
                </span>
              </div>
            </div>
          )}

          {/* 대체 진입로 */}
          <div className="space-y-3">
            <label className="block font-bold text-sm uppercase tracking-widest text-gray-300">
              ↩️ 우회 가능 여부
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasAlternative}
                onChange={e => setForm(f => ({ ...f, hasAlternative: e.target.checked, alternativeFar: e.target.checked ? f.alternativeFar : false }))}
                className="w-5 h-5 accent-green-500"
              />
              <span className="text-gray-300">대체 진입로 / 우회로가 있음</span>
            </label>
            {form.hasAlternative && (
              <label className="flex items-center gap-3 cursor-pointer ml-8">
                <input
                  type="checkbox"
                  checked={form.alternativeFar}
                  onChange={e => setForm(f => ({ ...f, alternativeFar: e.target.checked }))}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-gray-400">우회로가 매우 멀거나 비용이 큼</span>
              </label>
            )}
          </div>

          {/* 심각도 미리보기 */}
          {form.type && (
            <SeverityPreview form={form} />
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl text-lg transition"
          >
            버그 제보하기
          </button>
        </form>
      </div>
    </div>
  )
}

function SeverityPreview({ form }) {
  const { severity, reason } = classifySeverity({
    type: form.type,
    stairCount: Number(form.stairCount),
    hasAlternative: form.hasAlternative,
    alternativeFar: form.alternativeFar,
  })
  const meta = SEVERITY_META[severity]

  return (
    <div className={`border ${meta.borderColor} rounded-lg px-4 py-3 bg-gray-900`}>
      <p className="text-xs text-gray-500 font-mono mb-1">// 예상 심각도 (실시간 계산)</p>
      <div className="flex items-center gap-2">
        <span>{meta.emoji}</span>
        <span className={`font-black font-mono ${meta.textColor === 'text-purple-100' ? 'text-purple-300' : meta.textColor}`}>
          {meta.label}
        </span>
        <span className="text-gray-400 text-sm">— {reason}</span>
      </div>
    </div>
  )
}
