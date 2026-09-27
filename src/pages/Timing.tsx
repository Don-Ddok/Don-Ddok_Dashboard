import { MonthLink } from '../lib/month'
import { TableWrap } from '../components/TableWrap'
import { Footnotes } from '../components/Footnotes'
import { RESULT_LABEL, STAGES, TIMING_SOURCE, UNRELATED, type Account, type TimingResult } from '../data/accountTiming'

const LEGEND: TimingResult[] = ['match', 'differ', 'untested', 'outside']

function AccountItem({ a }: { a: Account }) {
  return (
    <li className="acct" data-result={a.result}>
      <span className="acct-name">
        {a.name}
        {a.inRule && <span className="rule-tag">규칙에 사용</span>}
      </span>
      <span className="acct-expected">예상 {a.expected}</span>
      <span className="acct-observed">
        {a.result === 'reference' ? '기준 계열' : a.observed ? `결과 ${a.observed}` : RESULT_LABEL[a.result]}
      </span>
      {a.note && <span className="acct-note">{a.note}</span>}
    </li>
  )
}

/** 예상과 결과를 대조할 수 있는 계정(결과가 있거나, 조기경보 후보인데 미검정인 계정) */
const compared = STAGES.flatMap((s) => s.accounts.map((a) => ({ ...a, stage: s.name }))).filter(
  (a) => a.result !== 'reference',
)

export function Timing() {
  return (
    <>
      <section className="lead lead-wide" aria-labelledby="timing-title">
        <h1 id="timing-title">수출이 꺾이면 은행 계정은 언제 움직이나</h1>
        <p>
          지역 수출통계는 물건이 선적되는 달에 기록됩니다. 선적 전에 일어나는 거래(원자재 매입, 생산 비용)는 수출보다 먼저 움직이고,
          선적 뒤의 거래(대금 회수, 부족분 대응, 대출 조정)는 늦게 움직입니다. 조기경보에 쓸 수 있는 것은 먼저 움직이는 계정입니다.
        </p>
        <p className="lead-note">※ {TIMING_SOURCE}</p>
      </section>

      <section aria-labelledby="map-title">
        <div className="section-head">
          <h2 id="map-title">수출 흐름 속 계정 지도</h2>
          <div className="legend" aria-hidden="true">
            {LEGEND.map((r) => (
              <span key={r}>
                <i className={`line timing-${r}`} /> {RESULT_LABEL[r]}
              </span>
            ))}
            <span>
              <span className="rule-tag">규칙에 사용</span> 이 월보의 참고 신호
            </span>
          </div>
        </div>

        <div className="timing-axis" aria-hidden="true">
          <span className="axis-lead">선행: 수출보다 먼저</span>
          <span className="axis-sync">동행 k = 0</span>
          <span className="axis-lag">후행: 수출보다 늦게</span>
        </div>

        <ol className="timing-map" aria-label="수출 흐름 여섯 단계와 관련 계정">
          {STAGES.map((s) => (
            <li key={s.no} className={`stage${s.no === 3 ? ' is-anchor' : ''}`} data-timing={s.timing}>
              <div className="stage-head">
                <span className="stage-no">{s.no}</span>
                <span className="stage-name">{s.name}</span>
                <span className="stage-timing">{s.no === 3 ? '기준 시점' : s.timing}</span>
              </div>
              <p className="stage-what">{s.what}</p>
              <ul className="stage-accounts">
                {s.accounts.map((a) => (
                  <AccountItem key={a.name} a={a} />
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="unrelated">
          <p className="unrelated-title">수출 흐름과 무관한 계정(위약검정용): 어느 시차에서도 반응하지 않아야 정상</p>
          <ul className="stage-accounts unrelated-list">
            {UNRELATED.map((a) => (
              <AccountItem key={a.name} a={a} />
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-title">
        <div className="section-head">
          <h2 id="compare-title">예상과 결과 대조</h2>
          <span className="unit">결과는 팀 중간보고서 기준(예비 관찰)</span>
        </div>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">계정</th>
                <th scope="col">단계</th>
                <th scope="col">예상</th>
                <th scope="col">결과</th>
                <th scope="col">판정</th>
              </tr>
            </thead>
            <tbody>
              {compared.map((a) => (
                <tr key={a.name}>
                  <th scope="row">{a.name}</th>
                  <td>{a.stage}</td>
                  <td>{a.expected}</td>
                  <td>{a.observed ?? '검정 안 함'}</td>
                  <td>
                    <span className={`timing-mark timing-${a.result}`}>{RESULT_LABEL[a.result]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </section>

      <section className="section" aria-labelledby="rule-link-title">
        <div className="section-head">
          <h2 id="rule-link-title">이 월보의 규칙과의 관계</h2>
        </div>
        <div className="prose timing-prose">
          <p>
            이 월보의 참고 신호는 <strong>요구불예금 잔액(동행)</strong>과 <strong>운전자금대출(후행)</strong>을 씁니다. 잔액은 먼저
            나가는 출금과 늦게 들어오는 입금이 섞인 값이라 신호가 흐려지고, 대출은 수출보다 반년쯤 늦게 움직입니다. 실제 데이터에
            규칙을 적용했을 때 수출 거래처와 비수출 거래처에서 비슷한 비율로 켜진 것(근거와 한계 화면)과 같은 방향의 설명입니다.
          </p>
          <p>다음에 확인할 것은 이렇습니다.</p>
          <ul>
            <li>
              <strong>선행 계정 검정:</strong> 수입실적, 기업구매자금, 외상매출채권담보, 요구불 출금. 조기경보에 쓸 수 있는 것은
              이 계정들뿐인데 아직 검정하지 않았습니다.
            </li>
            <li>
              <strong>잔액을 입금과 출금으로 나누기:</strong> 출금이 먼저, 입금이 나중에 움직이는지 확인하면 잔액의 동행 반응을 설명할
              수 있습니다.
            </li>
            <li>
              <strong>선행 계정은 판정 방식이 다름:</strong> 선적 전에 움직이는 것이 정상이라, "충격 전에 반응하면 설계 실패"라는
              기존 점검을 그대로 쓰면 안 됩니다. 시차 회귀의 앞선 시차 계수로 보고, 위약검정으로 신뢰성을 확인합니다.
            </li>
            <li>
              <strong>예상 시차는 분석 전에 문서로 고정:</strong> 결과를 본 뒤 끼워 맞추는 해석이 아니라 가설 검정이 되도록 합니다.
            </li>
          </ul>
          <p className="detail-actions">
            <MonthLink to="/evidence">근거와 한계 보기</MonthLink>
          </p>
        </div>
      </section>

      <Footnotes
        notes={[
          'k는 지역 수출 전년동월비 대비 계정 반응의 시차(개월)입니다. 음수(선행)는 수출보다 먼저, 0(동행)은 같은 달, 양수(후행)는 늦게 움직인다는 뜻입니다.',
          '결과 칸은 팀 중간보고서의 시차 분석을 옮긴 것이며 이 화면에서 다시 계산하지 않았습니다. 판정은 예상 시차 범위와의 일치 여부만 뜻하고 통계적 유의성을 뜻하지 않습니다.',
          '시설자금처럼 12개월 넘게 늦게 움직이는 계정의 무반응은 "효과 없음"이 아니라 36개월 자료로는 "측정 불가"입니다.',
        ]}
        source={TIMING_SOURCE}
      />
    </>
  )
}
