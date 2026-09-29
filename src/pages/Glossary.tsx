import { useMemo, useState } from 'react'
import { CATEGORIES, TERMS, type Category } from '../data/glossary'
import { Footnotes } from '../components/Footnotes'

/** 검색어가 용어·다른 이름·정의 어디에든 들어 있으면 보여 준다(띄어쓰기는 무시) */
const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase()

export default function Glossary() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | null>(null)
  const list = useMemo(() => {
    const k = norm(q)
    return TERMS.filter(
      (t) =>
        (cat === null || t.cat === cat) &&
        (!k || [t.term, ...(t.aka ?? []), t.def, t.like ?? ''].some((s) => norm(s).includes(k))),
    )
  }, [q, cat])

  return (
    <>
      <section className="lead" aria-labelledby="gl-title">
        <p className="kicker">근거와 한계 · 용어 사전</p>
        <h1 id="gl-title">화면에 나오는 계정·고객 구분·지표·분석 용어 {TERMS.length}개를 쉬운 말로 풀었습니다.</h1>
        <p className="lead-note">
          ※ 수치는 파트 3 문서와 팀 매칭 모델 데이터에서 확인한 값만 적었습니다. <b>팀 확인 중</b> 표시는 세부 기준을 팀 문서로 아직
          확인하지 못한 설명입니다.
        </p>
      </section>

      <section className="section" aria-labelledby="gl-list">
        <div className="section-head">
          <h2 id="gl-list">용어 찾기</h2>
          <span className="unit">
            {list.length}개 / {TERMS.length}개
          </span>
        </div>
        <label className="gl-search">
          <span className="visually-hidden">용어 검색</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="예: 요구불, β₃, 적기, 페르소나"
            autoComplete="off"
          />
        </label>
        <div className="an-filter" role="group" aria-label="분류 고르기">
          <button type="button" aria-pressed={cat === null} onClick={() => setCat(null)}>
            전체
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c} {TERMS.filter((t) => t.cat === c).length}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="gl-empty">찾는 용어가 없습니다. 다른 말로 찾아보거나 분류를 "전체"로 바꿔 보세요.</p>
        ) : (
          CATEGORIES.filter((c) => list.some((t) => t.cat === c)).map((c) => (
            <div key={c} className="gl-group">
              <h3>{c}</h3>
              <dl className="gl-list">
                {list
                  .filter((t) => t.cat === c)
                  .map((t) => (
                    <div key={t.term} className="gl-item">
                      <dt>
                        {t.term}
                        {t.pending && <span className="gl-pending">팀 확인 중</span>}
                      </dt>
                      <dd>
                        <p>{t.def}</p>
                        {t.like && <p className="gl-like">{t.like}</p>}
                        {(t.where || t.aka) && (
                          <p className="gl-meta">
                            {t.where && <span>나오는 곳: {t.where}</span>}
                            {t.aka && <span>다른 이름: {t.aka.join(', ')}</span>}
                          </p>
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))
        )}
      </section>

      <Footnotes
        notes={[
          '파트 3에서 쓴 원본 열과 가공 변수의 정의는 Don-Ddok_Docs 파트 3 문서 04_데이터명세서.md에 있습니다.',
          '분석 방법의 자세한 식과 판정 기준은 여신 분석 22장과 Don-Ddok_Docs 파트 3 문서에 있습니다.',
        ]}
        source="파트 3 여신·업종 분석 문서, 팀 매칭 모델·인사이트 집계(public/data), 관세청·KOSIS·한국은행 ECOS"
      />
    </>
  )
}
