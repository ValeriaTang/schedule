// 全画面共通の認証確認関数
async function requireAuth() {
  // 現在のファイル名が login.html の場合はチェック・転送を行わない
  if (window.location.pathname.endsWith('login.html')) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      // 未ログインなら現在の階層の login.html へ飛ばす
      window.location.href = 'login.html';
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error('認証チェックエラー:', err);
    window.location.href = 'login.html';
    return null;
  }
}