import { Link, NavLink, useLocation } from 'react-router-dom'
import { groupOf } from './SubNav'
import { useMonth } from '../lib/month'
import { MonthControl } from './MonthControl'
import { INTERNAL } from '../lib/internal'
import { useData } from '../lib/data'

/** 윗줄 메뉴. 발표 흐름(언제·누구에게 → 근거 → 효과 검증) 순서. 근거와 한계는 묶음이라 아래 작은 탭(SubNav)으로 나뉜다.
 *  신호 월보(시연용, 은행 계좌 신호는 기각)는 윗줄에서 빼고 근거와 한계 안에서만 연다 */
const LINKS = [
  { to: '/', label: '홈', group: null },
  { to: '/recommend', label: '이번 달 추천', group: null },
  { to: '/results', label: '분석 결과', group: null },
  { to: '/pilot', label: '효과 검증', group: null },
  { to: '/insight', label: '근거와 한계', group: '근거와 한계' },
  { to: '/board', label: '게시판', group: null },
  ...(INTERNAL ? [{ to: '/internal', label: '규칙 점검(실제 집계)', group: null }] : []),
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

/** 기준월 선택은 신호 월보 계열 화면에서만(이번 달 추천은 자체 달력, 홈·분석은 기준월과 무관) */
const MONTH_PAGES = ['/bulletin', '/firms', '/timing', '/evidence', '/internal']

export function Masthead() {
  const { search } = useMonth()
  const { kind } = useData()
  const { pathname } = useLocation()
  const showMonth = MONTH_PAGES.some((p) => pathname.startsWith(p))
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
          내부 시연 모드: 월보·고객은 실제 은행 법인 데이터입니다. 외부 공유·캡처 배포 금지
        </p>
      )}
      <div className="masthead-top">
        <div className="brand">
          <Emblem />
          <div>
            <p className="masthead-name">
              <NavLink to={{ pathname: '/', search }}>법인 고객 마케팅 월보</NavLink>
            </p>
            <p className="masthead-issuer">
              돈독 통계 프로젝트 프로토타입 · 은행 마케팅 담당자용{showMonth ? (kind === 'real' ? ' · 실제 법인 데이터(내부 시연)' : ' · 신호 월보는 가상 고객 데이터') : ''}
            </p>
          </div>
        </div>
        {showMonth && <MonthControl />}
      </div>
      <nav className="nav" aria-label="주요 화면">
        {LINKS.map((l) =>
          l.group ? (
            <Link
              key={l.to}
              to={{ pathname: l.to, search }}
              aria-current={groupOf(pathname)?.label === l.group ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ) : (
            <NavLink key={l.to} to={{ pathname: l.to, search }} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ),
        )}
      </nav>
    </header>
  )
}
