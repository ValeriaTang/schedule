import { neon } from '@neondatabase/serverless'

// .env からデータベースの接続URLを読み込む
const DATABASE_URL = process.env.DATABASE_URL || ''

if (!DATABASE_URL) {
  console.error('DATABASE_URL が設定されていません。')
}

// 他のファイルから使い回せるように SQL 発行関数を export
export const sql = neon(DATABASE_URL)