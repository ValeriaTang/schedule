// login.html 専用処理

// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // API呼び出しも現在のパス基準または相対パスに変更
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      // ルート相対パス（/index.html）ではなく、相対パス（index.html または ./index.html）で移動
      window.location.href = 'index.html';
    }
  } catch (err) {
    // 未ログイン（401等）のときは何もしないで login.html を表示
    console.log('未ログイン状態です');
  }
});

// 2. Google ログイン成功時の処理
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // 成功時も同階層の index.html へ移動
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}// login.html 専用処理

// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // API呼び出しも現在のパス基準または相対パスに変更
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      // ルート相対パス（/index.html）ではなく、相対パス（index.html または ./index.html）で移動
      window.location.href = 'index.html';
    }
  } catch (err) {
    // 未ログイン（401等）のときは何もしないで login.html を表示
    console.log('未ログイン状態です');
  }
});

// 2. Google ログイン成功時の処理
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // 成功時も同階層の index.html へ移動
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}// login.html 専用処理

// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // API呼び出しも現在のパス基準または相対パスに変更
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      // ルート相対パス（/index.html）ではなく、相対パス（index.html または ./index.html）で移動
      window.location.href = 'index.html';
    }
  } catch (err) {
    // 未ログイン（401等）のときは何もしないで login.html を表示
    console.log('未ログイン状態です');
  }
});

// 2. Google ログイン成功時の処理
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // 成功時も同階層の index.html へ移動
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}// login.html 専用処理

// 1. 既にログイン済みならメイン画面（index.html）へ移動
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // API呼び出しも現在のパス基準または相対パスに変更
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      // ルート相対パス（/index.html）ではなく、相対パス（index.html または ./index.html）で移動
      window.location.href = 'index.html';
    }
  } catch (err) {
    // 未ログイン（401等）のときは何もしないで login.html を表示
    console.log('未ログイン状態です');
  }
});

// 2. Google ログイン成功時の処理
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // 成功時も同階層の index.html へ移動
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'ログインに失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}