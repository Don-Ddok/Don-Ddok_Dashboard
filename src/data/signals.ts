// "참고 신호" 규칙
// 수출 경기가 나쁜 달에, 수출하는 거래처가 통장 잔고는 빠지는데 대출은 줄이지 않고 있으면 표시한다.
// 연구에서 관찰된 경향(약한 증거)을 바탕으로 한 모니터링 아이디어이며, 검증된 조기경보 규칙이 아니다.
import { MONTHS, regionYoY, type Firm } from './synthetic'

export const RULE = {
  depositDropWindow: 3, // 개월
  depositDropThreshold: -0.1, // 3개월 동안 잔고 10% 넘게 감소
  depositNearThreshold: -0.05, // 5~10% 감소는 '기준 근접'
  loanWindow: 6, // 개월
  loanHoldThreshold: -0.05, // 6개월 동안 대출이 5% 넘게 줄지 않음(= 유지하거나 늘림)
} as const

/** 대출 6개월 변화를 계산할 수 있는 첫 달(2023년 7월) */
export const FIRST_JUDGED_INDEX = RULE.loanWindow
export const LAST_INDEX = MONTHS.length - 1

/**
 * met: 세 조건 모두 충족
 * partial: 기준 근접. 지역 수출 감소와 대출 유지는 충족했고, 통장 잔고가 5~10% 줄어 기준에 조금 못 미침
 *   (대출 유지는 대부분의 회사가 늘 충족하므로 "조건 하나만 충족"으로 정의하면 거의 모든 회사가 걸린다)
 * none: 수출 거래처지만 해당 없음 / na: 비수출 거래처라 규칙 대상이 아님
 */
export type SignalStatus = 'met' | 'partial' | 'none' | 'na'

export interface Condition {
  key: 'region' | 'deposit' | 'loan'
  label: string
  met: boolean
  value: number | null // 변화율(소수)
  detail: string
}

export interface SignalCheck {
  ym: number
  status: SignalStatus
  conditions: Condition[]
}

function change(cur: number, prev: number | undefined) {
  return prev !== undefined && prev > 0 ? cur / prev - 1 : null
}

export function checkSignal(firm: Firm, monthIndex: number): SignalCheck {
  const cur = firm.series[monthIndex]
  const yoy = regionYoY(firm.region, cur.ym)
  const depositChange = change(cur.deposit, firm.series[monthIndex - RULE.depositDropWindow]?.deposit)
  const loanChange = change(cur.loan, firm.series[monthIndex - RULE.loanWindow]?.loan)

  const conditions: Condition[] = [
    {
      key: 'region',
      label: '지역 수출 감소',
      met: yoy < 0,
      value: yoy,
      detail: `${firm.region} 수출, 1년 전 같은 달 대비`,
    },
    {
      key: 'deposit',
      label: '통장 잔고 감소',
      met: depositChange !== null && depositChange < RULE.depositDropThreshold,
      value: depositChange,
      detail: `${RULE.depositDropWindow}개월 전 대비, 기준 -10%`,
    },
    {
      key: 'loan',
      label: '대출 유지',
      met: loanChange !== null && loanChange >= RULE.loanHoldThreshold,
      value: loanChange,
      detail: `${RULE.loanWindow}개월 전 대비, 기준 -5% 이상`,
    },
  ]

  let status: SignalStatus
  if (!firm.exporter || depositChange === null || loanChange === null) status = 'na'
  else if (conditions.every((c) => c.met)) status = 'met'
  else if (conditions[0].met && conditions[2].met && depositChange <= RULE.depositNearThreshold) status = 'partial'
  else status = 'none'

  return { ym: cur.ym, status, conditions }
}

export function firmsByStatus(firms: Firm[], monthIndex: number, status: SignalStatus) {
  return firms
    .map((firm) => ({ firm, check: checkSignal(firm, monthIndex) }))
    .filter((x) => x.check.status === status)
}

/**
 * 첫 화면 기본 기준월: 세 조건을 모두 충족한 거래처가 minCount곳 이상인 가장 최근 달.
 * 처음 보는 사람에게 사례가 충분히 보이도록 고른 기본값일 뿐, 다른 달도 모두 고를 수 있다.
 */
export function latestMonthWithSignal(firms: Firm[], minCount = 3) {
  for (let i = LAST_INDEX; i >= FIRST_JUDGED_INDEX; i--) {
    if (firmsByStatus(firms, i, 'met').length >= minCount) return i
  }
  return LAST_INDEX
}
