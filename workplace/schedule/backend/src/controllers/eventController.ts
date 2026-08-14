import { Context } from 'hono'
import { EventModel } from '../models/eventModel'

export const EventController = {
  // 取得処理
  async getEvents(c: Context) {
    try {
      const events = await EventModel.findAll()
      return c.json(events)
    } catch (error) {
      console.error(error)
      return c.json({ error: '予定の取得に失敗しました' }, 500)
    }
  },

  // 作成処理
  async createEvent(c: Context) {
    try {
      const { title, startDate, endDate } = await c.req.json()
      
      if (!title || !startDate) {
        return c.json({ error: 'タイトルと開始日を入力してください' }, 400)
      }

      const newEvent = await EventModel.create(title, startDate, endDate)
      return c.json(newEvent, 201)
    } catch (error) {
      console.error(error)
      return c.json({ error: '予定の作成に失敗しました' }, 500)
    }
  },

  // 削除処理
  // 削除処理
  async deleteEvent(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) {
        return c.json({ error: 'IDが指定されていません' }, 400)
      }

      await EventModel.delete(id)
      return c.json({ message: '削除が完了しました' })
    } catch (error) {
      console.error(error)
      return c.json({ error: '予定の削除に失敗しました' }, 500)
    }
  }
}