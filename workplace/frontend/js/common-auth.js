// commonAuth.js
const API_BASE_URL = "http://localhost:5000";

// 認証チェックを行い、ユーザー情報を返す
async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error("認証チェック失敗:", err);
    return null;
  }
}

// 保護されたページ（index.htmlなど）用：未ログインなら login.html へ
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    // 既に login.html にいる場合はリダイレクトしない（ループ防止）
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
    return null;
  }
  return user;
}

// ログインページ（login.html）用：すでにログイン済みなら index.html へ
async function redirectIfAuthenticated() {
  const user = await checkAuth();
  if (user) {
    window.location.href = "index.html";
  }
}