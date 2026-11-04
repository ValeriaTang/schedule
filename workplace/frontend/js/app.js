
// トークンをURLから即座に取得して localStorage に保存
(function handleTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    // トークンを localStorage に保存 - 'token' キー（後方互換性のため jwt_token にも保存）
    localStorage.setItem('token', tokenFromUrl);
    localStorage.setItem('jwt_token', tokenFromUrl); // 後方互換性のため
    console.log('✅ トークンをURLから正常に保存しました（token と jwt_token キー）');
    console.log('トークンデバッグ:', { tokenFromUrl, storedToken: localStorage.getItem('token') });

    // URLからクエリパラメータ（?token=...）を削除して履歴を綺麗にする
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
})();

// DOMContentLoaded 以降の処理
document.addEventListener("DOMContentLoaded", async () => {
  // Google OAuth リダイレクト後のトークンを localStorage に保存
  const searchParams = new URLSearchParams(window.location.search);
  const tokenFromSearch = searchParams.get("token");
  if (tokenFromSearch) {
    // トークンを localStorage に保存
    localStorage.setItem("jwt_token", tokenFromSearch);
    console.log("Token stored in localStorage from redirect");

    // URL からクエリパラメータを削除（画面はそのまま、履歴を綺麗にする）
    const cleanUrl = window.location.pathname + window.location.search.replace(tokenFromSearch, "").replace(/\?$/, "");
    window.history.replaceState(null, document.title, cleanUrl);
  }

  // カレンダー画面以外では実行しない
  const currentPage =
    window.location.pathname.split("/").pop();

  if (currentPage !== "calendar.html") {
    return;
  }

  // ログイン状態を確認
  const user = await requireAuth();

  // 未ログインなら処理を終了
  if (!user) {
    return;
  }

  // 認証成功後に画面を表示
  document.body.classList.add("authenticated");
  requestAnimationFrame(() => {
    if (window.calendar) {
      window.calendar.updateSize();
    }
  });

  // ユーザー名を表示（要素がある場合のみ）
  const userNameElement =
    document.getElementById("user-name");

  if (userNameElement) {
    userNameElement.textContent =
      `${user.name || user.email} さん`;
  }
});
