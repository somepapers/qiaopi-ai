import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { generateRouter } from './routes/generate.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'qiaopi-ai-server' })
})

app.use('/api', generateRouter)

app.listen(PORT, () => {
  console.log(`🖋️  侨批AI代书人 后端服务已启动 → http://localhost:${PORT}`)
})
