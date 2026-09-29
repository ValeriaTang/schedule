import { OAuth2Client } from 'google-auth-library'
import { AppContext } from '../types/hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { UserModel } from '../models/userModel'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.')
  }
  return secret
}

export const AuthController = {
  async googleLogin(c: AppContext, credential: string) {
    try {
      // 1. Google ID トークンの検証
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()

      if (!payload || !payload.email || !payload.email_verified) {
        return c.json({ error: '未検証の Google アカウントまたは無効なトークンです' }, 400)
      }

      const googleId = payload.sub
      const email = payload.email!
      const name = payload.name || ''
      const picture = payload.picture || ''

      // 2. ユーザー検索 (型は User | null)
      let user = await UserModel.findByGoogleId(googleId)

      if (!user && email) {
        user = await UserModel.findByEmail(email)
    }

      // 3. ユーザーが存在しない場合は新規作成して代入
      if (!user) {
        // dummyHash は渡さず、name と email のみを渡す
        user = await UserModel.createGoogleUser(
          googleId,
          name || 'Google User',
          email,
          picture
        )
      }

      // この時点で user は確実に User 型として認識されます
      const token = await sign(
        {
          id: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24時間有効
        },
        getJwtSecret()
      )

      // HttpOnly Cookie のセット
      setCookie(c, 'token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      })

      return c.json({
        message: 'Google ログインに成功しました',
        user: { id: user.id, name: user.name, email: user.email },
      })
    } catch (err) {
      console.error('Google 認証エラー:', err)
      return c.json({ error: 'Google 認証処理に失敗しました' }, 500)
    }
  },

  // ログイン中ユーザー情報の取得
  async getMe(c: AppContext) {
    const payload = c.get('jwtPayload')
    if (!payload) {
      return c.json({ error: '未認証のユーザーです' }, 401)
    }
    return c.json({ user: payload })
  },

  // ログアウト処理
  async logout(c: AppContext) {
    deleteCookie(c, 'token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    })
    return c.json({ message: 'ログアウトしました' })
  },
}