import { Area, Bar, BarChart, CartesianGrid, ComposedChart, LabelList, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartBlock } from '../components/ChartBlock'
import { Footnotes } from '../components/Footnotes'
import { TableWrap } from '../components/TableWrap'
import { DEMAND_IRF, INDICATORS, ROBUSTNESS, VERDICT_LABEL, VERDICT_TIER } from '../data/final'
import { MonthLink } from '../lib/month'

const INK = '#1b1e23'
const INK_3 = '#5f6570'
const RULE = '#d5dae1'
const ACCENT = '#007d6c'
const BAND = '#c9582b'
const TICK = { fontSize: 11, fill: INK_3 }

const KEY_FACTS = [
  { v: '−3.6%', l: '수출 증가율 10%p 하락 시 6개월 뒤', s: '비교 기업 대비 요구불예금', tier: 'mint' },
  { v: 'p 0.003', l: 'Holm 보정 p 0.005', s: '12개 시차를 보정해도 유의', tier: 'mint' },
  { v: 'p 0.917', l: '수출이 줄기 전(사전 추세)', s: '충격 전에는 차이가 없었음', tier: 'mint' },
  { v: '87%', l: '검정력', s: '이 크기의 차이를 찾아낼 확률', tier: 'mint' },
] as const

const irfRows = DEMAND_IRF.map((r) => ({ ...r, band: [r.lo, r.hi] as [number, number], dot: r.sig ? r.pct : null }))
const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`

function IrfTip(props: { active?: boolean; payload?: ReadonlyArray<{ payload?: (typeof irfRows)[number] }> }) {
  const r = props.active ? props.payload?.[0]?.payload : undefined
  if (!r) return null
  return (
    <div className="chart-tooltip">
      <div>{r.h}개월 뒤</div>
      <strong>{pct(r.pct)}</strong>
      <div>
        95% 구간 {pct(r.lo)} ~ {pct(r.hi)} · {r.sig ? '보정 후에도 유의' : '보정 후 유의하지 않음'}
      </div>
    </div>
  )
}

export default function Results() {
  return (
    <>
      <section className="lead" aria-labelledby="rs-title">
        <p className="kicker">분석 결과</p>
        <h1 id="rs-title">
          수출이 줄면, 6개월 뒤 수출입 기업의 요구불예금이 <em className="figure down">3.6% 더 낮았습니다.</em>
        </h1>
        <p className="lead-note">
          ※ 대구·경북 iM뱅크 거래 법인 11,036곳(수출입 기업 1,034곳), 2023.01~2025.12. 같은 기업의 변화만 비교하고(기업 고정효과), 같은
          지역·같은 달끼리 비교했으며(지역×월 고정효과), 12개 시차를 모두 검정한 만큼 기준을 엄격하게 했습니다(Holm 보정). 인과가 아니라
          평균적으로 함께 움직이는 관계입니다. 어려운 말은 <MonthLink to="/glossary">용어 사전</MonthLink>에 있습니다.
        </p>
      </section>

      <section className="section" aria-labelledby="rs-facts">
        <div className="section-head">
          <h2 id="rs-facts">숫자 네 개</h2>
        </div>
        <div className="an-facts">
          {KEY_FACTS.map((f) => (
            <div key={f.v} className={`an-fact tier-${f.tier}`}>
              <span className="an-fact-v">{f.v}</span>
              <span className="an-fact-l">{f.l}</span>
              <span className="an-fact-s">{f.s}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="rs-irf">
        <div className="section-head">
          <h2 id="rs-irf">몇 개월 뒤에 얼마나</h2>
          <span className="unit">채운 점 = 보정 후에도 유의 · 색칠한 띠 = 95% 신뢰구간</span>
        </div>
        <ChartBlock
          title="수출입 기업 − 비교 기업 요구불예금 차이"
          unit="%, 수출 증가율 10%p 하락 시"
          value={<span className="down">−3.6%</span>}
          valueLabel="6개월 뒤"
          summary="2개월째부터 벌어지기 시작해 6~8개월에 가장 커집니다(8개월 −4.8%). 9·10·12개월은 비교할 기업 수가 줄어 신뢰구간이 넓어진 탓에 보정 후 유의하지 않지만, 추정값은 계속 −4% 안팎입니다."
          tall
        >
          <ComposedChart data={irfRows} margin={{ top: 16, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={RULE} vertical={false} />
            <XAxis dataKey="h" tick={TICK} tickLine={false} axisLine={{ stroke: RULE }} tickFormatter={(h) => `${h}개월`} />
            <YAxis tick={TICK} width={44} tickLine={false} axisLine={false} unit="%" domain={[-8, 1]} ticks={[-8, -6, -4, -2, 0]} />
            <ReferenceLine y={0} stroke={INK} />
            <ReferenceLine x={6} stroke={ACCENT} strokeDasharray="4 4" />
            <Tooltip content={<IrfTip />} />
            <Area dataKey="band" stroke="none" fill={BAND} fillOpacity={0.18} isAnimationActive={false} />
            <Line
              dataKey="pct"
              stroke={ACCENT}
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={{ r: 4, fill: '#fff', stroke: ACCENT, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line dataKey="dot" stroke="none" isAnimationActive={false} dot={{ r: 5.5, fill: ACCENT, stroke: ACCENT }} activeDot={false} />
          </ComposedChart>
        </ChartBlock>
      </section>

      <section className="section" aria-labelledby="rs-table">
        <div className="section-head">
          <h2 id="rs-table">6개 지표 중 보정 후에도 유의한 것은 요구불예금 하나</h2>
          <span className="unit">6개월 뒤 기준 · 같은 식, 같은 판정 기준</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">지표</th>
                <th scope="col">차이</th>
                <th scope="col">p</th>
                <th scope="col">Holm 보정 p</th>
                <th scope="col">판정</th>
                <th scope="col">읽는 법</th>
              </tr>
            </thead>
            <tbody>
              {INDICATORS.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
                  <td className="num">{r.est}</td>
                  <td className="num">{r.p}</td>
                  <td className="num">{r.holm}</td>
                  <td>
                    <span className={`an-chip tier-${VERDICT_TIER[r.verdict]}`}>{VERDICT_LABEL[r.verdict]}</span>
                  </td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="section-note">
          보정 후 유의 = Holm 보정 후 p &lt; 0.05 + 사전 추세 유의하지 않음 · 보정 전만 유의 = 단일 검정만 p &lt; 0.05 · 유의하지 않음 =
          기각하지 못함(효과가 없다는 뜻이 아니라, 이 표본으로는 확인하지 못했다는 뜻)
        </p>
      </section>

      <section className="section" aria-labelledby="rs-robust">
        <div className="section-head">
          <h2 id="rs-robust">추정 방식을 바꿔도 결과가 유지됐습니다</h2>
          <span className="unit">요구불예금, 6개월 뒤</span>
        </div>
        <ChartBlock
          title="방식별 요구불예금 차이"
          unit="%, 수출 증가율 10%p 하락 시"
          summary="세 가지 대체 추정 모두 p < 0.05이고 방향이 같습니다. 수출 대금이 없는 수입만 하는 기업도 −4.2%라, 수출 대금 감소만으로는 설명되지 않습니다. 한계: 2023년 실적만으로 수출입 기업을 정하면 −0.55%(p 0.801), 검정력 35%로 판단을 보류했습니다."
        >
          <BarChart data={ROBUSTNESS} layout="vertical" margin={{ top: 8, right: 56, bottom: 8, left: 8 }}>
            <CartesianGrid stroke={RULE} horizontal={false} />
            <XAxis type="number" domain={[-5, 0]} tick={TICK} tickLine={false} axisLine={{ stroke: RULE }} unit="%" />
            <YAxis type="category" dataKey="name" width={150} tick={{ ...TICK, fill: INK }} tickLine={false} axisLine={false} />
            <ReferenceLine x={0} stroke={INK} />
            <Bar dataKey="pct" fill={ACCENT} barSize={18} isAnimationActive={false}>
              <LabelList dataKey="pct" position="left" formatter={(v: unknown) => pct(Number(v))} style={{ fontSize: 12, fontWeight: 700, fill: INK }} />
            </Bar>
          </BarChart>
        </ChartBlock>
      </section>

      <section className="section" aria-labelledby="rs-scope">
        <div className="section-head">
          <h2 id="rs-scope">확인한 범위</h2>
          <span className="unit">"지역 수출 경기와의 동행 관계"까지</span>
        </div>
        <ol className="rs-path">
          <li className="rs-step">지역 수출 감소</li>
          <li className="rs-step rs-no">
            기업 자체 수출입 감소 <span>연결 확인 안 됨</span>
          </li>
          <li className="rs-step rs-no">
            입금 감소 <span>설명되지 않음 (p 0.741)</span>
          </li>
          <li className="rs-step rs-yes">
            요구불예금 감소 <span>확인 (−3.6%)</span>
          </li>
          <li className="rs-step rs-na">
            자금 필요 <span>측정 불가</span>
          </li>
          <li className="rs-step rs-na">
            상품 적합 <span>파일럿으로 검증</span>
          </li>
        </ol>
        <p className="section-note">
          잔액 변화와 입출금 기록의 상관이 0.59에 그쳐, 이 데이터로는 감소 경로를 가르기 어렵습니다. 그래서 상담 대상을 고르는 데는 확인된
          요구불예금만 씁니다(<MonthLink to="/recommend">이번 달 추천</MonthLink>). 효과는{' '}
          <MonthLink to="/pilot">효과 검증</MonthLink>의 무작위 비교 실험으로 따로 확인합니다.
        </p>
      </section>

      <Footnotes
        notes={[
          '모든 수치는 교육용 법인 익명데이터를 집계한 결과이며, 은행 원본과 법인 단위 값은 없습니다.',
          '판정 시차 6개월은 결과를 보기 전에 정했습니다. 표준오차는 법인·연월 두 방향으로 묶어(이중 군집) 자유도 28의 t분포로 판정했습니다.',
          '업종×월 고정효과는 넣지 않았습니다. 수출입 기업이 제조업에 쏠려 있지만(χ² = 929.21), 업종별 충격 자체는 유의하지 않았습니다.',
        ]}
        source="돈독 최종 결과보고서(2026-10-06), iM뱅크 교육용 법인 익명데이터, 한국무역협회 K-stat, 한국은행 ECOS"
      />
    </>
  )
}
