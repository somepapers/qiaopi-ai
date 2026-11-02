import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateRouter } from './routes/generate.js'
import { shortenRouter } from './routes/shorten.js'
import exhibition from './exhibition/handler.js'

const app = express()
const localSite = process.argv.includes('--local-site')
const PORT = process.env.PORT || 3001

// Keep the authenticated gallery same-origin, including when Vite proxies it.
app.all('/api/exhibition', express.json({ limit: '16kb' }), exhibition)
if (!localSite) app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'qiaopi-ai-server' })
})

app.use('/api', generateRouter)
app.use('/api', shortenRouter)

if (localSite) {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url))
  const index = fileURLToPath(new URL('../dist/index.html', import.meta.url))
  if (!existsSync(index)) throw new Error('请先在项目根目录运行 npm run build')

  const { default: stats } = await import('../api/stats.js')
  app.all('/api/stats', stats)
  app.use('/api', (_req, res) => res.status(404).json({ message: '本机未提供此接口' }))
  app.use('/assets', express.static(dist + 'assets', { immutable: true, maxAge: '1y', fallthrough: false }))
  app.use(express.static(dist, { maxAge: 0 }))
  app.get('/{*path}', (_req, res) => res.sendFile(index))
  app.listen(4173, '127.0.0.1', () => {
    console.log('本机展览馆已启动 → http://127.0.0.1:4173/exhibition')
  })
} else {
  app.listen(PORT, () => {
    console.log(`🖋️  侨批AI代书人 后端服务已启动 → http://localhost:${PORT}`)
  })
}
