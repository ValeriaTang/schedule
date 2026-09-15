// =======================================
// calendar.js
// FullCalendar管理
// =======================================

// カレンダー本体
let calendar;

// カレンダーイベント
let events = [];


// =======================================
// 初期化
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    initializeCalendar();

});


// =======================================
// カレンダー初期化
// =======================================

function initializeCalendar() {

    const calendarEl = document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(calendarEl, {

        locale: "ja",

        initialView: "dayGridMonth",

        height: "auto",

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


    // 保存済みデータを読み込む
    updateCalendar();

}


// =======================================
// カレンダー更新
// =======================================

function updateCalendar() {

    // カレンダーがまだ生成されていない場合
    if (!calendar) {

        return;

    }


    // 一度すべてのイベントを削除

    calendar.removeAllEvents();


    // ===================================
    // 課題を取得
    // ===================================

    const tasks =
        JSON.parse(localStorage.getItem("tasks")) || [];


    // ===================================
    // 課題をカレンダーに追加
    // ===================================

    tasks.forEach(task => {

        let color = "#4285F4";


        // 優先順位で色を変更

        switch(task.priority){

            case "高":

                color = "#E53935";

                break;


            case "中":

                color = "#FB8C00";

                break;


            case "低":

                color = "#43A047";

                break;

        }


        calendar.addEvent({

            id: "task-" + task.id,

            title: "📝 " + task.title,

            start: task.deadline,

            allDay: true,

            backgroundColor: color,

            borderColor: color

        });

    });


    // ===================================
    // 予定を取得
    // ===================================

    const schedules =
        JSON.parse(localStorage.getItem("schedules")) || [];


    // ===================================
    // 予定をカレンダーに追加
    // ===================================

    schedules.forEach(schedule => {

        calendar.addEvent({

            id: "schedule-" + schedule.id,

            title: "📅 " + schedule.title,

            start: schedule.date + "T" + schedule.startTime,

            end: schedule.date + "T" + schedule.endTime,

            allDay: false,

            backgroundColor: "#6C63FF",

            borderColor: "#6C63FF"

        });

    });

}


// =======================================
// 指定日の課題＋予定を表示
// =======================================

function showSchedule(date) {

    const scheduleList =
        document.getElementById("scheduleList");


    // ===================================
    // 課題を取得
    // ===================================

    const tasks =
        JSON.parse(localStorage.getItem("tasks")) || [];


    // 指定日の課題

    const dayTasks =
        tasks.filter(task => task.deadline === date);


    // ===================================
    // 予定を取得
    // ===================================

    const schedules =
        JSON.parse(localStorage.getItem("schedules")) || [];


    // 指定日の予定

    const daySchedules =
        schedules.filter(schedule => schedule.date === date);


    // ===================================
    // 一度画面を消す
    // ===================================

    scheduleList.innerHTML = "";


    // ===================================
    // 日付
    // ===================================

    const title =
        document.createElement("h3");

    title.textContent = date;

    scheduleList.appendChild(title);


    // ===================================
    // 課題
    // ===================================

    const taskTitle =
        document.createElement("h3");

    taskTitle.textContent = "📝 課題";

    scheduleList.appendChild(taskTitle);


    // 課題がない場合

    if(dayTasks.length === 0){

        const p =
            document.createElement("p");

        p.textContent = "この日の課題はありません。";

        scheduleList.appendChild(p);

    }


    // 課題を表示

    dayTasks.forEach(task => {

        const div =
            document.createElement("div");

        div.className = "task-card";


        div.innerHTML = `

            <h3>${escapeHtml(task.title)}</h3>

            <p>⭐ 優先順位：${escapeHtml(task.priority)}</p>

            <p>
                📝 課題をする日：
                ${escapeHtml(task.studyDate || "未設定")}
            </p>

            <p>
                ⏰ 必要時間：
                ${escapeHtml(String(task.studyTime || 0))}時間
            </p>

        `;


        scheduleList.appendChild(div);

    });


    // ===================================
    // 予定
    // ===================================

    const scheduleTitle =
        document.createElement("h3");

    scheduleTitle.textContent = "📅 予定";

    scheduleList.appendChild(scheduleTitle);


    // 予定がない場合

    if(daySchedules.length === 0){

        const p =
            document.createElement("p");

        p.textContent = "この日の予定はありません。";

        scheduleList.appendChild(p);

    }


    // 予定を表示

    daySchedules.forEach(schedule => {

        const div =
            document.createElement("div");

        div.className = "schedule-card";


        div.innerHTML = `

            <h3>
                ${escapeHtml(schedule.title)}
            </h3>

            <p>
                🕐 ${escapeHtml(schedule.startTime)}
                ～ ${escapeHtml(schedule.endTime)}
            </p>

            ${
                schedule.memo
                ?
                `<p>
                    📝 ${escapeHtml(schedule.memo)}
                </p>`
                :
                ""
            }

        `;


        scheduleList.appendChild(div);

    });

}


// =======================================
// HTMLエスケープ
// =======================================

function escapeHtml(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// =======================================
// 外部から呼び出す更新関数
// =======================================

function refreshCalendar(){

    updateCalendar();

}


// =======================================
// デバッグ
// =======================================

console.log("calendar.js 読み込み完了");