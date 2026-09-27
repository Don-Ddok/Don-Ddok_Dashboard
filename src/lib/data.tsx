// 거래처 데이터 출처: 배포 화면은 가상 거래처, 내부 시연 모드(로컬 개발 서버)는 실제 법인 데이터
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { FIRMS, MONTHS, type Firm, type MonthPoint } from '../data/synthetic'
import type { Region } from '../data/regionExports'
import { INTERNAL } from './internal'

export interface DataSource {
  kind: 'synthetic' | 'real'
  firms: Firm[]
  /** 수출 실적 단위 */
  exportUnit: string
  /** 거래처 범위 한 줄 설명 */
  scope: string
}

const SYNTHETIC: DataSource = {
  kind: 'synthetic',
  firms: FIRMS,
  exportUnit: '만 달러',
  scope: '가상 거래처',
}

/** 분석 폴더 internal_firms_export.py가 만드는 firms.json 모양 */
interface RealFile {
  scope: string
  exportUnit: string
  months: number[]
  firms: {
    id: string
    region: Region
    industry: string
    grade: string
    exporter: boolean
    series: ([number, number, number, number] | null)[]
  }[]
}

function toFirms(file: RealFile): Firm[] {
  if (file.months.join() !== MONTHS.join()) throw new Error('실제 데이터의 월 범위가 화면(2023.01~2025.12)과 다릅니다')
  return file.firms.map((f) => {
    const series: MonthPoint[] = f.series.map((v, i) =>
      v
        ? { ym: MONTHS[i], observed: true, deposit: v[0], loan: v[1], bill: v[2], exportAmt: v[3] }
        : { ym: MONTHS[i], observed: false, deposit: null, loan: null, bill: null, exportAmt: null },
    )
    return {
      id: f.id,
      name: `법인 ${f.id}`,
      synthetic: false,
      region: f.region,
      industry: f.industry,
      grade: f.grade,
      exporter: f.exporter,
      billUser: series.some((p) => (p.bill ?? 0) > 0),
      series,
    }
  })
}

type State = { status: 'loading' } | { status: 'ready'; data: DataSource } | { status: 'error'; message: string }

const DataContext = createContext<DataSource>(SYNTHETIC)

/**
 * 내부 시연 모드에서는 개발 서버가 로컬 파일을 넘겨 주는 주소(/__internal/firms.json, 127.0.0.1 전용)에서
 * 실제 법인 데이터를 받아 월보·거래처·거래처 상세를 채운다. 배포 빌드에서는 INTERNAL이 false라 가상 데이터만 쓴다.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INTERNAL ? { status: 'loading' } : { status: 'ready', data: SYNTHETIC })

  useEffect(() => {
    if (!INTERNAL) return
    let alive = true
    fetch('/__internal/firms.json', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return (await r.json()) as RealFile
      })
      .then((file) => {
        const data: DataSource = { kind: 'real', firms: toFirms(file), exportUnit: file.exportUnit, scope: file.scope }
        if (alive) setState({ status: 'ready', data })
      })
      .catch((e: unknown) => alive && setState({ status: 'error', message: e instanceof Error ? e.message : String(e) }))
    return () => {
      alive = false
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <section className="lead" aria-busy="true">
        <p>실제 법인 데이터를 불러오는 중입니다(내부 시연).</p>
      </section>
    )
  }
  if (state.status === 'error') {
    return (
      <section className="lead">
        <p className="kicker">내부 시연</p>
        <h1>실제 법인 데이터를 읽지 못했습니다</h1>
        <p>{state.message}</p>
        <p>
          분석 폴더에서 <code>internal_firms_export.py</code>를 실행해 <code>내부시연/firms.json</code>을 만든 뒤 개발 서버를 다시
          여세요.
        </p>
      </section>
    )
  }
  return <DataContext.Provider value={state.data}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
