// スケジュール一覧の取得
async function fetchSchedules() {
  try {
    const res = await fetch('/api/events', {
      method: 'GET',
      credentials: 'include', // HttpOnly Cookie (JWT) を自動送信
    });

    if (res.status === 401) {
      window.location.href = '/login.html';
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