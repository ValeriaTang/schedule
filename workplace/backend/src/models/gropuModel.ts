import { sql } from '../config/db'

export interface Group {
  id?: number
  group_name: string
  color?: string
  invite_code?: string
  created_by?: number
}

export const groupModel = {
  // グループ新規作成（カラー指定対応）
  async createGroup(groupName: string, inviteCode: string, userId: number, color: string = '#3b82f6') {
    const [group] = await sql`
      INSERT INTO groups (group_name, invite_code, created_by, color)
      VALUES (${groupName}, ${inviteCode}, ${userId}, ${color})
      RETURNING *
    `
    return group
  },

  // IDからグループ検索
  async findById(groupId: number) {
    const [group] = await sql`
      SELECT * FROM groups WHERE id = ${groupId}
    `
    return group
  },

  // 招待コードからグループ検索
  async findByInviteCode(inviteCode: string) {
    const [group] = await sql`
      SELECT * FROM groups WHERE invite_code = ${inviteCode}
    `
    return group
  },

  // メンバー追加（作成者は 'admin'、通常メンバーは 'member'）
  async addMember(groupId: number, userId: number, role: string = 'member') {
    const [member] = await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${groupId}, ${userId}, ${role})
      ON CONFLICT (group_id, user_id) DO NOTHING
      RETURNING *
    `
    return member
  },

  // ユーザーのロール（admin, owner, member）を取得
  async getMemberRole(groupId: number, userId: number) {
    const [member] = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${userId}
    `
    return member ? member.role : null
  },

  // グループ情報の更新（管理者用）
  async updateGroup(groupId: number, groupName?: string | null, color?: string | null) {
    const [group] = await sql`
      UPDATE groups
      SET 
        group_name = COALESCE(${groupName}, group_name),
        color = COALESCE(${color}, color)
      WHERE id = ${groupId}
      RETURNING id, group_name, color, invite_code
    `
    return group
  },

  // 所属グループ一覧取得
  async getUserGroups(userId: number, isDemo: boolean = false) {
    if (isDemo) {
      return await sql`
        SELECT g.id, g.group_name, g.color, gm.role
        FROM groups g
        JOIN group_members gm ON gm.group_id = g.id
        WHERE gm.user_id = ${userId}
        ORDER BY g.id DESC
      `
    }

    return await sql`
      SELECT g.id, g.group_name, g.color, g.invite_code, gm.role
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.id
      WHERE gm.user_id = ${userId}
      ORDER BY g.id DESC
    `
  },

  // グループ共有イベント一覧取得（グループカラー自動適用対応）
  async getGroupEvents(groupId: number) {
    return await sql`
      SELECT 
        e.*, 
        g.color AS group_color,
        COALESCE(e.subject_color, g.color) AS display_color,
        creator.name AS creator_name, 
        editor.name AS editor_name
      FROM events e
      JOIN groups g ON e.group_id = g.id
      LEFT JOIN users creator ON e.created_by = creator.id
      LEFT JOIN users editor ON e.updated_by = editor.id
      WHERE e.group_id = ${groupId}
      ORDER BY e.start_time ASC
    `
  }
}