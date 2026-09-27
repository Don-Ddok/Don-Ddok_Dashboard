import { useMemo, useState, type CSSProperties } from 'react'
import { depositTrail, FIRMS, type Industry } from '../data/synthetic'
import type { Region } from '../data/regionExports'
import { checkSignal, partnerAmount, type SignalStatus } from '../data/signals'
import { COMBOS } from '../data/combos'
import { amount, ymLong } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { SignalMark } from '../components/SignalMark'
import { TableWrap } from '../components/TableWrap'
import { RegionTag } from '../components/RegionTag'
import { Sparkline } from '../components/Sparkline'
import { Footnotes, SYNTHETIC_NOTE } from '../components/Footnotes'

const STATUS_ORDER: Record<SignalStatus, number> = { met: 0, partial: 1, none: 2, na: 3 }
const STATUSES = Object.keys(STATUS_ORDER) as SignalStatus[]
/** 행이 차례로 나타나되, 긴 목록에서 기다리지 않도록 12번째 행부터는 한꺼번에 */
const rowDelay = (r: number) => ({ '--r': Math.min(r, 12) }) as CSSProperties
const INDUSTRIES = [...new Set(FIRMS.map((f) => f.industry))].sort() as Industry[]

type RegionFilter = '전체' | Region
type ExportFilter = '전체' | '수출' | '비수출'
type StatusFilter = '전체' | SignalStatus

export function Firms() {
  const { index, ym, combo } = useMonth()
  const C = COMBOS[combo]
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<RegionFilter>('전체')
  const [industry, setIndustry] = useState<'전체' | Industry>('전체')
  const [exporter, setExporter] = useState<ExportFilter>('전체')
  const [status, setStatus] = useState<StatusFilter>('전체')

  const base = useMemo(() => {
    const q = query.trim()
    return FIRMS.map((firm) => ({ firm, check: checkSignal(firm, index, combo) }))
      .filter(({ firm }) => {
        if (q && !firm.name.includes(q)) return false
        if (region !== '전체' && firm.region !== region) return false
        if (industry !== '전체' && firm.industry !== industry) return false
        if (exporter === '수출' && !firm.exporter) return false
        if (exporter === '비수출' && firm.exporter) return false
        return true
      })
      .sort((a, b) => STATUS_ORDER[a.check.status] - STATUS_ORDER[b.check.status] || a.firm.name.localeCompare(b.firm.name, 'ko'))
  }, [index, combo, query, region, industry, exporter])
  const rows = status === '전체' ? base : base.filter((r) => r.check.status === status)
  const counts = STATUSES.map((s) => ({ s, n: base.filter((r) => r.check.status === s).length }))

  const filtered = query !== '' || region !== '전체' || industry !== '전체' || exporter !== '전체' || status !== '전체'
  const reset = () => {
    setQuery('')
    setRegion('전체')
    setIndustry('전체')
    setExporter('전체')
    setStatus('전체')
  }

  return (
    <>
      <section className="lead" aria-labelledby="firms-title">
        <h1 id="firms-title">거래처 {FIRMS.length}곳의 {ymLong(ym)} 상태</h1>
        <p>
          {C.name} 조합의 신호를 충족한 거래처가 위에 오도록 정렬했습니다. 규칙 대상({C.target})이 아닌 거래처는 &lsquo;해당
          없음&rsquo;으로 표시합니다.
        </p>
      </section>

      <div className="status-bar" role="group" aria-label="이번 달 신호로 걸러 보기">
        <button type="button" aria-pressed={status === '전체'} onClick={() => setStatus('전체')}>
          <span className="status-name">전체</span>
          <span className="status-count">{base.length}</span>
        </button>
        {counts.map(({ s, n }) => (
          <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(status === s ? '전체' : s)}>
            <span className="status-name">
              <SignalMark status={s} />
            </span>
            <span className="status-count">{n}</span>
          </button>
        ))}
      </div>

      <div className="filters" role="search" aria-label="거래처 걸러 보기">
        <div className="field">
          <label htmlFor="q">거래처 이름</label>
          <input id="q" type="search" placeholder="예: 가람전자" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Segmented label="지역" value={region} options={['전체', '대구', '경북']} onChange={setRegion} />
        <div className="field">
          <label htmlFor="industry">업종</label>
          <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value as '전체' | Industry)}>
            <option value="전체">전체</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <Segmented label="수출 여부" value={exporter} options={['전체', '수출', '비수출']} onChange={setExporter} />
      </div>

      <div className="result-line" aria-live="polite">
        <span>
          {rows.length}곳 표시 {filtered && `(전체 ${FIRMS.length}곳 중)`}
        </span>
        {filtered && (
          <button type="button" className="text-button" onClick={reset}>
            조건 모두 지우기
          </button>
        )}
      </div>

      <TableWrap>
        <table className="stat-table">
          <caption className="visually-hidden">거래처 목록, {ymLong(ym)} 기준</caption>
          <thead>
            <tr>
              <th scope="col">거래처</th>
              <th scope="col">지역</th>
              <th scope="col">업종</th>
              <th scope="col">수출</th>
              <th scope="col">등급</th>
              <th scope="col" className="hide-sm">통장 잔고 12개월</th>
              <th scope="col" className="num">
                통장 잔고
                <span className="sub">백만 원</span>
              </th>
              <th scope="col" className="num">
                {combo === 'bill' ? '할인어음' : '운전자금 대출'}
                <span className="sub">백만 원</span>
              </th>
              <th scope="col">이번 달 신호</th>
            </tr>
          </thead>
          <tbody key={`${index}-${status}-${combo}`} className="rows-in">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-cell">
                  <strong>조건에 맞는 거래처가 없습니다</strong>
                  <p>걸러 보기 조건을 하나씩 풀어 보세요. 신호 상태는 기준월에 따라 달라집니다.</p>
                  <div className="chip-row">
                    <button type="button" className="text-button" onClick={reset}>
                      조건 모두 지우기
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {rows.map(({ firm, check }, r) => (
              <tr key={firm.id} style={rowDelay(r)}>
                <td className="firm-name">
                  <MonthLink to={`/firms/${firm.id}`}>{firm.name.replace('(가상)', '')}</MonthLink>{' '}
                  <span className="synthetic">(가상)</span>
                </td>
                <td>
                  <RegionTag region={firm.region} />
                </td>
                <td>{firm.industry}</td>
                <td>{firm.exporter ? '수출' : '비수출'}</td>
                <td>{firm.grade}</td>
                <td className="spark-cell hide-sm">
                  <Sparkline values={depositTrail(firm, index)} />
                </td>
                <td className="num">{amount(firm.series[index].deposit)}</td>
                <td className="num">{amount(partnerAmount(firm.series[index], combo))}</td>
                <td>
                  <SignalMark status={check.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      <Footnotes
        notes={[
          C.ruleNote,
          '신호 표시: 굵은 실선은 세 조건 모두 충족, 점선은 기준 근접(통장 잔고가 5~10% 감소), 가는 선은 미충족입니다.',
          SYNTHETIC_NOTE,
        ]}
        source="가상 거래처 데이터(유효숫자 두세 자리로 반올림)"
      />
    </>
  )
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (v: T) => void
}) {
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="field-label">{label}</span>
      <div className="segmented">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
