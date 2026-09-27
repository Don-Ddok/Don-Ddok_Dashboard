const W = 96
const H = 24
const PAD = 2

/**
 * 표 안의 작은 흐름선. 앞부분은 옅게, 판정에 쓰는 마지막 구간(recent개월)은 감소 색으로 굵게 긋고
 * 끝점을 찍는다. 숫자는 옆 칸에 있으므로 화면 읽기 프로그램에는 숨긴다.
 */
export function Sparkline({ values, recent = 3 }: { values: number[]; recent?: number }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
    const y = PAD + (1 - (v - min) / span) * (H - PAD * 2)
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as const
  })
  const split = Math.max(0, pts.length - 1 - recent)
  const line = (list: (readonly [number, number])[]) => list.map(([x, y]) => `${x},${y}`).join(' ')
  const [ex, ey] = pts[pts.length - 1]

  return (
    <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" focusable="false">
      <polyline className="spark-base" points={line(pts.slice(0, split + 1))} />
      <polyline className="spark-recent" points={line(pts.slice(split))} />
      <circle className="spark-end" cx={ex} cy={ey} r={2.25} />
    </svg>
  )
}
