-- JWT リプレイ検知用テーブル (R05)
CREATE TABLE IF NOT EXISTS jwt_used_jtis (
    jti TEXT PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL
);

-- 定期クリーンアップ用インデックス
CREATE INDEX IF NOT EXISTS idx_jwt_used_jtis_expires_at ON jwt_used_jtis(expires_at);
