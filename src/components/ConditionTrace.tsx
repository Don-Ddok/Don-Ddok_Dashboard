import { Fragment, type CSSProperties } from 'react'
import type { Condition, SignalCheck, SignalStatus } from '../data/signals'
import { pct } from '../lib/format'

/** 조건 한 칸의 선 모양: 충족 굵은 실선, 기준 근접 굵은 점선, 미충족 가는 실선, 해당 없음 점선 */
type StepState = 'met' | 'near' | 'unmet' | 'na'
const RANK: Record<StepState, number> = { na: 0, unmet: 1, near: 2, met: 3 }
const STATE_TEXT: Record<Exclude<StepState, 'na'>, string> = { met: '충족', near: '기준 근접', unmet: '미충족' }

function stepState(c: Condition, status: SignalStatus): StepState {
  if (status === 'na') return 'na'
  if (c.met) return 'met'
  if (c.key === 'deposit' && status === 'partial') return 'near'
  return 'unmet'
}

/** 두 칸을 잇는 선은 더 약한 쪽의 모양을 따른다 */
function weaker(a: StepState, b: StepState): StepState {
  return RANK[a] <= RANK[b] ? a : b
}

/**
 * 근거 잇기: 세 조건(지역 수출 감소 → 통장 잔고 감소 → 조합의 짝 계정)을 한 줄의 괘선으로 잇는다.
 * 각 칸 밑줄과 칸 사이 연결선의 모양이 상태를 말한다. animate가 켜지면 왼쪽부터 차례로 그어진다
 * (동작 줄이기 설정이면 바로 표시).
 */
export function ConditionTrace({ check, animate = false }: { check: SignalCheck; animate?: boolean }) {
  const { conditions, status } = check
  const states = conditions.map((c) => stepState(c, status))
  return (
    <div>
      <ol className={`trace${animate ? ' is-animated' : ''}`} aria-label="참고 신호 조건">
        {conditions.map((c, i) => (
          <Fragment key={c.key}>
            {i > 0 && (
              <li
                aria-hidden="true"
                className="trace-link"
                data-state={weaker(states[i - 1], states[i])}
                style={{ '--i': i } as CSSProperties}
              />
            )}
            <li className="trace-step" data-state={states[i]} style={{ '--i': i } as CSSProperties}>
              <span className="trace-no">조건 {i + 1}</span>
              <span className="trace-label">
                {c.label}
                {states[i] !== 'na' && <span className="trace-state">{STATE_TEXT[states[i] as Exclude<StepState, 'na'>]}</span>}
              </span>
              <span className="trace-value">{c.valueText ?? pct(c.value)}</span>
              <span className="trace-detail">{c.detail}</span>
            </li>
          </Fragment>
        ))}
      </ol>
      <p className="trace-verdict">
        {status === 'met' && '세 조건이 모두 이어졌습니다. 이번 달 한 번 살펴볼 만한 고객입니다.'}
        {status === 'partial' &&
          `지역 수출이 줄고 ${conditions[2].label}도 충족했는데, 통장 잔고 감소가 기준(-10%)에 조금 못 미칩니다. 다음 달 흐름을 함께 보면 좋습니다.`}
        {status === 'none' && '이번 달에는 조건이 이어지지 않았습니다.'}
        {status === 'na' && `해당 없음. ${check.naReason ?? '이 달은 판정하지 않습니다.'} 조건 값은 참고로만 표시합니다.`}
      </p>
    </div>
  )
}
