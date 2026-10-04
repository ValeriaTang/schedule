# API仕様

## 認証API

- `POST /api/auth/google`: Googleログイン
- `GET /api/auth/me`: ログインユーザー情報取得
- `POST /api/auth/logout`: ログアウト

## イベントAPI

- `GET /api/events`: イベント一覧取得
- `POST /api/events`: イベント作成
- `PUT /api/events/:id`: イベント更新
- `DELETE /api/events/:id`: イベント削除
