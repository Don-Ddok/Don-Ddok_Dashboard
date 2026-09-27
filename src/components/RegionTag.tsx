import type { Region } from '../data/regionExports'

const KEY: Record<Region, string> = { 대구: 'dg', 경북: 'gb' }

/** 지역 이름 앞에 지역 색 네모를 붙인다. 색은 보조 표시이고 이름이 항상 함께 적힌다 */
export function RegionTag({ region }: { region: Region }) {
  return (
    <span className="region-tag" data-region={KEY[region]}>
      {region}
    </span>
  )
}
