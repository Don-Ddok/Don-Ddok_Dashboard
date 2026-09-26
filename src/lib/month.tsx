// 기준월 상태: 주소창의 ?m=YYYYMM 에 담아 두어 새로고침·공유해도 같은 달이 열린다
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { Link, useSearchParams, type LinkProps } from 'react-router-dom'
import { FIRMS, MONTHS } from '../data/synthetic'
import { FIRST_JUDGED_INDEX, LAST_INDEX, latestMonthWithSignal } from '../data/signals'

const DEFAULT_INDEX = latestMonthWithSignal(FIRMS)

interface MonthState {
  index: number
  ym: number
  setIndex: (i: number) => void
}

const MonthContext = createContext<MonthState | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const fromUrl = MONTHS.indexOf(Number(params.get('m')))
  const index = fromUrl >= FIRST_JUDGED_INDEX ? fromUrl : DEFAULT_INDEX

  const setIndex = useCallback(
    (i: number) => {
      const clamped = Math.min(LAST_INDEX, Math.max(FIRST_JUDGED_INDEX, i))
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('m', String(MONTHS[clamped]))
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const value = useMemo(() => ({ index, ym: MONTHS[index], setIndex }), [index, setIndex])
  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth는 MonthProvider 안에서만 쓸 수 있습니다')
  return ctx
}

/** 현재 기준월을 유지한 채 이동하는 링크 */
export function MonthLink({ to, ...rest }: Omit<LinkProps, 'to'> & { to: string }) {
  const { ym } = useMonth()
  return <Link to={{ pathname: to, search: `?m=${ym}` }} {...rest} />
}
