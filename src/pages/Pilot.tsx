import { Footnotes } from '../components/Footnotes'
import { TableWrap } from '../components/TableWrap'
import { PILOT } from '../data/final'
import { MonthLink } from '../lib/month'

const STEPS = [
  { t: '국면 판정', d: '공식 수출통계로 둔화(보정 증감률 2개월 연속 음수)를 확인' },
  { t: '대상 선정', d: `수출입 기업 ${PILOT.exposed.toLocaleString()}곳 중 초대형 ${PILOT.excluded}곳을 뺀 ${PILOT.target}곳` },
  { t: '층화 무작위 배정', d: '페르소나 × 점수 구간으로 나눈 뒤 각 층에서 1:1로 연락 그룹과 비연락 그룹' },
  { t: '3개월 안에 상담', d: '연락 그룹만 우선순위 순서로 접촉하고 결과를 기록' },
  { t: '4~6개월 차 비교', d: '요구불 잔액 유지율을 두 그룹 사이에서 비교' },
]

const METRICS = [
  { k: '주지표', name: '요구불 잔액 유지율', def: '배정 후 4~6개월 평균 잔액이 배정 직전 3개월 평균 이상인 기업의 비율', base: `${PILOT.baseline}% (시점별 ${PILOT.baselineRange})` },
  { k: '보조지표', name: '6개월 이탈률', def: '배정 후 4~6개월 차에 3개월 연속 관측되지 않는 기업의 비율', base: `${PILOT.churnBaseline}%` },
  { k: '안전지표', name: '연체율', def: '여신 보유 기업 중 연체가 생긴 비율(iM뱅크 기준)', base: 'iM뱅크 내부 자료로 측정' },
]

const DECISIONS = [
  { k: '성공', tier: 'mint', c: '주지표가 연락 그룹에서 유의하게 좋고(양측 α = 0.05), 연체율이 나빠지지 않음', n: '확대 여부는 iM뱅크가 결정' },
  { k: '보류', tier: 'amber', c: '좋은 방향이지만 유의하지 않고, 연체율이 나빠지지 않음', n: '다음 회차와 합쳐 다시 판정' },
  { k: '실패', tier: 'gray', c: '두 그룹 차이가 없거나 연락 그룹이 더 나쁨', n: '접근 방식·상품·메시지 재검토' },
  { k: '중단', tier: 'orange', c: '연락 그룹의 연체율이 기준 이상 높음(주지표와 관계없이)', n: '여신 제안을 즉시 멈추고 원인 검토' },
]

export default function Pilot() {
  const r = PILOT.retention
  return (
    <>
      <section className="lead" aria-labelledby="pl-title">
        <p className="kicker">효과 검증 · 설계안</p>
        <h1 id="pl-title">
          먼저 찾아간 상담이 실제로 효과가 있는지는 <em className="figure up">무작위 비교 실험</em>으로 확인합니다.
        </h1>
        <p className="lead-note">
          ※ 이번 달 추천은 상담 후보를 고르는 도구이고, 상담 효과는 아직 검증하지 않았습니다. 이 화면은 그 효과를 재는 파일럿 설계입니다.
          새로운 전략이 아니라, iM뱅크가 이미 하고 있는 찾아가는 관계형 금융에 "언제 찾아갈까"(공식 수출통계 트리거)와 "효과는 얼마인가"(비교군
          실험)를 더하는 확장입니다. 대상 규모와 기준선은 교육용 데이터 기준이며, 배정 전 iM뱅크 실제 데이터로 다시 계산합니다.
        </p>
      </section>

      <section className="section" aria-labelledby="pl-why">
        <div className="section-head">
          <h2 id="pl-why">왜 해 볼 만한가 · 관계유지 효과</h2>
          <span className="unit">관찰된 차이이며 인과가 아닙니다</span>
        </div>
        <div className="pl-why">
          <div className="pl-bars" role="img" aria-label={`조기이탈률 수출입 기업 ${r.exposed}%, 그 외 기업 ${r.other}%`}>
            <p className="pl-bars-title">조기이탈률</p>
            <div className="pl-bar-row">
              <span className="pl-bar-name">수출입 기업</span>
              <span className="pl-bar">
                <span className="pl-bar-fill" style={{ width: `${(r.exposed / 40) * 100}%` }} />
              </span>
              <span className="pl-bar-v">{r.exposed}%</span>
            </div>
            <div className="pl-bar-row">
              <span className="pl-bar-name">그 외 기업</span>
              <span className="pl-bar">
                <span className="pl-bar-fill gray" style={{ width: `${(r.other / 40) * 100}%` }} />
              </span>
              <span className="pl-bar-v">{r.other}%</span>
            </div>
            <p className="pl-bars-note">카이제곱 검정 p = {r.p}</p>
          </div>
          <div className="an-facts pl-facts">
            <div className="an-fact tier-mint">
              <span className="an-fact-v">+1%p</span>
              <span className="an-fact-l">잔액 유지율이 1%p 오르면</span>
              <span className="an-fact-s">유지되는 잔액 {PILOT.valuePerPoint}</span>
            </div>
            <div className="an-fact tier-orange">
              <span className="an-fact-v">연체율 ↑</span>
              <span className="an-fact-l">안전장치 내장</span>
              <span className="an-fact-s">기준 이상 오르면 여신 제안 즉시 중단</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pl-flow">
        <div className="section-head">
          <h2 id="pl-flow">실험 흐름</h2>
          <span className="unit">파일럿 기간 6개월 · 배정 기준(ITT)으로 비교</span>
        </div>
        <ol className="pl-flow">
          {STEPS.map((s, i) => (
            <li key={s.t} className={i === 2 ? 'hot' : undefined}>
              <span className="pl-flow-no">{i + 1}</span>
              <span className="pl-flow-t">{s.t}</span>
              <span className="pl-flow-d">{s.d}</span>
            </li>
          ))}
        </ol>
        <p className="section-note">
          비연락 그룹은 평소대로 관리하고 담당자 화면과 발송 명단에서 뺍니다. 비연락 기업이 먼저 상담을 요청하면 평소대로 응대하고 건수를
          기록하며, 비연락 그룹에 선제 연락이 있었는지 매월 점검합니다.
        </p>
      </section>

      <section className="section" aria-labelledby="pl-metrics">
        <div className="section-head">
          <h2 id="pl-metrics">무엇으로 판정하나</h2>
          <span className="unit">주지표는 하나만 · 안전지표는 악화 여부만</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">구분</th>
                <th scope="col">지표</th>
                <th scope="col">정의</th>
                <th scope="col">기준선</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.k}>
                  <th scope="row">{m.k}</th>
                  <td>
                    <strong>{m.name}</strong>
                  </td>
                  <td>{m.def}</td>
                  <td>{m.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="section-note">
          주지표를 잔액 유지율로 둔 이유: 분석에서 효과가 계좌를 여닫는 데가 아니라 잔액 변화에서 나왔고, 이탈률(기준선 3.3%)은 너무 낮아
          1회차에서 효과를 잡기 어렵기 때문입니다.
        </p>
      </section>

      <section className="section" aria-labelledby="pl-power">
        <div className="section-head">
          <h2 id="pl-power">얼마나 차이가 나야 잡을 수 있나</h2>
          <span className="unit">두 비율 차이 검정, 양측 α = 0.05, 검정력 80%</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">회차</th>
                <th scope="col">필요한 차이</th>
                <th scope="col">연락 그룹 유지율</th>
              </tr>
            </thead>
            <tbody>
              {PILOT.mde.map((m) => (
                <tr key={m.round}>
                  <th scope="row">{m.round}</th>
                  <td className="num">{m.need}</td>
                  <td className="num">{m.reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="section-note">1회차로는 큰 효과만 잡힙니다. 그래서 여러 트리거 회차를 합쳐 판정하며, 회차 수와 합산 규칙은 배정 전에 정합니다.</p>
      </section>

      <section className="section" aria-labelledby="pl-decide">
        <div className="section-head">
          <h2 id="pl-decide">판정 기준</h2>
          <span className="unit">배정 전에 고정하고, 결과를 본 뒤 바꾸지 않습니다</span>
        </div>
        <ul className="pl-decide">
          {DECISIONS.map((d) => (
            <li key={d.k}>
              <span className={`an-chip tier-${d.tier}`}>{d.k}</span>
              <span className="pl-decide-c">{d.c}</span>
              <span className="pl-decide-n">→ {d.n}</span>
            </li>
          ))}
        </ul>
      </section>

      <Footnotes
        notes={[
          '관계유지 효과(조기이탈률 차이)는 수출입 기업이 원래 덜 떠나는 경향을 관찰한 것으로, 파일럿이 만들어 낼 효과가 아닙니다. 그래서 무작위 비교로 따로 확인합니다.',
          '성장 국면(수출 증감률과 생산지수가 함께 2개월 연속 양수)도 같은 방식으로 설계했지만, 그 근거는 사후 분석 1회라 운영 전에 별도 확인이 필요합니다.',
          <>
            상담 후보를 고르는 규칙은 <MonthLink to="/recommend">이번 달 추천</MonthLink>, 분석 근거는 <MonthLink to="/results">분석 결과</MonthLink>에
            있습니다.
          </>,
        ]}
        source="돈독 파일럿 설계서 B안(주지표 요구불 잔액 유지율), 돈독 최종 결과보고서·최종 발표자료(2026-10-06)"
      />
    </>
  )
}
