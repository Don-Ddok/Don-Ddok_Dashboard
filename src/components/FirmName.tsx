import type { Firm } from '../data/synthetic'
import { MonthLink } from '../lib/month'

/** 고객 이름(상세로 가는 링크). 가상 고객이면 뒤에 '(가상)'을 붙인다 */
export function FirmName({ firm, link = true }: { firm: Firm; link?: boolean }) {
  return (
    <>
      {link ? <MonthLink to={`/firms/${firm.id}`}>{firm.name}</MonthLink> : firm.name}
      {firm.synthetic && (
        <>
          {' '}
          <span className="synthetic">(가상)</span>
        </>
      )}
    </>
  )
}
