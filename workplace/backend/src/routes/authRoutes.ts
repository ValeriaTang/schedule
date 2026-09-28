import { Hono } from 'hono'
import { Env } from '../types/hono'
import { AuthController } from '../controllers/authController'
import { authCheck } from '../middleware/authMiddleware'

export const authRoutes = new Hono<Env>()

// Google 認証
authRoutes.post('/google', async (c) => {
  const { credential } = await c.req.json().catch(() => ({}))

  if (!credential) {
    return c.json({ error: 'Google 認証情報 (credential) がありません' }, 400)
  }

  return AuthController.googleLogin(c, credential)
})

// ログイン中のユーザー情報取得（要認証ミドルウェア）
authRoutes.get('/me', authCheck, (c) => AuthController.getMe(c))

// ログアウト
authRoutes.post('/logout', (c) => AuthController.logout(c))

export default authRoutes