
// TokenStorage と buildAuthHeaders（common-auth.js で定義済み）
// ここではグローバル変数として参照可能
function normalizeEventText(value) {

// JWT トークンを含む認証ヘッダーを構築（Cookie が機能しない場合のフォールバック）
function buildAuthHeaders(extraHeaders = {}) {
  const token = (typeof TokenStorage !== 'undefined') ? TokenStorage.get() : localStorage.getItem('jwt_token');
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

  return String(value || "")
    .replace(/^\[(?:課題|予定)\]\s*/, "")
    .trim()
    .replace(/\s+/g, " ");
}

function sameEventTime(left, right) {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  return Number.isFinite(leftTime) && leftTime === rightTime;
}

async function confirmNoSimilarEvent({ groupId, kind, title, description, startTime, endTime }) {
  const response = await fetch(
    `${API_BASE_URL}/api/events?groupId=${encodeURIComponent(groupId)}`,
    { headers: buildAuthHeaders(), credentials: "include" }
  );

  if (response.status === 401) {
    window.location.href = "login.html";
    return false;
  }
  if (!response.ok) {
    throw new Error("重複候補を確認できませんでした。");
  }

  const data = await response.json();
  if (!Array.isArray(data.events)) {
    throw new Error("イベント一覧の形式が正しくありません。");
  }

  const prefix = kind === "task" ? "[課題]" : "[予定]";
  const candidate = data.events.find((event) => {
    const eventDescription = String(event.description || "");
    if (!eventDescription.startsWith(prefix)) return false;
    if (event.title !== title || normalizeEventText(eventDescription) !== normalizeEventText(description)) {
      return false;
    }

    if (!sameEventTime(event.end_time, endTime)) return false;
    return kind === "task" || sameEventTime(event.start_time, startTime);
  });

  if (!candidate) return true;

  const eventDate = kind === "task" ? candidate.end_time : candidate.start_time;
  const dateLabel = new Date(eventDate).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  return window.confirm(
    `同じ内容と思われる${kind === "task" ? "課題" : "予定"}「${candidate.title}」(${dateLabel})がすでにあります。それでも作成しますか？`
  );
}
