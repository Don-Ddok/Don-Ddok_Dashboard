import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 내부 시연 모드(`npm run dev:internal`, mode = internal)
 * - 실제 법인 데이터 집계 파일(JSON)은 이 저장소 밖에 두고, `.env.internal.local`의 INTERNAL_SUMMARY 경로로만 가리킨다.
 * - 개발 서버가 요청을 받을 때마다 그 파일을 읽어 `/__internal/summary.json`으로, 같은 폴더의 조합 신호 점검 결과(`combo_check.json`)를
 *   `/__internal/combo.json`으로, 법인 단위 월별 잔액(`firms.json`, 월보·거래처 화면용)을 `/__internal/firms.json`으로 돌려준다.
 *   빌드 결과물에는 들어가지 않는다.
 * - internal 모드로 빌드하려고 하면 멈춘다(실수로 배포되는 것을 막음).
 */
function internalSummary(path: string | undefined): Plugin {
  // 집계 파일과 같은 폴더의 정해진 파일만 넘긴다(다른 파일은 열지 않음)
  const files: Record<string, string | undefined> = {
    '/__internal/summary.json': path,
    '/__internal/combo.json': path ? join(dirname(path), 'combo_check.json') : undefined,
    '/__internal/firms.json': path ? join(dirname(path), 'firms.json') : undefined,
  }
  return {
    name: 'internal-summary',
    apply: 'serve',
    configureServer(server) {
      for (const [route, file] of Object.entries(files)) {
        server.middlewares.use(route, (req, res) => {
          const local = req.socket.remoteAddress
          if (local !== '127.0.0.1' && local !== '::1' && local !== '::ffff:127.0.0.1') {
            res.statusCode = 403
            res.end('내부 시연 데이터는 이 컴퓨터에서만 볼 수 있습니다.')
            return
          }
          if (!file || !existsSync(file)) {
            res.statusCode = 404
            res.end('집계 파일이 없습니다. .env.internal.local의 INTERNAL_SUMMARY 경로와 분석 스크립트 실행 여부를 확인하세요.')
            return
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(readFileSync(file))
        })
      }
    },
  }
}

// base './': GitHub Pages 같은 하위 경로에 올려도 자원 경로가 깨지지 않도록 상대 경로로 빌드
export default defineConfig(({ command, mode }) => {
  if (mode === 'internal' && command === 'build') {
    throw new Error('내부 시연 모드는 빌드할 수 없습니다. 실제 데이터 화면은 로컬 개발 서버에서만 엽니다.')
  }
  // 다른 폴더에서 실행해도 이 설정 파일 옆의 .env.internal.local을 읽도록 기준을 설정 파일 위치로
  const env = loadEnv(mode, dirname(fileURLToPath(import.meta.url)), 'INTERNAL_')
  return {
    base: './',
    plugins: [react(), ...(mode === 'internal' ? [internalSummary(env.INTERNAL_SUMMARY)] : [])],
    server: mode === 'internal' ? { host: '127.0.0.1' } : undefined,
  }
})
