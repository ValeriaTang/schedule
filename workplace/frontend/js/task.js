// 課題一覧の取得と表示
async function loadTasks() {
  try {
    const res = await fetch('/api/events', {
      method: 'GET',
      credentials: 'include',
    });

    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    const tasks = await res.json();
    renderTaskList(tasks);
  } catch (err) {
    console.error('タスク取得エラー:', err);
  }
}

// 課題カードの安全な描写 (XSS対策)
function renderTaskList(tasks) {
  const container = document.getElementById('task-list');
  if (!container) return;

  container.innerHTML = ''; // クリア

  tasks.forEach((task) => {
    const card = document.createElement('div');
    card.className = 'task-card';

    const titleEl = document.createElement('h3');
    titleEl.textContent = task.title; // innerHTML ではなく textContent を使用

    const deadlineEl = document.createElement('p');
    deadlineEl.textContent = `📅 期限: ${new Date(task.end_time).toLocaleString()}`;

    card.appendChild(titleEl);
    card.appendChild(deadlineEl);
    container.appendChild(card);
  });
}

// 課題の追加
async function addTask(title, deadline, description) {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: title,
        description: description || '課題',
        start_time: new Date().toISOString(), // 作成日時
        end_time: deadline,
      }),
    });

    if (res.ok) {
      await loadTasks(); // 再読み込み
    } else {
      alert('課題の追加に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const addTaskButton = document.getElementById('addTaskButton');
  const taskModal = document.getElementById('taskModal');
  const closeModal = document.getElementById('closeModal');
  const saveTaskButton = document.getElementById('saveTask');

  // 初期表示でタスク一覧を取得
  loadTasks();

  // 1. 「＋ 課題追加」ボタンでモーダルを開く
  if (addTaskButton && taskModal) {
    addTaskButton.addEventListener('click', () => {
      taskModal.style.display = 'block'; // モーダルを表示（CSSの設計に合わせて調整してください）
    });
  }

  // 2. モーダルの「×」ボタンで閉じる
  if (closeModal && taskModal) {
    closeModal.addEventListener('click', () => {
      taskModal.style.display = 'none';
    });
  }

  // 3. 「保存」ボタンをクリックしたときの処理
  if (saveTaskButton) {
    saveTaskButton.addEventListener('click', async () => {
      const title = document.getElementById('taskTitle')?.value;
      const deadline = document.getElementById('deadline')?.value;
      const priority = document.getElementById('priority')?.value;

      if (!title || !deadline) {
        alert('課題名と提出期限を入力してください');
        return;
      }

      // API（POST /api/events）呼び出し
      await addTask(title, deadline, `優先度:${priority}`);

      // 入力フォームのクリア & モーダルを閉じる
      document.getElementById('taskTitle').value = '';
      document.getElementById('deadline').value = '';
      if (taskModal) taskModal.style.display = 'none';
    });
  }
});