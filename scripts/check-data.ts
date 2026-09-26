// 가상 데이터 점검: node ./node_modules/tsx/dist/cli.mjs scripts/check-data.ts
import { FIRMS, MONTHS, ymLabel } from '../src/data/synthetic'
import { FIRST_JUDGED_INDEX, firmsByStatus, latestMonthWithSignal } from '../src/data/signals'

const exporters = FIRMS.filter((f) => f.exporter)
console.log(`회사 ${FIRMS.length}곳, 수출 ${exporters.length}곳, 대구 ${FIRMS.filter((f) => f.region === '대구').length}곳`)
const counts = MONTHS.map((ym, i) =>
  i >= FIRST_JUDGED_INDEX
    ? `${ymLabel(ym)}:${firmsByStatus(FIRMS, i, 'met').length}/${firmsByStatus(FIRMS, i, 'partial').length}`
    : null,
).filter(Boolean)
console.log('월별 충족/일부 충족:', counts.join(' '))
console.log('첫 화면 기본 기준월:', ymLabel(MONTHS[latestMonthWithSignal(FIRMS)]))
console.log('이름 중복 없음:', new Set(FIRMS.map((x) => x.name)).size === FIRMS.length)
