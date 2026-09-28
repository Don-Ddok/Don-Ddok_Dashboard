import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, CaretDown } from '@phosphor-icons/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { regionYoY } from '../data/synthetic'
import { useData } from '../lib/data'
import { FirmName } from '../components/FirmName'
import { checkSignal, FIRST_JUDGED_INDEX, JUDGE_START_NOTE, type SignalStatus } from '../data/signals'
import { CALENDAR_NOTE } from '../data/workdays'
import { COMBOS } from '../data/combos'
import { amount, pct, ymLong, ymShort } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { ConditionTrace } from '../components/ConditionTrace'
import { SignalMark, STATUS_LABEL } from '../components/SignalMark'
import { TableWrap } from '../components/TableWrap'
import { ChartBlock } from '../components/ChartBlock'
import { RegionTag } from '../components/RegionTag'
import { prefersReducedMotion } from '../lib/motion'
import { dataNote, EXPORT_SOURCE, firmSource, Footnotes } from '../components/Footnotes'

const INK = '#1b1e23'
const INK_3 = '#5f6570'
const RULE = '#d5dae1'
const ACCENT = '#007d6c'
const SHADE = '#e6f0ee'
/** 지역 색(tokens.css의 --region-dg, --region-gb와 같은 값) */
const REGION_COLOR = { 대구: '#2f5fb3', 경북: '#7b4f93' } as const
const TICK = { fontSize: 11, fill: INK_3 }

interface Row {
  x: string
  ym: number
  regionYoy: number
  observed: boolean
  deposit: number | null
  loan: number | null
  bill: number | null
  exportAmt: number | null
  status: SignalStatus | null
}

export default function FirmDetail() {
  const { id } = useParams()
  const { index, ym, combo } = useMonth()
  const C = COMBOS[combo]
  const { firms, kind, exportUnit } = useData()
  const firm = firms.find((f) => f.id === id)

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

  const check = checkSignal(firm, index, combo)
  const partner = check.conditions[2]
  const isTarget = firm.exporter && (combo !== 'bill' || firm.billUser)
  const rows: Row[] = firm.series.map((p, i) => ({
    x: ymShort(p.ym),
    ym: p.ym,
    observed: p.observed,
    regionYoy: Math.round(regionYoY(firm.region, p.ym) * 1000) / 10,
    deposit: p.deposit,
    loan: p.loan,
    bill: p.bill,
    exportAmt: p.exportAmt,
    status: i >= FIRST_JUDGED_INDEX ? checkSignal(firm, i, combo).status : null,
  }))
  const metMonths = rows.filter((r) => r.status === 'met')
  const currentX = ymShort(ym)
  // 실제 데이터는 앞뒤로 거래 기록이 없는 달이 있을 수 있어, 처음·마지막으로 기록이 있는 달을 쓴다
  const seen = rows.filter((r) => r.observed)
  const first = seen[0] ?? rows[0]
  const last = seen[seen.length - 1] ?? rows[rows.length - 1]
  const regionColor = REGION_COLOR[firm.region]
  const animate = !prefersReducedMotion()
  const now = rows[index]
  const regionNow = regionYoY(firm.region, ym)
  const sameIndustry = firms.filter((f) => f.industry === firm.industry).length
  const exportMonths = rows.filter((r) => (r.exportAmt ?? 0) > 0).length
  const refLabel = { value: currentX, position: 'top' as const, fill: ACCENT, fontSize: 11, fontWeight: 700 }

  return (
    <>
      <MonthLink to="/firms" className="back-link">
        <ArrowLeft size={14} weight="bold" /> 거래처 목록
      </MonthLink>

      <section className="lead lead-wide" aria-labelledby="firm-title">
        <h1 id="firm-title">
          <FirmName firm={firm} link={false} />
        </h1>
        {!firm.synthetic && (
          <p className="lead-note">
            ※ 실제 법인 데이터(내부 시연). 36개월 중 은행 거래 기록이 있는 달은 {seen.length}개월입니다.
          </p>
        )}
        <dl className="facts">
          <Fact label="지역" note={`지역 수출 ${currentX} ${pct(regionNow)}`}>
            <RegionTag region={firm.region} />
          </Fact>
          <Fact label="업종" note={`같은 업종 ${firm.synthetic ? '가상 거래처' : '외환 거래 법인'} ${sameIndustry}곳`}>
            {firm.industry}
          </Fact>
          <Fact
            label="수출 여부"
            note={firm.exporter ? `36개월 중 수출 실적 있는 달 ${exportMonths}개월` : '36개월 수출 실적 없음'}
          >
            {firm.exporter ? '수출 거래처' : firm.synthetic ? '비수출 거래처' : '비수출(수입만)'}
          </Fact>
          <Fact
            label="할인어음"
            note={
              firm.billUser ? `36개월 중 잔액 있는 달 ${rows.filter((r) => (r.bill ?? 0) > 0).length}개월` : '36개월 잔액 없음'
            }
          >
            {firm.billUser ? '거래 있음' : '거래 없음'}
          </Fact>
          <Fact label="고객 등급" note={firm.synthetic ? '은행 내부 등급(가상)' : `은행 내부 등급, ${ymShort(last.ym)} 기준`}>
            {firm.grade}
          </Fact>
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
            {C.name}, {isTarget ? `신호 충족 ${metMonths.length}개월` : '규칙 대상 아님'}, 민트 칸·세로선은 기준월
          </span>
        </div>
        <SignalStrip rows={rows} currentYm={ym} naReason={isTarget ? undefined : check.naReason} />
        <div className="charts" style={{ marginTop: 'var(--s-5)' }}>
          <ChartBlock
            title={`${firm.region} 수출, 1년 전 같은 달 대비`}
            unit="%"
            value={<span className={regionNow < 0 ? 'down' : 'up'}>{pct(regionNow)}</span>}
            valueLabel={currentX}
            summary={`기준월 ${pct(regionYoY(firm.region, ym))}. 36개월 중 ${rows.filter((r) => r.regionYoy < 0).length}개월이 1년 전보다 줄었습니다.`}
          >
            <LineChart data={rows} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={40} tickLine={false} axisLine={false} unit="%" />
              <ReferenceLine y={0} stroke={INK} />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} label={refLabel} />
              <Tooltip content={tip((v) => `${v > 0 ? '+' : ''}${v}%`)} />
              <Line
                type="linear"
                dataKey="regionYoy"
                stroke={regionColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={animate}
                animationDuration={900}
              />
            </LineChart>
          </ChartBlock>

          <ChartBlock
            title="통장 잔고"
            unit="백만 원, 월말"
            value={
              <>
                {amount(now.deposit)}{' '}
                <span className={(check.conditions[1].value ?? 0) < 0 ? 'down' : 'up'}>
                  ({pct(check.conditions[1].value)}, 3개월)
                </span>
              </>
            }
            valueLabel={currentX}
            summary={`${ymShort(first.ym)} ${amount(first.deposit)}에서 ${ymShort(last.ym)} ${amount(last.deposit)}로, 기준월 3개월 변화 ${pct(check.conditions[1].value)}.`}
          >
            <AreaChart data={rows} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} />
              <Tooltip content={tip(amount)} />
              <Area
                type="linear"
                dataKey="deposit"
                stroke={INK}
                strokeWidth={1.5}
                fill={SHADE}
                fillOpacity={1}
                dot={false}
                isAnimationActive={animate}
                animationDuration={900}
              />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} label={refLabel} />
            </AreaChart>
          </ChartBlock>

          <ChartBlock
            title={combo === 'bill' ? '할인어음 잔액' : '운전자금 대출 잔액'}
            unit="백만 원, 월말"
            value={
              <>
                {amount(combo === 'bill' ? now.bill : now.loan)}{' '}
                <span className="plain">
                  ({partner.valueText ?? pct(partner.value)}, {C.window}개월)
                </span>
              </>
            }
            valueLabel={currentX}
            summary={
              combo === 'bill'
                ? `${ymShort(first.ym)} ${amount(first.bill)}에서 ${ymShort(last.ym)} ${amount(last.bill)}로, 기준월 3개월 변화 ${partner.valueText ?? pct(partner.value)}. 받은 어음을 할인하면 늘고 만기가 되면 줄어 들쭉날쭉합니다.`
                : `${ymShort(first.ym)} ${amount(first.loan)}에서 ${ymShort(last.ym)} ${amount(last.loan)}로, 기준월 6개월 변화 ${pct(partner.value)}. 금액이 반올림돼 있어 몇 달씩 같은 값이 이어집니다.`
            }
          >
            <LineChart data={rows} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
              <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} domain={['auto', 'auto']} />
              <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} label={refLabel} />
              <Tooltip content={tip(amount)} />
              <Line
                type="stepAfter"
                dataKey={combo === 'bill' ? 'bill' : 'loan'}
                stroke={INK}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={animate}
                animationDuration={900}
              />
            </LineChart>
          </ChartBlock>

          {firm.exporter ? (
            <ChartBlock
              title="수출 실적"
              unit={`${exportUnit}, 월간`}
              value={amount(now.exportAmt)}
              valueLabel={currentX}
              summary={`수출 실적이 없는 달이 ${rows.filter((r) => r.exportAmt === 0).length}개월 있습니다(선적이 없는 달).${
                seen.length < rows.length ? ` 은행 거래 기록이 없는 달 ${rows.length - seen.length}개월은 비워 두었습니다.` : ''
              }`}
            >
              <BarChart data={rows} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={RULE} vertical={false} />
                <XAxis dataKey="x" tick={TICK} interval={5} tickLine={false} axisLine={{ stroke: RULE }} />
                <YAxis tick={TICK} width={56} tickLine={false} axisLine={false} tickFormatter={amount} />
                <ReferenceLine x={currentX} stroke={ACCENT} strokeWidth={2} label={refLabel} />
                <Tooltip content={tip(amount)} cursor={{ fill: SHADE }} />
                <Bar dataKey="exportAmt" fill={regionColor} isAnimationActive={animate} animationDuration={700} />
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
                  <th scope="col" className="num">
                    지역 수출 전년비
                  </th>
                  <th scope="col" className="num">
                    통장 잔고
                  </th>
                  <th scope="col" className="num">
                    대출 잔액
                  </th>
                  <th scope="col" className="num">
                    할인어음 잔액
                  </th>
                  <th scope="col" className="num">
                    수출 실적
                  </th>
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
                    <td className="num">{amount(r.bill)}</td>
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
        notes={[C.ruleNote, C.basisNote, CALENDAR_NOTE, dataNote(kind), JUDGE_START_NOTE]}
        source={`${EXPORT_SOURCE}, ${firmSource(kind)}`}
      />
    </>
  )
}

/** 36칸 신호 이력: 굵은 실선 충족, 점선 일부 충족, 가는 선 미충족, 빈칸은 판정 전 */
function SignalStrip({ rows, currentYm, naReason }: { rows: Row[]; currentYm: number; naReason?: string }) {
  if (naReason) {
    return (
      <p className="strip-na">
        <strong>해당 없음.</strong> {naReason} 아래 그래프는 계좌 흐름을 참고로 보여 줍니다.
      </p>
    )
  }
  const seen = new Set(rows.map((r) => r.status ?? 'na'))
  const label = rows
    .filter((r) => r.status === 'met' || r.status === 'partial')
    .map((r) => `${ymShort(r.ym)} ${STATUS_LABEL[r.status as SignalStatus]}`)
    .join(', ')
  const years = [...new Set(rows.map((r) => Math.floor(r.ym / 100)))]
  return (
    <>
      <div
        className="strip"
        role="img"
        aria-label={label ? `신호 이력: ${label}` : '신호 이력: 충족하거나 기준에 가까웠던 달이 없습니다'}
      >
        {years.map((y) => {
          const yearRows = rows.filter((r) => Math.floor(r.ym / 100) === y)
          const met = yearRows.filter((r) => r.status === 'met').length
          return (
            <div className="strip-year-row" key={y}>
              <span className="strip-year">{y}년</span>
              <div className="strip-cells">
                {yearRows.map((r) => (
                  <span
                    key={r.ym}
                    className={`strip-cell ${r.status ?? 'pending'}${r.ym === currentYm ? ' is-current' : ''}`}
                    title={`${ymLong(r.ym)} ${r.status ? STATUS_LABEL[r.status] : '판정 전'}`}
                  >
                    {r.ym % 100}
                  </span>
                ))}
              </div>
              <span className={`strip-count${met > 0 ? ' has' : ''}`}>충족 {met}회</span>
            </div>
          )
        })}
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

function Fact({ label, note, children }: { label: string; note: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
      <dd className="fact-note">{note}</dd>
    </div>
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
