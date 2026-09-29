// 팀 인사이트 데이터: 파트별 분석(요구불 반응 재검정, 달력 보정, 상품 보유, 법인 군집, 가설 재검증)을 관계로 묶은 집계.
// 파일은 public/data/insight.json(scripts/mask-campaign.py가 만들고 1~4곳 칸은 -1로 가림)
import { useEffect, useState } from 'react'
import type { PersonaKey } from './campaign'

export interface RegionExport {
  지역: string
  연월: string
  원YoY: number
  보정YoY: number
}
export interface Response {
  h: number
  노출: number
  하한: number
  상한: number
  비노출: number
  유의: boolean | null
  차이유의: boolean | null
}
export interface IndustryExposure {
  업종: string
  법인수: number
  노출: number
  수출형: number
  수입형: number
  노출비중: number | null
}
export interface ProductGroup {
  유형: string
  이름: string
  법인수: number
  보유율: Record<string, number>
  lift: Record<string, number>
}
export interface Cluster {
  id: number
  이름: string
  법인수: number
  지역: Record<string, number>
  세그먼트: Record<string, number>
  업종상위: { 업종: string; 법인수: number }[]
  수출비중_평균: number
  요구불_중앙값: number
  보유율: Record<string, number>
  특성z: Record<string, number>
  페르소나: Partial<Record<PersonaKey, number>>
}
export interface Hypothesis {
  이름: string
  판정: string
  상태: '지지' | '기각' | '보류'
  요약: string
  출처: string
}
export interface InsightData {
  생성일: string
  지역수출: RegionExport[]
  달력: { 기울기: number; 상관: number; 관측: number; 근거: string }
  반응: Response[]
  업종노출: IndustryExposure[]
  상품관계: {
    대상: number
    상품: string[]
    전체보유율: Record<string, number>
    집단: ProductGroup[]
    기준: { 강조_이상: number; 강조_이하: number }
  }
  클러스터: {
    k: number
    실루엣: number
    대상: number
    전체: Record<string, number>
    군집: Cluster[]
    특성: string[]
  }
  검증: Hypothesis[]
}

let cache: Promise<InsightData> | null = null

export function loadInsight() {
  cache ??= fetch('./data/insight.json').then((r) => {
    if (!r.ok) throw new Error(`인사이트 데이터를 불러오지 못했습니다(${r.status})`)
    return r.json() as Promise<InsightData>
  })
  return cache
}

type Loaded = { status: 'loading' } | { status: 'ready'; data: InsightData } | { status: 'error'; message: string }

export function useInsight(): Loaded {
  const [state, setState] = useState<Loaded>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    loadInsight().then(
      (data) => alive && setState({ status: 'ready', data }),
      (e: Error) => alive && setState({ status: 'error', message: e.message }),
    )
    return () => {
      alive = false
    }
  }, [])
  return state
}
