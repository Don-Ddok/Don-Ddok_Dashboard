import { useEffect, useState } from 'react'

/** 운영체제의 "동작 줄이기" 설정이 켜져 있으면 true. 그때는 모든 움직임을 끄고 최종 상태를 바로 보여 준다 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 숫자가 0에서 목표값까지 올라가는 값. 목표가 바뀌면 다시 센다 */
export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
