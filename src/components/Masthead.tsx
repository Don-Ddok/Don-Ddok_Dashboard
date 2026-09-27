import { NavLink } from 'react-router-dom'
import { useMonth } from '../lib/month'
import { MonthControl } from './MonthControl'
import { INTERNAL } from '../lib/internal'

const LINKS = [
  { to: '/', label: '월보', end: true },
  { to: '/firms', label: '거래처', end: false },
  { to: '/timing', label: '계정 시차', end: false },
  { to: '/evidence', label: '근거와 한계', end: false },
  { to: '/board', label: '게시판', end: false },
  ...(INTERNAL ? [{ to: '/internal', label: '내부 시연(실제 데이터)', end: false }] : []),
]

/** 보도자료 표지 모양의 작은 표장: 먹색 머리 띠, 괘선 세 줄 가운데 민트 한 줄 */
function Emblem() {
  return (
    <svg className="emblem" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4" y="3" width="24" height="26" fill="var(--paper-raise)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="4" y="3" width="24" height="5" fill="var(--ink)" />
      <line x1="9" y1="14" x2="23" y2="14" stroke="var(--ink)" strokeWidth="2" />
      <line x1="9" y1="19" x2="23" y2="19" stroke="var(--mint)" strokeWidth="3" />
      <line x1="9" y1="24" x2="18" y2="24" stroke="var(--ink)" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  )
}

export function Masthead() {
  const { search } = useMonth()
  return (
    <header className="masthead">
      <div className="release-band">
        <p className="release-label">보도자료</p>
        <p className="release-kind">
          <span className="release-chip">시연용</span>
          <span className="release-title">대구·경북 기업금융 참고 통계</span>
        </p>
        <p className="release-meta">담당 돈독 팀</p>
      </div>
      {INTERNAL && (
        <p className="internal-band" role="note">
          내부 시연 모드: 실제 은행 데이터 집계 화면이 켜져 있습니다. 외부 공유·캡처 배포 금지
        </p>
      )}
      <div className="masthead-top">
        <div className="brand">
          <Emblem />
          <div>
            <p className="masthead-name">
              <NavLink to={{ pathname: '/', search }}>거래처 참고 신호 월보</NavLink>
            </p>
            <p className="masthead-issuer">
              돈독 통계 프로젝트 프로토타입, 가상 거래처 데이터{INTERNAL && ' (내부 시연 화면만 실제 데이터 집계)'}
            </p>
          </div>
        </div>
        <MonthControl />
      </div>
      <nav className="nav" aria-label="주요 화면">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={{ pathname: l.to, search }} end={l.end}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
