import { Hono } from 'hono'
import { cors } from 'hono/cors'
import eventRoutes from './routes/eventRoutes'
import authRoutes from './routes/Auth-.ts'

const app = new Hono()

app.use('/api/*', cors())

// 各ルートの登録
app.route('/api/events', eventRoutes)
app.route('/api/auth', authRoutes) // -> /api/auth/signup , /api/auth/login にアクセス可能

const port = Number(process.env.PORT) || 3000
console.log(`Server running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}