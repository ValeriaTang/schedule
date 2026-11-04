// APIベースURL（最新のプロダクションデプロイ）
const API_BASE_URL = "https://schedule-phi-seven.vercel.app";
// バックエンドのCORS設定に合わせた認証エンドポイント base
// fetch POSTでの認証回避のため、リダイレクト認証フローを使用します

let codeClient;
const selectAccount = new URLSearchParams(window.location.search).get('select_account') === 'true';
const reauthorizeGoogle = new URLSearchParams(window.location.search).get('reauthorize_google') === 'true';

// Google OAuth リダイレクト認証の初期化
function initGoogleAuth() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google SDK がまだ読み込まれていません。再試行します...');
    setTimeout(initGoogleAuth, 500);
    return;
  }

  // Google Identity Services を使用してリダイレクト認証を設定
  // バックエンドの /api/auth/google エンドポイントへリダイレクトする方式を使用
  codeClient = google.accounts.oauth2.initCodeClient({
    client_id: '1067955587484-appns84s4nb5t13797i53ur56e7ng49f.apps.googleusercontent.com',
    select_account: selectAccount,
    access_type: 'offline',
    ...(reauthorizeGoogle ? { prompt: 'consent' } : {}),
    scope: [
      'openid',
      'email',
      'profile',
      // ユーザー指定の3つのスコープ（そのまま使用）
      'https://www.googleapis.com/auth/calendar.events.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/classroom.course-work.readonly',
    ].join(' '),

    // 👇 リダイレクトモードを使用（CORS回避）
    ux_mode: 'redirect',

    // 👇 リダイレクト先をバックエンドの認証エンドポイントに設定
    // バックエンド側でGoogle認証後に処理を行い、フロントエンドにリダイレクトバック
    redirect_uri: `${API_BASE_URL}/api/auth/google/callback`,

    // 👇 コールバックはリダイレクトモードでは使用されません（バックエンド経由で処理）
    // リダイレクト後のトークンは app.js によって処理され、localStorage に保存されます
    callback: (response) => {
      console.log('Google OAuth redirect response:', response);
    }
  });
}

// Google認証リダイレクト開始
function startGoogleAuthRedirect() {
  if (codeClient) {
    // リダイレクトモードでは requestCode() がページ遷移を開始
    codeClient.requestCode();
  } else {
    initGoogleAuth();
    setTimeout(() => {
      if (codeClient) {
        codeClient.requestCode();
      } else {
        alert('Google ログインの初期化中です。少々お待ちください。');
      }
    }, 1000);
  }
}

// ページ読み込み時
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof redirectIfAuthenticated === 'function') {
    redirectIfAuthenticated(API_BASE_URL);
  }
  initGoogleAuth();
});

// ボタンクリック時に呼び出す関数（リダイレクトモード用）
function loginWithGoogle() {
  startGoogleAuthRedirect();
}
