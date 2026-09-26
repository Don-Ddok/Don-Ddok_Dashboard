const MINUS = '−' // 표에서 하이픈보다 또렷한 빼기 기호

/** 소수 변화율을 부호가 붙은 퍼센트로: 0.034 → "+3.4%", -0.1 → "−10.0%" */
export function pct(x: number | null | undefined, digits = 1) {
  if (x === null || x === undefined || Number.isNaN(x)) return '없음'
  const v = x * 100
  const s = Math.abs(v).toFixed(digits)
  if (Number(s) === 0) return `0.${'0'.repeat(digits)}%`
  return `${v > 0 ? '+' : MINUS}${s}%`
}

/** 퍼센트 값(이미 % 단위)을 부호와 함께: 3.4 → "+3.4%" */
export function pctPoint(v: number | null | undefined, digits = 1) {
  return v === null || v === undefined ? '없음' : pct(v / 100, digits)
}

const num = new Intl.NumberFormat('ko-KR')
export function amount(n: number) {
  return num.format(n)
}

/** 천 달러 → 백만 달러, 소수 첫째 자리 */
export function usdMillion(thousandUsd: number) {
  return (thousandUsd / 1000).toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function ymLong(ym: number) {
  return `${Math.floor(ym / 100)}년 ${ym % 100}월`
}

export function ymShort(ym: number) {
  return `${String(Math.floor(ym / 100)).slice(2)}.${String(ym % 100).padStart(2, '0')}`
}

/** 문장 속 증감 표현: 0.082 → "8.2% 늘었고", -0.05 → "5.0% 줄었고" */
export function moved(x: number) {
  const s = Math.abs(x * 100).toFixed(1)
  return x >= 0 ? `${s}% 늘었` : `${s}% 줄었`
}
