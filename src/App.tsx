import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Masthead } from './components/Masthead'
import { ComboSwitch } from './components/ComboSwitch'
import { SubNav } from './components/SubNav'
import { MonthLink, MonthProvider } from './lib/month'
import { Bulletin } from './pages/Bulletin'
import { Home } from './pages/Home'
import { Firms } from './pages/Firms'
import { Evidence } from './pages/Evidence'
import { Timing } from './pages/Timing'
import { Board } from './pages/Board'
import { INTERNAL } from './lib/internal'
import { DataProvider, useData } from './lib/data'

// 그래프 라이브러리는 상세 화면에서만 쓰므로 그 화면에 들어갈 때 불러온다
const FirmDetail = lazy(() => import('./pages/FirmDetail'))
// 이번 달 추천·근거(분석 결과) 화면은 들어갈 때 불러온다(추천 데이터는 화면에서 따로 받음)
const Campaign = lazy(() => import('./pages/Campaign'))
const Analysis = lazy(() => import('./pages/Analysis'))
const Insight = lazy(() => import('./pages/Insight'))
const Glossary = lazy(() => import('./pages/Glossary'))
// 내부 시연 화면: internal 모드 개발 서버에서만. 배포 빌드에서는 INTERNAL이 false로 고정돼 이 화면 코드가 빠진다
const Internal = INTERNAL ? lazy(() => import('./pages/Internal')) : null

/** 예전 주소 /campaign 은 조건(?r=&cm=…)을 그대로 들고 /recommend 로 옮긴다 */
function LegacyCampaign() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/recommend', search }} replace />
}

function DetailLoading() {
  return (
    <section className="lead" aria-busy="true">
      <p>화면을 불러오는 중입니다.</p>
    </section>
  )
}

const TITLES: Record<string, string> = {
  '/': '홈',
  '/recommend': '이번 달 추천',
  '/bulletin': '신호 월보',
  '/insight': '근거와 한계 · 팀 인사이트',
  '/analysis': '근거와 한계 · 여신 분석',
  '/firms': '고객',
  '/timing': '계정 시차',
  '/board': '팀 게시판',
  '/evidence': '근거와 한계 · 신호 규칙 점검',
  '/glossary': '근거와 한계 · 용어 사전',
  ...(INTERNAL ? { '/internal': '내부 시연' } : {}),
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = TITLES[pathname] ?? (pathname.startsWith('/firms/') ? '고객 상세' : '법인 고객 마케팅 월보')
    document.title = `${page} | 법인 고객 마케팅 월보`
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  )
}

function Shell() {
  const { kind } = useData()
  return (
    <MonthProvider>
      <DocumentTitle />
      {/* 뒷배경 장식: 페이지 맨 위 양쪽 끝에만 민트·청색 빛번짐. 스크롤하면 함께 올라가 표 뒤에는 깔리지 않는다 */}
      <div className="backdrop-glow" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="page">
        <Masthead />
        <SubNav />
        <ComboSwitch />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/recommend"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <Campaign />
                </Suspense>
              }
            />
            <Route path="/campaign" element={<LegacyCampaign />} />
            <Route path="/bulletin" element={<Bulletin />} />
            <Route
              path="/glossary"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <Glossary />
                </Suspense>
              }
            />
            <Route
              path="/insight"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <Insight />
                </Suspense>
              }
            />
            <Route
              path="/analysis"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <Analysis />
                </Suspense>
              }
            />
            <Route path="/firms" element={<Firms />} />
            <Route
              path="/firms/:id"
              element={
                <Suspense fallback={<DetailLoading />}>
                  <FirmDetail />
                </Suspense>
              }
            />
            <Route path="/timing" element={<Timing />} />
            <Route path="/board" element={<Board />} />
            <Route path="/evidence" element={<Evidence />} />
            {Internal && (
              <Route
                path="/internal"
                element={
                  <Suspense fallback={<DetailLoading />}>
                    <Internal />
                  </Suspense>
                }
              />
            )}
            <Route
              path="*"
              element={
                <section className="lead not-found">
                  <h1>없는 화면입니다</h1>
                  <p className="detail-actions">
                    <MonthLink to="/">처음 화면으로</MonthLink>
                  </p>
                </section>
              }
            />
          </Routes>
        </main>
        <footer className="colophon">
          돈독(Don-Ddok) 팀, iM DiGital Banker Academy 9기 통계 프로젝트 프로토타입. iM뱅크의 공식 입장이 아닙니다. 캐릭터 단디·똑디·우디는
          iM뱅크 캐릭터입니다.{' '}
          {kind === 'real'
            ? '내부 시연 모드: 신호 월보의 고객과 계좌 금액은 실제 은행 법인 데이터(익명 법인ID)이며 외부에 공유하지 않습니다.'
            : '신호 월보의 고객과 계좌 금액은 가상입니다. 이번 달 추천과 근거와 한계(분석 결과)의 숫자는 교육용 법인 익명데이터 집계입니다(법인 ID 없음).'}
        </footer>
      </div>
    </MonthProvider>
  )
}
