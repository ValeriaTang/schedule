import type { Context, Next } from 'hono'
import { Env } from '../types/hono'

/**
 * デモモードでは書き込み系 API をすべて拒否
 * 既存の rejectDemoAccess の別名（意味的に明確化）
 */
export const rejectDemoWrite = async (c: Context<Env>, next: Next) => {
  const payload = c.get('jwtPayload')
  if (payload?.mode === 'demo') {
    return c.json({ error: 'デモモードでは既存データを変更できません。' }, 403)
  }
  await next()
}

/**
 * デモモードでは機密情報の取得も拒否
 * 招待コード取得、グループ詳細、メンバー一覧、チャット履歴など
 */
export const rejectDemoReadSensitive = async (c: Context<Env>, next: Next) => {
  const payload = c.get('jwtPayload')
  if (payload?.mode === 'demo') {
    return c.json({ error: 'デモモードではこの操作はできません。' }, 403)
  }
  await next()
}

/**
 * 両方のチェックを一度に行う（互換性のため残す）
 */
export const rejectDemoAccess = rejectDemoWrite
