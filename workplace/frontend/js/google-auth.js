let codeClient;

// Google OAuth クライアントの初期化
function initGoogleAuth() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google SDK がまだ読み込まれていません。再試行します...');
    setTimeout(initGoogleAuth, 500); // 0.5秒後に再試行
    return;
  }

  codeClient = google.accounts.oauth2.initCodeClient({
    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ★ご自身のクライアントIDに置き換えてください
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar.readonlyr',
      'https://www.googleapis.com/classroom.courses.readonlys',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '),
    ux_mode: 'popup',
    callback: handleCodeResponse,
  });
}

// 画面読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // ログイン済みなら index.html にリダイレクト
  if (typeof redirectIfAuthenticated === 'function') {
    redirectIfAuthenticated();
  }

  // Google OAuth クライアント初期化
  initGoogleAuth();
});

// ボタンクリック時に呼び出す関数
function loginWithGoogle() {
  if (codeClient) {
    codeClient.requestCode();
  } else {
    // まだ初期化できていない場合は再試行してから実行
    initGoogleAuth();
    if (codeClient) {
      codeClient.requestCode();
    } else {
      alert('Google ログインの初期化中です。少々お待ちください。');
    }
  }
}

// Google ポップアップ完了後のコールバック処理
async function handleCodeResponse(response) {
  if (response.error) {
    console.error('Google 認可エラー:', response.error);
    return;
  }

  try {
    // 認可コード (code) をバックエンドへ送信
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        code: response.code,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログイン処理に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}