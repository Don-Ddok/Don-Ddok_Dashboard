import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, CaretDown } from '@phosphor-icons/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FIRMS, regionYoY } from '../data/synthetic'
import { checkSignal, FIRST_JUDGED_INDEX, type SignalStatus } from '../data/signals'
import { amount, pct, ymLong, ymShort } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { ConditionTrace } from '../components/ConditionTrace'
import { SignalMark, STATUS_LABEL } from '../components/SignalMark'
import { TableWrap } from '../components/TableWrap'
import { Footnotes, SIGNAL_RULE_NOTE, SYNTHETIC_NOTE, WEAK_EVIDENCE_NOTE } from '../components/Footnotes'

const INK = '#1b1e23'
const INK_3 = '#5f6570'
const RULE = '#d5dae1'
const ACCENT = '#1f5aa6'
const TICK = { fontSize: 11, fill: INK_3 }

interface Row {
  x: string
  ym: number
  regionYoy: number
  deposit: number
  loan: number
  exportAmt: number
  status: SignalStatus | null
}

export default function FirmDetail() {
  const { id } = useParams()
  const { index, ym } = useMonth()
  const firm = FIRMS.find((f) => f.id === id)

  if (!firm) {
    return (
      <section className="lead not-found">
        <h1>거래처를 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 없는 거래처 번호입니다.</p>
        <p className="detail-actions">
          <MonthLink to="/firms">거래처 목록으로</MonthLink>
        </p>
      </section>
    )
  }

  const check = checkSignal(firm, index)
  const rows: Row[] = firm.series.map((p, i) => ({
    x: ymShort(p.ym),
    ym: p.ym,
    regionYoy: Math.round(regionYoY(firm.region, p.ym) * 1000) / 10,
    deposit: p.deposit,
    loan: p.loan,
    exportAmt: p.exportAmt,
    status: i >= FIRST_JUDGED_INDEX ? checkSignal(firm, i).status : null,
  }))
  const metMonths = rows.filter((r) => r.status === 'met')
  const currentX = ymShort(ym)
  const first = rows[0]
  const last = rows[rows.length - 1]

  return (
    <>
      <MonthLink to="/firms" className="back-link">
        <ArrowLeft size={14} weight="bold" /> 거래처 목록
      </MonthLink>

      <section className="lead" aria-labelledby="firm-title">
        <h1 id="firm-title">
          {firm.name.replace('(가상)', '')} <span className="synthetic">(가상)</span>
        </h1>
        <dl className="facts">
          <div>
            <dt>지역</dt>
            <dd>{firm.region}</dd>
          </div>
          <div>
            <dt>업종</dt>
            <dd>{firm.industry}</dd>
          </div>
          <div>
            <dt>수출 여부</dt>
            <dd>{firm.exporter ? '수출 거래처' : '비수출 거래처'}</dd>
          </div>
          <div>
            <dt>고객 등급</dt>
            <dd>{firm.grade}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="judge-title">
        <div className="section-head">
          <h2 id="judge-title">{ymLong(ym)} 판정</h2>
          <SignalMark status={check.status} />
        </div>
        <div style={{ marginTop: 'var(--s-4)' }}>
          <ConditionTrace check={check} animate />
        </div>
      </section>

      <section className="section" aria-labelledby="history-title">
        <div className="section-head">
          <h2 id="history-title">36개월 흐름</h2>
          <span className="unit">
            {firm.exporter ? `신호 충족 ${metMonths.length}개월` : '규칙 대상 아님'}, 파란 세로선은 기준월
          </span>
        </div>
        <SignalStrip rows={rows} currentYm={ym} exporter={firm.exporter} />
        <div className="charts" style={{ marginTop: 'var(--s-5)' }}>
          <ChartBlock
            title={`${firm.region} 수출, 1년 전 같은 달 대비`}
            unit="%"
            summary={`기준월 ${pct(regionYoY(firm.region, ym))}. 36개월 중 ${rows.filter((r) => r.regionYoy < 0).length}개월이 1년 전보다 줄었습니다.`}
          >
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={40} tickLine={false} axisLine={false} unit="%" />
              <ReferenceLine y={0} stroke={INK} />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} />
              <Tooltip content={tip((v) => `${v > 0 ? '+' : ''}${v}%`)} />
              <Line type="linear" dataKey="regionYoy" stroke={INK} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ChartBlock>

          <ChartBlock
            title="통장 잔고"
            unit="백만 원, 월말"
            summary={`${ymShort(first.ym)} ${amount(first.deposit)}에서 ${ymShort(last.ym)} ${amount(last.deposit)}로, 기준월 3개월 변화 ${pct(check.conditions[1].value)}.`}
          >
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} />
              <Tooltip content={tip(amount)} />
              <Line type="linear" dataKey="deposit" stroke={INK} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ChartBlock>

          <ChartBlock
            title="운전자금 대출 잔액"
            unit="백만 원, 월말"
            summary={`${ymShort(first.ym)} ${amount(first.loan)}에서 ${ymShort(last.ym)} ${amount(last.loan)}로, 기준월 6개월 변화 ${pct(check.conditions[2].value)}. 금액이 반올림돼 있어 몇 달씩 같은 값이 이어집니다.`}
          >
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} domain={['auto', 'auto']} />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} />
              <Tooltip content={tip(amount)} />
              <Line type="stepAfter" dataKey="loan" stroke={INK} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ChartBlock>

          {firm.exporter ? (
            <ChartBlock
              title="수출 실적"
              unit="만 달러, 월간"
              summary={`수출 실적이 없는 달이 ${rows.filter((r) => r.exportAmt === 0).length}개월 있습니다(선적이 없는 달).`}
            >
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={RULE} vertical={false} />
                <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
                <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} />
                <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} />
                <Tooltip content={tip(amount)} cursor={{ fill: '#eceff2' }} />
                <Bar dataKey="exportAmt" fill={INK} isAnimationActive={false} />
              </BarChart>
            </ChartBlock>
          ) : null}
        </div>

        <details className="raw">
          <summary>
            <CaretDown size={14} weight="bold" aria-hidden="true" /> 월별 수치 표
          </summary>
          <TableWrap>
            <table className="stat-table">
              <thead>
                <tr>
                  <th scope="col">월</th>
                  <th scope="col" className="num">지역 수출 전년비</th>
                  <th scope="col" className="num">통장 잔고</th>
                  <th scope="col" className="num">대출 잔액</th>
                  <th scope="col" className="num">수출 실적</th>
                  <th scope="col">신호</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.ym} className={r.ym === ym ? 'is-current' : undefined}>
                    <th scope="row">{ymLong(r.ym)}</th>
                    <td className="num">{pct(r.regionYoy / 100)}</td>
                    <td className="num">{amount(r.deposit)}</td>
                    <td className="num">{amount(r.loan)}</td>
                    <td className="num">{firm.exporter ? amount(r.exportAmt) : '해당 없음'}</td>
                    <td>{r.status ? <SignalMark status={r.status} /> : <span className="synthetic">판정 전</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </details>
      </section>

      <Footnotes
        notes={[SIGNAL_RULE_NOTE, WEAK_EVIDENCE_NOTE, SYNTHETIC_NOTE, '2023년 1~6월은 대출 6개월 변화를 계산할 수 없어 판정하지 않습니다.']}
        source="관세청 수출입무역통계(한국무역협회 K-stat), 가상 거래처 데이터"
      />
    </>
  )
}

/** 36칸 신호 이력: 굵은 실선 충족, 점선 일부 충족, 가는 선 미충족, 빈칸은 판정 전 */
function SignalStrip({ rows, currentYm, exporter }: { rows: Row[]; currentYm: number; exporter: boolean }) {
  if (!exporter) {
    return (
      <p className="strip-na">
        <strong>해당 없음.</strong> 수출 실적이 없는 거래처라 36개월 내내 참고 신호 규칙의 대상이 아닙니다. 아래 그래프는 계좌 흐름을 참고로
        보여 줍니다.
      </p>
    )
  }
  const seen = new Set(rows.map((r) => r.status ?? 'na'))
  const label = rows
    .filter((r) => r.status === 'met' || r.status === 'partial')
    .map((r) => `${ymShort(r.ym)} ${STATUS_LABEL[r.status as SignalStatus]}`)
    .join(', ')
  return (
    <>
      <div
        className="strip"
        role="img"
        aria-label={label ? `신호 이력: ${label}` : '신호 이력: 충족하거나 기준에 가까웠던 달이 없습니다'}
      >
        {rows.map((r) => (
          <span
            key={r.ym}
            className={`strip-cell ${r.status ?? 'pending'}${r.ym === currentYm ? ' is-current' : ''}`}
            title={`${ymLong(r.ym)} ${r.status ? STATUS_LABEL[r.status] : '판정 전'}`}
          >
            {r.ym % 100 === 1 && <span className="strip-year">{Math.floor(r.ym / 100)}년</span>}
          </span>
        ))}
      </div>
      <div className="legend strip-legend" aria-hidden="true">
        {seen.has('met') && (
          <span>
            <i className="line met" /> 충족
          </span>
        )}
        {seen.has('partial') && (
          <span>
            <i className="line partial" /> 기준 근접
          </span>
        )}
        {seen.has('none') && (
          <span>
            <i className="line" /> 미충족
          </span>
        )}
        <span>
          <i className="line na" /> 판정 전(2023년 1~6월)
        </span>
      </div>
    </>
  )
}

function ChartBlock({ title, unit, summary, children }: { title: string; unit: string; summary: string; children: ReactElement }) {
  return (
    <figure className="chart">
      <figcaption>
        {title} <span className="unit">{unit}</span>
      </figcaption>
      <div className="chart-body" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <p className="chart-summary">{summary}</p>
    </figure>
  )
}

/** 공통 툴팁: 월과 값 한 줄 */
function tip(format: (v: number) => string) {
  return function ChartTip(props: { active?: boolean; payload?: ReadonlyArray<{ value?: unknown }>; label?: unknown }) {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    const v = Number(payload[0].value)
    return (
      <div className="chart-tooltip">
        <div>{String(label)}</div>
        <strong>{format(v)}</strong>
      </div>
    )
  }
}
