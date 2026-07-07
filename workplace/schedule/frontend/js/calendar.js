// =======================================
// calendar.js
// FullCalendar管理
// =======================================

// カレンダー本体
let calendar;

// カレンダーイベント
let events = [];

// -------------------------------
// 初期化
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {

    initializeCalendar();

});

// -------------------------------
// カレンダー初期化
// -------------------------------
function initializeCalendar() {

    const calendarEl = document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(calendarEl, {

        locale: "ja",

        initialView: "dayGridMonth",

        height: 650,

        selectable: true,

        navLinks: true,

        nowIndicator: true,

        editable: false,

        headerToolbar: {

            left: "prev,next today",

            center: "title",

            right: "dayGridMonth,timeGridWeek"

        },

        buttonText: {

            today: "今日",

            month: "月",

            week: "週"

        },

        events: events,

        // 日付クリック
        dateClick: function(info){

            showSchedule(info.dateStr);

        }

    });

    calendar.render();

    // 保存済み課題を読み込む
    updateCalendar();

}
// -------------------------------
// カレンダー更新
// -------------------------------
function updateCalendar() {

    // カレンダーがまだ生成されていない場合は終了
    if (!calendar) {
        return;
    }

    // 一度すべての予定を削除
    calendar.removeAllEvents();

    // localStorageから課題を取得
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // 1件ずつカレンダーへ追加
    tasks.forEach(task => {

        let color = "#4285F4"; // デフォルト（青）

        // 優先順位で色変更
        switch(task.priority){

            case "高":
                color = "#E53935";   // 赤
                break;

            case "中":
                color = "#FB8C00";   // オレンジ
                break;

            case "低":
                color = "#43A047";   // 緑
                break;

        }

        calendar.addEvent({

            id: task.id,

            title: task.title,

            start: task.deadline,

            allDay: true,

            backgroundColor: color,

            borderColor: color

        });

    });

}
// -------------------------------
// 指定日の予定一覧表示
// -------------------------------
function showSchedule(date) {

    const scheduleList = document.getElementById("scheduleList");

    // localStorageから課題を取得
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // 指定日の課題だけ抽出
    const dayTasks = tasks.filter(task => task.deadline === date);

    // 一度消す
    scheduleList.innerHTML = "";

    // タイトル
    const title = document.createElement("h3");
    title.textContent = date;
    scheduleList.appendChild(title);

    // 課題がない場合
    if(dayTasks.length === 0){

        const p = document.createElement("p");
        p.textContent = "予定はありません。";
        scheduleList.appendChild(p);

        return;

    }

    // 課題表示
    dayTasks.forEach(task => {

        const div = document.createElement("div");

        div.className = "task-card";

        div.innerHTML = `

            <h3>${task.title}</h3>

            <p>⭐ 優先順位：${task.priority}</p>

            <p>📝 課題をする日：${task.studyDate || "未設定"}</p>

            <p>⏰ 必要時間：${task.studyTime || 0}時間</p>

        `;

        scheduleList.appendChild(div);

    });

}

// -------------------------------
// 外部から呼び出す更新関数
// -------------------------------
function refreshCalendar() {

    updateCalendar();

}

// -------------------------------
// デバッグ
// -------------------------------
console.log("calendar.js 読み込み完了");