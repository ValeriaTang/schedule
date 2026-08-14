import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import eventRoutes from './src/routes/eventRoutes'
import authRoutes from './src/routes/AuthRoutes'

const app = new Hono()

app.use('/api/*', cors({
  origin: 'http://localhost:5500', // フロントエンドのURL（開発時は '*' でも可）
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 各ルートの登録
app.route('/api/events', eventRoutes)
app.route('/api/auth', authRoutes) // -> /api/auth/signup , /api/auth/login にアクセス可能

const port = 5000
console.log(`Server running on port ${port}`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`=================================`)
  console.log(`サーバーが正常に起動しました！`)
  console.log(`URL: http://localhost:${info.port}`)
  console.log(`=================================`)
})