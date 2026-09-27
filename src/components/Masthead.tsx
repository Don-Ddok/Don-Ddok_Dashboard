import { NavLink } from 'react-router-dom'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { useMonth } from '../lib/month'
import { MonthControl } from './MonthControl'
import { INTERNAL } from '../lib/internal'
import { FIRMS, MONTHS, regionYoY } from '../data/synthetic'
import { FIRST_JUDGED_INDEX, firmsByStatus } from '../data/signals'
import { ymLong } from '../lib/format'

const LINKS = [
  { to: '/', label: '월보', end: true },
  { to: '/firms', label: '거래처', end: false },
  { to: '/evidence', label: '근거와 한계', end: false },
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

const SPAN = 12

/**
 * 한눈에 칸 아래 12개월 작은 막대. signed면 기준선 위(증가, 민트)·아래(감소, 주황), 아니면 바닥에서 올라가는 개수 막대.
 * 마지막 칸이 기준월이고 진하게 표시한다. 숫자는 위에 있으므로 화면 읽기 프로그램에는 숨긴다.
 */
function MiniBars({ values, signed }: { values: (number | null)[]; signed: boolean }) {
  const max = Math.max(1e-9, ...values.map((v) => Math.abs(v ?? 0)))
  return (
    <span className={`mini-bars${signed ? ' signed' : ''}`} aria-hidden="true">
      {values.map((v, i) => {
        const h = v === null ? 0 : (Math.abs(v) / max) * 100
        const dir = v === null ? 'none' : v < 0 ? 'down' : 'up'
        return (
          <span key={i} className={`mini-col${i === values.length - 1 ? ' is-current' : ''}`}>
            <span className={`mini-bar ${dir}`} style={{ height: `${signed ? h / 2 : h}%` }} />
          </span>
        )
      })}
    </span>
  )
}

/** 이번 달 한눈에: 지역 수출 두 개와 거래처 수 두 개. 모든 화면 머리에 같은 기준월로 */
function Glance() {
  const { index, ym } = useMonth()
  const judged = index >= FIRST_JUDGED_INDEX
  const met = judged ? firmsByStatus(FIRMS, index, 'met').length : null
  const near = judged ? firmsByStatus(FIRMS, index, 'partial').length : null
  const prevMet = index - 1 >= FIRST_JUDGED_INDEX ? firmsByStatus(FIRMS, index - 1, 'met').length : null
  const diff = met !== null && prevMet !== null ? met - prevMet : null
  const recent = MONTHS.slice(Math.max(0, index - SPAN + 1), index + 1)
  const recentIdx = recent.map((_, k) => index - recent.length + 1 + k)
  const metTrail = recentIdx.map((i) => (i >= FIRST_JUDGED_INDEX ? firmsByStatus(FIRMS, i, 'met').length : null))
  const nearTrail = recentIdx.map((i) => (i >= FIRST_JUDGED_INDEX ? firmsByStatus(FIRMS, i, 'partial').length : null))

  return (
    <dl className="glance" aria-label={`${ymLong(ym)} 한눈에`}>
      {(['대구', '경북'] as const).map((r) => {
        const v = regionYoY(r, ym)
        const Arrow = v < 0 ? CaretDown : CaretUp
        return (
          <div key={r}>
            <dt>{r} 수출</dt>
            <dd className={`glance-value ${v < 0 ? 'down' : 'up'}`}>
              <Arrow size={12} weight="fill" aria-hidden="true" />
              <span className="visually-hidden">{v < 0 ? '감소' : '증가'} </span>
              {Math.abs(v * 100).toFixed(1)}%
            </dd>
            <dd className="glance-note">
              <MiniBars values={recent.map((m) => regionYoY(r, m))} signed />
              전년비
            </dd>
          </div>
        )
      })}
      <div>
        <dt>살펴볼 거래처</dt>
        <dd className="glance-value">
          {met === null ? '판정 전' : `${met}곳`}
          {diff !== null && (
            <span className="glance-delta">
              전월 {diff === 0 ? '같음' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)}`}
            </span>
          )}
        </dd>
        <dd className="glance-note">
          <MiniBars values={metTrail} signed={false} />
          12개월
        </dd>
      </div>
      <div>
        <dt>기준 근접</dt>
        <dd className="glance-value">{near === null ? '판정 전' : `${near}곳`}</dd>
        <dd className="glance-note">
          <MiniBars values={nearTrail} signed={false} />
          12개월
        </dd>
      </div>
    </dl>
  )
}

export function Masthead() {
  const { ym } = useMonth()
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
              <NavLink to={{ pathname: '/', search: `?m=${ym}` }}>거래처 참고 신호 월보</NavLink>
            </p>
            <p className="masthead-issuer">
              돈독 통계 프로젝트 프로토타입, 가상 거래처 데이터{INTERNAL && ' (내부 시연 화면만 실제 데이터 집계)'}
            </p>
          </div>
        </div>
        <Glance />
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
