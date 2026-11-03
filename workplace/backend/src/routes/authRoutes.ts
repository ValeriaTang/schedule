import { Hono } from 'hono'
import type { Env } from '../types/hono'
import { AuthController } from '../controllers/authController'
import { authCheck, rejectDemoAccess, rejectDemoSensitiveAccess } from '../middleware/authMiddleware'
import { rejectDemoWrite, rejectDemoReadSensitive } from '../middleware/demoGuard'
import { requireJsonContentType } from '../middleware/requestSecurity'
import { googleAuthRateLimit, loginRateLimit } from '../middleware/rateLimit'
import { requireLoginOriginGuard } from '../middleware/authSecurity'

export const authRoutes = new Hono<Env>()

// Google 認可コード (code) によるログイン（POST方式 - 既存のフロー）
authRoutes.post(
  '/google',
  loginRateLimit,
  googleAuthRateLimit,
  requireLoginOriginGuard,
  requireJsonContentType,
  async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const code = body.code

    if (!code) {
      return c.json({ error: '認可コード (code) が必要です' }, 400)
    }

    // AuthController の設計に合わせて `c`（Context）のみを渡す
    return AuthController.googleLogin(c)
  }
)

// Google OAuth リダイレクトフロー用コールバック（GET方式 - CORS回避）
// Google Identity Services の redirect_uri に指定されるエンドポイント
authRoutes.get(
  '/google/callback',
  loginRateLimit,
  googleAuthRateLimit,
  async (c) => {
    const code = c.req.query('code')
    const error = c.req.query('error')

    // Googleからエラーが返された場合
    if (error) {
      console.error('Google OAuth error:', error)
      const frontendUrl = (c.env as any).FRONTEND_URL || 'https://schedule-sai.vercel.app'
      return c.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent(error)}`)
    }

    // 認可コードがない場合
    if (!code) {
      console.error('No authorization code received from Google')
      const frontendUrl = (c.env as any).FRONTEND_URL || 'https://schedule-sai.vercel.app'
      return c.redirect(`${frontendUrl}/login.html?error=missing_code`)
    }

    try {
      // 認可コードをPOSTリクエストとして googleLogin に渡す
      // Hono Context を作成して AuthController.googleLogin を呼び出す
      const { AuthController } = await import('../controllers/authController.js')

      // Context を模倣して googleLogin を呼び出す
      const mockContext = {
        ...c,
        req: {
          ...c.req,
          json: async () => ({ code }),
          method: 'POST',
          header: (name: string) => c.req.header(name),
          query: (name: string) => c.req.query(name),
          param: (name: string) => c.req.param(name),
        },
        get: () => undefined,
        set: () => {},
        env: c.env as Env,
        var: c.var,
      } as any

      // googleLogin を呼び出してレスポンスを取得
      await AuthController.googleLogin(mockContext)

      // Cookie が設定されている場合、フロントエンドの calendar.html にリダイレクト
      const frontendUrl = (c.env as any).FRONTEND_URL || 'https://schedule-sai.vercel.app'
      return c.redirect(`${frontendUrl}/calendar.html`)
    } catch (err) {
      console.error('Google OAuth callback error:', err)
      const frontendUrl = (c.env as any).FRONTEND_URL || 'https://schedule-sai.vercel.app'
      return c.redirect(`${frontendUrl}/login.html?error=callback_failed`)
    }
  }
)

// ログイン中のユーザー情報取得
authRoutes.get('/me', authCheck, (c) => AuthController.getMe(c))

// プロフィールのニックネーム更新
authRoutes.patch(
  '/me',
  requireLoginOriginGuard,
  requireJsonContentType,
  authCheck,
  rejectDemoAccess,
  async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!name || name.length > 50) {
      return c.json({ error: 'ニックネームは1〜50文字で入力してください' }, 400)
    }

    return AuthController.updateMe(c, name)
  }
)

// 会員登録の削除
authRoutes.delete(
  '/me',
  requireLoginOriginGuard,
  authCheck,
  rejectDemoAccess,
  (c) => AuthController.deleteMe(c)
)

// ログアウト
authRoutes.post(
  '/logout',
  requireLoginOriginGuard,
  authCheck,
  rejectDemoAccess,
  (c) => AuthController.logout(c)
)

// Google連携の解除
authRoutes.post(
  '/disconnect',
  requireLoginOriginGuard,
  authCheck,
  rejectDemoAccess,
  (c) => AuthController.disconnectGoogle(c)
)

export default authRoutes
