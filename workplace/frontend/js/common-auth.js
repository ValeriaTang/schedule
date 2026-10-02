// APIのベースURL（環境に合わせて自動判別）
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

// ログイン状態のチェック（ユーザー情報を返す）
async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
    return null;
  }
  return user;
}

// ログイン画面（login.html）用：ログイン済みなら index.html へ飛ばす
async function redirectIfAuthenticated() {
  const user = await checkAuth();
  if (user) {
    window.location.href = 'index.html';
  }
}