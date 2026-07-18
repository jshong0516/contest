export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-20">
      <p className="text-xs tracking-widest text-green-400 uppercase mb-4 font-mono">City Debugger v0.1.0</p>
      <h1 className="text-5xl font-black text-center leading-tight mb-6">
        도시는 아직<br />
        <span className="text-green-400">개발 중</span>이다.
      </h1>
      <p className="text-xl text-gray-400 text-center max-w-xl mb-10">
        우리 모두가 도시의 개발자다.<br />
        교통약자는 도시 버그를 가장 먼저 발견하는 <span className="text-white font-semibold">디버거</span>다.
      </p>
      <div className="flex gap-4">
        <a href="/report" className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-lg transition">
          🐛 버그 제보하기
        </a>
        <a href="/heatmap" className="border border-gray-600 hover:border-gray-400 text-gray-300 font-bold px-6 py-3 rounded-lg transition">
          🗺️ 히트맵 보기
        </a>
      </div>

      <div className="mt-24 max-w-2xl w-full space-y-8 text-gray-400 font-mono text-sm">
        <div className="border-l-2 border-green-500 pl-4">
          <p className="text-green-400 font-bold mb-1">// 문제 정의</p>
          <p>소규모 점포 82.3%에 턱·계단 존재 (국가인권위 2016)</p>
          <p>그 중 65%는 경사로 미설치</p>
        </div>
        <div className="border-l-2 border-orange-500 pl-4">
          <p className="text-orange-400 font-bold mb-1">// 기존 서비스의 한계</p>
          <p>개별 시설 정보만 제공 → 여정이 완주 가능한지 알 수 없음</p>
        </div>
        <div className="border-l-2 border-purple-500 pl-4">
          <p className="text-purple-400 font-bold mb-1">// City Debugger의 차별점</p>
          <p>출발→도착 전체 여정을 그래프로 계산</p>
          <p>아예 갈 수 없는 경로를 BLOCKER로 명확히 표시</p>
        </div>
      </div>
    </div>
  )
}
