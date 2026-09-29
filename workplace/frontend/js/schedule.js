// スケジュール一覧の取得
async function fetchSchedules() {
  try {
    const res = await fetch('/api/events', {
      method: 'GET',
      credentials: 'include',
    });

    if (res.status === 401) {
      redirectToLogin();
      return [];
    }

    if (!res.ok) throw new Error('スケジュールの取得に失敗しました');

    const events = await res.json();
    return events;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 新規スケジュールの作成
async function createSchedule(scheduleData) {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: scheduleData.title,
        description: scheduleData.description || '',
        start_time: scheduleData.startTime,
        end_time: scheduleData.endTime,
        subject: scheduleData.subject || '',
        subject_color: scheduleData.color || '#3788d8',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.error || '登録に失敗しました');
      return false;
    }

    return true;
  } catch (err) {
    console.error('通信エラー:', err);
    return false;
  }
}

// モーダルの開閉と保存のイベント設定
document.addEventListener('DOMContentLoaded', () => {
  const addScheduleBtn = document.getElementById('addScheduleButton');
  const scheduleModal = document.getElementById('scheduleModal');
  const closeScheduleBtn = document.getElementById('closeScheduleModal');
  const saveScheduleBtn = document.getElementById('saveSchedule');

  // モーダルを開く
  if (addScheduleBtn && scheduleModal) {
    addScheduleBtn.addEventListener('click', () => {
      scheduleModal.style.display = 'block';
    });
  }

  // モーダルを閉じる
  if (closeScheduleBtn && scheduleModal) {
    closeScheduleBtn.addEventListener('click', () => {
      scheduleModal.style.display = 'none';
    });
  }

  // 保存ボタン押下処理
  if (saveScheduleBtn) {
    saveScheduleBtn.addEventListener('click', async () => {
      const title = document.getElementById('scheduleTitle').value;
      const date = document.getElementById('scheduleDate').value;
      const startTime = document.getElementById('scheduleStartTime').value;
      const endTime = document.getElementById('scheduleEndTime').value;
      const memo = document.getElementById('scheduleMemo').value;

      if (!title || !date) {
        alert('予定名と日付を入力してください');
        return;
      }

      const startDateTime = startTime ? `${date}T${startTime}:00` : `${date}T00:00:00`;
      const endDateTime = endTime ? `${date}T${endTime}:00` : `${date}T23:59:59`;

      const success = await createSchedule({
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        description: memo,
      });

      if (success) {
        scheduleModal.style.display = 'none';
        // 入力フォームのクリア
        document.getElementById('scheduleTitle').value = '';
        document.getElementById('scheduleDate').value = '';
        document.getElementById('scheduleStartTime').value = '';
        document.getElementById('scheduleEndTime').value = '';
        document.getElementById('scheduleMemo').value = '';

        // カレンダーや一覧の更新関数があれば呼ぶ
        if (typeof initCalendar === 'function') initCalendar();
      }
    });
  }
});