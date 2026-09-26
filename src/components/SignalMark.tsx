import type { SignalStatus } from '../data/signals'

export const STATUS_LABEL: Record<SignalStatus, string> = {
  met: '충족',
  partial: '기준 근접',
  none: '미충족',
  na: '해당 없음',
}

/** 상태를 색이 아니라 선 모양으로: 굵은 실선, 점선, 가는 선, 점선(흐림) */
export function SignalMark({ status }: { status: SignalStatus }) {
  return <span className={`mark ${status}`}>{STATUS_LABEL[status]}</span>
}
