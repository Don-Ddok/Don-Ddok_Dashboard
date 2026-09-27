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

export const SIGNAL_RULE_NOTE =
  '참고 신호는 수출 거래처가 세 조건을 모두 충족할 때 표시합니다. 지역 수출이 1년 전 같은 달보다 줄었고, 통장 잔고가 3개월 전보다 10% 넘게 줄었으며, 운전자금 대출은 6개월 전보다 5% 넘게 줄지 않은 경우입니다.'

export const WEAK_EVIDENCE_NOTE =
  '이 규칙은 연구에서 관찰된 경향(통계적으로 약한 증거)을 바탕으로 만든 참고용입니다. 부실이나 위험을 판정하지 않습니다.'

export const SYNTHETIC_NOTE =
  '거래처 이름과 계좌 금액은 모두 화면 시연을 위해 만든 가상 데이터입니다. 규칙이 작동하는 모습을 보이도록 만든 값이라 실제 데이터와 다릅니다(근거와 한계 화면 참고).'

export const EXPORT_SOURCE = '관세청 수출입무역통계(한국무역협회 K-stat, 지역별 수출입), 가상 거래처 데이터'
