import { MonthLink, useMonth } from '../lib/month'
import { TableWrap } from '../components/TableWrap'
import { COMBOS, criterionMark, type Combo } from '../data/combos'

/**
 * 연구 결과의 핵심 숫자. 파트 3 여신·업종 분석(매칭 1:3, 6개월, 법인·월 이중 클러스터)에서 검증한 값만 적는다.
 * 원자료(은행 법인 데이터)는 공개하지 않고, 요약 수치만 옮긴다.
 */
const KEY_FIGURES = [
  {
    value: '2.3%',
    label: '대출 변화의 차이',
    note: '지역 수출이 10%p 줄 때 6개월 동안, 비슷한 비수출 회사는 운전자금 대출을 1.9% 줄이고 수출 회사는 거의 그대로(+0.4%)였습니다.',
  },
  {
    value: '24/24',
    label: '같은 방향이 나온 계산',
    note: '짝짓는 방식과 추정 방법을 바꾼 24가지 계산이 모두 같은 방향이었습니다. 5% 기준으로 유의한 것은 0개입니다.',
  },
  {
    value: '0.094',
    label: 'p값(작을수록 믿을 만함)',
    note: '차이가 없어도 이만한 차이가 우연히 나올 수 있는 정도를 나타냅니다. 미리 정한 기준에서 0.05~0.10 구간이라 "약한 증거"입니다.',
  },
  {
    value: '39%',
    label: '검정력',
    note: '이 데이터 크기로 2.3% 크기의 차이를 잡아낼 확률입니다. 확실히 잡으려면 차이가 4.0%는 돼야 합니다. "효과 없음"이 아니라 "확정 불가"입니다.',
  },
]

/** 할인어음 조합의 실제 데이터 점검(2026-09-27, 실행 전에 조건과 통과 기준을 고정). 요약 수치만 옮긴다 */
const BILL_FIGURES = [
  {
    value: '1.27배',
    label: '수출 고객이 더 자주 켜진 정도',
    note: '수출이 줄어든 달에 할인어음을 쓰는 수출 고객은 14.4%, 비수출 고객은 11.3%에서 켜졌습니다. 미리 정한 기준(1.5배)에 못 미칩니다.',
  },
  {
    value: '+6.5%p',
    label: '수출 경기에 따른 차이',
    note: '수출 고객이 비수출보다 더 켜지는 정도가 수출이 줄어든 달에 늘어난 달보다 6.5%p 컸습니다(95% 구간 +2.2~+11.6, 고객 단위로 500번 다시 뽑아 계산).',
  },
  {
    value: '57곳',
    label: '할인어음을 쓰는 수출 법인',
    note: '할인어음을 한 번이라도 쓴 법인 363곳 가운데 수출 법인은 57곳뿐이라, 결과가 몇 곳에 따라 흔들릴 수 있습니다.',
  },
  {
    value: '0/2',
    label: '같은 달(1개월) 기준 통과',
    note: '같은 조건을 1개월 변화로 보면 두 기준 모두 통과하지 못했습니다. "같은 달에 바로 알 수 있다"고 말할 근거는 없습니다.',
  },
]

/** 증거의 세기 눈금에서 이 연구의 위치: 약한 증거 구간(0.05~0.10) 안, p=0.094 */
const P_VALUE = 0.094
const WEAK_POSITION = ((0.1 - P_VALUE) / (0.1 - 0.05)) * (100 / 3) + 100 / 3

export function Evidence() {
  const { combo } = useMonth()
  const C = COMBOS[combo]
  const figures = combo === 'bill' ? BILL_FIGURES : KEY_FIGURES
  return (
    <div className="evidence">
      <section className="lead" aria-labelledby="ev-title">
        <p className="kicker">근거와 한계 · {C.name}</p>
        <h1 id="ev-title">이 월보가 기대는 근거와 한계</h1>
        <p>
          이 화면은 대구·경북 수출 경기와 은행 거래의 관계를 살펴본 통계 프로젝트를 실무 화면으로 옮겨 본 프로토타입입니다. 지금
          보는 신호 조합(<strong>{C.name}</strong>)이 어디까지 믿을 만한지 먼저 적어 둡니다.
        </p>
      </section>

      <article className="prose">
        {combo === 'bill' ? <BillBasis /> : <LoanBasis />}

        <h2>실제 데이터로 점검한 결과</h2>
        <p>
          같은 규칙을 실제 은행 법인 데이터에 적용해, 수출 충격을 받은 고객을 가려내는지 확인했습니다. 판정은{' '}
          <strong>{C.verdict}</strong>입니다.
        </p>
        <CheckTable combo={C} />
        {combo === 'bill' ? (
          <p>
            수출 고객에서는 이 조합이 수출 경기에 따라 켜지고 꺼지는 경향이 있어, 잔고 하나만 보는 것보다는 나은 출발점입니다.
            다만 비수출 고객에서도 자주 켜져 개별 고객을 가려내려면 조건이 더 필요합니다. 조건을 더 붙이는 것도 결과를 보며
            고르면 과적합이 되므로, 설계를 먼저 고정하고 점검해야 합니다.
          </p>
        ) : (
          <p>
            신호가 너무 자주 켜지고 비수출 고객에서도 비슷하게 나타나, 이 문턱 그대로는 수출 충격을 받은 고객을 가려내지
            못했습니다. 규칙이 쓰는 통장 잔고가 수출과 같은 달에 움직이는 계정이라 신호가 흐려지는 것으로 보이며(계정 시차 화면),
            실무에 쓰려면 먼저 움직이는 계정으로 조건을 다시 설계하고 사후 결과로 검증해야 합니다.
          </p>
        )}

        <h2>한계</h2>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">한계</th>
                <th scope="col">이 화면에서 뜻하는 것</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{combo === 'bill' ? '부분 지지' : '약한 증거'}</th>
                <td>표시된 고객은 위험 판정이 아니라 먼저 연락해 볼 순서를 정하는 참고입니다.</td>
              </tr>
              {combo === 'bill' && (
                <>
                  <tr>
                    <th scope="row">기계적 연결</th>
                    <td>
                      수출대금은 요구불계좌로 들어오므로, 수출이 줄면 잔고가 줄어드는 것은 자금 압박이 아니어도 일어납니다. 이
                      점검은 둘을 가르지 못합니다.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">적은 고객</th>
                    <td>할인어음을 쓰는 수출 법인이 57곳뿐이라, 결과가 몇몇 고객에 따라 달라질 수 있습니다.</td>
                  </tr>
                </>
              )}
              <tr>
                <th scope="row">원인은 모름</th>
                <td>수출 여부는 회사가 스스로 고른 것이라 실험처럼 깨끗하게 비교할 수 없습니다. 관련성만 말합니다.</td>
              </tr>
              <tr>
                <th scope="row">은행 한 곳의 데이터</th>
                <td>
                  {combo === 'bill'
                    ? '할인어음이 늘어난 이유가 자금이 급해서인지, 거래 상대에게서 어음을 더 받아서인지 구분할 수 없습니다.'
                    : '대출이 줄어든 이유가 은행의 한도 조정인지, 회사가 덜 빌린 것인지 구분할 수 없습니다.'}
                </td>
              </tr>
              <tr>
                <th scope="row">반올림된 금액</th>
                <td>금액이 두세 자리로 반올림돼 작은 변화는 보이지 않고, 대출은 몇 달씩 같은 값이 이어집니다.</td>
              </tr>
              <tr>
                <th scope="row">가상 고객</th>
                <td>이 프로토타입의 고객과 계좌 금액은 모두 가상입니다. 실제 은행 데이터는 외부에 공개할 수 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </TableWrap>

        <h2>데이터 출처</h2>
        <ul>
          <li>
            대구·경북 월별 수출액과 전년동월비: 관세청 수출입무역통계, 한국무역협회 K-stat 지역별 수출입(전체 품목). 원자료와
            대조해 확인했습니다.
          </li>
          <li>고객 80곳의 계좌 흐름: 화면 시연을 위해 만든 가상 데이터입니다. 연구 결과의 근거로 쓰지 않습니다.</li>
        </ul>

        <h2>가상 데이터에 넣은 가정</h2>
        <p>
          가상 고객은 규칙이 작동하는 모습을 보이도록 만들었습니다. 그래서 이 화면에서 규칙이 수출 고객을 잘 골라내는 것처럼
          보이는 것은 데이터를 그렇게 만들었기 때문이며, 실제 데이터에서는 그렇지 않았습니다.
        </p>
        <TableWrap>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">가정</th>
                <th scope="col">근거</th>
                <th scope="col">검정 여부</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">수출이 줄 때 비수출 회사는 대출을 줄이고, 수출 회사는 유지</th>
                <td>파트 3 매칭 비교</td>
                <td>방향만 검정됨(약한 증거, p=0.094). 반응 크기는 임의로 정함</td>
              </tr>
              <tr>
                <th scope="row">수출이 줄 때 수출 회사의 통장 잔고가 비수출 회사보다 크게 줄어듦</th>
                <td>팀 중간보고서의 요구불예금 반응(예비 관찰)을 바탕으로 한 가정</td>
                <td>
                  <strong>검정 안 함.</strong> 실제 데이터에서는 수출이 줄어든 달의 잔고 감소 비율이 수출·비수출 고객 사이에
                  거의 같아 확인되지 않았습니다
                </td>
              </tr>
              <tr>
                <th scope="row">수출이 줄 때 수출 회사가 어음 할인을 더 자주, 더 많이 함(할인어음 잔액 증가)</th>
                <td>
                  팀 시차 분석의 할인어음 반응(같은 달, 예비 관찰)을 바탕으로 한 가정. 수출 고객의 70%, 비수출 고객의 35%가
                  할인어음을 쓴다고 둠(실제보다 훨씬 많게, 화면 연출용)
                </td>
                <td>
                  <strong>검정 안 함.</strong> 실제 데이터에서 조합으로는 부분 지지(수출 경기와 함께 움직임은 확인, 비수출
                  고객과 가려내는 힘은 기준 미달). 파트 3 세부 항목 분석에서 할인어음 단독의 수출·비수출 차이는 근거가
                  없었습니다
                </td>
              </tr>
              <tr>
                <th scope="row">잔고 흔들림 크기, 첫 화면 기준월</th>
                <td>사례가 적당히 보이도록 맞춤</td>
                <td>해당 없음(화면 연출)</td>
              </tr>
            </tbody>
          </table>
        </TableWrap>

        <h2>만든 사람들</h2>
        <p>
          돈독(Don-Ddok) 팀, iM DiGital Banker Academy 9기 통계 프로젝트(2026년 9~10월). 교육 과정의 결과물이며 iM뱅크의 공식
          입장이 아닙니다. 코드와 문서는{' '}
          <a href="https://github.com/Don-Ddok" target="_blank" rel="noreferrer">
            GitHub의 Don-Ddok
          </a>
          에 있습니다.
        </p>
        <p className="detail-actions">
          <MonthLink to="/bulletin">신호 월보로 돌아가기</MonthLink>
        </p>
      </article>

      <aside className="key-figures" aria-labelledby="kf-title">
        <h2 id="kf-title">{combo === 'bill' ? '숫자로 본 조합 점검' : '숫자로 본 연구 결과'}</h2>
        <dl>
          {figures.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd className="kf-value">{f.value}</dd>
              <dd className="kf-note">{f.note}</dd>
            </div>
          ))}
        </dl>
        <p className="kf-source">
          {combo === 'bill'
            ? '자료: 돈독 팀 조합 신호 점검(은행 법인 익명 데이터, 대구·경북, 금융·보험업 제외, 할인어음을 쓴 법인, 3개월 기준, 2026-09-27 실행 전 설계 고정). 원자료는 공개하지 않고 요약 수치만 옮겼습니다.'
            : '자료: 돈독 팀 여신·업종 분석(은행 법인 익명 데이터, 대구·경북, 비슷한 회사 1:3 짝짓기). 원자료는 공개하지 않고 요약 수치만 옮겼습니다.'}
        </p>
      </aside>
    </div>
  )
}

/** 운전자금 조합의 근거: 파트 3 매칭 비교 */
function LoanBasis() {
  return (
    <>
      <h2>무엇을 연구했나</h2>
      <p>
        대구·경북 수출이 1년 전보다 줄어든 달에, 수출입을 하는 회사와 비슷한 조건의 수출입을 하지 않는 회사가 은행에서
        운전자금(회사 운영에 쓰는 돈)을 빌리는 모습이 다르게 움직이는지 비교했습니다. 크기, 업종, 신용 등급, 은행과 거래한 기간이
        비슷한 회사끼리 짝을 지어 비교했습니다.
      </p>

      <h2>무엇을 발견했나</h2>
      <ul>
        <li>
          수출이 꺾일 때 비슷한 비수출 회사는 운전자금 대출을 줄이는 반면, 수출 회사는 줄이지 않고 유지하는 경향이 보였습니다.
        </li>
        <li>이 방향은 짝짓는 방식을 바꾸거나 다른 추정 방법을 써도 매번 같게 나왔습니다.</li>
        <li>환율 변화나 회사 크기로는 설명되지 않았습니다.</li>
        <li>
          다만 차이가 작아 <strong>통계적으로는 약한 증거</strong>입니다. 효과가 없다는 뜻이 아니라, 보유한 데이터로는 확정할 수
          없는 크기라는 뜻입니다.
        </li>
        <li>대출을 종류별로 쪼개거나, 업종 경기의 좋고 나쁨으로 나눠 보면 신호가 보이지 않았습니다.</li>
      </ul>

      <figure className="meter" aria-labelledby="meter-title">
        <figcaption id="meter-title">
          증거의 세기 <span>분석 전에 정해 둔 기준으로 판정</span>
        </figcaption>
        <div className="meter-scale" role="img" aria-label={`증거의 세기: 약한 증거 구간, p값 ${P_VALUE}`}>
          <div className="meter-band none">
            <span className="meter-name">근거 없음</span>
            <span className="meter-range">p 0.10 이상</span>
          </div>
          <div className="meter-band weak">
            <span className="meter-name">약한 증거</span>
            <span className="meter-range">p 0.05~0.10</span>
          </div>
          <div className="meter-band strong">
            <span className="meter-name">유의</span>
            <span className="meter-range">p 0.05 미만</span>
          </div>
          <div className="meter-marker" style={{ left: `${WEAK_POSITION}%` }} aria-hidden="true">
            <span>이 연구 p={P_VALUE}</span>
          </div>
        </div>
      </figure>

      <h2>이 화면의 규칙</h2>
      <p>
        연구에서 본 경향을 거꾸로 읽어, 수출 고객이 지역 수출이 줄어든 달에 통장 잔고는 빠지는데 대출은 줄이지 않고 있으면
        &lsquo;살펴볼 고객&rsquo;으로 모읍니다. 세 조건과 문턱(잔고 3개월 10% 감소, 대출 6개월 5% 이상 감소하지 않음)은 설명하기
        쉽게 정한 값입니다.
      </p>
    </>
  )
}

/** 할인어음 조합의 근거: 팀 시차 분석에서 제안된 조합 */
function BillBasis() {
  return (
    <>
      <h2>이 조합은 어디서 왔나</h2>
      <p>
        팀 시차 분석에서 요구불예금 잔액과 할인어음이 모두 수출과 같은 달에 움직였습니다(예비 관찰). 할인어음은 대금을 받은 뒤에
        움직일 것으로 예상했는데(1~3개월 뒤) 예상보다 빨랐습니다. 팀은 이 둘을 묶어 &lsquo;통장 잔고가 빠지면서 받을어음을 미리
        현금으로 바꾸는 회사&rsquo;를 수출 충격의 동행 신호로 제안했습니다.
      </p>
      <ul>
        <li>대출(6개월 뒤 반응)보다 반년 빨리 볼 수 있다는 것이 운전자금 조합과의 차이입니다.</li>
        <li>
          다만 수출보다 <strong>먼저</strong> 움직이는 계정은 아닙니다. 수출과 같은 달에 움직이므로 조기경보가 아니라 &lsquo;빨리
          알아채는 신호&rsquo;입니다.
        </li>
        <li>
          파트 3에서 할인어음 하나만 떼어 수출 회사와 비슷한 비수출 회사를 비교했을 때는 차이의 근거가 없었습니다. 조합으로 보면
          달라지는지는 아래 점검으로 확인했습니다.
        </li>
      </ul>

      <h2>이 화면의 규칙</h2>
      <p>
        할인어음을 쓰는 수출 고객이 지역 수출이 줄어든 달에 통장 잔고는 3개월 동안 10% 넘게 빠지고, 할인어음 잔액은 3개월 전보다
        늘었으면 &lsquo;살펴볼 고객&rsquo;으로 모읍니다. 조건과 문턱은 실제 데이터 점검과 같게 맞췄고, 점검 전에 정해 둔 값입니다.
      </p>
    </>
  )
}

/** 사전 기준별 점검 결과표 */
function CheckTable({ combo }: { combo: Combo }) {
  return (
    <>
      <TableWrap>
        <table className="stat-table check-table">
          <thead>
            <tr>
              <th scope="col">확인한 것</th>
              <th scope="col">결과</th>
              <th scope="col">판정</th>
            </tr>
          </thead>
          <tbody>
            {combo.checks.map((k) => (
              <tr key={k.label}>
                <th scope="row">{k.label}</th>
                <td>{k.result}</td>
                <td>
                  <span className="check-mark" data-passed={k.passed}>
                    {criterionMark(k)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      {combo.checks.some((k) => !k.preset) && (
        <p className="table-note">
          통과 기준을 점검 전에 정해 두지 않았기 때문에 &lsquo;미달&rsquo;이 아니라 &lsquo;문제 있음&rsquo;으로 적었습니다.
        </p>
      )}
    </>
  )
}
