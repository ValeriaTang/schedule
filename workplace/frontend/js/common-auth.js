// ===== 重要: ページ読み込み時に URL の ?token= を即座に localStorage に保存 =====
// Google OAuth リダイレクト後のトークンを、他の認証チェックより先に保存する
(function immediateTokenExtraction() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  if (token) {
    localStorage.setItem('jwt_token', token);
    console.log('Token stored in localStorage (immediate)');
    // URL からクエリパラメータを削除（履歴を綺麗にする）
    const cleanUrl = window.location.pathname + window.location.search.replace(token, '').replace(/\?$/, '');
    window.history.replaceState(null, document.title, cleanUrl);
  }
})();

// ===== APIベースURL（未定義ならデフォルトを設定） =====
const DEFAULT_API_URL = "https://schedule-backend-navy.vercel.app";

// ===== JWT トークンを localStorage に保存・取得する関数（Cookie が正しく設定されない場合のフォールバック） =====
const TokenStorage = {
  set(token) {
    if (token) {
      localStorage.setItem('jwt_token', token)
      console.log('Token stored in localStorage')
    }
  },
  get() {
    return localStorage.getItem('jwt_token')
  },
  clear() {
    localStorage.removeItem('jwt_token')
  }
}


/**
 * 1. バックエンド（Neon）に問い合わせてログイン状態をチェックする関数
 */
async function checkAuth(baseUrl = window.API_BASE_URL || DEFAULT_API_URL) {
  // デモモード中はダミーユーザー情報を返す（バックエンド認証チェックは不要）
  if (window.DemoMode?.active) {
    return {
      id: 0,
      email: "demo@demo.local",
      name: "デモユーザー",
      mode: "demo",
    };
  }

  const token = TokenStorage.get()
  const headers = {
    'Content-Type': 'application/json'
  }

  // JWT トークンを Authorization ヘッダーで送信（Cookie が機能しない場合のフォールバック）
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers,
      credentials: "include"
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error("認証チェック通信エラー:", err);
    return null;
  }
}

/**
 * 2. メイン画面（index.html等）用：未ログインなら login.html へ飛ばす
 */
async function requireAuth(baseUrl = window.API_BASE_URL || DEFAULT_API_URL) {
  // 認証不要の公開ページリスト
  const publicPages = [
    "index.html", // ※もし index.html も完全公開ならここに入れます（ログイン必須なら外してください）
    "login.html",
    "privacy-policy.html",
    "terms-of-service.html",
    "calendar.html"
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // 公開ページの場合は認証チェックを行わずスルー
  if (publicPages.includes(currentPage)) {
    return null;
  }

  // バックエンドに問い合わせてユーザー情報を取得
  const user = await checkAuth(baseUrl);

  if (!user) {
    if (window.DemoMode?.active) {
      window.DemoMode.expire();
      return null;
    }

    // 未ログインかつログインページでなければリダイレクト
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
    return null;
  }

  return user;
}

/**
 * 3. ログイン画面（login.html）用：すでにログイン済みなら index.html へ飛ばす
 */
async function redirectIfAuthenticated(baseUrl = window.API_BASE_URL || DEFAULT_API_URL) {
  const user = await checkAuth(baseUrl);
  if (user) {
    window.location.href = 'https://schedule-sai.vercel.app/calendar.html';
  }
}