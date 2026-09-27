import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

/**
 * 표를 감싸는 틀. 표가 화면보다 넓으면(주로 모바일) 옆으로 밀어 볼 수 있다는 안내를 보이고,
 * 키보드로도 밀 수 있도록 초점을 받게 한다.
 */
export function TableWrap({ children, label }: { children: ReactNode; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        className="table-wrap"
        tabIndex={overflow ? 0 : undefined}
        role={overflow ? 'region' : undefined}
        aria-label={overflow ? `${label ?? '표'}, 옆으로 밀어 볼 수 있음` : undefined}
      >
        {children}
      </div>
      {overflow && (
        <p className="scroll-hint">
          표를 옆으로 밀면 나머지 칸이 보입니다 <ArrowRight size={12} weight="bold" aria-hidden="true" />
        </p>
      )}
    </>
  )
}
