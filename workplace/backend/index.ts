import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'
import { Env } from './src/types/hono'
import eventRoutes from './src/routes/eventRoutes'
import authRoutes from './src/routes/authRoutes'

const app = new Hono<Env>()

// 1. セキュリティヘッダー
app.use('*', secureHeaders())

// 2. CORS設定
app.use('/api/*', cors({
  origin: ['http://localhost:5500', 'https://schedule-eight-eta.vercel.app'],
  credentials: true, // Cookie のやり取りを許可
}))

// 3. APIルートの登録
app.route('/api/events', eventRoutes)
app.route('/api/auth', authRoutes)

// ローカル開発用サーバー起動
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT) || 5000
  serve(
    {
      fetch: app.fetch,
      port,
      hostname: '0.0.0.0',
    },
    (info) => {
      console.log(`開発用サーバー起動: http://localhost:${info.port}`)
    }
  )
}

export default app