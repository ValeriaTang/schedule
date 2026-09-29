/**
 * ログイン状態をバックエンド（/api/auth/me）に問い合わせる
 * 未ログインの場合は自動的に login.html にリダイレクトする
 */
async function requireAuth() {
  if (window.location.pathname.endsWith('/login.html')) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

   if (!res.ok) {
      // 未ログインなら login.html へ
     window.location.href = '/login.html';
     return null;
   }

   const data = await res.json();
   return data.user;
 } catch (err) {
     console.error('認証チェックエラー:', err);
     window.location.href = '/login.html';
     return null;
   }
 }

/**
 * ログアウト処理
 */
async function logout() {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      window.location.href = '/login.html';
    } else {
      alert('ログアウトに失敗しました');
    }
  } catch (err) {
    console.error('ログアウトエラー:', err);
  }
}