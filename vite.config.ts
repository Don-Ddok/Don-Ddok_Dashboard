import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 내부 시연 모드(`npm run dev:internal`, mode = internal)
 * - 실제 법인 데이터 집계 파일(JSON)은 이 저장소 밖에 두고, `.env.internal.local`의 INTERNAL_SUMMARY 경로로만 가리킨다.
 * - 개발 서버가 요청을 받을 때마다 그 파일을 읽어 `/__internal/summary.json`으로 돌려준다. 빌드 결과물에는 들어가지 않는다.
 * - internal 모드로 빌드하려고 하면 멈춘다(실수로 배포되는 것을 막음).
 */
function internalSummary(path: string | undefined): Plugin {
  return {
    name: 'internal-summary',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__internal/summary.json', (req, res) => {
        const local = req.socket.remoteAddress
        if (local !== '127.0.0.1' && local !== '::1' && local !== '::ffff:127.0.0.1') {
          res.statusCode = 403
          res.end('내부 시연 데이터는 이 컴퓨터에서만 볼 수 있습니다.')
          return
        }
        if (!path || !existsSync(path)) {
          res.statusCode = 404
          res.end('INTERNAL_SUMMARY 경로의 집계 파일이 없습니다. .env.internal.local을 확인하세요.')
          return
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(readFileSync(path))
      })
    },
  }
}

// base './': GitHub Pages 같은 하위 경로에 올려도 자원 경로가 깨지지 않도록 상대 경로로 빌드
export default defineConfig(({ command, mode }) => {
  if (mode === 'internal' && command === 'build') {
    throw new Error('내부 시연 모드는 빌드할 수 없습니다. 실제 데이터 화면은 로컬 개발 서버에서만 엽니다.')
  }
  const env = loadEnv(mode, process.cwd(), 'INTERNAL_')
  return {
    base: './',
    plugins: [react(), ...(mode === 'internal' ? [internalSummary(env.INTERNAL_SUMMARY)] : [])],
    server: mode === 'internal' ? { host: '127.0.0.1' } : undefined,
  }
})
