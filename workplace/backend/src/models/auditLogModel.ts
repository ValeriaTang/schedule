import { sql } from '../config/db'
import type { Context } from 'hono'
import type { Env } from '../types/hono'

export interface AuditLogEntry {
  id: number
  user_id: number | null
  event_type: string
  event_details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CreateAuditLogParams {
  userId: number | null
  eventType: string
  details?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

export class AuditLogModel {
  /**
   * 監査ログを作成する
   */
  static async create(params: CreateAuditLogParams): Promise<void> {
    const { userId, eventType, details, ipAddress, userAgent } = params

    await sql`
      INSERT INTO audit_logs (user_id, event_type, event_details, ip_address, user_agent)
      VALUES (${userId}, ${eventType}, ${details ? JSON.stringify(details) : null}, ${ipAddress}, ${userAgent})
    `
  }

  /**
   * Hono Context から IP アドレスと User-Agent を抽出して監査ログを作成
   */
  static async createFromContext(
    c: Context<Env>,
    userId: number | null,
    eventType: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || null

    const userAgent = c.req.header('user-agent') || null

    await this.create({
      userId,
      eventType,
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * ユーザーの監査ログを取得（管理用）
   */
  static async getByUserId(userId: number, limit = 100): Promise<AuditLogEntry[]> {
    return (sql`
      SELECT id, user_id, event_type, event_details, ip_address, user_agent, created_at
      FROM audit_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as unknown as AuditLogEntry[])
  }

  /**
   * イベントタイプで検索
   */
  static async getByEventType(eventType: string, limit = 100): Promise<AuditLogEntry[]> {
    return (sql`
      SELECT id, user_id, event_type, event_details, ip_address, user_agent, created_at
      FROM audit_logs
      WHERE event_type = ${eventType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as unknown as AuditLogEntry[])
  }
}
