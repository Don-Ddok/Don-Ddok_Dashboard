import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { numText, STAGE_OF, useCampaign, ymText } from '../data/campaign'
import { MonthLink, useMonth } from '../lib/month'

const CHARACTERS = [
  { src: 'characters/dandi.webp', name: '단디', w: 526 },
  { src: 'characters/ttokdi.webp', name: '똑디', w: 453 },
  { src: 'characters/udi.webp', name: '우디', w: 553 },
]

const ENTRIES = [
  {
    to: '/campaign',
    step: '언제 · 누구에게 · 무엇을',
    title: '이번 달 캠페인',
    body: '수출 둔화 단계에 맞춰 업종 → 페르소나 → 추천 상품 순서로 캠페인 대상을 고릅니다.',
    note: '교육용 법인 익명데이터 집계',
  },
  {
    to: '/bulletin',
    step: '먼저 연락할 곳',
    title: '신호 월보',
    body: '예금·대출 계좌 흐름으로 이번 달 먼저 연락해 볼 고객을 추립니다. 계정 시차로 신호 조합을 고릅니다.',
    note: '가상 고객 데이터로 시연',
  },
  {
    to: '/analysis',
    step: '왜 이 시점, 왜 이 고객',
    title: '근거와 한계',
    body: '비슷한 고객끼리 비교한 여신 분석 22장을 방법·결과·판정·한계와 함께 봅니다.',
    note: '약한 증거 · 사전 추세 의심까지 공개',
  },
]

function Summary() {
  const loaded = useCampaign()
  const { search } = useMonth()
  if (loaded.status !== 'ready') return <p className="home-summary-wait">이번 달 요약을 불러오는 중입니다.</p>
  const { data } = loaded
  const ym = data.meta.기본월
  const regions = Object.keys(data.지역).sort()
  return (
    <div className="home-summary" aria-label={`${ymText(ym)} 지역별 단계`}>
      <p className="home-summary-title">{ymText(ym)} 기준</p>
      <ul>
        {regions.map((r) => {
          const rm = data.지역[r][ym]
          const s = STAGE_OF[rm.단계]
          return (
            <li key={r}>
              <Link to={{ pathname: '/campaign', search: `${search}${search ? '&' : '?'}r=${encodeURIComponent(r)}` }} className="home-summary-row">
                <span className="home-region">{r}</span>
                <span className="cp-stage-chip" style={{ background: s.color, color: s.dark ? '#fff' : 'var(--ink)' }}>
                  {rm.단계}
                </span>
                <span className="home-count">
                  외환노출 고객 <strong>{numText(rm.요약.노출법인)}곳</strong>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="kicker home-kicker">돈독 · 법인 고객 마케팅 월보</p>
          <h1 id="home-title">
            수출이 꺾이는 달,
            <br />
            어떤 법인 고객에게 <span className="home-accent">무엇을 먼저</span> 제안할까요?
          </h1>
          <p className="home-lede">
            대구·경북 법인 36개월 은행 기록과 지역 수출 통계를 엮어, 수출 경기의 단계에 맞는 캠페인 대상과 상품을 고릅니다.
          </p>
          <Summary />
          <p className="home-cta">
            <MonthLink to="/campaign" className="home-cta-main">
              이번 달 캠페인 보기 <ArrowRight size={16} weight="bold" />
            </MonthLink>
            <MonthLink to="/analysis" className="home-cta-sub">
              근거부터 보기
            </MonthLink>
          </p>
        </div>
        <div className="home-parade" aria-hidden="true">
          {CHARACTERS.map((c, i) => (
            <div key={c.name} className="walker" style={{ '--i': i } as CSSProperties}>
              <div className="bob">
                <img src={c.src} alt="" width={c.w} height={640} />
              </div>
              <span className="walker-shadow" />
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-entries">
        <div className="section-head">
          <h2 id="home-entries">세 가지 화면</h2>
          <span className="unit">언제 → 누구에게 → 무엇을 → 왜</span>
        </div>
        <div className="home-entries">
          {ENTRIES.map((e, i) => (
            <MonthLink key={e.to} to={e.to} className="home-entry" style={{ '--i': i } as CSSProperties}>
              <span className="home-entry-step">{e.step}</span>
              <span className="home-entry-title">
                {e.title} <ArrowRight size={16} weight="bold" />
              </span>
              <span className="home-entry-body">{e.body}</span>
              <span className="home-entry-note">{e.note}</span>
            </MonthLink>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-read">
        <div className="section-head">
          <h2 id="home-read">읽을 때 주의</h2>
        </div>
        <ul className="home-cautions">
          <li>
            <strong>참고 신호입니다.</strong> 위험 판정이나 예측이 아니라, 캠페인 대상과 연락 순서를 정하는 참고 자료입니다.
          </li>
          <li>
            <strong>근거는 약한 증거입니다.</strong> 비슷한 고객끼리 비교하면 수출이 나쁜 시기에 비노출 고객은 운전자금을 줄이고
            수출입 고객은 유지하는 경향이 보이지만(p=0.094), 수출이 꺾이기 전에도 비슷한 차이가 있어 시간 순서는 확정하지 않았습니다.
          </li>
          <li>
            <strong>제안 메시지와 상품 순위는 설계값(초안)입니다.</strong> 금리·한도·판매 여부는 iM뱅크 상품몰에서 다시 확인합니다.
          </li>
        </ul>
      </section>
    </>
  )
}
