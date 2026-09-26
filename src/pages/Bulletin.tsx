import { useState, type ReactNode } from 'react'
import { ArrowRight, CaretDown } from '@phosphor-icons/react'
import { REGION_EXPORTS, type Region } from '../data/regionExports'
import { FIRMS, MONTHS, regionYoY } from '../data/synthetic'
import { firmsByStatus } from '../data/signals'
import { amount, moved, pct, usdMillion, ymLong, ymShort } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { ConditionTrace } from '../components/ConditionTrace'
import { YoyBars } from '../components/YoyBars'
import { SignalMark } from '../components/SignalMark'
import { EXPORT_SOURCE, Footnotes, SIGNAL_RULE_NOTE, SYNTHETIC_NOTE, WEAK_EVIDENCE_NOTE } from '../components/Footnotes'

const REGIONS: Region[] = ['대구', '경북']
const PARTIAL_PREVIEW = 6

function lastSix(region: Region, ym: number) {
  const list = REGION_EXPORTS[region]
  const end = list.findIndex((p) => p.ym === ym)
  return list.slice(Math.max(0, end - 5), end + 1)
}

/** 신호가 있었던 가까운 달(해당 없음일 때 이동 제안) */
function nearbySignalMonths(index: number) {
  const out: number[] = []
  for (let d = 1; d < MONTHS.length && out.length < 4; d++) {
    for (const i of [index - d, index + d]) {
      if (i >= 6 && i < MONTHS.length && firmsByStatus(FIRMS, i, 'met').length > 0 && out.length < 4) out.push(i)
    }
  }
  return out.sort((a, b) => a - b)
}

export function Bulletin() {
  const { index, ym, setIndex } = useMonth()
  const [open, setOpen] = useState<string | null>(null)
  const met = firmsByStatus(FIRMS, index, 'met')
  const partial = firmsByStatus(FIRMS, index, 'partial')
  const exporters = FIRMS.filter((f) => f.exporter).length
  const dg = regionYoY('대구', ym)
  const gb = regionYoY('경북', ym)

  const headline =
    `${ymLong(ym)}, 대구 수출은 1년 전보다 ${moved(dg)}고 경북은 ${moved(gb)}습니다. ` +
    (met.length > 0 ? `살펴볼 거래처는 ${met.length}곳입니다.` : '세 조건을 모두 충족한 거래처는 없습니다.')

  return (
    <>
      <section className="lead" aria-labelledby="lead-title">
        <h1 id="lead-title">{headline}</h1>
        <p>
          수출 거래처 {exporters}곳 가운데, 지역 수출이 줄어든 달에 통장 잔고는 빠지는데 대출은 줄이지 않은 곳을 모았습니다.
          위험 판정이 아니라 먼저 연락해 볼 순서를 정하는 참고 자료입니다.
        </p>
      </section>

      <section aria-labelledby="region-title">
        <div className="section-head">
          <h2 id="region-title">지역 수출</h2>
          <span className="unit">단위: 백만 달러, %</span>
        </div>
        <div className="split" style={{ marginTop: 'var(--s-4)' }}>
          <div className="table-wrap">
            <table className="stat-table">
              <caption className="visually-hidden">대구·경북 월별 수출액과 전년동월비, 최근 6개월</caption>
              <thead>
                <tr>
                  <th scope="col">기준월</th>
                  <th scope="col" className="num">대구 수출액</th>
                  <th scope="col" className="num">전년동월비</th>
                  <th scope="col" className="num">경북 수출액</th>
                  <th scope="col" className="num">전년동월비</th>
                </tr>
              </thead>
              <tbody>
                {lastSix('대구', ym).map((p, k) => {
                  const q = lastSix('경북', ym)[k]
                  return (
                    <tr key={p.ym} className={p.ym === ym ? 'is-current' : undefined}>
                      <th scope="row">{ymLong(p.ym)}</th>
                      <td className="num">{usdMillion(p.amount)}</td>
                      <td className="num">{pct((p.yoy ?? 0) / 100)}</td>
                      <td className="num">{usdMillion(q.amount)}</td>
                      <td className="num">{pct((q.yoy ?? 0) / 100)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="yoy-bars">
            {REGIONS.map((r) => (
              <YoyBars key={r} region={r} points={lastSix(r, ym)} currentYm={ym} />
            ))}
            <div className="legend" aria-hidden="true">
              <span>
                <i className="swatch fill" /> 1년 전보다 증가
              </span>
              <span>
                <i className="swatch outline" /> 1년 전보다 감소
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="watch-title">
        <div className="section-head">
          <h2 id="watch-title">살펴볼 거래처</h2>
          <span className="unit">세 조건 모두 충족, {ymLong(ym)} 기준</span>
        </div>
        <div className="table-wrap">
          <table className="stat-table">
            <caption className="visually-hidden">이번 달 참고 신호 거래처</caption>
            <thead>
              <tr>
                <th scope="col">거래처</th>
                <th scope="col">지역</th>
                <th scope="col">업종</th>
                <th scope="col" className="num">통장 잔고, 3개월</th>
                <th scope="col" className="num">대출, 6개월</th>
                <th scope="col" className="num">대출 잔액</th>
                <th scope="col">
                  <span className="visually-hidden">근거 펼치기</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {met.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    <strong>해당 없음</strong>
                    <p>
                      이번 달은 세 조건을 모두 충족한 거래처가 없습니다. 지역 수출이 늘었거나, 수출 거래처의 계좌에서 잔고 감소와
                      대출 유지가 함께 나타나지 않았다는 뜻입니다.
                    </p>
                    <div className="chip-row">
                      {nearbySignalMonths(index).map((i) => (
                        <button key={i} type="button" className="text-button" onClick={() => setIndex(i)}>
                          {ymLong(MONTHS[i])} 보기
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {met.map(({ firm, check }) => {
                const isOpen = open === firm.id
                const [, dep, loan] = check.conditions
                return (
                  <FirmRow
                    key={firm.id}
                    id={firm.id}
                    name={firm.name}
                    cells={[firm.region, firm.industry]}
                    nums={[pct(dep.value), pct(loan.value), amount(firm.series[index].loan)]}
                    open={isOpen}
                    onToggle={() => setOpen(isOpen ? null : firm.id)}
                    detail={<ConditionTrace check={check} animate />}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {partial.length > 0 && (
        <section className="section" aria-labelledby="partial-title">
          <div className="section-head">
            <h2 id="partial-title">기준에 가까운 거래처</h2>
            <span className="unit">{partial.length}곳, 통장 잔고가 5~10% 줄어 다음 달 함께 볼 곳</span>
          </div>
          <div className="table-wrap">
            <table className="stat-table">
              <thead>
                <tr>
                  <th scope="col">거래처</th>
                  <th scope="col">상태</th>
                  <th scope="col">지역</th>
                  <th scope="col" className="num">통장 잔고, 3개월</th>
                  <th scope="col" className="num">대출, 6개월</th>
                </tr>
              </thead>
              <tbody>
                {partial.slice(0, PARTIAL_PREVIEW).map(({ firm, check }) => (
                  <tr key={firm.id}>
                    <td className="firm-name">
                      <MonthLink to={`/firms/${firm.id}`}>{firm.name.replace('(가상)', '')}</MonthLink>{' '}
                      <span className="synthetic">(가상)</span>
                    </td>
                    <td>
                      <SignalMark status="partial" />
                    </td>
                    <td>{firm.region}</td>
                    <td className="num">{pct(check.conditions[1].value)}</td>
                    <td className="num">{pct(check.conditions[2].value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {partial.length > PARTIAL_PREVIEW && (
            <p className="detail-actions">
              <MonthLink to="/firms">
                거래처 목록에서 {partial.length}곳 모두 보기 <ArrowRight size={14} weight="bold" />
              </MonthLink>
            </p>
          )}
        </section>
      )}

      <Footnotes
        notes={[SIGNAL_RULE_NOTE, WEAK_EVIDENCE_NOTE, SYNTHETIC_NOTE, `지역 수출은 ${ymShort(ym)} 월간 통관 기준이며, 은행 계좌는 월말 잔액 기준입니다.`]}
        source={EXPORT_SOURCE}
      />
    </>
  )
}

function FirmRow({
  id,
  name,
  cells,
  nums,
  open,
  onToggle,
  detail,
}: {
  id: string
  name: string
  cells: string[]
  nums: string[]
  open: boolean
  onToggle: () => void
  detail: ReactNode
}) {
  const detailId = `detail-${id}`
  return (
    <>
      <tr>
        <td className="firm-name">
          <MonthLink to={`/firms/${id}`}>{name.replace('(가상)', '')}</MonthLink> <span className="synthetic">(가상)</span>
        </td>
        {cells.map((c) => (
          <td key={c}>{c}</td>
        ))}
        {nums.map((n, i) => (
          <td key={i} className="num">
            {n}
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
          <td colSpan={7}>
            {detail}
            <p className="detail-actions">
              <MonthLink to={`/firms/${id}`}>
                거래처 계좌 흐름 보기 <ArrowRight size={14} weight="bold" />
              </MonthLink>
            </p>
          </td>
        </tr>
      )}
    </>
  )
}
