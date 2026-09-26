import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import App from './App'

// 정적 호스팅(GitHub Pages)에서도 새로고침이 깨지지 않도록 해시 주소를 쓴다
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
