import { NavLink, useLocation } from 'react-router-dom'
import { useMonth } from '../lib/month'

/** 윗줄 메뉴 하나 아래에 묶인 화면들. 윗줄 메뉴는 묶음의 첫 화면으로 가고, 묶음 안에서는 이 작은 탭으로 오간다 */
export const GROUPS = [
  {
    label: '신호 월보',
    items: [
      { to: '/bulletin', label: '월보' },
      { to: '/firms', label: '고객' },
      { to: '/timing', label: '계정 시차' },
    ],
  },
  {
    label: '근거와 한계',
    items: [
      { to: '/analysis', label: '분석 결과 (여신 분석 22장)' },
      { to: '/evidence', label: '신호 규칙 점검' },
    ],
  },
]

export function groupOf(pathname: string) {
  return GROUPS.find((g) => g.items.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`)))
}

export function SubNav() {
  const { pathname } = useLocation()
  const { search } = useMonth()
  const group = groupOf(pathname)
  if (!group) return null
  return (
    <nav className="subnav" aria-label={`${group.label} 안의 화면`}>
      {group.items.map((i) => (
        <NavLink key={i.to} to={{ pathname: i.to, search }}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  )
}
