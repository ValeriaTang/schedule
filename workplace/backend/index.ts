import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'
import { Env } from './src/types/hono'
import eventRoutes from './src/routes/eventRoutes'
import authRoutes from './src/routes/authRoutes'

const app = new Hono<Env>()

// 1. セキュリティヘッダー (Google ログインポップアップ通信を許可するために COOP を緩和)
app.use(
  '*',
  secureHeaders({
    crossOriginOpenerPolicy: 'unsafe-none',
  })
)

// 2. CORS設定
app.use(
  '/api/*',
  cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://schedule-sai.vercel.app'],
    credentials: true, // Cookie のやり取りを許可
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// 3. エラーハンドラ (500エラー発生時にターミナルに詳しいログを出力させる)
app.onError((err, c) => {
  console.error('★ サーバーエラー詳細:', err)
  return c.json(
    {
      error: 'サーバー内部エラーが発生しました',
      message: err.message,
    },
    500
  )
})

// 4. APIルートの登録
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