import type { CSSProperties } from 'react'
import type { ExportPoint, Region } from '../data/regionExports'
import { pctPoint, ymShort } from '../lib/format'
import { RegionTag } from './RegionTag'

const AREA_REM = 2.75 // 증가·감소 막대가 함께 쓰는 높이(왼쪽 표 높이와 맞추기 위해 낮게)

/**
 * 전년동월비 막대. 증가는 민트(기준선 위), 감소는 주황(기준선 아래).
 * 색을 못 구분해도 위치와 부호로 방향을 읽을 수 있고, 값은 숫자로도 적는다. 화면이 열리면 기준선에서 자란다.
 * 기준선 위아래 높이는 실제 값의 범위에 맞춘다(감소만 있으면 위쪽 빈 공간을 두지 않음).
 */
export function YoyBars({ region, points, currentYm }: { region: Region; points: ExportPoint[]; currentYm: number }) {
  const values = points.map((p) => p.yoy ?? 0)
  const maxUp = Math.max(0, ...values)
  const maxDown = Math.max(0, ...values.map((v) => -v))
  const scale = Math.max(10, maxUp + maxDown)
  const rem = (v: number) => (Math.abs(v) / scale) * AREA_REM
  const rows = `${rem(maxUp)}rem ${rem(maxDown)}rem auto`
  const summary = points.map((p) => `${ymShort(p.ym)} ${pctPoint(p.yoy)}`).join(', ')
  const current = points.find((p) => p.ym === currentYm)?.yoy ?? null

  return (
    <figure>
      <figcaption>
        <span>
          <RegionTag region={region} /> 수출, 1년 전 같은 달 대비
        </span>
        <span className={`yoy-now ${(current ?? 0) < 0 ? 'down' : 'up'}`}>
          {ymShort(currentYm)} {pctPoint(current)}
        </span>
      </figcaption>
      <div className="yoy-row" role="img" aria-label={`${region} 수출 전년동월비: ${summary}`}>
        {points.map((p, i) => {
          const v = p.yoy ?? 0
          const bar = { height: `${rem(v)}rem`, '--i': i } as CSSProperties
          return (
            <div
              key={p.ym}
              className={`yoy-col${p.ym === currentYm ? ' is-current' : ''}`}
              style={{ gridTemplateRows: rows }}
              aria-hidden="true"
            >
              <div className="yoy-half up">{v >= 0 && <div className="yoy-bar" style={bar} />}</div>
              <div className="yoy-half down">{v < 0 && <div className="yoy-bar" style={bar} />}</div>
              <div>
                <div className={`yoy-value ${v < 0 ? 'down' : 'up'}`}>{pctPoint(p.yoy)}</div>
                <div className="yoy-month">{ymShort(p.ym)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
