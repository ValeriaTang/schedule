/**
 * Google ログイン成功時に呼び出される SDK コールバック関数
 * @param {object} response - Google から返される認証レスポンス
 */
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Cookie（JWT）を発行してもらうため必須
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Googleログインに失敗しました');
      return;
    }

    // ログイン成功 -> メイン画面（カレンダー等）へ遷移
    window.location.href = '/index.html';
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}