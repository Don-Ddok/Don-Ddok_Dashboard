import type { ReactNode } from 'react'

export function Footnotes({ notes, source }: { notes: ReactNode[]; source: ReactNode }) {
  return (
    <aside className="footnotes" aria-label="주석과 자료 출처">
      <p>주:</p>
      <ol>
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ol>
      <p className="source">자료: {source}</p>
    </aside>
  )
}

export const SYNTHETIC_NOTE =
  '거래처 이름과 계좌 금액은 모두 화면 시연을 위해 만든 가상 데이터입니다. 규칙이 작동하는 모습을 보이도록 만든 값이라 실제 데이터와 다릅니다(근거와 한계 화면 참고).'

export const EXPORT_SOURCE = '관세청 수출입무역통계(한국무역협회 K-stat, 지역별 수출입), 가상 거래처 데이터'
