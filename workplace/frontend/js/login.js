// 1. 既にログインしているかチェック
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      // 既にログイン済みならメイン画面へ
      window.location.href = '/index.html';
    }
  } catch (err) {
    console.error('認証チェックエラー:', err);
  }
});

// 2. Google ログイン成功時のコールバック関数
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // HttpOnly Cookie を受け取る設定
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // ログイン成功したらメイン画面へ移動
      window.location.href = '/index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}