// 화면 시연용 가상 거래처 데이터
// - 실제 은행 데이터가 아니다. 이름·금액·거래 내역은 모두 규칙에 따라 만들어낸 값이다.
// - 지역 수출 증감률(REGION_EXPORTS)만 실제 공개 통계를 쓴다.
// - 연구에서 관찰된 "방향"(수출이 꺾일 때 비수출 회사는 대출을 줄이고 수출 회사는 유지하는 경향)을
//   단순화해 넣었다. 가상 데이터의 숫자는 연구 결과의 근거가 아니다.
import { REGION_EXPORTS, type Region } from './regionExports'

export type Industry =
  | '전자부품'
  | '자동차부품'
  | '기계'
  | '1차금속'
  | '금속가공'
  | '화학'
  | '섬유'
  | '식료품'

export type Grade = '최우수' | '우수' | '일반'

export interface MonthPoint {
  ym: number // 202301 형식
  deposit: number // 입출금 통장 잔고(백만 원)
  loan: number // 운전자금 대출 잔액(백만 원)
  exportAmt: number // 그 달 수출 실적(만 달러), 비수출 회사는 0
}

export interface Firm {
  id: string
  name: string
  region: Region
  industry: Industry
  exporter: boolean
  grade: Grade
  series: MonthPoint[]
}

const SEED = 20260926
const FIRM_COUNT = 80

// 수출 회사가 될 확률 — 업종별로 다르게
const EXPORT_PROB: Record<Industry, number> = {
  전자부품: 0.55,
  자동차부품: 0.45,
  기계: 0.35,
  '1차금속': 0.4,
  금속가공: 0.25,
  화학: 0.35,
  섬유: 0.3,
  식료품: 0.1,
}
const INDUSTRIES = Object.keys(EXPORT_PROB) as Industry[]
const NAME_PREFIX = [
  '가람', '누리', '다온', '라온', '마루', '바른', '새솔', '아름', '자람', '하늘',
  '한결', '온새', '가온', '나래', '늘봄', '다솜', '도담', '보람', '세움', '해솔',
]
const NAME_WORD: Record<Industry, string> = {
  전자부품: '전자',
  자동차부품: '오토텍',
  기계: '기계',
  '1차금속': '스틸',
  금속가공: '정밀',
  화학: '케미칼',
  섬유: '섬유',
  식료품: '푸드',
}

/** 같은 씨앗이면 항상 같은 수열을 내는 난수 생성기(mulberry32) */
function makeRng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const normal = () => {
    const u = Math.max(next(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next())
  }
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)]
  return { next, normal, pick }
}

/** 은행 데이터처럼 유효숫자 n자리로 반올림(작은 변화는 보이지 않게 됨) */
function roundSig(x: number, n: number) {
  if (x <= 0) return 0
  const p = Math.pow(10, n - Math.ceil(Math.log10(x)))
  return Math.round(x * p) / p
}

export const MONTHS: number[] = Array.from({ length: 36 }, (_, i) => {
  const y = 2023 + Math.floor(i / 12)
  return y * 100 + (i % 12) + 1
})

/** 지역 수출 전년동월비(소수, 0.1 = 10%) */
export function regionYoY(region: Region, ym: number): number {
  const p = REGION_EXPORTS[region].find((d) => d.ym === ym)
  return p?.yoy == null ? 0 : p.yoy / 100
}

function makeFirm(index: number, rng: ReturnType<typeof makeRng>, usedNames: Set<string>): Firm {
  const industry = rng.pick(INDUSTRIES)
  const region: Region = rng.next() < 0.55 ? '대구' : '경북'
  const exporter = rng.next() < EXPORT_PROB[industry]
  const gradeRoll = rng.next()
  const grade: Grade = gradeRoll < (exporter ? 0.55 : 0.28) ? '최우수' : gradeRoll < 0.75 ? '우수' : '일반'

  // 겹치면 다음 접두어로 넘어가고, 업종의 조합을 다 쓴 경우에만 번호를 붙인다(무한 반복 방지)
  const start = Math.floor(rng.next() * NAME_PREFIX.length)
  let name = ''
  for (let k = 0; k < NAME_PREFIX.length; k++) {
    const candidate = `${NAME_PREFIX[(start + k) % NAME_PREFIX.length]}${NAME_WORD[industry]}`
    if (!usedNames.has(candidate)) {
      name = candidate
      break
    }
  }
  if (!name) {
    const base = `${NAME_PREFIX[start]}${NAME_WORD[industry]}`
    for (let n = 2; ; n++) {
      if (!usedNames.has(`${base}${n}`)) {
        name = `${base}${n}`
        break
      }
    }
  }
  usedNames.add(name)

  const size = Math.exp(rng.normal() * 0.8) * (exporter ? 1.8 : 1)
  let logDeposit = Math.log(300 * size)
  let logLoan = Math.log(1500 * size)
  const exportBase = exporter ? 20 + 180 * size * rng.next() : 0
  // 연구에서 관찰된 방향을 단순화: 비수출 회사는 수출 경기에 맞춰 대출을 늘리고 줄이고, 수출 회사는 거의 유지
  const loanSensitivity = exporter ? -0.004 : 0.03
  const depositSensitivity = exporter ? 0.06 : 0.01

  const series: MonthPoint[] = MONTHS.map((ym) => {
    const y = regionYoY(region, ym)
    logDeposit += depositSensitivity * y + 0.035 * rng.normal()
    logLoan += 0.002 + loanSensitivity * y + 0.012 * rng.normal()
    if (rng.next() < 0.04) logLoan += (rng.next() < 0.5 ? -1 : 1) * (0.1 + 0.2 * rng.next()) // 가끔 한도 증액·상환
    const shipped = exporter && rng.next() > 0.15 // 선적이 없는 달은 수출 실적 0
    const exportAmt = shipped ? Math.max(0, exportBase * (1 + 1.2 * y) * (1 + 0.25 * rng.normal())) : 0
    return {
      ym,
      deposit: roundSig(Math.exp(logDeposit), 3),
      loan: roundSig(Math.exp(logLoan), 2),
      exportAmt: roundSig(exportAmt, 2),
    }
  })

  return {
    id: `F-${String(index + 1).padStart(3, '0')}`,
    name: `${name}(가상)`,
    region,
    industry,
    exporter,
    grade,
    series,
  }
}

export const FIRMS: Firm[] = (() => {
  const rng = makeRng(SEED)
  const used = new Set<string>()
  return Array.from({ length: FIRM_COUNT }, (_, i) => makeFirm(i, rng, used))
})()

/** 기준월까지 최근 months개월 통장 잔고(표 안 흐름선용) */
export function depositTrail(firm: Firm, index: number, months = 12) {
  return firm.series.slice(Math.max(0, index - months + 1), index + 1).map((p) => p.deposit)
}

export function ymLabel(ym: number) {
  return `${Math.floor(ym / 100)}.${String(ym % 100).padStart(2, '0')}`
}
