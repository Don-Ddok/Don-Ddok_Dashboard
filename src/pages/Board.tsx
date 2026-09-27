import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { BOARD, TOPICS, type TopicKey } from '../data/board'

/** giscus 글타래를 붙인다. 주제가 바뀌면 key로 새로 그린다 */
function Giscus({ term }: { term: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    const attrs: Record<string, string> = {
      'data-repo': BOARD.repo,
      'data-repo-id': BOARD.repoId,
      'data-category': BOARD.category,
      'data-category-id': BOARD.categoryId,
      'data-mapping': 'specific',
      'data-term': term,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': 'light',
      'data-lang': 'ko',
      'data-loading': 'lazy',
    }
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    host.appendChild(s)
    return () => {
      host.innerHTML = ''
    }
  }, [term])
  return <div ref={ref} className="giscus-host" />
}

export function Board() {
  const [topic, setTopic] = useState<TopicKey>('free')
  const current = TOPICS.find((t) => t.key === topic) ?? TOPICS[0]
  const ready = (BOARD.categoryId as string) !== ''

  return (
    <>
      <section className="lead lead-wide" aria-labelledby="board-title">
        <h1 id="board-title">팀 게시판</h1>
        <p>
          돈독 팀원이 의견과 질문을 남기는 곳입니다. GitHub 계정으로 로그인해 글을 쓰고, 글은 대시보드 저장소의 Discussions에
          저장됩니다.
        </p>
        <p className="board-warning" role="note">
          <strong>공개 게시판입니다.</strong> 누구나 읽을 수 있습니다. 은행 제공 데이터, 거래처별 수치, 내부 시연 화면 캡처는 올리지
          마세요.
        </p>
      </section>

      <section aria-labelledby="topic-title">
        <div className="section-head">
          <h2 id="topic-title">{current.label}</h2>
          <a className="board-link" href={BOARD.discussionsUrl} target="_blank" rel="noreferrer">
            GitHub에서 전체 글 보기 <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
          </a>
        </div>

        <div className="segmented board-topics" role="tablist" aria-label="게시판 주제">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === topic}
              aria-pressed={t.key === topic}
              onClick={() => setTopic(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="section-note">{current.hint}</p>

        {ready ? (
          <Giscus key={current.term} term={current.term} />
        ) : (
          <div className="empty-cell board-pending">
            <strong>게시판 연결 준비 중</strong>
            <p>저장소에서 Discussions를 켜고 giscus 앱을 설치하면 이 자리에 글쓰기 창이 열립니다.</p>
          </div>
        )}
      </section>
    </>
  )
}
