// =======================================
// main.js
// アプリ全体の管理（ダッシュボード・現在時刻表示）
// =======================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Study Planner 起動");

  // 1. 認証チェック（未ログインなら login.html へ自動リダイレクト）
  const user = await requireAuth();
  if (!user) return;

  // 2. アプリ初期化
  initializeApp();
});

// ---------------------------------------
// アプリ初期化
// ---------------------------------------
function initializeApp() {
  console.log("初期化完了");

  // 時計の初期表示と1秒ごとの更新
  updateClock();
  setInterval(updateClock, 1000);

  // ダッシュボード（件数など）の更新
  updateDashboard();
}

// ---------------------------------------
// 現在時刻表示
// ---------------------------------------
function updateClock() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const text = `${year}/${month}/${day} ${hour}:${minute}:${second}`;

  const clock = document.getElementById("clock");
  if (clock) {
    clock.textContent = text;
  }
}

// ---------------------------------------
// ダッシュボード更新（API連携版）
// ---------------------------------------
async function updateDashboard() {
  try {
    // データベース（Neon）からイベント一覧を取得
    const res = await fetch('/api/events', {
      method: 'GET',
      credentials: 'include', // HttpOnly Cookie (JWT) を自動送信
    });

    if (!res.ok) {
      console.error('ダッシュボードデータの取得に失敗しました');
      return;
    }

    const tasks = await res.json();

    // 1. 全登録課題・イベント数
    const taskCountEl = document.getElementById("taskCount");
    if (taskCountEl) {
      taskCountEl.textContent = tasks.length;
    }

    // 2. 今日の日付 (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split("T")[0];

    // 今日締切（end_time が本日の日付で始まるもの）
    const todayTasks = tasks.filter(task => {
      if (!task.end_time) return false;
      return task.end_time.startsWith(todayStr);
    });

    const todayTaskCountEl = document.getElementById("todayTaskCount");
    if (todayTaskCountEl) {
      todayTaskCountEl.textContent = todayTasks.length;
    }

    // 3. 優先度：高（DBの優先度フィールド、または特定の判定条件）
    const highPriority = tasks.filter(task => task.priority === "高");

    const highPriorityCountEl = document.getElementById("highPriorityCount");
    if (highPriorityCountEl) {
      highPriorityCountEl.textContent = highPriority.length;
    }

  } catch (err) {
    console.error('ダッシュボード更新エラー:', err);
  }
}