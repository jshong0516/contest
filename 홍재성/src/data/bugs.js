/**
 * 예시 데이터 — 실제 지역/시설과 무관한 가상 데이터입니다.
 * 실제 서비스에서는 서버 DB로 교체됩니다.
 */

export const DISTRICTS = [
  { id: 'D1', name: '신도림 A구역', alias: '환승 밀집 지구' },
  { id: 'D2', name: '녹천 B구역', alias: '주거 상업 혼합 지구' },
  { id: 'D3', name: '한솔 C구역', alias: '구도심 상업 지구' },
  { id: 'D4', name: '태양 D구역', alias: '공공시설 밀집 지구' },
  { id: 'D5', name: '미성 E구역', alias: '신축 주거 지구' },
  { id: 'D6', name: '하늘 F구역', alias: '전통시장 지구' },
]

export const BUGS = [
  // D1 — 신도림 A구역 (BLOCKER 포함)
  { id: 'B01', districtId: 'D1', type: 'elevator',  location: '신도림 A역 환승 통로 B출구', severity: 'BLOCKER',  reportedAt: '2026-07-15' },
  { id: 'B02', districtId: 'D1', type: 'stairs',    location: '신도림 A역 1번 출구',         severity: 'CRITICAL', reportedAt: '2026-07-12' },
  { id: 'B03', districtId: 'D1', type: 'threshold', location: 'A구역 복지관 정문',           severity: 'MAJOR',    reportedAt: '2026-07-10' },
  { id: 'B04', districtId: 'D1', type: 'doorWidth', location: 'A구역 편의점 입구',           severity: 'MAJOR',    reportedAt: '2026-07-08' },
  { id: 'B05', districtId: 'D1', type: 'stairs',    location: 'A구역 보도육교',              severity: 'CRITICAL', reportedAt: '2026-07-05' },
  { id: 'B06', districtId: 'D1', type: 'threshold', location: 'A구역 카페 입구',             severity: 'MINOR',    reportedAt: '2026-07-03' },

  // D2 — 녹천 B구역
  { id: 'B07', districtId: 'D2', type: 'stairs',    location: '녹천 B역 3번 출구',           severity: 'CRITICAL', reportedAt: '2026-07-14' },
  { id: 'B08', districtId: 'D2', type: 'elevator',  location: '녹천 B역 플랫폼 엘리베이터', severity: 'MAJOR',    reportedAt: '2026-07-11' },
  { id: 'B09', districtId: 'D2', type: 'threshold', location: 'B구역 약국 앞 보도',          severity: 'MINOR',    reportedAt: '2026-07-09' },
  { id: 'B10', districtId: 'D2', type: 'doorWidth', location: 'B구역 주민센터 화장실',       severity: 'CRITICAL', reportedAt: '2026-07-06' },

  // D3 — 한솔 C구역
  { id: 'B11', districtId: 'D3', type: 'stairs',    location: 'C구역 재래시장 입구 계단',    severity: 'MAJOR',    reportedAt: '2026-07-13' },
  { id: 'B12', districtId: 'D3', type: 'threshold', location: 'C구역 식당 거리 보도',        severity: 'MINOR',    reportedAt: '2026-07-11' },
  { id: 'B13', districtId: 'D3', type: 'stairs',    location: 'C구역 지하상가 연결 계단',    severity: 'MAJOR',    reportedAt: '2026-07-07' },
  { id: 'B14', districtId: 'D3', type: 'elevator',  location: 'C구역 공영주차장 엘리베이터', severity: 'CRITICAL', reportedAt: '2026-07-04' },
  { id: 'B15', districtId: 'D3', type: 'threshold', location: 'C구역 은행 앞',               severity: 'MINOR',    reportedAt: '2026-07-02' },

  // D4 — 태양 D구역
  { id: 'B16', districtId: 'D4', type: 'elevator',  location: 'D구역 행정복지센터 B동',      severity: 'BLOCKER',  reportedAt: '2026-07-16' },
  { id: 'B17', districtId: 'D4', type: 'stairs',    location: 'D구역 도서관 정문 계단',      severity: 'CRITICAL', reportedAt: '2026-07-14' },
  { id: 'B18', districtId: 'D4', type: 'threshold', location: 'D구역 체육관 입구',           severity: 'MAJOR',    reportedAt: '2026-07-12' },

  // D5 — 미성 E구역
  { id: 'B19', districtId: 'D5', type: 'threshold', location: 'E구역 신축 카페 입구',        severity: 'MINOR',    reportedAt: '2026-07-15' },
  { id: 'B20', districtId: 'D5', type: 'doorWidth', location: 'E구역 아파트 상가 입구',      severity: 'MINOR',    reportedAt: '2026-07-10' },
  { id: 'B21', districtId: 'D5', type: 'stairs',    location: 'E구역 단지 내 소공원',        severity: 'MAJOR',    reportedAt: '2026-07-06' },

  // D6 — 하늘 F구역
  { id: 'B22', districtId: 'D6', type: 'stairs',    location: 'F구역 전통시장 진입로',       severity: 'CRITICAL', reportedAt: '2026-07-17' },
  { id: 'B23', districtId: 'D6', type: 'threshold', location: 'F구역 시장 내부 통로',        severity: 'MAJOR',    reportedAt: '2026-07-15' },
  { id: 'B24', districtId: 'D6', type: 'elevator',  location: 'F구역 근린공원 엘리베이터',   severity: 'CRITICAL', reportedAt: '2026-07-13' },
  { id: 'B25', districtId: 'D6', type: 'doorWidth', location: 'F구역 노인정 입구',           severity: 'MAJOR',    reportedAt: '2026-07-10' },
]

// 심각도 가중치 (정렬·비교용)
export const SEVERITY_WEIGHT = { BLOCKER: 4, CRITICAL: 3, MAJOR: 2, MINOR: 1 }

export const TYPE_LABEL = {
  threshold: '턱',
  stairs:    '계단',
  elevator:  '엘리베이터 고장',
  doorWidth: '문폭 부족',
}
