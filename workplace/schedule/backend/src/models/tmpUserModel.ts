import { sql } from '../config/db'

export const TmpUserModel = {
  // 仮登録の作成（トークンと有効期限を保持）
  async create(name: string, email: string, passwordHash: string, token: string) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await sql`DELETE FROM tmp_users WHERE expires_at < NOW()`

    const result = await sql`
      INSERT INTO tmp_users (name, email, password_hash, token, expires_at)
      VALUES (${name}, ${email}, ${passwordHash}, ${token}, ${expiresAt})
      RETURNING *
    `
    return result[0]
  },

  // トークンによる検索
  async findByToken(token: string) {
    const result = await sql`
      SELECT * FROM tmp_users
      WHERE token = ${token} AND expires_at > NOW()
    `
    return result[0] || null
  },

  // 仮登録の削除
  async delete(id: number) {
    await sql`DELETE FROM tmp_users WHERE id = ${id}`
  }
}