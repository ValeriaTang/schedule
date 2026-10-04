// 環境（ローカルか本番か）に応じて API のベース URL を自動切り替え
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  redirectIfAuthenticated(API_BASE_URL);
});

// 2. Google ログイン成功時の処理 (GSI コールバック)
window.handleCredentialResponse = async (response) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}