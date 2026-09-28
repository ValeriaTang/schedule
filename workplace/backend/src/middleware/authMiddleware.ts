import { AppContext, Env } from '../types/hono'
import { Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.')
  }
  return secret
}


export const authCheck = async (c: AppContext, next: Next) => {
  try {
    const token = getCookie(c, 'token')

    if (!token) {
      return c.json({ error: '認証トークンが存在しません。ログインしてください' }, 401)
    }

    // JWT の検証 (HS256)
    const payload = await verify(token, getJwtSecret(), 'HS256')
    c.set('jwtPayload', payload as Env['Variables']['jwtPayload'])
    await next()
  } catch (error) {
    return c.json({ error: '無効または期限切れのトークンです' }, 401)
  }
}