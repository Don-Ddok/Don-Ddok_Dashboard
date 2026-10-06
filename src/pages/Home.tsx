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
    to: '/recommend',
    step: '언제 · 누구에게 · 무엇을',
    title: '이번 달 추천',
    body: '수출 둔화 단계에 맞춰 업종 → 페르소나 → 추천 상품 순서로 제안 대상을 고릅니다.',
    note: '교육용 법인 익명데이터 집계',
  },
  {
    to: '/results',
    step: '왜 이 시점, 왜 이 고객',
    title: '분석 결과',
    body: '수출이 줄면 6개월 뒤 수출입 기업의 요구불예금이 3.6% 더 낮았습니다. 6개 지표 중 보정 후에도 유의한 것은 요구불 하나입니다.',
    note: '공통 사양 · Holm 보정 · 강건성 점검',
  },
  {
    to: '/pilot',
    step: '효과는 얼마인가',
    title: '효과 검증',
    body: '먼저 찾아간 상담이 요구불 잔액을 지키는지, 연락 그룹과 비연락 그룹을 무작위로 나눠 비교하는 파일럿 설계입니다.',
    note: '설계안 · 연체율 안전장치 포함',
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
              <Link to={{ pathname: '/recommend', search: `${search}${search ? '&' : '?'}r=${encodeURIComponent(r)}` }} className="home-summary-row">
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
          <p className="kicker home-kicker">돈독 · 착시를 걷어낸 은행 장부</p>
          <h1 id="home-title">
            수출이 꺾이는 달,
            <br />
            어떤 법인 고객에게 <span className="home-accent">무엇을 먼저</span> 제안할까요?
          </h1>
          <p className="home-lede">
            대구·경북 법인 36개월 은행 기록과 지역 수출 통계를 엮어, 수출 경기의 단계에 맞는 제안 대상과 상품을 고릅니다.
          </p>
          <Summary />
          <p className="home-cta">
            <MonthLink to="/recommend" className="home-cta-main">
              이번 달 추천 보기 <ArrowRight size={16} weight="bold" />
            </MonthLink>
            <MonthLink to="/results" className="home-cta-sub">
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
          <span className="unit">언제·누구에게·무엇을 → 왜 → 효과는</span>
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
            <strong>상담 후보 제안 도구입니다.</strong> 위험 판정이나 예측이 아니라, 제안 대상과 연락 순서를 정하는 참고 자료입니다. 상담 효과는 파일럿으로 검증합니다.
          </li>
          <li>
            <strong>근거는 요구불예금 하나입니다.</strong> 수출 증가율이 10%p 떨어지면 6개월 뒤 수출입 기업의 요구불예금이 비교 기업보다
            3.6% 낮았습니다(p 0.003, 다중검정 보정 후에도 유의). 인과가 아니라 지역 수출 경기와 함께 움직이는 관계입니다.
          </li>
          <li>
            <strong>둔화 판정은 공식 수출통계로 합니다.</strong> 은행 계좌 신호로는 둔화를 미리 알아채지 못했습니다(위약 검정 미통과).
            은행 데이터는 대상을 나누는 데만 씁니다.
          </li>
          <li>
            <strong>제안 메시지와 상품 순위는 설계값(초안)입니다.</strong> 금리·한도·판매 여부는 iM뱅크에서 다시 확인합니다.
          </li>
        </ul>
      </section>
    </>
  )
}
