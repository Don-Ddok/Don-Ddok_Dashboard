import { MonthLink } from '../lib/month'
import { TableWrap } from '../components/TableWrap'

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

/** 증거의 세기 눈금에서 이 연구의 위치: 약한 증거 구간(0.05~0.10) 안, p=0.094 */
const P_VALUE = 0.094
const WEAK_POSITION = ((0.1 - P_VALUE) / (0.1 - 0.05)) * (100 / 3) + 100 / 3

export function Evidence() {
  return (
    <div className="evidence">
      <section className="lead" aria-labelledby="ev-title">
        <p className="kicker">근거와 한계</p>
        <h1 id="ev-title">이 월보가 기대는 근거와 한계</h1>
        <p>
          이 화면은 대구·경북 수출 경기와 은행 거래의 관계를 살펴본 통계 프로젝트를 실무 화면으로 옮겨 본 프로토타입입니다. 어디까지
          믿어도 되는지 먼저 적어 둡니다.
        </p>
      </section>

      <article className="prose">
        <h2>무엇을 연구했나</h2>
        <p>
          대구·경북 수출이 1년 전보다 줄어든 달에, 수출입을 하는 회사와 비슷한 조건의 수출입을 하지 않는 회사가 은행에서 운전자금(회사
          운영에 쓰는 돈)을 빌리는 모습이 다르게 움직이는지 비교했습니다. 크기, 업종, 신용 등급, 은행과 거래한 기간이 비슷한 회사끼리
          짝을 지어 비교했습니다.
        </p>

        <h2>무엇을 발견했나</h2>
        <ul>
          <li>수출이 꺾일 때 비슷한 비수출 회사는 운전자금 대출을 줄이는 반면, 수출 회사는 줄이지 않고 유지하는 경향이 보였습니다.</li>
          <li>이 방향은 짝짓는 방식을 바꾸거나 다른 추정 방법을 써도 매번 같게 나왔습니다.</li>
          <li>환율 변화나 회사 크기로는 설명되지 않았습니다.</li>
          <li>
            다만 차이가 작아 <strong>통계적으로는 약한 증거</strong>입니다. 효과가 없다는 뜻이 아니라, 보유한 데이터로는 확정할 수 없는
            크기라는 뜻입니다.
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
          연구에서 본 경향을 거꾸로 읽어, 수출 거래처가 지역 수출이 줄어든 달에 통장 잔고는 빠지는데 대출은 줄이지 않고 있으면
          &lsquo;살펴볼 거래처&rsquo;로 모읍니다. 세 조건과 문턱(잔고 3개월 10% 감소, 대출 6개월 5% 이상 감소하지 않음)은 설명하기
          쉽게 정한 값이며, 실제 데이터로 적중률을 검증하지 않았습니다.
        </p>
        <p>
          같은 규칙을 실제 데이터에 적용해 점검해 보니 신호가 너무 자주 켜지고 비수출 거래처에서도 비슷하게 나타나, 이 문턱 그대로는
          수출 충격을 받은 거래처를 가려내지 못했습니다. 규칙이 쓰는 통장 잔고가 수출과 같은 달에 움직이는 계정이라 신호가 흐려지는
          것으로 보이며(계정 시차 화면), 실무에 쓰려면 먼저 움직이는 계정으로 조건을 다시 설계하고 사후 결과로 검증해야 합니다.
        </p>

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
                <th scope="row">약한 증거</th>
                <td>표시된 거래처는 위험 판정이 아니라 먼저 연락해 볼 순서를 정하는 참고입니다.</td>
              </tr>
              <tr>
                <th scope="row">원인은 모름</th>
                <td>수출 여부는 회사가 스스로 고른 것이라 실험처럼 깨끗하게 비교할 수 없습니다. 관련성만 말합니다.</td>
              </tr>
              <tr>
                <th scope="row">은행 한 곳의 데이터</th>
                <td>대출이 줄어든 이유가 은행의 한도 조정인지, 회사가 덜 빌린 것인지 구분할 수 없습니다.</td>
              </tr>
              <tr>
                <th scope="row">반올림된 금액</th>
                <td>금액이 두세 자리로 반올림돼 작은 변화는 보이지 않고, 대출은 몇 달씩 같은 값이 이어집니다.</td>
              </tr>
              <tr>
                <th scope="row">가상 거래처</th>
                <td>이 프로토타입의 거래처와 계좌 금액은 모두 가상입니다. 실제 은행 데이터는 외부에 공개할 수 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </TableWrap>

        <h2>데이터 출처</h2>
        <ul>
          <li>대구·경북 월별 수출액과 전년동월비: 관세청 수출입무역통계, 한국무역협회 K-stat 지역별 수출입(전체 품목). 원자료와 대조해 확인했습니다.</li>
          <li>거래처 80곳의 계좌 흐름: 연구에서 관찰된 방향을 단순화해 넣은 가상 데이터입니다. 연구 결과의 근거로 쓰지 않습니다.</li>
        </ul>

        <h2>만든 사람들</h2>
        <p>
          돈독(Don-Ddok) 팀, iM DiGital Banker Academy 9기 통계 프로젝트(2026년 9~10월). 교육 과정의 결과물이며 iM뱅크의 공식 입장이
          아닙니다. 코드와 문서는{' '}
          <a href="https://github.com/Don-Ddok" target="_blank" rel="noreferrer">
            GitHub의 Don-Ddok
          </a>
          에 있습니다.
        </p>
        <p className="detail-actions">
          <MonthLink to="/">월보로 돌아가기</MonthLink>
        </p>
      </article>

      <aside className="key-figures" aria-labelledby="kf-title">
        <h2 id="kf-title">숫자로 본 연구 결과</h2>
        <dl>
          {KEY_FIGURES.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd className="kf-value">{f.value}</dd>
              <dd className="kf-note">{f.note}</dd>
            </div>
          ))}
        </dl>
        <p className="kf-source">
          자료: 돈독 팀 여신·업종 분석(은행 법인 익명 데이터, 대구·경북, 비슷한 회사 1:3 짝짓기). 원자료는 공개하지 않고 요약 수치만
          옮겼습니다.
        </p>
      </aside>
    </div>
  )
}
