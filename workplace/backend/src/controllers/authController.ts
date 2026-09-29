import { OAuth2Client } from 'google-auth-library'
import { AppContext } from '../types/hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import argon2 from 'argon2'
import crypto from 'crypto'
import { sql } from '../config/db'
import { UserModel } from '../models/userModel'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// JWT秘密鍵の厳格取得
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.')
  }
  return secret
}

export const AuthController = {
  // 1. Google ログイン・新規自動登録
  async googleLogin(c: AppContext, credential: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()

      if (!payload || !payload.email || !payload.email_verified) {
        return c.json({ error: '未検証の Google アカウントまたは無効なトークンです' }, 400)
      }

      const { email, name } = payload

      // 既存ユーザーの検索
      let user = await UserModel.findByEmail(email)

      // 初回ログイン時は自動登録
      if (!user) {
        const dummyHash = await argon2.hash(crypto.randomUUID())
        const [newUser] = await sql`
          INSERT INTO users (name, email, password_hash)
          VALUES (${name || 'Google User'}, ${email}, ${dummyHash})
          RETURNING id, name, email
        `
        user = newUser
      }

      // JWT トークン発行
      const token = await sign(
        {
          id: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        getJwtSecret()
      )

      // Cookieに保存 (HttpOnly)
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
      console.error(err)
      return c.json({ error: 'Google 認証に失敗しました' }, 500)
    }
  },

  // 2. ログイン状態確認 (GET /api/auth/me)
  async getMe(c: AppContext) {
    const payload = c.get('jwtPayload')
    return c.json({ user: payload })
  },

  // 3. ログアウト (POST /api/auth/logout)
  async logout(c: AppContext) {
    deleteCookie(c, 'token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    })
    return c.json({ message: 'ログアウトしました' })
  },
}