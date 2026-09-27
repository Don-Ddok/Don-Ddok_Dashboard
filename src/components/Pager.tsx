import { CaretLeft, CaretRight } from '@phosphor-icons/react'

/** 보여 줄 쪽 번호: 처음·끝과 현재 쪽 앞뒤 한 쪽씩, 사이는 줄임표 */
function pageList(current: number, count: number): (number | null)[] {
  const keep = new Set([0, count - 1, current - 1, current, current + 1])
  const out: (number | null)[] = []
  for (let i = 0; i < count; i++) {
    if (keep.has(i)) out.push(i)
    else if (out[out.length - 1] !== null) out.push(null)
  }
  return out
}

/**
 * 표 아래 쪽 넘김. 한 쪽뿐이면 그리지 않는다.
 * page는 0부터 센다.
 */
export function Pager({
  page,
  pageSize,
  total,
  unit = '곳',
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  unit?: string
  onChange: (page: number) => void
}) {
  const count = Math.ceil(total / pageSize)
  if (count <= 1) return null
  const from = page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)
  return (
    <nav className="pager" aria-label="쪽 넘기기">
      <span className="pager-range">
        {from.toLocaleString('ko-KR')}–{to.toLocaleString('ko-KR')} / {total.toLocaleString('ko-KR')}
        {unit}
      </span>
      <div className="pager-buttons">
        <button
          type="button"
          className="icon-button"
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          aria-label="이전 쪽"
        >
          <CaretLeft size={14} weight="bold" />
        </button>
        {pageList(page, count).map((p, i) =>
          p === null ? (
            <span key={`gap${i}`} className="pager-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className="pager-page"
              aria-current={p === page ? 'page' : undefined}
              aria-label={`${p + 1}쪽`}
              onClick={() => onChange(p)}
            >
              {p + 1}
            </button>
          ),
        )}
        <button
          type="button"
          className="icon-button"
          onClick={() => onChange(page + 1)}
          disabled={page >= count - 1}
          aria-label="다음 쪽"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    </nav>
  )
}
