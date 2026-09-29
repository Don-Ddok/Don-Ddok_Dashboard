import { useState, type CSSProperties } from 'react'
import { FIGURES, SECTIONS, type Tier } from '../data/analysis'
import { Footnotes } from '../components/Footnotes'
import { MonthLink } from '../lib/month'

const TIERS: { tier: Tier; label: string }[] = [
  { tier: 'mint', label: '완료 · 유지' },
  { tier: 'amber', label: '약한 증거' },
  { tier: 'blue', label: '부분 지지' },
  { tier: 'gray', label: '근거 없음' },
  { tier: 'orange', label: '주의 · 한계' },
]

const KEY_FACTS = [
  { v: '−0.231', l: '비슷한 고객끼리 비교한 반응 차이 β₃', s: '수출 10%p 하락당 대출 약 2.3%p', tier: 'amber' },
  { v: 'p 0.094', l: '회사·월 이중 클러스터', s: '약한 증거', tier: 'amber' },
  { v: '39%', l: '추정치 크기에서의 검정력', s: '"효과 없음"이 아니라 "확정 불가"', tier: 'orange' },
  { v: 'p 0.095', l: '수출이 꺾이기 전 6개월에도 같은 차이', s: '사전 추세 의심', tier: 'orange' },
] as const

export default function Analysis() {
  const [section, setSection] = useState<number | null>(null)
  const list = section === null ? FIGURES : FIGURES.filter((f) => f.section === section)
  return (
    <>
      <section className="lead" aria-labelledby="an-title">
        <p className="kicker">근거와 한계 · 여신 분석(파트 3 여신·업종 분석)</p>
        <h1 id="an-title">
          비슷한 고객끼리 비교하면, 수출이 나쁜 시기에 비노출 고객은 운전자금을 줄이고 수출입 고객은 유지합니다.{' '}
          <em className="figure down">다만 약한 증거</em>입니다.
        </h1>
        <p className="lead-note">
          ※ 대구·경북 법인 11,018곳, 2023.01~2025.12. 판정은 실행 전에 고정한 기준(6개월 · 매칭 1:3 · 회사·월 이중 클러스터)으로만
          했습니다. 인과가 아니라 관련성입니다. 신호 월보 규칙의 가정과 실제 데이터 점검은 옆 탭 <MonthLink to="/evidence">신호 규칙 점검</MonthLink>에, β₃·이중 클러스터 같은 말은{' '}
          <MonthLink to="/glossary">용어 사전</MonthLink>에 있습니다.
        </p>
      </section>

      <section className="section" aria-labelledby="an-facts">
        <div className="section-head">
          <h2 id="an-facts">숫자 네 개</h2>
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

      <section className="section" aria-labelledby="an-map">
        <div className="section-head">
          <h2 id="an-map">전체 지도</h2>
          <span className="unit">누르면 원본 크기로 열립니다</span>
        </div>
        <a className="an-overview" href="analysis/overview.png" target="_blank" rel="noopener">
          <img src="analysis/overview.png" alt="파트 3 분석 전체 지도: 준비, 핵심 비교, 세부 확인, 반론 점검, 새 질문, 실무 연결" loading="lazy" />
        </a>
      </section>

      <section className="section" aria-labelledby="an-list">
        <div className="section-head">
          <h2 id="an-list">분석별 그림 22장</h2>
          <ul className="an-legend" aria-label="판정 표시">
            {TIERS.map((t) => (
              <li key={t.tier}>
                <span className={`an-chip tier-${t.tier}`}>{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="an-filter" role="group" aria-label="구역 고르기">
          <button type="button" aria-pressed={section === null} onClick={() => setSection(null)}>
            전체 {FIGURES.length}
          </button>
          {SECTIONS.map((s, i) => (
            <button key={s} type="button" aria-pressed={section === i} onClick={() => setSection(i)}>
              {s} {FIGURES.filter((f) => f.section === i).length}
            </button>
          ))}
        </div>
        <ol className="an-cards">
          {list.map((f, i) => (
            <li key={f.no} className="an-card" style={{ '--i': i } as CSSProperties}>
              <div className="an-card-head">
                <span className="an-no">그림 {f.no}</span>
                <span className="an-tag">{f.tag}</span>
              </div>
              <h3>{f.title}</h3>
              <p className="an-q">{f.q}</p>
              <p className="an-verdict">
                {f.verdict.map((v) => (
                  <span key={v.label} className={`an-chip tier-${v.tier}`}>
                    {v.label}
                  </span>
                ))}
              </p>
              {f.note && <p className="an-note">{f.note}</p>}
              <a className="an-thumb" href={`analysis/${f.no}.png`} target="_blank" rel="noopener">
                <img src={`analysis/${f.no}.png`} alt={`그림 ${f.no} ${f.title}: 방법, 결과 그래프, 판정, 문제점`} loading="lazy" />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <Footnotes
        notes={[
          '그림의 수치는 모두 집계 결과이며 은행 원본과 법인 단위 값은 없습니다.',
          '분석 코드와 문서는 GitHub Don-Ddok_Data, Don-Ddok_Docs 저장소에 있습니다.',
        ]}
        source="iM뱅크 교육용 법인 익명데이터(분석자 로컬에서 집계), 관세청 수출입무역통계, 한국은행 ECOS, KOSIS"
      />
    </>
  )
}
