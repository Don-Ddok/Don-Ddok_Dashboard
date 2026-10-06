import { Link, useLocation } from 'react-router-dom'
import { useMonth } from '../lib/month'

interface Item {
  to: string
  label: string
  /** 이 탭이 켜져 보일 주소들(첫 화면 외에 딸린 화면이 있을 때) */
  also?: string[]
}

/** 시도했다 뺀 방법 안의 화면들: 왜 뺐는지(근거) + 그때 만든 시연 화면(신호 월보 계열) */
export const DROPPED: Item[] = [
  { to: '/evidence', label: '왜 뺐나' },
  { to: '/bulletin', label: '시연: 월보' },
  { to: '/firms', label: '시연: 고객' },
  { to: '/timing', label: '시연: 계정 시차' },
]

const DEMO_NOTE =
  '시연용 화면입니다. 가상 고객 80곳으로 규칙이 작동하는 모습을 보여 주며, 이 계좌 신호는 달력(영업일수)을 걷어낸 팀 재검증에서 수출 둔화를 알아채지 못해 최종 모델에서 뺐습니다.'

/** 윗줄 메뉴 하나 아래에 묶인 화면들. 윗줄 메뉴는 묶음의 첫 화면으로 가고, 묶음 안에서는 이 작은 탭으로 오간다 */
export const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: '근거와 한계',
    items: [
      { to: '/insight', label: '팀 인사이트' },
      { to: '/evidence', label: '시도했다 뺀 방법', also: DROPPED.map((d) => d.to) },
      { to: '/glossary', label: '용어 사전' },
    ],
  },
]

const matches = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`)
const isOn = (pathname: string, i: Item) => [i.to, ...(i.also ?? [])].some((p) => matches(pathname, p))

export function groupOf(pathname: string) {
  return GROUPS.find((g) => g.items.some((i) => isOn(pathname, i)))
}

export function SubNav() {
  const { pathname } = useLocation()
  const { search } = useMonth()
  const group = groupOf(pathname)
  if (!group) return null
  const inDropped = DROPPED.some((d) => matches(pathname, d.to))
  const inDemo = inDropped && !matches(pathname, '/evidence')
  return (
    <>
      <nav className="subnav" aria-label={`${group.label} 안의 화면`}>
        {group.items.map((i) => (
          <Link key={i.to} to={{ pathname: i.to, search }} aria-current={isOn(pathname, i) ? 'page' : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
      {inDropped && (
        <nav className="subnav subnav-sub" aria-label="시도했다 뺀 방법 안의 화면">
          <span className="subnav-sub-label">시도했다 뺀 방법</span>
          {DROPPED.map((d) => (
            <Link key={d.to} to={{ pathname: d.to, search }} aria-current={matches(pathname, d.to) ? 'page' : undefined}>
              {d.label}
            </Link>
          ))}
        </nav>
      )}
      {inDemo && (
        <p className="subnav-note" role="note">
          {DEMO_NOTE}
        </p>
      )}
    </>
  )
}
