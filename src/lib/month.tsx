// 기준월과 신호 조합 상태: 주소창의 ?m=YYYYMM&c=조합 에 담아 두어 새로고침·공유해도 같은 화면이 열린다
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { Link, useSearchParams, type LinkProps } from 'react-router-dom'
import { MONTHS } from '../data/synthetic'
import { FIRST_JUDGED_INDEX, LAST_INDEX, latestMonthWithSignal } from '../data/signals'
import { COMBO_IDS, DEFAULT_COMBO, isComboId, type ComboId } from '../data/combos'
import { useData } from './data'

interface MonthState {
  index: number
  ym: number
  setIndex: (i: number) => void
  combo: ComboId
  setCombo: (c: ComboId) => void
  /** 현재 기준월·조합을 담은 주소 뒷부분(?m=...&c=...) */
  search: string
}

const MonthContext = createContext<MonthState | null>(null)

function searchFor(ym: number, combo: ComboId) {
  return combo === DEFAULT_COMBO ? `?m=${ym}` : `?m=${ym}&c=${combo}`
}

export function MonthProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const { firms } = useData()
  // 첫 화면 기본 기준월은 조합마다, 데이터(가상·실제)마다 다르다
  const defaultIndex = useMemo(
    () => Object.fromEntries(COMBO_IDS.map((id) => [id, latestMonthWithSignal(firms, id)])) as Record<ComboId, number>,
    [firms],
  )
  const c = params.get('c')
  const combo: ComboId = isComboId(c) ? c : DEFAULT_COMBO
  const fromUrl = MONTHS.indexOf(Number(params.get('m')))
  const index = fromUrl >= FIRST_JUDGED_INDEX ? fromUrl : defaultIndex[combo]

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

  // 조합을 바꿔도 기준월은 그대로 둔다(같은 달을 두 조합으로 견줘 볼 수 있게)
  const setCombo = useCallback(
    (next: ComboId) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('m', String(MONTHS[index]))
          if (next === DEFAULT_COMBO) p.delete('c')
          else p.set('c', next)
          return p
        },
        { replace: true },
      )
    },
    [setParams, index],
  )

  const value = useMemo(
    () => ({
      index,
      ym: MONTHS[index],
      setIndex,
      combo,
      setCombo,
      search: searchFor(MONTHS[index], combo),
    }),
    [index, setIndex, combo, setCombo],
  )
  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth는 MonthProvider 안에서만 쓸 수 있습니다')
  return ctx
}

/** 현재 기준월·조합을 유지한 채 이동하는 링크 */
export function MonthLink({ to, ...rest }: Omit<LinkProps, 'to'> & { to: string }) {
  const { search } = useMonth()
  return <Link to={{ pathname: to, search }} {...rest} />
}
