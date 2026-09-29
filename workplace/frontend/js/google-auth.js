// 1. 既にログイン済みなら index.html へリダイレクト
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
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
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}