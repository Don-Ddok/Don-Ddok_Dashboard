// 가상 데이터 점검: node ./node_modules/tsx/dist/cli.mjs scripts/check-data.ts
import { FIRMS, MONTHS, ymLabel } from '../src/data/synthetic'
import { FIRST_JUDGED_INDEX, firmsByStatus, latestMonthWithSignal, targetCount } from '../src/data/signals'
import { COMBO_IDS, COMBOS } from '../src/data/combos'

const exporters = FIRMS.filter((f) => f.exporter)
console.log(`회사 ${FIRMS.length}곳, 수출 ${exporters.length}곳, 대구 ${FIRMS.filter((f) => f.region === '대구').length}곳`)
console.log(`할인어음 거래 ${FIRMS.filter((f) => f.billUser).length}곳(수출 ${exporters.filter((f) => f.billUser).length}곳)`)
for (const combo of COMBO_IDS) {
  const counts = MONTHS.map((ym, i) =>
    i >= FIRST_JUDGED_INDEX
      ? `${ymLabel(ym)}:${firmsByStatus(FIRMS, i, 'met', combo).length}/${firmsByStatus(FIRMS, i, 'partial', combo).length}`
      : null,
  ).filter(Boolean)
  console.log(`\n[${COMBOS[combo].name}] 대상 ${targetCount(FIRMS, combo)}곳`)
  console.log('월별 충족/기준 근접:', counts.join(' '))
  console.log('첫 화면 기본 기준월:', ymLabel(MONTHS[latestMonthWithSignal(FIRMS, combo)]))
}
console.log('\n이름 중복 없음:', new Set(FIRMS.map((x) => x.name)).size === FIRMS.length)
