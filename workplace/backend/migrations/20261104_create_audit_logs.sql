-- 監査ログテーブルの作成
-- ログイン、グループ参加、アカウント削除などのセキュリティ関連イベントを記録

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス: ユーザー別検索用
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- インデックス: イベントタイプ別検索用
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);

-- インデックス: 作成日時による検索用（古いログ削除など）
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
