// 이번 달 추천 데이터: 팀 매칭 모델(단계 × 페르소나 × 세그먼트 → 추천 상품)의 집계 결과.
// 파일은 public/data/campaign.json(법인 ID·개별 잔액 없음). 크기가 커서 화면에 들어올 때 한 번만 불러온다.
import { useEffect, useState } from 'react'

export type PersonaKey = 'A' | 'B' | 'C' | 'D' | 'E'
export type Segment = '수출형' | '수입형'
export type Stage = '평시' | '관찰' | '적기' | '정점·유지' | '장기둔화'
export type PersonaCounts = Partial<Record<PersonaKey, number>>

export interface ProductPick {
  상품명: string
  추가요건: string
  이용경로: string
  법인추천가능: string
  제안방식: string
  한도조건조정_비율: number
}

export interface RecoCell {
  페르소나?: string
  세그먼트?: Segment
  법인수: number
  대표조합_법인수: number
  추천: ProductPick[]
  제안메시지: string
  근거_타이밍?: string
}

export interface IndustryMid {
  업종_중분류: string
  법인수: number
  페르소나: PersonaCounts
}

export interface Industry {
  업종: string
  법인수: number
  페르소나: PersonaCounts
  포함업종?: string[]
  중분류?: IndustryMid[]
}

export interface RegionMonth {
  단계: Stage
  k: number | null
  T0: string | null
  보정YoY: number
  좌측절단: boolean
  요약: { 노출법인: number; 수출형: number; 수입형: number; 비노출법인: number }
  업종: Industry[]
  추천: RecoCell[]
  비노출_일반: RecoCell | null
}

export interface ProductInfo {
  모델유형?: string
  대상?: string
  금리기준일?: string
  안내페이지?: boolean
  목록?: string
  수집일?: string
  상세URL?: string
  상세?: Record<string, string>
}

export interface CampaignData {
  meta: { 생성일: string; 기본지역: string; 기본월: string; 월: string[]; 근거: string; 링크: string; 링크이름: string; 주의: string }
  페르소나설명: Record<PersonaKey, { 이름: string; 정의: string }>
  상품: Record<string, ProductInfo>
  지역: Record<string, Record<string, RegionMonth>>
}

let cache: Promise<CampaignData> | null = null

export function loadCampaign() {
  cache ??= fetch('./data/campaign.json').then((r) => {
    if (!r.ok) throw new Error(`추천 데이터를 불러오지 못했습니다(${r.status})`)
    return r.json() as Promise<CampaignData>
  })
  return cache
}

type Loaded = { status: 'loading' } | { status: 'ready'; data: CampaignData } | { status: 'error'; message: string }

export function useCampaign(): Loaded {
  const [state, setState] = useState<Loaded>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    loadCampaign().then(
      (data) => alive && setState({ status: 'ready', data }),
      (e: Error) => alive && setState({ status: 'error', message: e.message }),
    )
    return () => {
      alive = false
    }
  }, [])
  return state
}

/** 단계: 둔화가 진행될수록 짙은 먹색. 페르소나 색과 겹치지 않게 무채색 농도로만 */
export const STAGES: { name: Stage; color: string; dark: boolean }[] = [
  { name: '평시', color: '#ecefec', dark: false },
  { name: '관찰', color: '#cfd4d1', dark: false },
  { name: '적기', color: '#9aa19e', dark: false },
  { name: '정점·유지', color: '#5b625f', dark: true },
  { name: '장기둔화', color: '#2b302e', dark: true },
]
export const STAGE_OF = Object.fromEntries(STAGES.map((s) => [s.name, s])) as Record<Stage, (typeof STAGES)[number]>

export const PERSONA_KEYS: PersonaKey[] = ['A', 'B', 'C', 'D', 'E']

/** 작은 칸(1~4곳)은 법인이 특정될 수 있어 공개 파일에서 -1로 바꿔 두었다(scripts/mask-campaign.py). 화면은 "5곳 미만"으로 읽는다 */
export const SMALL = 5
export const isSmall = (n: number) => n === -1 || (n > 0 && n < SMALL)
export const numText = (n: number) => (isSmall(n) ? `${SMALL} 미만` : n.toLocaleString('ko-KR'))
export const countText = (n: number) => (isSmall(n) ? `${SMALL}곳 미만` : `${n.toLocaleString('ko-KR')}곳`)

export const ymText = (ym: string) => `${ym.slice(0, 4)}년 ${Number(ym.slice(4))}월`
export const ymDash = (ym: string) => `${ym.slice(0, 4)}.${ym.slice(4)}`

/** 페르소나 분포를 큰 순서로 */
export function personaEntries(p: PersonaCounts) {
  // 가린 칸(-1)은 작은 칸이라 맨 뒤로
  const size = (n: number) => (n === -1 ? 2.5 : n)
  return (Object.entries(p) as [PersonaKey, number][]).filter(([, n]) => n !== 0).sort((a, b) => size(b[1]) - size(a[1]))
}
