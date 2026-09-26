import type { ExportPoint, Region } from '../data/regionExports'
import { pctPoint, ymShort } from '../lib/format'

/**
 * 전년동월비 막대. 증가는 채운 막대(기준선 위), 감소는 테두리만 있는 막대(기준선 아래).
 * 색이 아니라 모양과 위치로 방향을 읽을 수 있고, 값은 숫자로도 적는다.
 */
export function YoyBars({ region, points, currentYm }: { region: Region; points: ExportPoint[]; currentYm: number }) {
  const max = Math.max(10, ...points.map((p) => Math.abs(p.yoy ?? 0)))
  const summary = points.map((p) => `${ymShort(p.ym)} ${pctPoint(p.yoy)}`).join(', ')
  return (
    <figure>
      <figcaption>{region} 수출, 1년 전 같은 달 대비</figcaption>
      <div className="yoy-row" role="img" aria-label={`${region} 수출 전년동월비: ${summary}`}>
        {points.map((p) => {
          const v = p.yoy ?? 0
          const h = `${(Math.abs(v) / max) * 100}%`
          return (
            <div key={p.ym} className={`yoy-col${p.ym === currentYm ? ' is-current' : ''}`} aria-hidden="true">
              <div className="yoy-half up">{v >= 0 && <div className="yoy-bar" style={{ height: h }} />}</div>
              <div className="yoy-half down">{v < 0 && <div className="yoy-bar" style={{ height: h }} />}</div>
              <div>
                <div className="yoy-value">{pctPoint(p.yoy)}</div>
                <div className="yoy-month">{ymShort(p.ym)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
