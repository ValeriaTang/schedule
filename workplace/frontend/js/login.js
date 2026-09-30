// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    if (res.ok) {
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.log('未ログイン状態です');
  }
});

// 2. Google ログイン成功時の処理 (GSI コールバック)
async function handleCredentialResponse(response) {
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