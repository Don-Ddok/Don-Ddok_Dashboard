import { Fragment, type CSSProperties } from 'react'
import type { SignalCheck } from '../data/signals'
import { pct } from '../lib/format'

/**
 * 근거 잇기: 세 조건(지역 수출 감소 → 통장 잔고 감소 → 대출 유지)을 괘선으로 잇는다.
 * 충족한 조건과 그 사이 연결선은 굵은 실선, 충족하지 못한 것은 점선.
 * animate가 켜지면 왼쪽부터 차례로 드러난다(동작 줄이기 설정이면 바로 표시).
 */
export function ConditionTrace({ check, animate = false }: { check: SignalCheck; animate?: boolean }) {
  const { conditions, status } = check
  return (
    <div>
      <ol className={`trace${animate ? ' is-animated' : ''}`} aria-label="참고 신호 조건">
        {conditions.map((c, i) => (
          <Fragment key={c.key}>
            {i > 0 && (
              <li
                aria-hidden="true"
                className="trace-link"
                data-met={conditions[i - 1].met && c.met}
                style={{ '--i': i } as CSSProperties}
              />
            )}
            <li className="trace-step" data-met={c.met} style={{ '--i': i } as CSSProperties}>
              <span className="trace-label">
                {c.label}
                <span className="trace-state">{c.met ? '충족' : '미충족'}</span>
              </span>
              <span className="trace-value">{pct(c.value)}</span>
              <span className="trace-detail">{c.detail}</span>
            </li>
          </Fragment>
        ))}
      </ol>
      <p className="trace-verdict">
        {status === 'met' && '세 조건이 모두 이어졌습니다. 이번 달 한 번 살펴볼 만한 거래처입니다.'}
        {status === 'partial' &&
          '지역 수출이 줄고 대출도 유지 중인데, 통장 잔고 감소가 기준(-10%)에 조금 못 미칩니다. 다음 달 흐름을 함께 보면 좋습니다.'}
        {status === 'none' && '이번 달에는 조건이 이어지지 않았습니다.'}
        {status === 'na' && '수출 실적이 없는 거래처라 이 규칙의 대상이 아닙니다. 조건 값은 참고로만 표시합니다.'}
      </p>
    </div>
  )
}
