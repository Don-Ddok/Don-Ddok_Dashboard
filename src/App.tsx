import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Masthead } from './components/Masthead'
import { MonthLink, MonthProvider } from './lib/month'
import { Bulletin } from './pages/Bulletin'
import { Firms } from './pages/Firms'
import { Evidence } from './pages/Evidence'

// 그래프 라이브러리는 상세 화면에서만 쓰므로 그 화면에 들어갈 때 불러온다
const FirmDetail = lazy(() => import('./pages/FirmDetail'))

function DetailLoading() {
  return (
    <section className="lead" aria-busy="true">
      <p>거래처 계좌 흐름을 불러오는 중입니다.</p>
    </section>
  )
}

const TITLES: Record<string, string> = {
  '/': '월보',
  '/firms': '거래처',
  '/evidence': '근거와 한계',
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = TITLES[pathname] ?? (pathname.startsWith('/firms/') ? '거래처 상세' : '거래처 참고 신호 월보')
    document.title = `${page} | 거래처 참고 신호 월보`
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <MonthProvider>
      <DocumentTitle />
      <div className="page">
        <Masthead />
        <main>
          <Routes>
            <Route path="/" element={<Bulletin />} />
            <Route path="/firms" element={<Firms />} />
            <Route
              path="/firms/:id"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <FirmDetail />
                </Suspense>
              }
            />
            <Route path="/evidence" element={<Evidence />} />
            <Route
              path="*"
              element={
                <section className="lead not-found">
                  <h1>없는 화면입니다</h1>
                  <p className="detail-actions">
                    <MonthLink to="/">월보로 돌아가기</MonthLink>
                  </p>
                </section>
              }
            />
          </Routes>
        </main>
        <footer className="colophon">
          돈독(Don-Ddok) 팀, iM DiGital Banker Academy 9기 통계 프로젝트 프로토타입. iM뱅크의 공식 입장이 아니며, 거래처와 계좌 금액은
          모두 가상입니다.
        </footer>
      </div>
    </MonthProvider>
  )
}
