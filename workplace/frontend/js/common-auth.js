// ログイン状態のチェック（ユーザー情報を返す）
async function checkAuth(API_BASE_URL_ARG) {
  try {
    const res = await fetch(`${API_BASE_URL_ARG}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('認証チェック失敗:', err);
    return null;
  }
}

// メイン画面（index.html等）用：未ログインなら login.html へ飛ばす
async function requireAuth(API_BASE_URL_ARG) {
  const user = await checkAuth(API_BASE_URL_ARG);
  if (!user) {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
    return null;
  }
  return user;
}

// ログイン画面（login.html）用：ログイン済みなら index.html へ飛ばす
async function redirectIfAuthenticated(API_BASE_URL_ARG) {
  const user = await checkAuth(API_BASE_URL_ARG);
  if (user) {
    window.location.href = 'index.html';
  }
}