import { Context } from 'hono'
import argon2 from 'argon2'
import { UserModel } from '../models/userModel'

export const AuthController = {
  // 1. ユーザー登録 (POST /api/auth/signup)
  async signup(c: Context) {
    try {
      const { name, email, password } = await c.req.json()

      if (!name || !email || !password) {
        return c.json({ error: 'すべての項目を入力してください' }, 400)
      }

      // 入力されたパスワードをArgon2でハッシュ化
      const hash = await argon2.hash(password)

      // Neonデータベースに保存
      const newUser = await UserModel.create( name, email, hash)

      return c.json({
        message: 'ユーザー登録が完了しました',
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }, 201)

    } catch (err: any) {
      console.error(err)

      // メールアドレス重複エラーハンドリング (PostgreSQLのエラーコード 23505)
      if (err.code === '23505' || err.message?.includes('unique constraint')) {
        return c.json({ error: 'このメールアドレスは既に登録されています' }, 400)
      }

      return c.json({ error: 'サーバーエラーが発生しました' }, 500)
    }
  },

  // 2. ログイン (POST /api/auth/login)
  async login(c: Context) {
    try {
      const { email, password } = await c.req.json()

      if (!email || !password) {
        return c.json({ error: 'メールアドレスとパスワードを入力してください' }, 400)
      }

      // 1. ユーザーをメールアドレスで検索
      const user = await UserModel.findByEmail(email)

      if (!user) {
        return c.json({ error: 'メールアドレスまたはパスワードが間違っています' }, 401)
      }

      // 2. ハッシュとパスワードの検証
      const isPasswordValid = await argon2.verify(user.password_hash, password)

      if (!isPasswordValid) {
        return c.json({ error: 'メールアドレスまたはパスワードが間違っています' }, 401)
      }

      // 3. ログイン成功
      return c.json({
        message: 'ログインに成功しました',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })

    } catch (err) {
      console.error(err)
      return c.json({ error: 'サーバーエラーが発生しました' }, 500)
    }
  }
}