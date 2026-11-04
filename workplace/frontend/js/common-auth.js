// ===== 重要: ページ読み込み時に URL の ?token= を即座に localStorage に保存 =====
// Google OAuth リダイレクト後のトークンを、他の認証チェックより先に保存する
(function immediateTokenExtraction() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  // トークンが存在し、かつ空文字（""）ではない場合のみ保存する
  if (token && token.trim() !== "") {
    // トークンを jwt_token キーに保存（後方互換性のため token キーにも保存）
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('token', token); // 互換性のため - 他のファイルで token を使用する場合に対応
    console.log('✅ 有効なトークンをURLから正常に保存しました（jwt_token と token キーに）');
    console.log('保存されたトークン:', token);
    // URL からクエリパラメータを削除（履歴を綺麗にする）
    const cleanUrl = window.location.pathname + window.location.search.replace(token, '').replace(/\?$/, '');
    window.history.replaceState(null, document.title, cleanUrl);
  } else if (window.location.search.includes('token')) {
    // ⚠️ tokenパラメータはあるのに中身が空の場合
    console.warn('⚠️ トークンが空の状態でリダイレクトされました');
    // クエリパラメータをクリーンアップしてリダイレクトループを防止
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, document.title, cleanUrl);
  } else {
    console.log('⚠️ URL にトークンパラメータは存在しません');
  }
})();

// ===== APIベースURL（未定義ならデフォルトを設定） =====
const DEFAULT_API_URL = "https://schedule-phi-seven.vercel.app";

// ===== JWT トークンを localStorage に保存・取得する関数（Cookie が正しく設定されない場合のフォールバック） =====
const TokenStorage = {
  set(token) {
    if (token) {
      localStorage.setItem('token', token); // 主なキー名
      localStorage.setItem('jwt_token', token); // 後方互換性のため
      console.log('✅ トークンを正常に保存しました（token キー）');
    }
  },
  get() {
    return localStorage.getItem('token') || localStorage.getItem('jwt_token'); // 'token' を優先
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token');
  }
}


/**
 * トークンが localStorage に保存されるまで待機する（最大5秒）
 * 非同期でトークンがセットされる前にAPIが走るのを防ぐためのガード
 */
async function waitForToken(timeout = 5000) {
  const startTime = Date.now();
  const checkInterval = 50; // 50msごとにチェック
  
  return new Promise((resolve) => {
    const check = () => {
      const token = TokenStorage.get();
      if (token && token.trim() !== "") {
        console.log('✅ トークン確認完了:', token.substring(0, 20) + '...');
        resolve(token);
        return;
      }
      if (Date.now() - startTime > timeout) {
        console.warn('⚠️ トークン待機タイムアウト（' + timeout + 'ms）');
        resolve(null);
        return;
      }
      setTimeout(check, checkInterval);
    };
    check();
  });
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

  // トークンが保存されるまで待機（非同期セットのガード）
  await waitForToken();

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

    // 未ログインかつログインページでなければリダイレクト（500ms待機）
    if (!window.location.pathname.endsWith('login.html')) {
      redirectToLoginIfStillUnauthenticated();
    }
    return null;
  }

  return user;
}

/**
 * リダイレクト前にトークン復旧を待機（500ms間隔チェック）
 * 非同期でトークンがセットされる前にリダイレクトするのを防ぐ
 */
let redirectTimer = null;

function redirectToLoginIfStillUnauthenticated(delayMs = 500) {
  // 既存のタイマーをクリア（重複リダイレクト防止）
  if (redirectTimer) {
    clearTimeout(redirectTimer);
  }

  redirectTimer = setTimeout(async () => {
    // 再度トークンをチェック（復旧した可能性があるため）
    const token = TokenStorage.get();
    if (token && token.trim() !== "") {
      console.log('✅ トークンが復旧しました。リダイレクトをキャンセルします。');
      return;
    }

    // デモモードもチェック
    if (window.DemoMode?.active) {
      return;
    }

    // リダイレクト実行
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  }, delayMs);
}

/**
 * 3. ログイン画面（login.html）用：すでにログイン済みなら index.html へ飛ばす
 */
async function redirectIfAuthenticated(baseUrl = window.API_BASE_URL || DEFAULT_API_URL) {
  const user = await checkAuth(baseUrl);
  if (user) {
    window.location.href = 'https://schedule-sai-v2.vercel.app/calendar.html';
  }
}