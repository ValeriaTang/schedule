import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

export const authCheck = async (c: Context, next: Next) => {
  // 1. Cookie から token を取得
  const token = getCookie(c, 'token') || c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: '認証トークンがありません (400/401)' }, 400)
  }

  try {
    // 2. JWT の検証
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const payload = await verify(token, secret, 'HS256')

    // コンテキストにユーザー情報を保存
    c.set('jwtPayload', payload)

    await next()
  } catch (err) {
    console.error('JWT検証エラー:', err)
    return c.json({ error: '無効なトークンです' }, 401)
  }
}