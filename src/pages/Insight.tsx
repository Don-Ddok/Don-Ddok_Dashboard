import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useInsight, type InsightData } from '../data/insight'
import { PERSONA_KEYS } from '../data/campaign'
import { Footnotes } from '../components/Footnotes'
import { MonthLink } from '../lib/month'

const INK = '#1b1e23'
const MUTED = '#5f6570'
const MINT = '#00b39b'
const REGION_COLOR: Record<string, string> = { 대구: '#2f5fb3', 경북: '#7b4f93' }
const HOLDS = ['할인어음', '무역금융', '순수운전자금', '시설자금', '저축성예금', '투자상품', '퇴직연금']
/** 가설 노드는 모두 같은 흰 원이고, 안의 기호와 그 색으로만 지지·기각·보류를 구분한다 */
const STATUS = {
  지지: { glyph: '✓', color: '#00705f' },
  기각: { glyph: '✕', color: '#8a929c' },
  보류: { glyph: '?', color: '#9a6700' },
} as const

/** 하위 원 반지름: 군집은 고객 수에 비례(넓이), 나머지는 같은 크기 */
const kidR = (k: MapNode) => (k.size ? 8 + Math.sqrt(k.size) * 0.95 : 15)
/** 이웃한 하위 원 사이 최소 여백(px) */
const KID_GAP = 20

const signed = (v: number, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`
const pct = (v: number) => `${signed(v)}%`
const share = (v: number) => `${(v * 100).toFixed(1)}%`
const masked = (n: number) => (n === -1 ? '5 미만' : n.toLocaleString('ko-KR'))
const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s)

interface MapNode {
  id: string
  label: string
  sub?: string
  size?: number
  status?: keyof typeof STATUS
  kids?: MapNode[]
}

export default function Insight() {
  const loaded = useInsight()
  if (loaded.status === 'loading')
    return (
      <section className="lead" aria-busy="true">
        <p>팀 인사이트를 불러오는 중입니다.</p>
      </section>
    )
  if (loaded.status === 'error')
    return (
      <section className="lead">
        <h1>팀 인사이트를 불러오지 못했습니다</h1>
        <p>{loaded.message}</p>
      </section>
    )
  return <InsightView I={loaded.data} />
}

function buildTree(I: InsightData): MapNode {
  const C = I.클러스터
  const regions = [...new Set(I.지역수출.map((r) => r.지역))].sort()
  return {
    id: 'root',
    label: '수출 둔화',
    kids: [
      { id: 'reg', label: '지역 수출', sub: '대구·경북', kids: regions.map((r) => ({ id: `reg:${r}`, label: r })) },
      {
        id: 'resp',
        label: '예금 반응',
        sub: '요구불',
        kids: [
          { id: 'resp:노출', label: '외환노출 고객' },
          { id: 'resp:비노출', label: '비노출 고객' },
        ],
      },
      { id: 'ind', label: '업종', sub: '노출 비중', kids: I.업종노출.slice(0, 5).map((x) => ({ id: `ind:${x.업종}`, label: short(x.업종, 7) })) },
      {
        id: 'prod',
        label: '수출–상품',
        sub: '보유 관계',
        kids: I.상품관계.집단.slice(0, 6).map((g) => ({ id: `prod:${g.이름}`, label: short(g.이름, 7) })),
      },
      {
        id: 'clu',
        label: '고객 군집',
        sub: `${C.대상}곳 · ${C.k}군`,
        kids: C.군집.map((g) => ({ id: `clu:${g.id}`, label: `${g.id}군`, size: g.법인수 })),
      },
      {
        id: 'hyp',
        label: '검증된 가설',
        sub: '지지·기각',
        kids: I.검증.map((h, i) => ({ id: `hyp:${i}`, label: short(h.이름, 8), status: h.상태 })),
      },
    ],
  }
}

function InsightView({ I }: { I: InsightData }) {
  const tree = useMemo(() => buildTree(I), [I])
  const [open, setOpen] = useState<string | null>(null)
  const [sel, setSel] = useState('root')
  const counts = { 지지: 0, 기각: 0, 보류: 0 }
  I.검증.forEach((h) => counts[h.상태]++)

  return (
    <>
      <section className="lead" aria-labelledby="in-title">
        <p className="kicker">근거와 한계 · 팀 인사이트</p>
        <h1 id="in-title">수출이 꺾이면 은행 기록에서 무엇이 이어지나, 팀 분석을 한 장의 관계로 묶었습니다.</h1>
        <p className="lead-note">
          ※ 가설 재검증 결과 지지 {counts.지지}개 · 기각 {counts.기각}개 · 보류 {counts.보류}개. 기각된 가설은 캠페인 모델에 쓰지 않습니다.
          상품 보유 비교와 고객 군집은 탐색적 기술통계입니다. 여신 반응의 세부 분석은 옆 탭{' '}
          <MonthLink to="/analysis">여신 분석 22장</MonthLink>에 있습니다.
        </p>
      </section>

      <section className="section" aria-labelledby="in-map">
        <div className="section-head">
          <h2 id="in-map">관계 지도</h2>
          <span className="unit">가지를 누르면 펼쳐지고, 자세한 내용이 함께 나옵니다</span>
        </div>
        <div className="in-wrap">
          <div className="in-map">
            <RelationMap tree={tree} open={open} sel={sel} onBranch={(id) => { setOpen(open === id ? null : id); setSel(id) }} onNode={setSel} onRoot={() => { setOpen(null); setSel('root') }} />
            <ul className="in-map-legend" aria-label="가설 표시">
              {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => (
                <li key={k}>
                  <span className="in-glyph" style={{ color: STATUS[k].color }} aria-hidden="true">
                    {STATUS[k].glyph}
                  </span>
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <aside className="in-detail" aria-live="polite">
            <Detail I={I} sel={sel} />
          </aside>
        </div>
      </section>

      <Footnotes
        notes={[
          '1~4곳인 칸은 법인이 특정되지 않도록 5곳 미만으로 가렸습니다(업종 노출 비중은 함께 숨김).',
          '요구불예금 감소는 수출대금 입금이 줄어드는 기계적 연결일 수 있어, 여신 전이나 조기경보의 근거로 곧장 쓰지 않습니다.',
          '상품 보유 배율(lift)과 고객 군집은 2025년 12월 잔액 기준 기술통계로, 인과 해석이 아닙니다.',
        ]}
        source={`iM뱅크 교육용 법인 익명데이터 집계(팀 분석, 생성일 ${I.생성일}), 관세청 수출입무역통계, 영업일수(공휴일 반영)`}
      />
    </>
  )
}

function RelationMap({
  tree,
  open,
  sel,
  onBranch,
  onNode,
  onRoot,
}: {
  tree: MapNode
  open: string | null
  sel: string
  onBranch: (id: string) => void
  onNode: (id: string) => void
  onRoot: () => void
}) {
  const W = 820, H = 680, CX = W / 2, CY = H / 2, RB = 168, RK = 112, PAD = 34
  const n = tree.kids!.length
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n - Math.PI / 6
  const key = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }
  const links: ReactNode[] = []
  const nodes: ReactNode[] = []
  tree.kids!.forEach((b, i) => {
    const a = ang(i)
    const bx = CX + RB * Math.cos(a), by = CY + RB * Math.sin(a)
    links.push(
      <path
        key={`l-${b.id}`}
        className="in-link"
        d={`M${CX},${CY} Q${(CX + bx) / 2 + 20 * Math.sin(a)},${(CY + by) / 2 - 20 * Math.cos(a)} ${bx},${by}`}
      />,
    )
    if (open === b.id && b.kids) {
      // 하위 원을 가지 둘레의 호에 원 크기만큼 간격을 두고 놓는다. 호가 모자라면 가지에서 더 멀리 펼친다
      const m = b.kids.length
      const rs = b.kids.map(kidR)
      const widths = rs.map((r) => 2 * r + KID_GAP)
      const total = widths.reduce((sum, w) => sum + w, 0)
      const maxSpread = Math.min(Math.PI * 0.9, 0.5 * (m - 1) + 0.2)
      const rk = m === 1 ? RK : Math.max(RK, total / maxSpread)
      const spread = m === 1 ? 0 : total / rk
      let acc = 0
      b.kids.forEach((k, j) => {
        const r = rs[j]
        const ka = m === 1 ? a : a - spread / 2 + (acc + widths[j] / 2) / rk
        acc += widths[j]
        const kx = Math.max(PAD, Math.min(W - PAD, bx + rk * Math.cos(ka)))
        const ky = Math.max(PAD + 20, Math.min(H - PAD - 18, by + rk * Math.sin(ka)))
        const st = k.status ? STATUS[k.status] : null
        links.push(<path key={`l-${k.id}`} className="in-link in-pop" d={`M${bx},${by} L${kx},${ky}`} />)
        nodes.push(
          <g
            key={k.id}
            className={`in-node in-pop${sel === k.id ? ' sel' : ''}`}
            transform={`translate(${kx},${ky})`}
            role="button"
            tabIndex={0}
            aria-label={k.label}
            aria-pressed={sel === k.id}
            onClick={() => onNode(k.id)}
            onKeyDown={key(() => onNode(k.id))}
          >
            <circle className="core" r={r} fill={k.size ? '#eef3f1' : '#fff'} stroke={INK} strokeWidth={1.8} />
            {st && (
              <text y={5} textAnchor="middle" fontSize={14} fontWeight={800} fill={st.color}>
                {st.glyph}
              </text>
            )}
            {k.size && (
              <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>
                {k.size}
              </text>
            )}
            <text y={r + 15} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={INK}>
              {k.label}
            </text>
          </g>,
        )
      })
    }
    const on = open === b.id
    nodes.push(
      <g
        key={b.id}
        className={`in-node${sel === b.id ? ' sel' : ''}`}
        transform={`translate(${bx},${by})`}
        role="button"
        tabIndex={0}
        aria-label={`${b.label} ${b.sub ?? ''}`}
        aria-expanded={on}
        onClick={() => onBranch(b.id)}
        onKeyDown={key(() => onBranch(b.id))}
      >
        <circle className="core" r={46} fill={on ? INK : '#fff'} stroke={INK} strokeWidth={2} />
        <text y={b.sub ? -2 : 5} textAnchor="middle" fontSize={14.5} fontWeight={800} fill={on ? '#fff' : INK}>
          {b.label}
        </text>
        {b.sub && (
          <text y={16} textAnchor="middle" fontSize={11.5} fill={on ? '#d5dae1' : MUTED}>
            {b.sub}
          </text>
        )}
      </g>,
    )
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="관계 지도">
      <g>{links}</g>
      <g>{nodes}</g>
      <g
        className={`in-node${sel === 'root' ? ' sel' : ''}`}
        transform={`translate(${CX},${CY})`}
        role="button"
        tabIndex={0}
        aria-label="수출 둔화, 처음으로"
        onClick={onRoot}
        onKeyDown={key(onRoot)}
      >
        <circle className="core" r={62} fill={MINT} stroke={INK} strokeWidth={0} />
        <text y={6} textAnchor="middle" fontSize={18} fontWeight={800} fill="#0b2420">
          {tree.label}
        </text>
      </g>
    </svg>
  )
}

/* ─── 상세 ─────────────────────────────────────────── */
function DHead({ k, title, children }: { k: string; title: string; children?: ReactNode }) {
  return (
    <>
      <p className="in-k">{k}</p>
      <h3>{title}</h3>
      {children && <p className="in-take">{children}</p>}
    </>
  )
}

function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="in-stats">
      {items.map(([v, l]) => (
        <div key={l}>
          <b>{v}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  )
}

function Rows({ items, max, base }: { items: { l: string; v: number | null; txt: string; dim?: boolean; base?: number }[]; max: number; base?: boolean }) {
  return (
    <div className="in-rows">
      {items.map((x) => (
        <div key={x.l} className={`in-row${x.dim ? ' dim' : ''}`}>
          <span className="in-row-l" title={x.l}>
            {x.l}
          </span>
          <span className="in-bar">
            <b style={{ width: `${x.v === null ? 0 : Math.min(100, (x.v / max) * 100)}%` }} />
            {base && x.base !== undefined && <i style={{ left: `${Math.min(100, (x.base / max) * 100)}%` }} />}
          </span>
          <span className="in-row-v">{x.txt}</span>
        </div>
      ))}
    </div>
  )
}

function Detail({ I, sel }: { I: InsightData; sel: string }) {
  const [kind, arg] = sel.split(/:(.*)/s) as [string, string | undefined]
  switch (kind) {
    case 'reg':
      return <RegionDetail I={I} r={arg} />
    case 'resp':
      return <ResponseDetail I={I} focus={arg as '노출' | '비노출' | undefined} />
    case 'ind':
      return <IndustryDetail I={I} name={arg} />
    case 'prod':
      return <ProductDetail I={I} name={arg} />
    case 'clu':
      return <ClusterDetail I={I} id={arg ? Number(arg) : undefined} />
    case 'hyp':
      return <HypDetail I={I} i={arg !== undefined ? Number(arg) : undefined} />
    default:
      return <RootDetail I={I} />
  }
}

function RootDetail({ I }: { I: InsightData }) {
  const r6 = I.반응.find((r) => r.h === 6)!
  const exp = I.상품관계.집단.find((g) => g.이름 === '수출형')
  const rejected = I.검증.filter((h) => h.상태 === '기각').length
  return (
    <>
      <DHead k="관계 지도" title="수출 둔화에서 무엇이 이어지나">
        가운데에서 뻗은 <b>6개 가지</b>를 누르면 하위 노드가 펼쳐집니다. 팀의 회귀·재검증·보유 패턴·군집 분석을 관계로 묶었습니다.
      </DHead>
      <Stats
        items={[
          [pct(r6.노출), '외환노출 고객 요구불 6개월 반응 (수출 10%p 하락)'],
          [exp ? `×${exp.lift['무역금융'].toFixed(1)}` : '—', '수출형 고객의 무역금융 보유 배율'],
          [`${I.클러스터.k}개`, '외환노출 고객 군집(탐색적)'],
          [`${rejected}개 기각`, '재검증에서 기각된 가설'],
        ]}
      />
    </>
  )
}

function RegionDetail({ I, r }: { I: InsightData; r?: string }) {
  const rows = I.지역수출.filter((x) => !r || x.지역 === r)
  const neg = rows.filter((x) => x.보정YoY < 0).length
  return (
    <>
      <DHead k={`지역 수출${r ? ` · ${r}` : ''}`} title={r ? `${r} 수출 흐름` : '공식 수출 통계가 출발점'}>
        {r ? (
          <>
            36개월 중 <b>{neg}개월</b>이 1년 전보다 줄었습니다(달력 보정 후).
          </>
        ) : (
          <>
            은행 기록이 아니라 <b>관세청 지역 수출 통계</b>로 둔화를 판단합니다. 영업일수 차이가 수출 전년비를 크게 흔들어서 먼저 걷어
            냅니다.
          </>
        )}
      </DHead>
      <RegionChart I={I} focus={r} />
      <p className="in-legend">
        {Object.entries(REGION_COLOR).map(([k, c]) => (
          <span key={k}>
            <i className="ln" style={{ borderColor: c }} />
            {k}
          </span>
        ))}
        <span>
          <i className="dash" style={{ borderColor: MUTED }} />
          달력 보정 전
        </span>
      </p>
      <Stats
        items={[
          [`${signed(I.달력.기울기, 2)}%p`, '영업일 하루당 수출 전년비'],
          [`r ${I.달력.상관}`, `영업일수 차이와의 상관(${I.달력.관측}개 지역×월)`],
        ]}
      />
    </>
  )
}

function RegionChart({ I, focus }: { I: InsightData; focus?: string }) {
  const W = 420, H = 220, L = 34, R = 34, T = 12, B = 24
  const rows = I.지역수출
  const ms = [...new Set(rows.map((r) => r.연월))]
  const vals = rows.flatMap((r) => [r.원YoY, r.보정YoY])
  const lo = Math.floor(Math.min(...vals) / 10) * 10, hi = Math.ceil(Math.max(...vals) / 10) * 10
  const X = (i: number) => L + (i / (ms.length - 1)) * (W - L - R)
  const Y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B)
  const grid: number[] = []
  for (let v = lo; v <= hi; v += 20) grid.push(v)
  const regions = [...new Set(rows.map((r) => r.지역))]
  return (
    <svg className="in-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="대구·경북 수출 전년비, 달력 보정 전후">
      {grid.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? '#aab1bb' : '#eceff2'} />
          <text x={L - 5} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={MUTED}>
            {v}
          </text>
        </g>
      ))}
      {ms.map((m, i) =>
        m.endsWith('01') ? (
          <text key={m} x={X(i)} y={H - 6} textAnchor="middle" fontSize={11} fill={MUTED}>
            {m.slice(0, 4)}
          </text>
        ) : null,
      )}
      {regions.map((r) => {
        const d = rows.filter((x) => x.지역 === r)
        const on = !focus || focus === r
        const c = REGION_COLOR[r] ?? INK
        const last = d[d.length - 1]
        return (
          <g key={r} opacity={on ? 1 : 0.15}>
            <path d={d.map((x, i) => `${i ? 'L' : 'M'}${X(i)},${Y(x.원YoY)}`).join('')} fill="none" stroke={c} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.5} />
            <path d={d.map((x, i) => `${i ? 'L' : 'M'}${X(i)},${Y(x.보정YoY)}`).join('')} fill="none" stroke={c} strokeWidth={2} />
            <text x={X(ms.length - 1) + 4} y={Y(last.보정YoY) + 4} fontSize={12} fontWeight={700} fill={c}>
              {r}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function ResponseDetail({ I, focus }: { I: InsightData; focus?: '노출' | '비노출' }) {
  const R0 = I.반응
  const r6 = R0.find((r) => r.h === 6)!, r12 = R0.find((r) => r.h === 12)!
  const sig = R0.filter((r) => r.유의).map((r) => r.h)
  const dif = R0.filter((r) => r.차이유의).map((r) => r.h)
  const take =
    focus === '비노출' ? (
      <>
        비노출 고객은 <b>모든 시차에서 유의한 반응이 없습니다</b>. 다만 이것만으로 두 집단의 차이가 유의하다고 말할 수는 없습니다.
      </>
    ) : focus === '노출' ? (
      <>
        수출 전년비가 10%p 떨어지면 <b>6개월 {pct(r6.노출)}, 12개월 {pct(r12.노출)}</b>. Holm 보정 후 h={sig[0]}~{sig[sig.length - 1]}
        에서 유의하고, 사전 추세는 없습니다.
      </>
    ) : (
      <>
        수출이 꺾이면 <b>외환노출 고객의 요구불예금이 줄어듭니다</b>. 노출과 비노출의 차이는 h={dif.join('·')}에서만 다중검정을
        견딥니다.
      </>
    )
  return (
    <>
      <DHead k={`예금 반응${focus ? ` · ${focus} 고객` : ''}`} title="수출 충격 → 요구불예금">
        {take}
      </DHead>
      <ResponseChart I={I} focus={focus} />
      <p className="in-legend">
        <span>
          <i className="ln" style={{ borderColor: INK }} />
          외환노출(β₁+β₃)
        </span>
        <span>
          <i className="dash" style={{ borderColor: MUTED }} />
          비노출(β₁)
        </span>
        <span>
          <i className="dot" style={{ background: INK }} />
          Holm 보정 후 유의
        </span>
      </p>
      <p className="in-src">누적 로그 변화(≈%), 법인·월 이중 군집, 사전등록 재검정. 점 위에 마우스를 올리면 값이 보입니다.</p>
    </>
  )
}

function ResponseChart({ I, focus }: { I: InsightData; focus?: '노출' | '비노출' }) {
  const R0 = I.반응, W = 420, H = 230, L = 40, R = 8, T = 10, B = 34
  const vals = R0.flatMap((r) => [r.하한, r.상한, r.비노출])
  const lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5)
  const h0 = R0[0].h, h1 = R0[R0.length - 1].h
  const X = (h: number) => L + ((h - h0) / (h1 - h0)) * (W - L - R)
  const Y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B)
  const grid: number[] = []
  for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) grid.push(v)
  const exOn = focus !== '비노출', noOn = focus !== '노출'
  return (
    <svg className="in-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="수출 충격 뒤 개월별 요구불예금 누적 반응, 외환노출과 비노출">
      {grid.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? '#aab1bb' : '#eceff2'} />
          <text x={L - 5} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={MUTED}>
            {v}%
          </text>
        </g>
      ))}
      {R0.map((r) => (
        <text key={r.h} x={X(r.h)} y={H - 18} textAnchor="middle" fontSize={11} fill={MUTED}>
          {r.h}
        </text>
      ))}
      <text x={(L + W) / 2} y={H - 2} textAnchor="middle" fontSize={11} fill={MUTED}>
        수출 전년비 10%p 하락 뒤 경과 개월(h)
      </text>
      <path
        d={
          R0.map((r, i) => `${i ? 'L' : 'M'}${X(r.h)},${Y(r.상한)}`).join('') +
          R0.slice()
            .reverse()
            .map((r) => `L${X(r.h)},${Y(r.하한)}`)
            .join('') +
          'Z'
        }
        fill={INK}
        fillOpacity={exOn ? 0.1 : 0.03}
      />
      <path d={R0.map((r, i) => `${i ? 'L' : 'M'}${X(r.h)},${Y(r.비노출)}`).join('')} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="5 4" opacity={noOn ? 1 : 0.25} />
      <path d={R0.map((r, i) => `${i ? 'L' : 'M'}${X(r.h)},${Y(r.노출)}`).join('')} fill="none" stroke={INK} strokeWidth={2} opacity={exOn ? 1 : 0.25} />
      {R0.map((r) => (
        <g key={r.h} opacity={exOn ? 1 : 0.25}>
          <title>{`${r.h}개월 뒤까지: 외환노출 ${pct(r.노출)} (95% 구간 ${pct(r.하한)}~${pct(r.상한)}), 비노출 ${pct(r.비노출)}${r.유의 ? ', Holm 보정 후 유의' : ''}`}</title>
          <circle cx={X(r.h)} cy={Y(r.노출)} r={4} fill={r.유의 ? INK : '#fff'} stroke={INK} strokeWidth={1.5} />
          <rect x={X(r.h) - 11} y={T} width={22} height={H - T - B} fill="transparent" />
        </g>
      ))}
    </svg>
  )
}

function IndustryDetail({ I, name }: { I: InsightData; name?: string }) {
  const L0 = I.업종노출
  const mx = Math.max(...L0.map((x) => x.노출비중 ?? 0))
  const x = name ? L0.find((v) => v.업종 === name) : undefined
  const pg = name ? I.상품관계.집단.find((g) => g.이름 === name) : undefined
  return (
    <>
      <DHead k={`업종${name ? ` · ${name}` : ''}`} title={name ?? '어느 업종이 수출에 노출돼 있나'}>
        {x ? (
          <>
            고객 {x.법인수.toLocaleString('ko-KR')}곳 중{' '}
            <b>
              {masked(x.노출)}곳{x.노출비중 !== null ? `(${share(x.노출비중)})` : ''}
            </b>
            이 외환노출(수출형 {masked(x.수출형)}, 수입형 {masked(x.수입형)}).
          </>
        ) : (
          <>
            2025년 12월 기준 업종별 외환노출 고객 비중입니다(고객 50곳 이상 업종). <b>제조업</b>이 가장 높습니다.
          </>
        )}
      </DHead>
      <Rows
        max={mx}
        items={L0.map((v) => ({
          l: v.업종,
          v: v.노출비중,
          txt: v.노출비중 === null ? '5곳 미만' : share(v.노출비중),
          dim: Boolean(name && v.업종 !== name),
        }))}
      />
      {pg && (
        <>
          <h4>이 업종이 평균보다 많이 쓰는 상품</h4>
          <p className="in-tags">
            {Object.entries(pg.lift)
              .filter(([, v]) => v >= 1.2)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <span key={k}>
                  {k} ×{v.toFixed(1)}
                </span>
              ))}
          </p>
        </>
      )}
    </>
  )
}

function ProductDetail({ I, name }: { I: InsightData; name?: string }) {
  const PR = I.상품관계
  const g = name ? PR.집단.find((x) => x.이름 === name) : undefined
  const ex = PR.집단.find((x) => x.이름 === '수출형')
  return (
    <>
      <DHead k={`수출–상품${name ? ` · ${name}` : ''}`} title={g ? `${g.이름} 고객이 쓰는 상품` : '수출하는 고객은 어떤 상품을 쓰나'}>
        {g ? (
          <>
            고객 {masked(g.법인수)}곳의 보유율을 전체({PR.대상.toLocaleString('ko-KR')}곳)와 비교했습니다. 굵은 선일수록 평균보다 많이 씁니다.
          </>
        ) : ex ? (
          <>
            선 굵기 = 전체 평균 대비 보유 배율(lift). <b>수출형은 무역금융을 ×{ex.lift['무역금융'].toFixed(1)}</b>, 할인어음을 ×
            {ex.lift['할인어음'].toFixed(1)} 더 많이 씁니다.
          </>
        ) : null}
      </DHead>
      <Network I={I} focus={name} />
      <p className="in-legend">
        <span>
          <i className="ln" style={{ borderColor: INK, borderTopWidth: 3 }} />
          평균보다 많음(×{PR.기준.강조_이상} 이상)
        </span>
        <span>
          <i className="dash" style={{ borderColor: '#aab1bb' }} />
          평균보다 적음(×{PR.기준.강조_이하} 이하)
        </span>
      </p>
      {g && (
        <Rows
          max={Math.max(...PR.상품.map((p) => Math.max(g.보유율[p], PR.전체보유율[p])))}
          base
          items={PR.상품.map((p) => ({ l: p, v: g.보유율[p], txt: share(g.보유율[p]), base: PR.전체보유율[p] }))}
        />
      )}
      <p className="in-src">2025년 12월 잔액이 있는지로 본 보유율 비교(기술통계, 탐색적). 인과 해석이 아닙니다.</p>
    </>
  )
}

function Network({ I, focus }: { I: InsightData; focus?: string }) {
  const PR = I.상품관계, G = PR.집단, P = PR.상품
  const W = 420, rowG = 34, rowP = 22
  const H = Math.max(G.length * rowG, P.length * rowP) + 20
  const xg = 128, xp = 270
  const yg = (i: number) => 14 + i * ((H - 28) / Math.max(1, G.length - 1))
  const yp = (i: number) => 14 + i * ((H - 28) / Math.max(1, P.length - 1))
  return (
    <svg className="in-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="고객 집단과 상품 보유의 관계">
      {G.map((g, i) =>
        P.map((p, j) => {
          const lf = g.lift[p]
          const pos = lf >= PR.기준.강조_이상
          if (!pos && lf > PR.기준.강조_이하) return null
          const on = !focus || focus === g.이름
          return (
            <path
              key={`${g.이름}-${p}`}
              d={`M${xg},${yg(i)} C${(xg + xp) / 2},${yg(i)} ${(xg + xp) / 2},${yp(j)} ${xp},${yp(j)}`}
              fill="none"
              stroke={pos ? INK : '#aab1bb'}
              strokeWidth={pos ? Math.min(6, 1 + Math.log2(lf) * 1.6) : 1.4}
              strokeDasharray={pos ? undefined : '4 3'}
              opacity={on ? (pos ? 0.75 : 0.9) : 0.06}
            >
              <title>{`${g.이름} → ${p}: 보유율 ${share(g.보유율[p])} (전체 ${share(PR.전체보유율[p])}), 배율 ×${lf.toFixed(2)}`}</title>
            </path>
          )
        }),
      )}
      {G.map((g, i) => {
        const on = !focus || focus === g.이름
        return (
          <g key={g.이름}>
            <circle cx={xg} cy={yg(i)} r={5} fill={g.유형 === '세그먼트' ? INK : '#fff'} stroke={INK} strokeWidth={1.5} />
            <text x={xg - 10} y={yg(i) + 4} textAnchor="end" fontSize={12} fill={on ? INK : '#aab1bb'} fontWeight={on && focus ? 700 : 500}>
              {short(g.이름, 9)}
            </text>
          </g>
        )
      })}
      {P.map((p, j) => (
        <g key={p}>
          <rect x={xp - 4} y={yp(j) - 4} width={8} height={8} fill={MINT} />
          <text x={xp + 10} y={yp(j) + 4} fontSize={12} fill={INK}>
            {p}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ClusterDetail({ I, id }: { I: InsightData; id?: number }) {
  const C = I.클러스터
  if (id === undefined) {
    const lab: Record<string, string> = { 수출비중: '수출', 외환규모: '외환', 요구불규모: '요구불' }
    const col = (z: number) => {
      const a = Math.min(1, Math.abs(z) / 1.5)
      return z >= 0 ? `rgba(201, 84, 44, ${a * 0.85})` : `rgba(47, 95, 179, ${a * 0.75})`
    }
    return (
      <>
        <DHead k="고객 군집(탐색적)" title={`데이터가 나눈 외환노출 고객 ${C.k}개 군집`}>
          외환 거래(수출 비중·규모), 요구불 규모, 7개 상품 보유로 {C.대상}곳을 k-means로 나눴습니다. 실루엣 {C.실루엣}으로{' '}
          <b>구분이 약한 편</b>이라 경향으로만 봅니다.
        </DHead>
        <h4>군집별 특징(전체 평균 대비 z)</h4>
        <div className="in-heat-wrap">
          <table className="in-heat">
            <thead>
              <tr>
                <th />
                {C.특성.map((f) => (
                  <th key={f} scope="col" title={f}>
                    {(lab[f] ?? f).slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {C.군집.map((g) => (
                <tr key={g.id}>
                  <th scope="row">
                    {g.id}군 ({masked(g.법인수)})
                  </th>
                  {C.특성.map((f) => {
                    const z = g.특성z[f]
                    return (
                      <td key={f} style={{ background: col(z), color: Math.abs(z) > 1 ? '#fff' : INK }}>
                        {signed(z)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="in-legend">
          <span>
            <i style={{ background: 'rgba(201, 84, 44, 0.8)' }} />
            평균보다 높음
          </span>
          <span>
            <i style={{ background: 'rgba(47, 95, 179, 0.7)' }} />
            평균보다 낮음
          </span>
        </p>
        <p className="in-src">방법은 결과를 보기 전에 고정했습니다(사전 등록). 군집 이름은 차이가 가장 큰 특성 2개로 자동 생성.</p>
      </>
    )
  }
  const g = C.군집.find((x) => x.id === id)!
  const tot = g.법인수
  return (
    <>
      <DHead k={`고객 군집 · ${g.id}군`} title={g.이름}>
        <b>{masked(tot)}곳</b> · 수출형 {masked(g.세그먼트['수출형'] ?? 0)} / 수입형 {masked(g.세그먼트['수입형'] ?? 0)} · 요구불 중앙값{' '}
        {g.요구불_중앙값.toLocaleString('ko-KR')} · 수출 비중 평균 {(g.수출비중_평균 * 100).toFixed(0)}%
      </DHead>
      <h4>상품 보유율(세로선 = 외환노출 고객 전체)</h4>
      <Rows max={1} base items={HOLDS.map((h) => ({ l: h, v: g.보유율[h], txt: `${(g.보유율[h] * 100).toFixed(0)}%`, base: C.전체[h] }))} />
      <h4>규칙 기반 페르소나와 겹침</h4>
      <p className="in-tags">
        {PERSONA_KEYS.filter((k) => g.페르소나[k]).map((k) => {
          const n = g.페르소나[k]!
          return (
            <span key={k}>
              <span className={`cp-badge p-${k} in-mini`}>{k}</span>
              {n === -1 ? '5곳 미만' : `${n}곳 (${Math.round((n / tot) * 100)}%)`}
            </span>
          )
        })}
      </p>
      <h4>많은 업종</h4>
      <p className="in-tags">
        {g.업종상위.length ? g.업종상위.map((x) => <span key={x.업종}>{x.업종} {masked(x.법인수)}</span>) : <span>5곳 이상 업종 없음</span>}
      </p>
      <p className="in-src">탐색적 군집입니다. 군집별 수출 충격 반응은 추정하지 않았습니다.</p>
    </>
  )
}

function HypDetail({ I, i }: { I: InsightData; i?: number }) {
  if (i === undefined) {
    const c = (s: string) => I.검증.filter((h) => h.상태 === s).length
    return (
      <>
        <DHead k="검증된 가설" title="무엇이 맞았고 무엇이 틀렸나">
          재검증으로 <b>지지 {c('지지')}개, 기각 {c('기각')}개, 보류 {c('보류')}개</b>가 나왔습니다. 기각된 가설은 캠페인 모델에 쓰지 않습니다.
        </DHead>
        <ul className="in-hyps">
          {I.검증.map((h) => (
            <li key={h.이름}>
              <h4>
                <i className={`in-swatch st-${h.상태 === '지지' ? 'support' : h.상태 === '기각' ? 'reject' : 'hold'}`} />
                {h.이름} — {h.판정}
              </h4>
              <p>{h.요약}</p>
            </li>
          ))}
        </ul>
      </>
    )
  }
  const h = I.검증[i]
  return (
    <>
      <DHead k={`검증된 가설 · ${h.상태}`} title={h.이름}>
        {h.요약}
      </DHead>
      <p className="in-tags">
        <span>판정: {h.판정}</span>
      </p>
      <p className="in-src">출처: 팀 분석 문서 {h.출처}</p>
    </>
  )
}
