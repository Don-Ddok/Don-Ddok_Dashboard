import { useLocation } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { COMBO_IDS, COMBOS } from '../data/combos'
import { MonthLink, useMonth } from '../lib/month'

/** 조합을 쓰는 신호 월보 계열 화면에서만 보인다(계정 시차는 화면 안에서 자세히 고르므로 제외) */
const SHOWN = ['/bulletin', '/firms', '/evidence']

/**
 * 신호 조합 고르기: 요구불예금 잔액에 짝지을 계정을 고르면 월보·고객·근거와 한계가 그 조합으로 바뀐다.
 * 고른 조합은 주소(?c=)에 남아 화면을 옮겨 다녀도 유지된다.
 */
export function ComboSwitch() {
  const { pathname } = useLocation()
  const { combo, setCombo } = useMonth()
  if (!SHOWN.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="combo-switch" role="group" aria-label="신호 조합">
      <span className="combo-switch-label">신호 조합</span>
      <div className="combo-switch-options">
        {COMBO_IDS.map((id) => {
          const c = COMBOS[id]
          return (
            <button key={id} type="button" aria-pressed={combo === id} onClick={() => setCombo(id)}>
              <span className="combo-name">
                요구불예금 <span aria-hidden="true">+</span> <strong>{c.partner}</strong>
              </span>
              <span className="combo-meta">
                {c.timing} · 실제 점검 {c.verdict}
              </span>
            </button>
          )
        })}
      </div>
      <MonthLink to="/timing" className="combo-switch-more">
        계정 시차에서 고르기 <ArrowRight size={12} weight="bold" />
      </MonthLink>
    </div>
  )
}
