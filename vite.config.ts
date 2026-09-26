import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './': GitHub Pages 같은 하위 경로에 올려도 자원 경로가 깨지지 않도록 상대 경로로 빌드
export default defineConfig({
  base: './',
  plugins: [react()],
})
