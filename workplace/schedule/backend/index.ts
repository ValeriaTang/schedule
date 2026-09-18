import 'dotenv/config'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
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

export const POST = handle(app)
export const GET = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)

export default handle(app)

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