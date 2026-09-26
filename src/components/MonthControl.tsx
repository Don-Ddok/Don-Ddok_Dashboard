import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { MONTHS } from '../data/synthetic'
import { FIRST_JUDGED_INDEX, LAST_INDEX } from '../data/signals'
import { ymLong } from '../lib/format'
import { useMonth } from '../lib/month'

const OPTIONS = MONTHS.map((ym, i) => ({ ym, i })).filter((o) => o.i >= FIRST_JUDGED_INDEX)

export function MonthControl() {
  const { index, setIndex } = useMonth()
  return (
    <div className="month-control">
      <label htmlFor="month-select">기준월</label>
      <div className="month-control-row">
        <button
          type="button"
          className="icon-button"
          onClick={() => setIndex(index - 1)}
          disabled={index <= FIRST_JUDGED_INDEX}
          aria-label="이전 달"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <select id="month-select" value={index} onChange={(e) => setIndex(Number(e.target.value))}>
          {OPTIONS.map((o) => (
            <option key={o.ym} value={o.i}>
              {ymLong(o.ym)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-button"
          onClick={() => setIndex(index + 1)}
          disabled={index >= LAST_INDEX}
          aria-label="다음 달"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}
