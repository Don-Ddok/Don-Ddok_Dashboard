import { NavLink } from 'react-router-dom'
import { useMonth } from '../lib/month'
import { MonthControl } from './MonthControl'

const LINKS = [
  { to: '/', label: '월보', end: true },
  { to: '/firms', label: '거래처', end: false },
  { to: '/evidence', label: '근거와 한계', end: false },
]

export function Masthead() {
  const { ym } = useMonth()
  return (
    <header className="masthead">
      <div className="masthead-top">
        <div>
          <p className="masthead-name">
            <NavLink to={{ pathname: '/', search: `?m=${ym}` }}>거래처 참고 신호 월보</NavLink>
          </p>
          <p className="masthead-issuer">돈독 통계 프로젝트 프로토타입, 가상 거래처 데이터</p>
        </div>
        <MonthControl />
      </div>
      <nav className="nav" aria-label="주요 화면">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={{ pathname: l.to, search: `?m=${ym}` }} end={l.end}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
