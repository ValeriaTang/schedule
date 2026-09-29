// 環境（ローカルか本番か）に応じて API のベース URL を自動切り替え
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

// 1. 既にログイン済みなら index.html へリダイレクト
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    if (res.ok) {
      // ログイン済みならメイン画面へ
      window.location.href = '/index.html';
    }
  } catch (err) {
    // 未ログイン（401等）やネットワークエラー時は何もしない（login.html をそのまま表示）
    console.log('未ログイン状態です');
  }
});

// 2. Google ログインボタンのコールバック関数
async function handleCredentialResponse(response) {
  try {
    // 1. レスポンスから Google ID トークンを取得
    const idToken = response.credential;

    if (!idToken) {
      console.error('Google からトークンを取得できませんでした');
      return;
    }

    // 2. バックエンドへ送信 (API_BASE_URL を使用)
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // HttpOnly Cookie (JWT) の送受信に必須
      body: JSON.stringify({
        credential: idToken, // ★ バックエンド側が期待するキー名 "credential"
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // ログイン成功 -> メイン画面へ
      window.location.href = '/index.html';
    } else {
      alert(data.error || 'ログイン処理に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}