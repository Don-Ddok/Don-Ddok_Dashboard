import { useMemo, useState, type CSSProperties } from 'react'
import { depositTrail } from '../data/synthetic'
import type { Region } from '../data/regionExports'
import { checkSignal, partnerAmount, type SignalStatus } from '../data/signals'
import { CALENDAR_NOTE } from '../data/workdays'
import { COMBOS } from '../data/combos'
import { amount, ymLong } from '../lib/format'
import { useMonth } from '../lib/month'
import { SignalMark } from '../components/SignalMark'
import { TableWrap } from '../components/TableWrap'
import { RegionTag } from '../components/RegionTag'
import { Sparkline } from '../components/Sparkline'
import { dataNote, firmSource, Footnotes } from '../components/Footnotes'
import { FirmName } from '../components/FirmName'
import { useData } from '../lib/data'
import { Pager } from '../components/Pager'

/** 한 쪽에 보여 줄 거래처 수(실제 데이터는 한 달에 수백 곳) */
const PAGE_SIZE = 50

const STATUS_ORDER: Record<SignalStatus, number> = { met: 0, partial: 1, none: 2, na: 3 }
const STATUSES = Object.keys(STATUS_ORDER) as SignalStatus[]
/** 행이 차례로 나타나되, 긴 목록에서 기다리지 않도록 12번째 행부터는 한꺼번에 */
const rowDelay = (r: number) => ({ '--r': Math.min(r, 12) }) as CSSProperties

type RegionFilter = '전체' | Region
type ExportFilter = '전체' | '수출' | '비수출'
type StatusFilter = '전체' | SignalStatus

export function Firms() {
  const { index, ym, combo } = useMonth()
  const C = COMBOS[combo]
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<RegionFilter>('전체')
  const { firms, kind, scope } = useData()
  const industries = useMemo(() => [...new Set(firms.map((f) => f.industry))].sort((a, b) => a.localeCompare(b, 'ko')), [firms])
  const [industry, setIndustry] = useState<string>('전체')
  const [exporter, setExporter] = useState<ExportFilter>('전체')
  const [status, setStatus] = useState<StatusFilter>('전체')

  const base = useMemo(() => {
    const q = query.trim()
    return firms
      .map((firm) => ({ firm, check: checkSignal(firm, index, combo) }))
      .filter(({ firm }) => {
        // 실제 데이터는 그 달에 은행 거래 기록이 있는 법인만(가상 거래처는 36개월 모두 있음)
        if (!firm.series[index].observed) return false
        if (q && !firm.name.includes(q)) return false
        if (region !== '전체' && firm.region !== region) return false
        if (industry !== '전체' && firm.industry !== industry) return false
        if (exporter === '수출' && !firm.exporter) return false
        if (exporter === '비수출' && firm.exporter) return false
        return true
      })
      .sort((a, b) => STATUS_ORDER[a.check.status] - STATUS_ORDER[b.check.status] || a.firm.name.localeCompare(b.firm.name, 'ko'))
  }, [firms, index, combo, query, region, industry, exporter])
  const rows = status === '전체' ? base : base.filter((r) => r.check.status === status)
  const observedCount = useMemo(() => firms.filter((f) => f.series[index].observed).length, [firms, index])

  // 쪽 번호는 걸러 보기 조건과 함께 기억해, 조건·기준월·조합이 바뀌면 첫 쪽으로 돌아간다
  const filterKey = [index, combo, query, region, industry, exporter, status].join('|')
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 })
  const page = pageState.key === filterKey ? Math.min(pageState.page, Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1)) : 0
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const goPage = (p: number) => {
    setPageState({ key: filterKey, page: p })
    document.getElementById('firms-result')?.scrollIntoView({ block: 'start' })
  }
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
        <h1 id="firms-title">
          {kind === 'real' ? `실제 법인 ${observedCount.toLocaleString('ko-KR')}곳` : `거래처 ${firms.length}곳`}의 {ymLong(ym)}{' '}
          상태
        </h1>
        {kind === 'real' && (
          <p className="lead-note">
            ※ {scope} {firms.length.toLocaleString('ko-KR')}곳 가운데 {ymLong(ym)}에 거래 기록이 있는 곳입니다. 나머지 약 1만 곳은
            외환 거래가 없어 두 조합 모두 규칙 대상이 아니라 불러오지 않았습니다.
          </p>
        )}
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
          <input
            id="q"
            type="search"
            placeholder={kind === 'real' ? '법인ID 앞 8자리 일부' : '예: 가람전자'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Segmented label="지역" value={region} options={['전체', '대구', '경북']} onChange={setRegion} />
        <div className="field">
          <label htmlFor="industry">업종</label>
          <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="전체">전체</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <Segmented label="수출 여부" value={exporter} options={['전체', '수출', '비수출']} onChange={setExporter} />
      </div>

      <div className="result-line" id="firms-result" aria-live="polite">
        <span>
          {rows.length.toLocaleString('ko-KR')}곳 표시 {filtered && `(전체 ${observedCount.toLocaleString('ko-KR')}곳 중)`}
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
              <th scope="col" className="hide-sm">
                통장 잔고 12개월
              </th>
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
          <tbody key={`${index}-${status}-${combo}-${page}`} className="rows-in">
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
            {pageRows.map(({ firm, check }, r) => (
              <tr key={firm.id} style={rowDelay(r)}>
                <td className="firm-name">
                  <FirmName firm={firm} />
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
      <Pager page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={goPage} />

      <Footnotes
        notes={[
          C.ruleNote,
          '신호 표시: 굵은 실선은 세 조건 모두 충족, 점선은 기준 근접(통장 잔고가 5~10% 감소), 가는 선은 미충족입니다.',
          CALENDAR_NOTE,
          dataNote(kind),
        ]}
        source={kind === 'real' ? firmSource(kind) : '가상 거래처 데이터(유효숫자 두세 자리로 반올림)'}
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
