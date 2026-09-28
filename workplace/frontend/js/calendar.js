// ページロード時に認証確認とカレンダー描画を開始
document.addEventListener('DOMContentLoaded', async () => {
  // 1. ログインチェック
  const user = await requireAuth();
  if (!user) return;

  // 2. カレンダーデータの読み込み
  await initCalendar();
});

/**
 * バックエンドからイベントを取得してカレンダーに表示する
 */
async function initCalendar() {
  try {
    const res = await fetch('/api/events', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('予定の取得に失敗しました');
    }

    const events = await res.json();
    renderCalendarEvents(events);
  } catch (err) {
    console.error('カレンダー読み込みエラー:', err);
  }
}

/**
 * 取得したイベントリストを DOM に安全に挿入する (XSS対策)
 * @param {Array} events 
 */
function renderCalendarEvents(events) {
  const container = document.getElementById('calendar-events-list');
  if (!container) return;

  container.innerHTML = ''; // クリア

  if (events.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = '予定はありません';
    container.appendChild(emptyMsg);
    return;
  }

  events.forEach((evt) => {
    const item = document.createElement('div');
    item.className = 'event-item';
    if (evt.subject_color) {
      item.style.borderLeft = `5px solid ${evt.subject_color}`;
    }

    // タイトル (textContent で挿入し XSS を防ぐ)
    const title = document.createElement('h4');
    title.textContent = evt.title;

    // 日時表示
    const timeInfo = document.createElement('span');
    const start = new Date(evt.start_time).toLocaleString();
    const end = new Date(evt.end_time).toLocaleString();
    timeInfo.textContent = `${start} 〜 ${end}`;

    // 説明文 (存在する場合)
    item.appendChild(title);
    item.appendChild(timeInfo);

    if (evt.description) {
      const desc = document.createElement('p');
      desc.textContent = evt.description;
      item.appendChild(desc);
    }

    container.appendChild(item);
  });
}