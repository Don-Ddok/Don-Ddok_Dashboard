import { useMemo, useState } from 'react'
import { FIRMS, type Industry } from '../data/synthetic'
import type { Region } from '../data/regionExports'
import { checkSignal, type SignalStatus } from '../data/signals'
import { amount, ymLong } from '../lib/format'
import { MonthLink, useMonth } from '../lib/month'
import { SignalMark, STATUS_LABEL } from '../components/SignalMark'
import { Footnotes, SIGNAL_RULE_NOTE, SYNTHETIC_NOTE } from '../components/Footnotes'

const STATUS_ORDER: Record<SignalStatus, number> = { met: 0, partial: 1, none: 2, na: 3 }
const INDUSTRIES = [...new Set(FIRMS.map((f) => f.industry))].sort() as Industry[]

type RegionFilter = '전체' | Region
type ExportFilter = '전체' | '수출' | '비수출'
type StatusFilter = '전체' | SignalStatus

export function Firms() {
  const { index, ym } = useMonth()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<RegionFilter>('전체')
  const [industry, setIndustry] = useState<'전체' | Industry>('전체')
  const [exporter, setExporter] = useState<ExportFilter>('전체')
  const [status, setStatus] = useState<StatusFilter>('전체')

  const rows = useMemo(() => {
    const q = query.trim()
    return FIRMS.map((firm) => ({ firm, check: checkSignal(firm, index) }))
      .filter(({ firm, check }) => {
        if (q && !firm.name.includes(q)) return false
        if (region !== '전체' && firm.region !== region) return false
        if (industry !== '전체' && firm.industry !== industry) return false
        if (exporter === '수출' && !firm.exporter) return false
        if (exporter === '비수출' && firm.exporter) return false
        if (status !== '전체' && check.status !== status) return false
        return true
      })
      .sort((a, b) => STATUS_ORDER[a.check.status] - STATUS_ORDER[b.check.status] || a.firm.name.localeCompare(b.firm.name, 'ko'))
  }, [index, query, region, industry, exporter, status])

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
        <p>신호를 충족한 거래처가 위에 오도록 정렬했습니다. 수출 실적이 없는 거래처는 규칙 대상이 아니라 '해당 없음'으로 표시합니다.</p>
      </section>

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
        <div className="field">
          <label htmlFor="status">이번 달 신호</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="전체">전체</option>
            {(Object.keys(STATUS_LABEL) as SignalStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
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

      <div className="table-wrap">
        <table className="stat-table">
          <caption className="visually-hidden">거래처 목록, {ymLong(ym)} 기준</caption>
          <thead>
            <tr>
              <th scope="col">거래처</th>
              <th scope="col">지역</th>
              <th scope="col">업종</th>
              <th scope="col">수출</th>
              <th scope="col">등급</th>
              <th scope="col" className="num">
                통장 잔고
                <span className="sub">백만 원</span>
              </th>
              <th scope="col" className="num">
                운전자금 대출
                <span className="sub">백만 원</span>
              </th>
              <th scope="col">이번 달 신호</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-cell">
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
            {rows.map(({ firm, check }) => (
              <tr key={firm.id}>
                <td className="firm-name">
                  <MonthLink to={`/firms/${firm.id}`}>{firm.name.replace('(가상)', '')}</MonthLink>{' '}
                  <span className="synthetic">(가상)</span>
                </td>
                <td>{firm.region}</td>
                <td>{firm.industry}</td>
                <td>{firm.exporter ? '수출' : '비수출'}</td>
                <td>{firm.grade}</td>
                <td className="num">{amount(firm.series[index].deposit)}</td>
                <td className="num">{amount(firm.series[index].loan)}</td>
                <td>
                  <SignalMark status={check.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footnotes
        notes={[
          SIGNAL_RULE_NOTE,
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
