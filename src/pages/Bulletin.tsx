import { useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, CaretDown } from '@phosphor-icons/react'
import { REGION_EXPORTS, type Region } from '../data/regionExports'
import { depositTrail, MONTHS, regionYoY, type Firm } from '../data/synthetic'
import { FIRST_JUDGED_INDEX, firmsByStatus, JUDGE_START_NOTE, partnerAmount, targetCount } from '../data/signals'
import { CALENDAR_NOTE } from '../data/workdays'
import { COMBOS, type ComboId } from '../data/combos'
import { amount, pct, usdMillion, ymLong, ymShort } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { ConditionTrace } from '../components/ConditionTrace'
import { YoyBars } from '../components/YoyBars'
import { TableWrap } from '../components/TableWrap'
import { Sparkline } from '../components/Sparkline'
import { RegionTag } from '../components/RegionTag'
import { ChangeFigure, CountFigure } from '../components/Figure'
import { dataNote, EXPORT_SOURCE, firmSource, Footnotes } from '../components/Footnotes'
import { FirmName } from '../components/FirmName'
import { useData } from '../lib/data'
import { Pager } from '../components/Pager'

const REGIONS: Region[] = ['대구', '경북']
const PARTIAL_PREVIEW = 6
/** 살펴볼 고객 한 쪽 크기(실제 데이터는 한 달에 수십 곳이 걸리기도 함) */
const WATCH_PAGE = 20
/** 행이 차례로 나타나도록 순번을 CSS 변수로 넘긴다 */
const rowDelay = (r: number) => ({ '--r': r }) as CSSProperties

const chg = (v: number | null | undefined) => `num chg ${(v ?? 0) < 0 ? 'down' : 'up'}`

function lastSix(region: Region, ym: number) {
  const list = REGION_EXPORTS[region]
  const end = list.findIndex((p) => p.ym === ym)
  return list.slice(Math.max(0, end - 5), end + 1)
}

/** 신호가 있었던 가까운 달(해당 없음일 때 이동 제안) */
function nearbySignalMonths(firms: Firm[], index: number, combo: ComboId) {
  const out: number[] = []
  for (let d = 1; d < MONTHS.length && out.length < 4; d++) {
    for (const i of [index - d, index + d]) {
      if (i >= 6 && i < MONTHS.length && firmsByStatus(firms, i, 'met', combo).length > 0 && out.length < 4) out.push(i)
    }
  }
  return out.sort((a, b) => a - b)
}

export function Bulletin() {
  const { index, ym, setIndex, combo } = useMonth()
  const C = COMBOS[combo]
  const [open, setOpen] = useState<string | null>(null)
  const { firms, kind } = useData()
  const met = firmsByStatus(firms, index, 'met', combo)
  // 쪽 번호는 기준월·조합과 함께 기억해, 달이나 조합이 바뀌면 첫 쪽으로
  const pageKey = `${index}|${combo}`
  const [pageState, setPageState] = useState({ key: pageKey, page: 0 })
  const page = pageState.key === pageKey ? pageState.page : 0
  const metPage = met.slice(page * WATCH_PAGE, (page + 1) * WATCH_PAGE)
  const goPage = (p: number) => {
    setPageState({ key: pageKey, page: p })
    setOpen(null)
    document.getElementById('watch-title')?.scrollIntoView({ block: 'start' })
  }
  const partial = firmsByStatus(firms, index, 'partial', combo)
  const targets = targetCount(firms, combo)
  const judged = index >= FIRST_JUDGED_INDEX
  const prev = index - 1 >= FIRST_JUDGED_INDEX ? index - 1 : null
  const metDelta = prev === null ? null : met.length - firmsByStatus(firms, prev, 'met', combo).length
  const partialDelta = prev === null ? null : partial.length - firmsByStatus(firms, prev, 'partial', combo).length
  const dg = regionYoY('대구', ym)
  const gb = regionYoY('경북', ym)

  const headline = (
    <>
      {ymLong(ym)}, 대구 수출은 1년 전보다 <ChangeFigure key={`dg${ym}`} value={dg} />고 경북은{' '}
      <ChangeFigure key={`gb${ym}`} value={gb} />
      습니다.{' '}
      {met.length > 0 ? (
        <>
          살펴볼 고객은 <CountFigure key={`n${ym}`} value={met.length} unit="곳" />
          입니다.
        </>
      ) : (
        '세 조건을 모두 충족한 고객은 없습니다.'
      )}
    </>
  )

  return (
    <>
      <section className="lead" aria-labelledby="lead-title">
        <p className="kicker">
          이달의 요지
          {prev !== null && metDelta !== null && partialDelta !== null && (
            <span className="kicker-delta">
              {ymLong(MONTHS[prev])}보다 살펴볼 고객 <Delta value={metDelta} />, 기준 근접 <Delta value={partialDelta} />
            </span>
          )}
        </p>
        <h1 id="lead-title">{headline}</h1>
        <p className="lead-note">
          ※{C.target} {targets}곳 가운데, {C.leadNote} 위험 판정이 아니라 먼저 연락해 볼 순서를 정하는 참고 자료입니다.
        </p>
      </section>

      <section aria-labelledby="region-title">
        <div className="section-head">
          <h2 id="region-title">지역 수출</h2>
          <div className="legend" aria-hidden="true">
            <span>
              <i className="swatch up" /> 1년 전보다 증가
            </span>
            <span>
              <i className="swatch down" /> 1년 전보다 감소
            </span>
            <span>단위: 백만 달러, %</span>
          </div>
        </div>
        <div className="split" style={{ marginTop: 'var(--s-4)' }}>
          <TableWrap>
            <table className="stat-table">
              <caption className="visually-hidden">대구·경북 월별 수출액과 전년동월비, 최근 6개월</caption>
              <thead>
                <tr>
                  <th scope="col">기준월</th>
                  <th scope="col" className="num">
                    <RegionTag region="대구" /> 수출액
                  </th>
                  <th scope="col" className="num">
                    전년동월비
                  </th>
                  <th scope="col" className="num">
                    <RegionTag region="경북" /> 수출액
                  </th>
                  <th scope="col" className="num">
                    전년동월비
                  </th>
                </tr>
              </thead>
              <tbody key={ym} className="rows-in">
                {lastSix('대구', ym).map((p, k) => {
                  const q = lastSix('경북', ym)[k]
                  return (
                    <tr key={p.ym} className={p.ym === ym ? 'is-current' : undefined} style={rowDelay(k)}>
                      <th scope="row">
                        {ymLong(p.ym)}
                        {p.ym === ym && <span className="badge">당월</span>}
                      </th>
                      <td className="num">{usdMillion(p.amount)}</td>
                      <td className={chg(p.yoy)}>{pct((p.yoy ?? 0) / 100)}</td>
                      <td className="num">{usdMillion(q.amount)}</td>
                      <td className={chg(q.yoy)}>{pct((q.yoy ?? 0) / 100)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
          <div className="yoy-bars">
            {REGIONS.map((r) => (
              <YoyBars key={`${r}${ym}`} region={r} points={lastSix(r, ym)} currentYm={ym} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="watch-title">
        <div className="section-head">
          <h2 id="watch-title">살펴볼 고객</h2>
          <span className="unit">
            {C.name}, 세 조건 모두 충족 {met.length}곳, {ymLong(ym)} 기준
          </span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <caption className="visually-hidden">이번 달 참고 신호 고객</caption>
            <thead>
              <tr>
                <th scope="col">고객</th>
                <th scope="col">지역</th>
                <th scope="col" className="hide-sm">
                  업종
                </th>
                <th scope="col" className="hide-sm">
                  통장 잔고 12개월
                </th>
                <th scope="col" className="num">
                  통장 잔고, 3개월
                </th>
                <th scope="col" className="num">
                  {C.short}, {C.window}개월
                </th>
                <th scope="col" className="num hide-sm">
                  {C.short} 잔액
                </th>
                <th scope="col">
                  <span className="visually-hidden">근거 펼치기</span>
                </th>
              </tr>
            </thead>
            <tbody key={`${ym}-${page}`} className="rows-in">
              {met.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    <strong>해당 없음</strong>
                    <p>
                      {judged
                        ? `이번 달은 세 조건을 모두 충족한 고객이 없습니다. 지역 수출이 늘었거나, ${C.target}의 계좌에서 잔고 감소와 ${C.condition}가 함께 나타나지 않았다는 뜻입니다.`
                        : JUDGE_START_NOTE}
                    </p>
                    <div className="chip-row">
                      {nearbySignalMonths(firms, index, combo).map((i) => (
                        <button key={i} type="button" className="text-button" onClick={() => setIndex(i)}>
                          {ymLong(MONTHS[i])} 보기
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {metPage.map(({ firm, check }, r) => {
                const isOpen = open === firm.id
                const [, dep, partner] = check.conditions
                return (
                  <FirmRow
                    key={firm.id}
                    firm={firm}
                    order={r}
                    cells={[
                      { text: <RegionTag region={firm.region} /> },
                      { text: firm.industry, hideSm: true },
                      { text: <Sparkline values={depositTrail(firm, index)} />, className: 'spark-cell', hideSm: true },
                      { text: pct(dep.value), num: true, className: 'chg down' },
                      { text: partner.valueText ?? pct(partner.value), num: true },
                      { text: amount(partnerAmount(firm.series[index], combo)), num: true, hideSm: true },
                    ]}
                    open={isOpen}
                    onToggle={() => setOpen(isOpen ? null : firm.id)}
                    detail={<ConditionTrace check={check} animate />}
                  />
                )
              })}
            </tbody>
          </table>
        </TableWrap>
        <Pager page={page} pageSize={WATCH_PAGE} total={met.length} onChange={goPage} />
      </section>

      <section className="section" aria-labelledby="partial-title">
        <div className="section-head">
          <h2 id="partial-title">기준에 가까운 고객</h2>
          <span className="unit">{partial.length}곳, 통장 잔고가 5~10% 줄어 다음 달 함께 볼 곳</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">고객</th>
                <th scope="col">지역</th>
                <th scope="col">업종</th>
                <th scope="col" className="hide-sm">
                  통장 잔고 12개월
                </th>
                <th scope="col" className="num">
                  통장 잔고, 3개월
                </th>
                <th scope="col" className="num">
                  {C.short}, {C.window}개월
                </th>
              </tr>
            </thead>
            <tbody key={ym} className="rows-in">
              {partial.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    <strong>해당 없음</strong>
                    <p>
                      {!judged
                        ? JUDGE_START_NOTE
                        : dg >= 0 && gb >= 0
                          ? '이번 달은 대구·경북 수출이 모두 1년 전보다 늘어, 규칙의 첫 조건(지역 수출 감소)에 해당하는 고객이 없습니다.'
                          : `이번 달은 통장 잔고가 5~10% 줄어 기준에 가까운 ${C.target}가 없습니다.`}
                    </p>
                  </td>
                </tr>
              )}
              {partial.slice(0, PARTIAL_PREVIEW).map(({ firm, check }, r) => (
                <tr key={firm.id} style={rowDelay(r)}>
                  <td className="firm-name">
                    <FirmName firm={firm} />
                  </td>
                  <td>
                    <RegionTag region={firm.region} />
                  </td>
                  <td>{firm.industry}</td>
                  <td className="spark-cell hide-sm">
                    <Sparkline values={depositTrail(firm, index)} />
                  </td>
                  <td className="num chg down">{pct(check.conditions[1].value)}</td>
                  <td className="num">{check.conditions[2].valueText ?? pct(check.conditions[2].value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        {partial.length > PARTIAL_PREVIEW && (
          <p className="detail-actions">
            <MonthLink to="/firms">
              고객 목록에서 {partial.length}곳 모두 보기 <ArrowRight size={14} weight="bold" />
            </MonthLink>
          </p>
        )}
      </section>

      <Footnotes
        notes={[
          C.ruleNote,
          C.basisNote,
          CALENDAR_NOTE,
          dataNote(kind),
          `지역 수출은 ${ymShort(ym)} 월간 통관 기준이며, 은행 계좌는 월말 잔액 기준입니다.`,
        ]}
        source={`${EXPORT_SOURCE}, ${firmSource(kind)}`}
      />
    </>
  )
}

/** 지난달 대비 곳 수 변화: +2곳 / −1곳 / 변화 없음 */
function Delta({ value }: { value: number }) {
  if (value === 0) return <strong className="delta">변화 없음</strong>
  return (
    <strong className={`delta ${value > 0 ? 'more' : 'less'}`}>
      {value > 0 ? '+' : '\u2212'}
      {Math.abs(value)}곳
    </strong>
  )
}

function FirmRow({
  firm,
  order,
  cells,
  open,
  onToggle,
  detail,
}: {
  firm: Firm
  order: number
  cells: { text: ReactNode; num?: boolean; hideSm?: boolean; className?: string }[]
  open: boolean
  onToggle: () => void
  detail: ReactNode
}) {
  const id = firm.id
  const detailId = `detail-${id}`
  return (
    <>
      <tr style={rowDelay(order)}>
        <td className="firm-name">
          <FirmName firm={firm} />
        </td>
        {cells.map((c, i) => (
          <td key={i} className={[c.num && 'num', c.className, c.hideSm && 'hide-sm'].filter(Boolean).join(' ') || undefined}>
            {c.text}
          </td>
        ))}
        <td className="num">
          <button type="button" className="expand-button" aria-expanded={open} aria-controls={detailId} onClick={onToggle}>
            근거 <CaretDown size={12} weight="bold" />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="detail-row" id={detailId}>
          <td colSpan={8}>
            {detail}
            <p className="detail-actions">
              <MonthLink to={`/firms/${id}`}>
                고객 계좌 흐름 보기 <ArrowRight size={14} weight="bold" />
              </MonthLink>
            </p>
          </td>
        </tr>
      )}
    </>
  )
}
