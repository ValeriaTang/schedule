import { sql } from '../config/db'

export const EventModel = {
  // 全予定の取得
  async findAll() {
    return await sql`SELECT * FROM events ORDER BY start_date ASC`
  },

  // 新規予定の作成
  async create(title: string, startDate: string, endDate: string) {
    const result = await sql`
      INSERT INTO events (title, start_date, end_date)
      VALUES (${title}, ${startDate}, ${endDate})
      RETURNING *
    `
    return result[0]
  },

  // 予定の削除
  async delete(id: string) {
    return await sql`DELETE FROM events WHERE id = ${id}`
  }
}