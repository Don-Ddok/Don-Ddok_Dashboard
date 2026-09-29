import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowSquareOut, X } from '@phosphor-icons/react'
import {
  countText,
  numText,
  isSmall,
  PERSONA_KEYS,
  personaEntries,
  STAGE_OF,
  STAGES,
  useCampaign,
  ymDash,
  ymText,
  type CampaignData,
  type PersonaCounts,
  type PersonaKey,
  type RecoCell,
  type RegionMonth,
  type Segment,
} from '../data/campaign'
import { Footnotes } from '../components/Footnotes'
import { MonthLink } from '../lib/month'

type View = 'ind' | 'per' | 'reco' | 'gen'
type ScopeGroup = 'mid' | 'ind'
interface Scope {
  name: string
  sub: string
  n: number
  p: PersonaCounts
}

const SEGMENTS: Segment[] = ['수출형', '수입형']
const delay = (i: number) => ({ '--i': i }) as CSSProperties

/** 받침 유무로 은/는 */
const eunNeun = (w: string) => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? '은' : '는')

function splitName(name: string) {
  const [main, rest] = name.split(';').map((v) => v.trim())
  return { main, rest: rest ?? '' }
}

function findScope(rm: RegionMonth, group: ScopeGroup | null, name: string | null): Scope | null {
  if (!group || !name) return null
  if (group === 'mid') {
    const mf = rm.업종.find((i) => i.업종 === '제조업')
    const m = mf?.중분류?.find((s) => s.업종_중분류 === name)
    return m ? { name, ...splitNameScope(name), n: m.법인수, p: m.페르소나 } : null
  }
  const i = rm.업종.find((x) => x.업종 === name && x.업종 !== '제조업')
  return i ? { name, sub: i.포함업종 ? `${i.포함업종.length}개 업종 합산` : '', n: i.법인수, p: i.페르소나 } : null
}
const splitNameScope = (name: string) => ({ sub: splitName(name).rest })

/** 제조업 밖 업종 합계 = 외환노출 전체 − 제조업(가린 칸을 더하지 않도록 뺄셈으로) */
function othersTotal(rm: RegionMonth, manufacturing: number | undefined) {
  const all = rm.요약.노출법인
  if (isSmall(all) || (manufacturing !== undefined && isSmall(manufacturing))) return '일부'
  return countText(all - (manufacturing ?? 0))
}

export default function Campaign() {
  const loaded = useCampaign()
  if (loaded.status === 'loading')
    return (
      <section className="lead" aria-busy="true">
        <p>이번 달 캠페인 데이터를 불러오는 중입니다.</p>
      </section>
    )
  if (loaded.status === 'error')
    return (
      <section className="lead">
        <h1>캠페인 데이터를 불러오지 못했습니다</h1>
        <p>{loaded.message}</p>
      </section>
    )
  return <CampaignView data={loaded.data} />
}

function CampaignView({ data }: { data: CampaignData }) {
  const [params, setParams] = useSearchParams()
  const regions = Object.keys(data.지역).sort()
  const months = data.meta.월
  const r = params.get('r')
  const region = r && regions.includes(r) ? r : data.meta.기본지역
  const cm = params.get('cm')
  const ym = cm && months.includes(cm) ? cm : data.meta.기본월
  const rm = data.지역[region][ym]
  const group = params.get('g') as ScopeGroup | null
  const scope = findScope(rm, group, params.get('s'))
  const pk = params.get('p') as PersonaKey | null
  const persona = pk && PERSONA_KEYS.includes(pk) ? pk : null
  let view = (params.get('v') as View | null) ?? 'ind'
  if ((view === 'per' || view === 'reco') && !scope) view = 'ind'
  if (view === 'reco' && !persona) view = 'per'
  if (view === 'gen' && !rm.비노출_일반) view = 'ind'

  const update = useCallback(
    (patch: Record<string, string | null>, replace = false) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v === null) next.delete(k)
            else next.set(k, v)
          }
          return next
        },
        { replace },
      ),
    [setParams],
  )
  const toIndustries = useCallback(() => update({ v: null, g: null, s: null, p: null }), [update])
  const toPersona = useCallback(() => update({ v: 'per', p: null }), [update])

  const [product, setProduct] = useState<string | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || product) return
      if (view === 'reco') toPersona()
      else if (view === 'per' || view === 'gen') toIndustries()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [view, product, toPersona, toIndustries])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const stage = STAGE_OF[rm.단계]
  const personaName = persona ? data.페르소나설명[persona].이름 : ''
  const crumbs: { t: string; go?: () => void }[] = [
    { t: `${region} ${ymDash(ym)} · ${rm.단계}`, go: view === 'ind' ? undefined : toIndustries },
  ]
  if (view === 'gen') crumbs.push({ t: '외환 비노출 고객' })
  if (scope) crumbs.push({ t: splitName(scope.name).main, go: view === 'reco' ? toPersona : undefined })
  if (view === 'reco' && persona) crumbs.push({ t: personaName })

  const headline: Record<View, ReactNode> = {
    ind: (
      <>
        {ymText(ym)} {region}
        {eunNeun(region)} <span className="cp-stage-word">&lsquo;{rm.단계}&rsquo;</span> 단계입니다. 외환노출 고객{' '}
        <em className="figure count">{numText(rm.요약.노출법인)}곳</em> 가운데 어느 업종부터 볼까요?
      </>
    ),
    per: scope ? (
      <>
        {splitName(scope.name).main} <em className="figure count">{countText(scope.n)}</em>, 어떤 성격의 고객인가요?
      </>
    ) : null,
    reco: <>{personaName} 고객에게 무엇을 먼저 제안할까요?</>,
    gen: (
      <>
        외환 비노출 고객 <em className="figure count">{numText(rm.요약.비노출법인)}곳</em>에는 단계와 관계없이 일반
        안내를 합니다.
      </>
    ),
  }

  const since =
    rm.T0 && rm.단계 !== '평시'
      ? `둔화 시작 ${ymDash(rm.T0)}${rm.좌측절단 ? ' 이전' : ''}${rm.k !== null ? ` · ${rm.k}개월 경과` : ''}`
      : '둔화 신호 없음'

  return (
    <div className="campaign">
      <nav className="cp-crumbs" aria-label="캠페인 경로">
        <span className="cp-crumb-root">이번 달 캠페인</span>
        {crumbs.map((c, i) => (
          <span key={i} className="cp-crumb-item">
            <span aria-hidden="true">›</span>
            {c.go ? (
              <button type="button" className="cp-crumb" onClick={c.go}>
                {c.t}
              </button>
            ) : (
              <span className="cp-crumb now" aria-current="page">
                {c.t}
              </span>
            )}
          </span>
        ))}
      </nav>

      <section className="lead" aria-labelledby="cp-title">
        <p className="kicker">
          이번 달 캠페인
          <span className="kicker-delta">
            {since} · 보정 수출 전년비 {rm.보정YoY > 0 ? '+' : rm.보정YoY < 0 ? '−' : ''}
            {Math.abs(rm.보정YoY)}%
          </span>
        </p>
        <h1 id="cp-title">{headline[view]}</h1>
        <p className="lead-note">
          ※ 언제(단계) → 누구에게(업종·페르소나) → 무엇을(추천 상품) 순서로 좁혀 갑니다. 추천은 매칭 모델의 설계값이며 위험 판정이
          아니라 캠페인 대상을 고르는 참고 자료입니다. <MonthLink to="/analysis">근거와 한계 보기</MonthLink>
        </p>
      </section>

      {view === 'ind' && (
        <>
          <StagePicker data={data} region={region} ym={ym} regions={regions} onPick={(patch) => update(patch)} stageColor={stage} />
          <Industries rm={rm} onScope={(g, s) => update({ v: 'per', g, s, p: null })} onGeneral={() => update({ v: 'gen' })} />
        </>
      )}
      {view === 'per' && scope && (
        <Personas data={data} scope={scope} onPick={(k) => update({ v: 'reco', p: k })} />
      )}
      {view === 'reco' && persona && (
        <Recommendation data={data} rm={rm} persona={persona} region={region} ym={ym} onProduct={setProduct} />
      )}
      {view === 'gen' && rm.비노출_일반 && <General data={data} cell={rm.비노출_일반} onProduct={setProduct} />}

      {product && <ProductDialog data={data} name={product} onClose={() => setProduct(null)} />}

      <Footnotes
        notes={[
          `${data.meta.주의}. 1~4곳인 칸은 법인이 특정되지 않도록 "${'5곳 미만'}"으로 가렸습니다.`,
          '추천은 단계 × 페르소나 × 세그먼트(수출형·수입형)로 정해집니다. 업종은 대상 규모를 보여 주며, 업종이 달라도 같은 페르소나는 같은 추천을 받습니다.',
          `매칭 모델 근거: ${data.meta.근거}. 참고 신호로 읽어 주세요. 파트 3 여신 분석(근거와 한계 화면)은 약한 증거이고 수출이 꺾이기 전에도 비슷한 차이가 보여(사전 추세 의심) 시간 순서를 확정하지 않았습니다.`,
          '상품 정보는 iM뱅크 사이트에서 수집한 요약입니다. 금리·한도·판매 여부는 상품몰에서 다시 확인하세요.',
        ]}
        source={`iM뱅크 교육용 법인 익명데이터 집계(매칭 결과 기준일 ${data.meta.생성일}), 관세청 수출입무역통계, iM뱅크 금융상품몰`}
      />
    </div>
  )
}

function StagePicker({
  data,
  region,
  ym,
  regions,
  onPick,
  stageColor,
}: {
  data: CampaignData
  region: string
  ym: string
  regions: string[]
  onPick: (patch: Record<string, string>) => void
  stageColor: (typeof STAGES)[number]
}) {
  const months = data.meta.월
  const years = [...new Set(months.map((m) => m.slice(0, 4)))]
  const rm = data.지역[region][ym]
  return (
    <section className="section cp-picker" aria-labelledby="cp-when">
      <div className="section-head">
        <h2 id="cp-when">언제</h2>
        <span className="unit">지역과 달을 고르면 그 달의 단계와 대상이 바뀝니다</span>
      </div>
      <div className="cp-picker-body">
        <div className="cp-region" role="group" aria-label="지역">
          {regions.map((r) => (
            <button key={r} type="button" aria-pressed={r === region} onClick={() => onPick({ r })}>
              {r}
            </button>
          ))}
        </div>
        <p className="cp-now">
          <strong>
            {region} {ymText(ym)}
          </strong>
          <span className="cp-stage-chip" style={{ background: stageColor.color, color: stageColor.dark ? '#fff' : 'var(--ink)' }}>
            {rm.단계}
          </span>
          <span className="cp-now-sub">
            외환노출 {numText(rm.요약.노출법인)}곳 (수출형 {numText(rm.요약.수출형)} · 수입형 {numText(rm.요약.수입형)})
          </span>
        </p>
        <div className="cp-timeline" role="group" aria-label="기준월" style={{ '--n': months.length } as CSSProperties}>
          {months.map((m) => {
            const mm = data.지역[region][m]
            const s = STAGE_OF[mm.단계]
            const label = `${ymText(m)} · ${mm.단계} · 외환노출 ${numText(mm.요약.노출법인)}곳`
            return (
              <button
                key={m}
                type="button"
                className="cp-tl"
                style={{ background: s.color }}
                aria-pressed={m === ym}
                aria-label={label}
                title={label}
                onClick={() => onPick({ cm: m })}
              />
            )
          })}
        </div>
        <div className="cp-years" style={{ '--y': years.length } as CSSProperties} aria-hidden="true">
          {years.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
        <ul className="cp-legend" aria-label="단계 범례">
          {STAGES.map((s) => (
            <li key={s.name}>
              <i style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PersonaBar({ p }: { p: PersonaCounts }) {
  const e = personaEntries(p)
  return (
    <>
      <span className="cp-pbar" aria-hidden="true">
        {e.map(([k, n]) => (
          <b key={k} className={`p-${k}`} style={{ flex: isSmall(n) ? 2.5 : n }} />
        ))}
      </span>
      <span className="cp-pleg">
        {e.map(([k, n]) => (
          <span key={k}>
            <i className={`p-${k}`} />
            {k} {isSmall(n) ? '<5' : n}
          </span>
        ))}
      </span>
    </>
  )
}

function Industries({
  rm,
  onScope,
  onGeneral,
}: {
  rm: RegionMonth
  onScope: (g: ScopeGroup, s: string) => void
  onGeneral: () => void
}) {
  const mf = rm.업종.find((i) => i.업종 === '제조업')
  const others = rm.업종.filter((i) => i.업종 !== '제조업')
  let k = 0
  const card = (key: string, name: string, n: number, p: PersonaCounts, sub: string, go: () => void) => {
    const { main, rest } = splitName(name)
    return (
      <button key={key} type="button" className="cp-pick" style={delay(k++)} onClick={go}>
        <span className="cp-pick-row">
          <span className="cp-pick-name">
            {main}
            {(rest || sub) && <small>{rest || sub}</small>}
          </span>
          <span className="cp-pick-n">{countText(n)}</span>
        </span>
        <PersonaBar p={p} />
      </button>
    )
  }
  return (
    <>
      <section className="section" aria-labelledby="cp-who">
        <div className="section-head">
          <h2 id="cp-who">누구에게 · 업종별 대상 규모</h2>
          <span className="unit">업종을 누르면 페르소나별 분포로 들어갑니다</span>
        </div>
        {mf && (
          <>
            <p className="cp-group">
              제조업 <span>{countText(mf.법인수)} · 중분류 {mf.중분류?.length ?? 0}개</span>
            </p>
            <div className="cp-grid">
              {(mf.중분류 ?? []).map((s) =>
                card(`m-${s.업종_중분류}`, s.업종_중분류, s.법인수, s.페르소나, '', () => onScope('mid', s.업종_중분류)),
              )}
            </div>
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="cp-group">
              그 외 업종 <span>{othersTotal(rm, mf?.법인수)}</span>
            </p>
            <div className="cp-grid">
              {others.map((i) =>
                card(`o-${i.업종}`, i.업종, i.법인수, i.페르소나, i.포함업종 ? `${i.포함업종.length}개 업종 합산` : '', () =>
                  onScope('ind', i.업종),
                ),
              )}
            </div>
          </>
        )}
        {!mf && others.length === 0 && <p className="section-note">이 달에는 외환노출 고객이 없습니다.</p>}
      </section>
      {rm.비노출_일반 && (
        <section className="section" aria-labelledby="cp-general">
          <div className="section-head">
            <h2 id="cp-general">외환 비노출 고객</h2>
            <span className="unit">매칭 모델의 수출 충격 규칙 대상이 아니어서 일반 안내</span>
          </div>
          <div className="cp-grid">
            <button type="button" className="cp-pick" style={delay(k++)} onClick={onGeneral}>
              <span className="cp-pick-row">
                <span className="cp-pick-name">
                  외환 비노출 고객<small>수출·수입 실적 없음</small>
                </span>
                <span className="cp-pick-n">{countText(rm.요약.비노출법인)}</span>
              </span>
            </button>
          </div>
        </section>
      )}
    </>
  )
}

function Personas({ data, scope, onPick }: { data: CampaignData; scope: Scope; onPick: (k: PersonaKey) => void }) {
  return (
    <section className="section" aria-labelledby="cp-persona">
      <div className="section-head">
        <h2 id="cp-persona">{splitName(scope.name).main} · 페르소나 분포</h2>
        <span className="unit">
          총 {countText(scope.n)}
          {scope.sub ? ` · ${scope.sub}` : ''} · 페르소나를 누르면 추천 상품이 나옵니다
        </span>
      </div>
      <div className="cp-grid cp-grid-persona">
        {personaEntries(scope.p).map(([key, n], i) => {
          const d = data.페르소나설명[key]
          return (
            <button key={key} type="button" className="cp-pick" style={delay(i)} onClick={() => onPick(key)}>
              <span className="cp-pick-row">
                <span className={`cp-badge p-${key}`}>{key}</span>
                <span className="cp-pick-n big">{countText(n)}</span>
              </span>
              <span className="cp-pick-name">
                {d.이름}
                <small>{d.정의}</small>
              </span>
            </button>
          )
        })}
      </div>
      <p className="section-note cp-caveat">
        업종은 대상 규모를 보여 줍니다. 추천 상품은 단계 × 페르소나 × 세그먼트(수출형·수입형)로 정해지므로, 업종이 달라도 같은
        페르소나는 같은 추천을 받습니다.
      </p>
    </section>
  )
}

function ProductList({ data, cell, onProduct }: { data: CampaignData; cell: RecoCell; onProduct: (n: string) => void }) {
  return (
    <ol className="cp-products">
      {cell.추천.map((p, i) => {
        const info = data.상품[p.상품명] ?? {}
        const tags = [
          info.안내페이지 ? '상담 안내(가입 상품 아님)' : '',
          p.제안방식,
          p.추가요건 ? `요건: ${p.추가요건}` : '',
          p.이용경로 ? `경로: ${p.이용경로}` : '',
          p.법인추천가능 === '확인필요' ? '법인 이용 확인 필요' : '',
        ].filter(Boolean)
        const pct = Math.round((p.한도조건조정_비율 || 0) * 100)
        return (
          <li key={p.상품명}>
            <button type="button" className="cp-product" onClick={() => onProduct(p.상품명)}>
              <span className="cp-product-row">
                <span className="cp-rank">{i + 1}</span>
                <span className="cp-product-name">{p.상품명}</span>
                <span className="cp-product-type">{info.모델유형 ?? ''}</span>
              </span>
              {tags.length > 0 && (
                <span className="cp-tags">
                  {tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              )}
              {pct > 0 && !isSmall(cell.법인수) && (
                <span className="cp-hold">
                  이미 보유한 고객 <strong>{pct}%</strong> → 신규 대신 한도·조건 조정 제안
                </span>
              )}
              <span className="cp-more">
                상품 정보 보기 <ArrowRight size={12} weight="bold" />
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function SegmentBox({
  title,
  count,
  cell,
  stage,
  data,
  onProduct,
  tone,
}: {
  title: string
  count: string
  cell: RecoCell
  stage: string
  data: CampaignData
  onProduct: (n: string) => void
  tone: 'export' | 'import' | 'general'
}) {
  // 대표 조합과 다른 조합을 받는 고객 수. 칸이 가려졌으면(-1) 숫자 대신 '일부'
  const alt = isSmall(cell.법인수) ? 0 : isSmall(cell.대표조합_법인수) ? -1 : cell.법인수 - cell.대표조합_법인수
  return (
    <article className={`cp-seg cp-seg-${tone}`}>
      <header className="cp-seg-head">
        <h3>{title}</h3>
        <span>{count}</span>
      </header>
      {cell.추천.length ? (
        <>
          <p className="cp-quote">{cell.제안메시지}</p>
          {alt !== 0 && (
            <p className="cp-alt">
              대표 조합 기준 · {alt === -1 || isSmall(alt) ? '일부 고객' : `${alt.toLocaleString('ko-KR')}곳`}은 보유 상품에 따라 다른 조합
            </p>
          )}
          <ProductList data={data} cell={cell} onProduct={onProduct} />
        </>
      ) : (
        <p className="cp-none">
          이번 달은 추천하지 않습니다(연락 보류). {stage} 단계에서 이 페르소나는 먼저 연락하지 않도록 설계했습니다.
        </p>
      )}
    </article>
  )
}

function Recommendation({
  data,
  rm,
  persona,
  region,
  ym,
  onProduct,
}: {
  data: CampaignData
  rm: RegionMonth
  persona: PersonaKey
  region: string
  ym: string
  onProduct: (n: string) => void
}) {
  const d = data.페르소나설명[persona]
  const cols = SEGMENTS.map((seg) => [seg, rm.추천.find((c) => c.페르소나 === d.이름 && c.세그먼트 === seg)] as const).filter(
    (v): v is readonly [Segment, RecoCell] => Boolean(v[1]),
  )
  return (
    <section className="section" aria-labelledby="cp-what">
      <div className="section-head">
        <h2 id="cp-what">
          무엇을 · <span className={`cp-badge p-${persona}`}>{persona}</span> {d.이름}
        </h2>
        <span className="unit">
          {d.정의} · {region} {ymDash(ym)} {rm.단계}
        </span>
      </div>
      <div className="cp-segs">
        {cols.map(([seg, cell]) => (
          <SegmentBox
            key={seg}
            title={seg}
            count={`이 페르소나 ${seg} 전체 ${countText(cell.법인수)}`}
            cell={cell}
            stage={rm.단계}
            data={data}
            onProduct={onProduct}
            tone={seg === '수출형' ? 'export' : 'import'}
          />
        ))}
        {cols.length === 0 && <p className="section-note">이 달에는 이 페르소나의 외환노출 고객이 없습니다.</p>}
      </div>
      <p className="section-note cp-caveat">상품을 누르면 수집한 상품 정보와 iM뱅크 상품몰 바로가기가 나옵니다.</p>
    </section>
  )
}

function General({ data, cell, onProduct }: { data: CampaignData; cell: RecoCell; onProduct: (n: string) => void }) {
  return (
    <section className="section" aria-labelledby="cp-gen">
      <div className="section-head">
        <h2 id="cp-gen">무엇을 · 일반 안내</h2>
        <span className="unit">매칭 모델의 수출 충격 규칙 대상이 아니어서 단계와 관계없이 같은 안내</span>
      </div>
      <div className="cp-segs cp-segs-one">
        <SegmentBox
          title="일반 제안"
          count={countText(cell.법인수)}
          cell={cell}
          stage=""
          data={data}
          onProduct={onProduct}
          tone="general"
        />
      </div>
    </section>
  )
}

function ProductDialog({ data, name, onClose }: { data: CampaignData; name: string; onClose: () => void }) {
  const info = data.상품[name] ?? {}
  const rows = Object.entries(info.상세 ?? {}).filter(([, v]) => v)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const last = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      last?.focus({ preventScroll: true })
    }
  }, [onClose])
  const tags = [
    info.모델유형,
    info.안내페이지 ? '상담 안내(가입 상품 아님)' : '',
    info.대상 && info.대상 !== '불명' ? `대상: ${info.대상}` : '',
    info.금리기준일 ? `금리 ${info.금리기준일}` : '',
  ].filter(Boolean) as string[]
  const path = info.안내페이지 ? '외환 업무 안내' : `대출 › 기업상품 › ${info.목록 ?? ''}`
  return (
    <div className="cp-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
        <button ref={closeRef} type="button" className="cp-modal-close" aria-label="닫기" onClick={onClose}>
          <X size={18} weight="bold" />
        </button>
        <p className="cp-modal-type">iM뱅크 기업상품</p>
        <h3 id="cp-modal-title">{name}</h3>
        {tags.length > 0 && (
          <p className="cp-tags">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        )}
        {rows.length ? (
          <dl className="cp-modal-dl">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="cp-none">수집된 상세 정보가 없습니다. iM뱅크 상품몰에서 원문을 확인하세요.</p>
        )}
        <p className="cp-modal-mall">
          <span>iM뱅크 금융상품몰 › {path}</span>
          <a href={data.meta.상품몰} target="_blank" rel="noopener noreferrer">
            상품몰 열기 <ArrowSquareOut size={14} weight="bold" />
          </a>
        </p>
        <p className="cp-modal-note">
          iM뱅크 사이트 {info.수집일 ?? ''} 수집 기준 요약입니다. 금리·한도·판매 여부는 상품몰에서 다시 확인하세요. 상품몰은 상품별
          주소를 제공하지 않아 첫 화면으로 연결됩니다.
        </p>
      </div>
    </div>
  )
}
