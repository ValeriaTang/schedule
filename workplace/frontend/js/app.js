document.addEventListener('DOMContentLoaded', async () => {
  // 1. ログイン状態の確認 (未ログインなら login.html へ強制リダイレクト)
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }

    const data = await res.json();
    // 画面にユーザー名を表示
    document.getElementById('user-name').textContent = `${data.user.name || data.user.email} さん`;
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  // 2. ログアウトボタンの処理設定
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        // ログアウト完了後、ログイン画面へ遷移
        window.location.href = '/login.html';
      } catch (err) {
        console.error('ログアウトエラー:', err);
      }
    });
  }
});