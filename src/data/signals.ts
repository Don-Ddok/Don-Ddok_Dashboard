// "참고 신호" 규칙
// 수출 경기가 나쁜 달에, 수출하는 거래처가 통장 잔고는 빠지는데 짝 계정(운전자금대출 또는 할인어음)이 조합의 모양을 보이면 표시한다.
// 연구에서 관찰된 경향을 바탕으로 한 모니터링 아이디어이며, 검증된 조기경보 규칙이 아니다.
import { MONTHS, regionYoY, type Firm, type MonthPoint } from './synthetic'
import { COMBOS, DEFAULT_COMBO, type ComboId } from './combos'
import { workdayNote } from './workdays'

export const RULE = {
  depositDropWindow: 3, // 개월
  depositDropThreshold: -0.1, // 3개월 동안 잔고 10% 넘게 감소
  depositNearThreshold: -0.05, // 5~10% 감소는 '기준 근접'
  loanHoldThreshold: -0.05, // 6개월 동안 대출이 5% 넘게 줄지 않음(= 유지하거나 늘림)
} as const

/**
 * 판정을 시작하는 달(2023년 7월). 대출 6개월 변화가 계산되는 첫 달이며,
 * 두 조합을 같은 기간으로 비교하도록 할인어음 조합(3개월)도 같은 달부터 판정한다.
 */
export const FIRST_JUDGED_INDEX = 6
export const LAST_INDEX = MONTHS.length - 1
export const JUDGE_START_NOTE =
  '2023년 1~6월은 판정하지 않습니다. 대출 6개월 변화를 계산할 수 있는 7월부터, 두 조합 모두 같은 기간으로 판정합니다.'

/**
 * met: 세 조건 모두 충족
 * partial: 기준 근접. 지역 수출 감소와 조건 3은 충족했고, 통장 잔고가 5~10% 줄어 기준에 조금 못 미침
 *   (대출 유지는 대부분의 회사가 늘 충족하므로 "조건 하나만 충족"으로 정의하면 거의 모든 회사가 걸린다)
 * none: 규칙 대상이지만 해당 없음 / na: 규칙 대상이 아님(비수출, 할인어음 조합에서는 할인어음 거래 없음)
 */
export type SignalStatus = 'met' | 'partial' | 'none' | 'na'

export interface Condition {
  key: 'region' | 'deposit' | 'partner'
  label: string
  met: boolean
  value: number | null // 변화율(소수)
  /** 변화율로 나타낼 수 없을 때 대신 보이는 글(예: 3개월 전 0에서 생김) */
  valueText?: string
  detail: string
}

export interface SignalCheck {
  ym: number
  status: SignalStatus
  conditions: Condition[]
  /** 규칙 대상이 아닌 이유(status가 na일 때) */
  naReason?: string
}

/** 변화율. 어느 한쪽이 관측되지 않았거나 이전 값이 0이면 계산하지 않는다 */
function change(cur: number | null, prev: number | null | undefined) {
  return cur !== null && prev != null && prev > 0 ? cur / prev - 1 : null
}

function partnerCondition(firm: Firm, monthIndex: number, combo: ComboId): Condition {
  const c = COMBOS[combo]
  const cur = firm.series[monthIndex]
  const prev = firm.series[monthIndex - c.window]
  if (combo === 'loan') {
    const v = change(cur.loan, prev?.loan)
    return {
      key: 'partner',
      label: c.condition,
      met: v !== null && v >= RULE.loanHoldThreshold,
      value: v,
      detail: c.conditionDetail,
    }
  }
  const before = prev?.bill ?? undefined
  const now = cur.bill ?? 0
  const newly = before === 0 && now > 0
  return {
    key: 'partner',
    label: c.condition,
    met: before !== undefined && cur.bill !== null && now > before,
    value: change(cur.bill, before),
    valueText: newly ? '새로 생김' : before === 0 ? '0 유지' : undefined,
    detail: c.conditionDetail,
  }
}

export function checkSignal(firm: Firm, monthIndex: number, combo: ComboId = DEFAULT_COMBO): SignalCheck {
  const cur = firm.series[monthIndex]
  const yoy = regionYoY(firm.region, cur.ym)
  const depositChange = change(cur.deposit, firm.series[monthIndex - RULE.depositDropWindow]?.deposit)
  const partner = partnerCondition(firm, monthIndex, combo)

  const conditions: Condition[] = [
    {
      key: 'region',
      label: '지역 수출 감소',
      met: yoy < 0,
      value: yoy,
      detail: `${firm.region} 수출, 1년 전 같은 달 대비 · ${workdayNote(cur.ym)}`,
    },
    {
      key: 'deposit',
      label: '통장 잔고 감소',
      met: depositChange !== null && depositChange < RULE.depositDropThreshold,
      value: depositChange,
      detail: `${RULE.depositDropWindow}개월 전 대비, 기준 -10%`,
    },
    partner,
  ]

  const naReason = !cur.observed
    ? '이 달은 은행 거래 기록이 없습니다.'
    : !firm.exporter
      ? '수출 실적이 없는 거래처라 이 규칙의 대상이 아닙니다.'
      : combo === 'bill' && !firm.billUser
        ? '할인어음 거래가 없는 거래처라 이 조합의 대상이 아닙니다.'
        : undefined
  const computable = depositChange !== null && (combo === 'bill' || partner.value !== null)

  let status: SignalStatus
  if (naReason || !computable || monthIndex < FIRST_JUDGED_INDEX) status = 'na'
  else if (conditions.every((c) => c.met)) status = 'met'
  else if (conditions[0].met && partner.met && depositChange <= RULE.depositNearThreshold) status = 'partial'
  else status = 'none'

  return { ym: cur.ym, status, conditions, naReason }
}

export function firmsByStatus(firms: Firm[], monthIndex: number, status: SignalStatus, combo: ComboId = DEFAULT_COMBO) {
  return firms.map((firm) => ({ firm, check: checkSignal(firm, monthIndex, combo) })).filter((x) => x.check.status === status)
}

/** 조합의 짝 계정 잔액 */
export function partnerAmount(p: MonthPoint, combo: ComboId) {
  return combo === 'bill' ? p.bill : p.loan
}

/** 조합의 규칙 대상 거래처 수 */
export function targetCount(firms: Firm[], combo: ComboId) {
  return firms.filter((f) => f.exporter && (combo !== 'bill' || f.billUser)).length
}

/**
 * 첫 화면 기본 기준월: 세 조건을 모두 충족한 거래처가 minCount곳 이상인 가장 최근 달.
 * 처음 보는 사람에게 사례가 충분히 보이도록 고른 기본값일 뿐, 다른 달도 모두 고를 수 있다.
 */
export function latestMonthWithSignal(firms: Firm[], combo: ComboId = DEFAULT_COMBO, minCount = 3) {
  for (let i = LAST_INDEX; i >= FIRST_JUDGED_INDEX; i--) {
    if (firmsByStatus(firms, i, 'met', combo).length >= minCount) return i
  }
  return LAST_INDEX
}
