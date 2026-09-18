import { Context } from 'hono'
import argon2 from 'argon2'
import { sql } from '../config/db'
import { Resend } from 'resend'
import { UserModel } from '../models/userModel'
import { TmpUserModel } from '../models/tmpUserModel'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export const AuthController = {
  // 1. ユーザー登録 (POST /api/auth/signup)
  async signup(c: Context) {
    try {
      const { name, email, password } = await c.req.json()

      if (!name || !email || !password) {
        return c.json({ error: 'すべての項目を入力してください' }, 400)
      }

      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return c.json({ error: 'このメールアドレスは既に登録されています' }, 400)
      }

      const hash = await argon2.hash(password)
      const token = crypto.randomUUID()
      await TmpUserModel.create(name, email, hash, token)
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`
      await resend.emails.send({
        from: 'onboarding@resend.dev', // 本番は独自ドメインに設定
        to: email,
        subject: 'アカウント認証のお願い',
        html: `<p>${name}様</p><p>以下のリンクをクリックして30分以内に本登録を完了してください。</p><a href="${verifyUrl}">${verifyUrl}</a>`
      })

      return c.json({ message: '確認メールを送信しました。30分以内に認証を完了してください。' }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ error: '仮登録処理に失敗しました' }, 500)
    }
  },

  // 2. 本登録 (GET /api/auth/verify?token=xxxx)
  async verify(c: Context) {
    try {
      const token = c.req.query('token')
      if (!token) {
        return c.json({ error: 'トークンが指定されていません' }, 400)
      }

      const tmpUser = await TmpUserModel.findByToken(token)
      if (!tmpUser) {
        return c.json({ error: '無効なトークンです' }, 400)
      }

      let newUser
      const [inserted] = await sql.transaction((tx) => [
        tx`
          INSERT INTO users (name, email, password_hash)
          VALUES (${tmpUser.name}, ${tmpUser.email}, ${tmpUser.password_hash})
          RETURNING id, name, email
        `,
        tx`
          DELETE FROM tmp_users WHERE id = ${tmpUser.id}
        `
        ])
        newUser = inserted[0]

      return c.json({ message: '本登録が完了しました！', user: newUser }, 201)
    } catch (err) {
      console.error(err)
      return c.json({ error: '本登録処理に失敗しました' }, 500)
    }
  },

  // 3. ログイン (POST /api/auth/login)
  async login(c: Context) {
    try {
      const { email, password } = await c.req.json()
      const user = await UserModel.findByEmail(email)

      if (!email || !password) {
        return c.json({ error: 'メールアドレスとパスワードを入力してください' }, 400)
      }

      if (!user) {
        return c.json({ error: 'メールアドレスまたはパスワードが間違っています' }, 401)
      }

      const isValid = await argon2.verify(user.password_hash, password)
      if (!isValid) {
        return c.json({ error: 'メールアドレスまたはパスワードが間違っています' }, 401)
      }

      return c.json({
        message: 'ログインに成功しました',
        user: { id: user.id, name: user.name, email: user.email }
      })
    } catch (err) {
      console.error(err)
      return c.json({ error: 'サーバーエラーが発生しました' }, 500)
    }
  }
}