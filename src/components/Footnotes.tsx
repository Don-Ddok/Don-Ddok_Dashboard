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
  '고객 이름과 계좌 금액은 모두 화면 시연을 위해 만든 가상 데이터입니다. 규칙이 작동하는 모습을 보이도록 만든 값이라 실제 데이터와 다릅니다(근거와 한계 화면 참고).'

export const REAL_NOTE =
  '내부 시연 모드: 고객과 계좌 금액은 실제 은행 법인 데이터(대구·경북 외환 거래 법인, 익명 법인ID 앞 8자리)입니다. 금액은 유효숫자 두 자리로 반올림돼 있습니다. 외부 공유·캡처 배포 금지.'

/** 고객 데이터에 대한 각주(가상 또는 실제) */
export function dataNote(kind: 'synthetic' | 'real') {
  return kind === 'real' ? REAL_NOTE : SYNTHETIC_NOTE
}

/** 고객 데이터 출처 */
export function firmSource(kind: 'synthetic' | 'real') {
  return kind === 'real' ? 'iM뱅크 교육용 법인 익명데이터(내부 시연 전용)' : '가상 고객 데이터'
}

export const EXPORT_SOURCE = '관세청 수출입무역통계(한국무역협회 K-stat, 지역별 수출입)'
