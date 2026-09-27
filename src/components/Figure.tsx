import { useCountUp } from '../lib/motion'

/**
 * 요지 문장 속 핵심 숫자. 증감 방향 색과 굵은 밑줄로 눈에 띄게 하고, 화면이 열리면 0부터 올라간다.
 * 움직이는 숫자는 화면 읽기 프로그램에 숨기고, 최종 문구를 따로 읽힌다.
 */
export function ChangeFigure({ value }: { value: number }) {
  const shown = useCountUp(Math.abs(value * 100))
  const verb = value >= 0 ? '늘었' : '줄었'
  const final = `${Math.abs(value * 100).toFixed(1)}% ${verb}`
  return (
    <em className={`figure ${value >= 0 ? 'up' : 'down'}`}>
      <span aria-hidden="true">
        {shown.toFixed(1)}% {verb}
      </span>
      <span className="visually-hidden">{final}</span>
    </em>
  )
}

export function CountFigure({ value, unit }: { value: number; unit: string }) {
  const shown = useCountUp(value, 500)
  return (
    <em className="figure count">
      <span aria-hidden="true">
        {Math.round(shown)}
        {unit}
      </span>
      <span className="visually-hidden">
        {value}
        {unit}
      </span>
    </em>
  )
}
