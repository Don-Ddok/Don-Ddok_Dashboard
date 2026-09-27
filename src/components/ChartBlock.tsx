import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { ArrowsOut, X } from '@phosphor-icons/react'
import { ResponsiveContainer } from 'recharts'

/**
 * 그래프 한 칸. 그래프나 "크게 보기"를 누르면 같은 그래프를 대화 상자(모달)로 크게 띄운다.
 * Esc, 닫기 버튼, 바깥 부분 클릭으로 닫히고, 닫히면 그래프 버튼으로 초점을 돌려준다.
 * 거래처 상세와 내부 시연 화면이 함께 쓴다(recharts를 쓰므로 지연 로딩되는 화면에서만 가져온다).
 */
export function ChartBlock({
  title,
  unit,
  value,
  valueLabel,
  summary,
  tall = false,
  children,
}: {
  title: string
  unit: string
  value?: ReactNode
  valueLabel?: string
  summary: ReactNode
  tall?: boolean
  children: ReactElement
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const show = () => {
    dialogRef.current?.showModal()
    setOpen(true)
  }
  const close = () => dialogRef.current?.close()

  const heading = (
    <>
      <span>
        {title} <span className="unit">{unit}</span>
      </span>
      {value !== undefined && (
        <span className="chart-value">
          {valueLabel && <span className="chart-value-label">{valueLabel}</span>} {value}
        </span>
      )}
    </>
  )

  return (
    <figure className="chart">
      <figcaption>{heading}</figcaption>
      <button ref={triggerRef} type="button" className="chart-open" onClick={show} aria-label={`${title} 그래프 크게 보기`}>
        <span className={`chart-body${tall ? ' tall' : ''}`} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </span>
        <span className="chart-open-hint" aria-hidden="true">
          <ArrowsOut size={14} weight="bold" /> 크게 보기
        </span>
      </button>
      <p className="chart-summary">{summary}</p>

      <dialog
        ref={dialogRef}
        className="chart-dialog"
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false)
          triggerRef.current?.focus()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="chart-dialog-inner">
          <div className="chart-dialog-head">
            <h3 id={titleId}>{heading}</h3>
            <button type="button" className="icon-button chart-dialog-close" onClick={close} aria-label="닫기">
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="chart-dialog-body" aria-hidden="true">
            {open && (
              <ResponsiveContainer width="100%" height="100%">
                {children}
              </ResponsiveContainer>
            )}
          </div>
          <p className="chart-summary">{summary}</p>
        </div>
      </dialog>
    </figure>
  )
}
