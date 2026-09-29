import { sql } from '../config/db'

export interface User {
  id: number
  google_id?: string
  name: string
  email: string
  picture?: string
  created_at?: Date
}

export const UserModel = {

  async findByGoogleId(googleId: string): Promise<User | null> {
    const rows = await sql`
      SELECT id, google_id, name, email, picture
      FROM users
      WHERE google_id = ${googleId}
      LIMIT 1
    `
    if (rows.length === 0) {
      return null
    }
    return rows[0] as User
  },

  // メールアドレスでユーザーを検索
  async findByEmail(email: string): Promise<User | null> {
    const rows = await sql`
      SELECT id, google_id, name, email, picture
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    if (rows.length === 0) {
      return null
    }
    return rows[0] as User
  },

  // ID（主キー）でユーザーを検索
  async findById(id: string | number): Promise<User | null> {
    const users = await sql`
      SELECT id, google_id, name, email, picture
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    return (users[0] as User) || null
  },

  // Google ユーザーの新規作成
  async createGoogleUser(
    googleId: string,
    name: string,
    email: string,
    picture?: string
  ): Promise<User> {
    const [newUser] = await sql`
      INSERT INTO users (google_id, name, email, picture)
      VALUES (${googleId}, ${name || 'Google User'}, ${email}, ${picture || null})
      RETURNING id, google_id, name, email, picture
    `
    return newUser as User
  }
}