import { useEffect, useState } from 'react'
import type { Region } from '../data/regionExports'

/** 내부 시연 모드인지(`npm run dev:internal`). 배포 빌드에서는 항상 false라 관련 화면과 메뉴가 빠진다 */
export const INTERNAL = import.meta.env.MODE === 'internal'

/** 5 미만이라 가린 칸은 null */
type Masked = number | null

export interface InternalSummary {
  generatedFrom: string
  notice: string
  minCell: number
  firstYm: number
  totals: { firms: number; exporters: number; metFirmMonths: Masked; metFirms: Masked; judgedFirmMonths: number }
  monthly: { ym: number; region: Region; exporters: Masked; judged: Masked; met: Masked; near: Masked }[]
  industries: { industry: string; exporters: number; judgedMonths: number; metMonths: Masked; metShare: number | null }[]
  industryOtherFirms: number
  loanCut: { ym: number; exposedN: Masked; exposedCutShare: number | null; otherN: Masked; otherCutShare: number | null }[]
  patternRate: Record<'exporters' | 'others', { judgedMonths: number; share: number }>
  depositDropRate: Record<'exporters' | 'others', number>
}

type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; message: string }

/** 개발 서버가 로컬 집계 파일을 읽어 주는 주소에서 가져온다(파일은 저장소 밖) */
function useInternalFile<T>(url: string): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    fetch(url, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return (await r.json()) as T
      })
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((e: unknown) => alive && setState({ status: 'error', message: e instanceof Error ? e.message : String(e) }))
    return () => {
      alive = false
    }
  }, [url])
  return state
}

export function useInternalSummary() {
  return useInternalFile<InternalSummary>('/__internal/summary.json')
}

/** 조합 신호 점검(요구불예금 감소 + 할인어음 증가) 결과. 분석 폴더 combo_signal_check.py가 만든다 */
export interface ComboRate {
  pct: number
  n: number
  hits: number
}

export interface ComboResult {
  label: string
  treat: string
  firmsExposed: number
  firmsOther: number
  rates: Record<'down_exposed' | 'down_other' | 'up_exposed' | 'up_other', ComboRate>
  ratioDown: number
  did: number
  didCI: [number, number]
  pass1: boolean
  pass2: boolean
}

export function useInternalCombo() {
  return useInternalFile<{ results: ComboResult[] }>('/__internal/combo.json')
}

/** 가린 칸 표시 */
export function masked(n: Masked, min: number) {
  return n === null ? `${min} 미만` : n.toLocaleString('ko-KR')
}
