import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { REGION_EXPORTS, type Region } from '../data/regionExports'
import { FIRST_JUDGED_INDEX } from '../data/signals'
import { masked, useInternalCombo, useInternalSummary, type ComboResult, type InternalSummary } from '../lib/internal'
import { pctPoint, ymLong, ymShort } from '../lib/format'
import { useMonth } from '../lib/month'
import { prefersReducedMotion } from '../lib/motion'
import { RegionTag } from '../components/RegionTag'
import { TableWrap } from '../components/TableWrap'
import { Footnotes } from '../components/Footnotes'
import { ChartBlock } from '../components/ChartBlock'

const REGIONS: Region[] = ['대구', '경북']
const INK = '#1b1e23'
const INK_3 = '#5f6570'
const RULE = '#d5dae1'
const ACCENT = '#007d6c'
const REGION_COLOR = { 대구: '#2f5fb3', 경북: '#7b4f93' } as const
const TICK = { fontSize: 11, fill: INK_3 }

const share = (a: number | null, b: number | null) => (a === null || b === null || b === 0 ? null : (a / b) * 100)
const pctText = (v: number | null) => (v === null ? '가림' : `${v.toFixed(1)}%`)

/**
 * 내부 시연: 프로토타입의 참고 신호 규칙을 실제 법인 데이터에 적용한 집계.
 * 개별 고객은 나오지 않고, 5 미만인 칸은 가린다. 개발 서버(internal 모드)에서만 열린다.
 */
export default function Internal() {
  const state = useInternalSummary()
  if (state.status === 'loading') {
    return (
      <section className="lead" aria-busy="true">
        <p>로컬 집계 파일을 읽는 중입니다.</p>
      </section>
    )
  }
  if (state.status === 'error') {
    return (
      <section className="lead">
        <p className="kicker">내부 시연</p>
        <h1>집계 파일을 읽지 못했습니다</h1>
        <p>{state.message}</p>
        <p>
          분석 폴더에서 <code>internal_demo_summary.py</code>를 실행해 집계 파일을 만든 뒤, <code>.env.internal.local</code>의
          INTERNAL_SUMMARY 경로를 확인하세요.
        </p>
      </section>
    )
  }
  return <InternalView data={state.data} />
}

function InternalView({ data }: { data: InternalSummary }) {
  const { index, ym } = useMonth()
  const animate = !prefersReducedMotion()
  const { totals, minCell } = data
  const overall = share(totals.metFirmMonths, totals.judgedFirmMonths)
  const rows = REGIONS.map((region) => ({
    region,
    m: data.monthly.find((r) => r.ym === ym && r.region === region),
    yoy: REGION_EXPORTS[region].find((p) => p.ym === ym)?.yoy ?? null,
  }))

  const trend = [...new Set(data.monthly.map((r) => r.ym))].map((m) => ({
    x: ymShort(m),
    대구: data.monthly.find((r) => r.ym === m && r.region === '대구')?.met ?? null,
    경북: data.monthly.find((r) => r.ym === m && r.region === '경북')?.met ?? null,
  }))
  const cut = data.loanCut.map((r) => ({ x: ymShort(r.ym), 수출: r.exposedCutShare, 비수출: r.otherCutShare }))
  const avg = (k: '수출' | '비수출') => {
    const v = cut.map((r) => r[k]).filter((x): x is number => x !== null)
    return v.reduce((a, b) => a + b, 0) / v.length
  }
  const { exporters: pe, others: po } = data.patternRate
  const indShares = data.industries.map((r) => r.metShare).filter((x): x is number => x !== null)
  const indMin = indShares.length ? Math.min(...indShares) : null
  const indMax = indShares.length ? Math.max(...indShares) : null

  return (
    <>
      <section className="lead lead-wide" aria-labelledby="internal-title">
        <p className="kicker">내부 시연 · 실제 데이터 집계</p>
        <h1 id="internal-title">
          실제 법인 데이터에 같은 규칙을 대 보면, 수출 고객을 달마다 판정한 {totals.judgedFirmMonths.toLocaleString('ko-KR')}번 중{' '}
          <em className="figure down">{pctText(overall)}</em>에서 신호가 켜집니다.
        </h1>
        <p className="lead-note">
          ※ {data.generatedFrom}를 이 컴퓨터에서 집계한 값만 보여 줍니다. 개별 고객은 나오지 않고, {minCell} 미만인 칸은
          가렸습니다. 외부 공유와 캡처 배포는 하지 않습니다.
        </p>
      </section>

      <section aria-labelledby="in-month-title">
        <div className="section-head">
          <h2 id="in-month-title">{ymLong(ym)} 지역별 판정</h2>
          <span className="unit">수출 고객 {totals.exporters}곳(2023년 7월 이후 관측) 기준</span>
        </div>
        {index < FIRST_JUDGED_INDEX ? (
          <p className="section-note">2023년 1~6월은 대출 6개월 변화를 계산할 수 없어 판정하지 않습니다.</p>
        ) : (
          <TableWrap>
            <table className="stat-table">
              <thead>
                <tr>
                  <th scope="col">지역</th>
                  <th scope="col" className="num">지역 수출 전년동월비</th>
                  <th scope="col" className="num">수출 고객</th>
                  <th scope="col" className="num">판정 가능</th>
                  <th scope="col" className="num">충족</th>
                  <th scope="col" className="num">기준 근접</th>
                  <th scope="col" className="num">충족 비율</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ region, m, yoy }) => (
                  <tr key={region}>
                    <th scope="row">
                      <RegionTag region={region} />
                    </th>
                    <td className={`num chg ${(yoy ?? 0) < 0 ? 'down' : 'up'}`}>{pctPoint(yoy)}</td>
                    <td className="num">{m ? masked(m.exporters, minCell) : '없음'}</td>
                    <td className="num">{m ? masked(m.judged, minCell) : '없음'}</td>
                    <td className="num">{m ? masked(m.met, minCell) : '없음'}</td>
                    <td className="num">{m ? masked(m.near, minCell) : '없음'}</td>
                    <td className="num">{m ? pctText(share(m.met, m.judged)) : '없음'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      <section className="section" aria-labelledby="in-trend-title">
        <div className="section-head">
          <h2 id="in-trend-title">30개월 동안 충족한 수출 고객 수</h2>
          <span className="unit">지역 수출이 늘어난 달은 규칙상 0곳</span>
        </div>
        <ChartBlock
          title="대구·경북 월별 충족 수출 고객"
          unit="곳"
          valueLabel={ymShort(ym)}
          value={rows.map(({ region, m }) => `${region} ${m ? masked(m.met, minCell) : '없음'}`).join(' · ')}
          tall
          summary={
            <>
              판정 가능한 고객 가운데 충족 비율은 전체 기간 {pctText(overall)}입니다. 한 번이라도 충족한 수출 고객은{' '}
              {masked(totals.metFirms, minCell)}곳(전체 {totals.exporters}곳)입니다.
            </>
          }
        >
          <BarChart data={trend} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={RULE} vertical={false} />
            <XAxis dataKey="x" tick={TICK} interval={2} tickLine={false} axisLine={{ stroke: RULE }} />
            <YAxis tick={TICK} width={40} tickLine={false} axisLine={false} allowDecimals={false} />
            <ReferenceLine
              x={ymShort(ym)}
              stroke={ACCENT}
              strokeWidth={2}
              label={{ value: ymShort(ym), position: 'top', fill: ACCENT, fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip cursor={{ fill: '#e6f0ee' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {REGIONS.map((r) => (
              <Bar key={r} dataKey={r} fill={REGION_COLOR[r]} isAnimationActive={animate} />
            ))}
          </BarChart>
        </ChartBlock>
      </section>

      <section className="section" aria-labelledby="in-test-title">
        <div className="section-head">
          <h2 id="in-test-title">이 규칙은 수출 충격을 가려내는가</h2>
          <span className="unit">지역 수출이 줄어든 달, 판정 가능한 고객-월 기준</span>
        </div>
        <div className="compare">
          <CompareRow
            label="같은 모양(잔고 10% 넘게 감소 + 대출 유지)"
            a={{ name: '수출 고객', value: pe.share, n: pe.judgedMonths }}
            b={{ name: '비수출 고객', value: po.share, n: po.judgedMonths }}
          />
          <CompareRow
            label="잔고 10% 넘게 감소만"
            a={{ name: '수출 고객', value: data.depositDropRate.exporters }}
            b={{ name: '비수출 고객', value: data.depositDropRate.others }}
          />
        </div>
        <p className="finding">
          <strong>결론: 가려내지 못합니다.</strong> 지역 수출이 줄어든 달에 비수출 고객도 거의 같은 비율로 같은 모양을 보입니다.
          통장 잔고(요구불예금)는 석 달 사이 10% 넘게 오르내리는 일이 원래 흔해서, 이 문턱으로는 수출 충격을 받은 고객만 따로
          골라내지 못합니다. 프로토타입의 규칙은 화면 시연용이며, 실무에 쓰려면 조건과 문턱을 다시 설계하고 사후 결과(연체 등)로
          검증해야 합니다. 같은 데이터로 문턱을 맞추면 과적합이 되므로 여기서 조정하지 않았습니다.
        </p>
      </section>

      <ComboSection />

      <section className="section" aria-labelledby="in-cut-title">
        <div className="section-head">
          <h2 id="in-cut-title">연구 방향의 단순 확인: 대출을 5% 넘게 줄인 회사 비율</h2>
          <span className="unit">운전자금을 쓴 적 있는 회사, 6개월 변화, 매칭 전</span>
        </div>
        <ChartBlock
          title="6개월 대출을 5% 넘게 줄인 회사 비율"
          unit="%, 월별"
          valueLabel="30개월 평균"
          value={`수출 ${avg('수출').toFixed(1)}% · 비수출 ${avg('비수출').toFixed(1)}%`}
          tall
          summary={
            <>
              수출 고객이 대출을 덜 줄이는 방향은 연구와 같지만, 이 차이는 수출이 늘어난 달에도 비슷하게 있어서 이 선만으로는 수출
              충격의 영향이라고 말할 수 없습니다. 회사 크기·업종 차이가 섞인 단순 비율이고, 연구의 근거는 비슷한 회사끼리 짝지은
              비교(근거와 한계 화면)입니다.
            </>
          }
        >
          <LineChart data={cut} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={RULE} vertical={false} />
            <XAxis dataKey="x" tick={TICK} interval={2} tickLine={false} axisLine={{ stroke: RULE }} />
            <YAxis tick={TICK} width={40} tickLine={false} axisLine={false} unit="%" domain={[0, 'auto']} />
            <ReferenceLine x={ymShort(ym)} stroke={ACCENT} strokeWidth={2} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="수출" stroke={ACCENT} strokeWidth={2} dot={false} isAnimationActive={animate} />
            <Line dataKey="비수출" stroke={INK} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={animate} />
          </LineChart>
        </ChartBlock>
      </section>

      <section className="section" aria-labelledby="in-ind-title">
        <div className="section-head">
          <h2 id="in-ind-title">업종별 충족 비율(전체 기간)</h2>
          <span className="unit">수출 고객 10곳 이상 업종만</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">업종(중분류)</th>
                <th scope="col" className="num">수출 고객</th>
                <th scope="col" className="num">판정한 달</th>
                <th scope="col" className="num">충족한 달</th>
                <th scope="col" className="num">충족 비율</th>
              </tr>
            </thead>
            <tbody>
              {data.industries.map((r) => (
                <tr key={r.industry}>
                  <th scope="row">{r.industry}</th>
                  <td className="num">{r.exporters}</td>
                  <td className="num">{r.judgedMonths.toLocaleString('ko-KR')}</td>
                  <td className="num">{masked(r.metMonths, minCell)}</td>
                  <td className="num">{pctText(r.metShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="chart-summary">
          업종별 충족 비율은 {pctText(indMin)}~{pctText(indMax)} 범위입니다. 10곳 미만 업종의 수출 고객{' '}
          {data.industryOtherFirms}곳은 표에서 뺐습니다.
        </p>
      </section>

      <Footnotes
        notes={[
          '규칙은 프로토타입과 같습니다: 지역 수출 전년동월비 감소, 요구불예금 3개월 10% 넘게 감소, 운전자금대출 6개월 5% 넘게 줄지 않음. 수출 고객은 관측 기간 중 수출 실적이 한 번이라도 있는 법인입니다.',
          '3개월 전·6개월 전 값이 없거나 0이면 판정하지 않습니다. 금액은 유효숫자 두 자리로 반올림된 원자료 기준입니다.',
          `${minCell} 미만인 칸은 개별 법인이 드러나지 않도록 가렸습니다. 이 화면은 개발 서버에서만 열리며 배포 빌드에 포함되지 않습니다.`,
        ]}
        source={`${data.generatedFrom}, 관세청 수출입무역통계(한국무역협회 K-stat)`}
      />
    </>
  )
}

function CompareRow({
  label,
  a,
  b,
}: {
  label: string
  a: { name: string; value: number; n?: number }
  b: { name: string; value: number; n?: number }
}) {
  return (
    <div className="compare-row">
      <p className="compare-label">{label}</p>
      {[a, b].map((x, i) => (
        <div className="compare-bar" key={x.name}>
          <span className="compare-name">
            {x.name}
            {x.n !== undefined && <span className="synthetic"> ({x.n.toLocaleString('ko-KR')})</span>}
          </span>
          <span className="compare-track" aria-hidden="true">
            <span className={`compare-fill${i === 0 ? ' is-a' : ''}`} style={{ width: `${x.value}%` }} />
          </span>
          <span className="compare-value">{x.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

const TREAT_LABEL: Record<string, string> = { 수출노출: '수출 실적 기준', 외환노출: '수출 또는 수입 실적 기준' }

function verdict(r: ComboResult) {
  // 참고 표본(전체 법인)은 할인어음을 안 쓰는 회사가 섞여 구성 차이가 커서, 기준을 넘어도 그대로 통과로 읽지 않는다
  if (r.pass1 && r.pass2 && r.label.includes('참고')) return { text: '기준상 통과(구성 차이 섞임)', cls: 'partial' }
  if (r.pass1 && r.pass2) return { text: '통과', cls: 'met' }
  if (r.pass2) return { text: '부분 지지(경기 연동만)', cls: 'partial' }
  return { text: '근거 없음', cls: 'none' }
}

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}`

/** 팀 결론 "요구불예금 감소 + 할인어음 증가" 조합을 개별 법인 단위로 점검한 결과(사전 기준) */
function ComboSection() {
  const state = useInternalCombo()
  return (
    <section className="section" aria-labelledby="in-combo-title">
      <div className="section-head">
        <h2 id="in-combo-title">팀 조합 신호 점검: 요구불예금 감소 + 할인어음 증가</h2>
        <span className="unit">할인어음을 한 번이라도 쓴 법인, 3개월 변화, 기준은 실행 전 고정</span>
      </div>
      {state.status === 'loading' && <p className="section-note">점검 결과를 읽는 중입니다.</p>}
      {state.status === 'error' && (
        <p className="section-note">
          점검 결과 파일이 없습니다. 분석 폴더에서 <code>combo_signal_check.py</code>를 실행하면 집계 파일 옆에 결과가 생깁니다.
        </p>
      )}
      {state.status === 'ready' && <ComboView results={state.data.results} />}
    </section>
  )
}

function ComboView({ results }: { results: ComboResult[] }) {
  const main = results[0]
  const r = main.rates
  const v = verdict(main)
  return (
    <>
      <p className="section-note">
        석 달 사이 요구불예금이 10% 넘게 줄고 할인어음 잔액이 늘어난 경우를 신호로 봅니다. 수출 고객 {main.firmsExposed}곳, 비수출
        고객 {main.firmsOther}곳입니다.
      </p>
      <TableWrap>
        <table className="stat-table">
          <thead>
            <tr>
              <th scope="col">신호 비율</th>
              <th scope="col" className="num">지역 수출이 줄어든 달</th>
              <th scope="col" className="num">지역 수출이 늘어난 달</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">수출 고객</th>
              <td className="num">
                <strong>{r.down_exposed.pct.toFixed(1)}%</strong> <span className="synthetic">({r.down_exposed.hits}/{r.down_exposed.n})</span>
              </td>
              <td className="num">
                {r.up_exposed.pct.toFixed(1)}% <span className="synthetic">({r.up_exposed.hits}/{r.up_exposed.n})</span>
              </td>
            </tr>
            <tr>
              <th scope="row">비수출 고객</th>
              <td className="num">
                {r.down_other.pct.toFixed(1)}% <span className="synthetic">({r.down_other.hits}/{r.down_other.n})</span>
              </td>
              <td className="num">
                {r.up_other.pct.toFixed(1)}% <span className="synthetic">({r.up_other.hits}/{r.up_other.n})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </TableWrap>

      <TableWrap>
        <table className="stat-table combo-criteria">
          <thead>
            <tr>
              <th scope="col">사전 기준</th>
              <th scope="col" className="num">결과</th>
              <th scope="col">판정</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">① 수출이 줄어든 달에 수출 고객이 비수출의 1.5배 이상(가려내는 힘)</th>
              <td className="num">{main.ratioDown.toFixed(2)}배</td>
              <td>
                <span className={`mark ${main.pass1 ? 'met' : 'none'}`}>{main.pass1 ? '통과' : '미통과'}</span>
              </td>
            </tr>
            <tr>
              <th scope="row">② 수출 고객의 초과분이 늘어난 달보다 줄어든 달에 더 큼(경기 연동)</th>
              <td className="num">
                {signed(main.did)}%p [{signed(main.didCI[0])}, {signed(main.didCI[1])}]
              </td>
              <td>
                <span className={`mark ${main.pass2 ? 'met' : 'none'}`}>{main.pass2 ? '통과' : '미통과'}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </TableWrap>

      <p className="finding">
        <strong>종합: {v.text}.</strong>{' '}
        {main.pass2
          ? '이 조합은 수출 고객에서 수출 경기에 따라 켜지고 꺼집니다. 통장 잔고 하나만 볼 때는 없던 차이입니다. '
          : '수출 경기에 따라 켜지고 꺼지는 모습도 확인되지 않았습니다. '}
        {main.pass1
          ? '수출이 줄어든 달에 수출 고객을 비수출 고객보다 뚜렷하게 더 많이 골라냅니다.'
          : `다만 수출이 줄어든 달에도 비수출 고객의 ${r.down_other.pct.toFixed(0)}%에서 같은 신호가 켜져, 개별 고객을 가려내는 도구로는 아직 기준에 못 미칩니다.`}
      </p>

      <TableWrap>
        <table className="stat-table">
          <caption className="visually-hidden">보조 점검</caption>
          <thead>
            <tr>
              <th scope="col">점검</th>
              <th scope="col" className="num">① 배수</th>
              <th scope="col" className="num">② 초과분 차이 [95% 구간]</th>
              <th scope="col">종합</th>
            </tr>
          </thead>
          <tbody>
            {results.map((x) => {
              const xv = verdict(x)
              return (
                <tr key={`${x.label}-${x.treat}`}>
                  <th scope="row">
                    {x.label} <span className="synthetic">· {TREAT_LABEL[x.treat] ?? x.treat}</span>
                  </th>
                  <td className="num">{x.ratioDown.toFixed(2)}배</td>
                  <td className="num">
                    {signed(x.did)}%p [{signed(x.didCI[0])}, {signed(x.didCI[1])}]
                  </td>
                  <td>
                    <span className={`mark ${xv.cls}`}>{xv.text}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrap>
      <p className="chart-summary">
        첫 줄이 주 점검입니다. 전체 법인(참고)은 수출 기업이 원래 할인어음을 더 많이 써서 배수가 크게 나오며, 수출이 늘어난 달에도
        차이가 있어 구성 차이가 대부분입니다. 검정을 여러 번 했으므로 주 점검 하나로 판단하고, 쓴 계정은 요구불예금과 할인어음
        두 개뿐입니다.
      </p>
    </>
  )
}
