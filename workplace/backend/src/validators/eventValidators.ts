import { z } from 'zod'

const isValidDateString = (val: string): boolean => {
  const date = new Date(val)
  return !isNaN(date.getTime())
}

// 1. ベースとなる純粋なオブジェクトスキーマ（.refine を付けない）
const baseEventSchema = z.object({
  group_id: z.number({ message: 'グループIDは必須です' }),
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().optional(),
  start_time: z.string().refine(isValidDateString, {
    message: '正しい日時フォーマット(ISO8601)で指定してください',
  }),
  end_time: z.string().refine(isValidDateString, {
    message: '正しい日時フォーマット(ISO8601)で指定してください',
  }),
  subject: z.string().optional(),
  subject_color: z.string().optional(),
})

// 2. 新規作成用スキーマ (ベースオブジェクトに refine を追加)
export const createEventSchema = baseEventSchema.refine(
  (data) => new Date(data.start_time) < new Date(data.end_time),
  {
    message: '終了時刻は開始時刻より後に設定してください',
    path: ['end_time'],
  }
)

// 3. 更新用スキーマ (ベースオブジェクトに対して partial と omit を実行した後に refine を追加)
export const updateEventSchema = baseEventSchema
  .omit({ group_id: true })
  .partial()
  .refine(
    (data) => {
      // 両方入力されている場合のみ開始・終了時刻の前後関係をチェック
      if (data.start_time && data.end_time) {
        return new Date(data.start_time) < new Date(data.end_time)
      }
      return true
    },
    {
      message: '終了時刻は開始時刻より後に設定してください',
      path: ['end_time'],
    }
  )

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>