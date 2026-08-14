import { sql } from '../config/db.ts'

export const UserModel = {
  // メールアドレスでユーザーを検索
  async findByEmail(email: string) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    return result[0] || null
  },

  // ユーザーの新規作成
  async create(name: string, email: string, passwordHash: string) {
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email
    `
    return result[0]
  }
}