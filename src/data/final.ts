// 최종 결과보고서(2026-10-06)와 최종 발표자료의 공통 사양 결과만 옮긴다.
// 공통 사양: Δln(1+잔액) = 법인 FE + 지역×연월 FE + β·(수출 증감률 × 수출입 기업) + δ·(수출입 기업 × 영업일수 차),
// 시차 h = 1~12개월마다 따로 추정, 법인·연월 이중 군집 표준오차, 판정 시차 h = 6(사전 고정), Holm 다중검정 보정.
// 퍼센트는 "수출 증감률이 10%p 떨어질 때 수출입 기업이 비교 기업보다 몇 % 더 변했나"로 바꾼 값이다.

export type Verdict = 'confirmed' | 'pre-only' | 'not-sig'

export const VERDICT_LABEL: Record<Verdict, string> = {
  confirmed: '보정 후 유의',
  'pre-only': '보정 전만 유의',
  'not-sig': '유의하지 않음',
}

export const VERDICT_TIER: Record<Verdict, string> = {
  confirmed: 'mint',
  'pre-only': 'orange',
  'not-sig': 'gray',
}

/** 요구불예금 시차별 반응(h = 0~12). sig = Holm 보정 후 p < 0.05 */
export const DEMAND_IRF = [
  { h: 0, pct: -0.14, lo: -1.03, hi: 0.76, sig: false },
  { h: 1, pct: -0.93, lo: -2.57, hi: 0.73, sig: false },
  { h: 2, pct: -1.95, lo: -3.51, hi: -0.36, sig: false },
  { h: 3, pct: -2.07, lo: -3.74, hi: -0.38, sig: false },
  { h: 4, pct: -2.68, lo: -4.71, hi: -0.6, sig: false },
  { h: 5, pct: -2.79, lo: -5.04, hi: -0.48, sig: false },
  { h: 6, pct: -3.57, lo: -5.79, hi: -1.3, sig: true },
  { h: 7, pct: -4.29, lo: -6.52, hi: -2.01, sig: true },
  { h: 8, pct: -4.75, lo: -7.09, hi: -2.35, sig: true },
  { h: 9, pct: -4.0, lo: -6.82, hi: -1.11, sig: false },
  { h: 10, pct: -4.12, lo: -7.15, hi: -1.0, sig: false },
  { h: 11, pct: -4.63, lo: -7.55, hi: -1.61, sig: true },
  { h: 12, pct: -4.22, lo: -7.38, hi: -0.95, sig: false },
]

/** 6개 지표 판정(h = 6) */
export const INDICATORS: { name: string; est: string; p: string; holm: string; verdict: Verdict; note: string }[] = [
  { name: '요구불예금', est: '−3.6%', p: '0.003', holm: '0.005', verdict: 'confirmed', note: '사전 추세 유의하지 않음 (p 0.917), 검정력 87%' },
  { name: '적립식예금', est: '+8.5%', p: '0.035', holm: '0.419', verdict: 'pre-only', note: '수출입 기업 139곳, 잔액 있는 달만 보면 +1.1%' },
  { name: '거치식예금', est: '+7.8%', p: '0.137', holm: '0.628', verdict: 'not-sig', note: '검정력이 낮아 있다·없다를 가리기 어려움' },
  { name: '운전자금 대출', est: '+0.6%', p: '0.591', holm: '1.000', verdict: 'not-sig', note: '대출 잔액은 원래 잘 변하지 않음' },
  { name: '요구불 입금', est: '−0.3%', p: '0.741', holm: '1.000', verdict: 'not-sig', note: '입금 감소로는 설명되지 않음' },
  { name: '기업 외환 실적 연계', est: '—', p: '—', holm: '0.61 이상', verdict: 'not-sig', note: '공식 통계와 기업 자체 수출입 실적이 연결되지 않음' },
]

/** 강건성: 같은 가설을 추정 방식만 바꿔 다시 잰 결과(요구불, h = 6) */
export const ROBUSTNESS = [
  { name: '기본 방식', pct: -3.57, p: '0.003' },
  { name: '① 성향점수매칭 표본', pct: -4.13, p: '0.003' },
  { name: '② 미보정 증감률', pct: -3.57, p: '0.003' },
  { name: '③ 잔액 0 관측 제외', pct: -2.87, p: '0.017' },
  { name: '수입만 하는 기업', pct: -4.2, p: '—' },
]

/** 파일럿 설계서 B안(주지표: 요구불 잔액 유지율)과 최종 발표자료 제안 01·02 */
export const PILOT = {
  target: 946,
  exposed: 1034,
  excluded: 88,
  baseline: 45.5,
  baselineRange: '40.6~50.6%',
  churnBaseline: 3.3,
  mde: [
    { round: '1회차 (그룹당 약 370곳)', need: '+10.3%p', reach: '55.8% 이상' },
    { round: '2회차 합산 (740곳)', need: '+7.3%p', reach: '52.8% 이상' },
    { round: '4회차 합산 (1,480곳)', need: '+5.1%p', reach: '50.6% 이상' },
  ],
  retention: { exposed: 27.37, other: 33.48, p: '0.0001' },
  valuePerPoint: '회차당 약 1.0억 원',
}
