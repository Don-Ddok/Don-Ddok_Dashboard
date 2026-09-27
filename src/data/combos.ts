// 신호 조합: 요구불예금 잔액에 어떤 계정을 짝지어 볼 것인가
// 실제 데이터로 점검한 두 조합만 둔다. 계정을 마음대로 붙여 보는 탐색은 과적합이 되므로 조합을 늘릴 때는
// 조건과 통과 기준을 먼저 문서로 고정하고 실제 데이터로 점검한 뒤 여기에 추가한다.

export type ComboId = 'loan' | 'bill'

/** 실제 데이터로 확인한 것 하나와 그 결과 */
export interface Criterion {
  label: string
  result: string
  passed: boolean
  /** 통과 기준을 점검 전에 정해 두었는가(아니면 '미달' 대신 '문제 있음'으로 적는다) */
  preset: boolean
}

export function criterionMark(k: Criterion) {
  return k.passed ? '통과' : k.preset ? '미달' : '문제 있음'
}

export interface Combo {
  id: ComboId
  /** 짝이 되는 계정(요구불예금 잔액은 모든 조합에 들어간다) */
  partner: string
  /** 표 머리에 쓰는 짧은 이름 */
  short: string
  name: string
  /** 계정 시차 화면의 시차 구분 */
  timing: string
  /** 조건 3 */
  condition: string
  conditionDetail: string
  /** 조건 3 계산 창(개월) */
  window: number
  /** 규칙 대상 */
  target: string
  /** 한 줄 규칙 설명(각주) */
  ruleNote: string
  /** 월보 머리 설명 */
  leadNote: string
  /** 규칙이 기대는 근거와 그 세기(각주) */
  basisNote: string
  /** 실제 데이터 점검 판정 */
  verdict: string
  verdictShort: string
  checks: Criterion[]
}

export const COMBOS: Record<ComboId, Combo> = {
  loan: {
    id: 'loan',
    partner: '운전자금대출',
    short: '대출',
    name: '요구불예금 + 운전자금대출',
    timing: '동행 + 후행(6개월)',
    condition: '대출 유지',
    conditionDetail: '6개월 전 대비, 기준 -5% 이상',
    window: 6,
    target: '수출 거래처',
    ruleNote:
      '참고 신호는 수출 거래처가 세 조건을 모두 충족할 때 표시합니다. 지역 수출이 1년 전 같은 달보다 줄었고, 통장 잔고가 3개월 전보다 10% 넘게 줄었으며, 운전자금 대출은 6개월 전보다 5% 넘게 줄지 않은 경우입니다.',
    leadNote: '지역 수출이 줄어든 달에 통장 잔고는 빠지는데 대출은 줄이지 않은 곳을 모았습니다.',
    basisNote:
      '이 규칙은 파트 3 연구에서 관찰된 경향(통계적으로 약한 증거)을 바탕으로 만든 참고용이며, 실제 데이터 점검에서 수출 거래처를 가려내지 못했습니다. 부실이나 위험을 판정하지 않습니다.',
    verdict: '선별력 부족',
    verdictShort: '수출 거래처와 비수출 거래처에서 비슷한 비율로 켜짐',
    checks: [
      {
        label: '신호가 켜지는 빈도',
        result: '판정 가능한 수출 거래처-월의 24.5%에서 켜짐(너무 잦음)',
        passed: false,
        preset: false,
      },
      {
        label: '수출 거래처를 가려내는가',
        result: '수출이 줄어든 달에 같은 모양이 수출 35.2%, 비수출 33.2%로 거의 같음',
        passed: false,
        preset: false,
      },
    ],
  },
  bill: {
    id: 'bill',
    partner: '할인어음',
    short: '할인어음',
    name: '요구불예금 + 할인어음',
    timing: '동행 + 동행',
    condition: '할인어음 증가',
    conditionDetail: '3개월 전 잔액보다 늘어남',
    window: 3,
    target: '할인어음을 쓰는 수출 거래처',
    ruleNote:
      '참고 신호는 할인어음을 쓰는 수출 거래처가 세 조건을 모두 충족할 때 표시합니다. 지역 수출이 1년 전 같은 달보다 줄었고, 통장 잔고가 3개월 전보다 10% 넘게 줄었으며, 할인어음 잔액이 3개월 전보다 늘어난 경우입니다.',
    leadNote: '지역 수출이 줄어든 달에 통장 잔고는 빠지고 어음 할인은 늘어난 곳을 모았습니다.',
    basisNote:
      '이 규칙은 팀 시차 분석(예비 관찰)에서 제안된 조합을 옮긴 참고용이며, 실제 데이터 점검에서 부분 지지(수출 경기와 함께 움직임은 확인, 비수출 거래처와 가려내는 힘은 기준 미달)에 그쳤습니다. 부실이나 위험을 판정하지 않습니다.',
    verdict: '부분 지지',
    verdictShort: '수출 경기에 따라 켜지고 꺼지지만, 비수출 거래처와 가려내는 힘은 기준 미달',
    checks: [
      {
        label: '수출이 줄어든 달, 수출 거래처가 비수출의 1.5배 이상 켜지는가',
        result: '14.4% 대 11.3%, 1.27배',
        passed: false,
        preset: true,
      },
      {
        label: '수출 거래처의 초과분이 수출이 줄어든 달에 더 커지는가',
        result: '+6.5%p, 95% 구간 +2.2~+11.6(0을 포함하지 않음)',
        passed: true,
        preset: true,
      },
    ],
  },
}

export const COMBO_IDS = Object.keys(COMBOS) as ComboId[]
export const DEFAULT_COMBO: ComboId = 'loan'

export function isComboId(v: string | null): v is ComboId {
  return v !== null && (COMBO_IDS as string[]).includes(v)
}
