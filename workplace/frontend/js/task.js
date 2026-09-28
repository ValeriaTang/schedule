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