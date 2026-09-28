// =======================================
// schedule.js
// 予定の追加・表示・削除
// =======================================


// =======================================
// ページ読み込み
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    setupSchedule();

});


// =======================================
// 予定機能の初期設定
// =======================================

function setupSchedule(){

    const addButton =
        document.getElementById("addScheduleButton");

    const closeButton =
        document.getElementById("closeScheduleModal");

    const saveButton =
        document.getElementById("saveSchedule");


    // 予定追加ボタン
    if(addButton){

        addButton.addEventListener("click", () => {

            openScheduleModal();

        });

    }


    // 閉じるボタン
    if(closeButton){

        closeButton.addEventListener("click", () => {

            closeScheduleModal();

        });

    }


    // 保存ボタン
    if(saveButton){

        saveButton.addEventListener("click", () => {

            saveSchedule();

        });

    }


    // 予定一覧を表示
    displaySchedules();

}


// =======================================
// 予定追加画面を開く
// =======================================

function openScheduleModal(){

    const modal =
        document.getElementById("scheduleModal");

    if(modal){

        modal.classList.add("active");

    }

}


// =======================================
// 予定追加画面を閉じる
// =======================================

function closeScheduleModal(){

    const modal =
        document.getElementById("scheduleModal");

    if(modal){

        modal.classList.remove("active");

    }

}


// =======================================
// 予定を保存
// =======================================

function saveSchedule(){

    const title =
        document.getElementById("scheduleTitle").value.trim();

    const date =
        document.getElementById("scheduleDate").value;

    const startTime =
        document.getElementById("scheduleStartTime").value;

    const endTime =
        document.getElementById("scheduleEndTime").value;

    const memo =
        document.getElementById("scheduleMemo").value.trim();


    // 必須項目チェック

    if(title === ""){

        alert("予定名を入力してください。");

        return;

    }


    if(date === ""){

        alert("予定の日を入力してください。");

        return;

    }


    if(startTime === ""){

        alert("開始時間を入力してください。");

        return;

    }


    if(endTime === ""){

        alert("終了時間を入力してください。");

        return;

    }


    // 時間チェック

    if(endTime <= startTime){

        alert("終了時間は開始時間より後にしてください。");

        return;

    }


    // 現在の予定を取得

    const schedules =
        JSON.parse(localStorage.getItem("schedules")) || [];


    // 新しい予定

    const newSchedule = {

        id: Date.now(),

        title: title,

        date: date,

        startTime: startTime,

        endTime: endTime,

        memo: memo

    };


    // 予定を追加

    schedules.push(newSchedule);


    // localStorageに保存

    localStorage.setItem(
        "schedules",
        JSON.stringify(schedules)
    );


    // 入力欄をリセット

    document.getElementById("scheduleTitle").value = "";

    document.getElementById("scheduleDate").value = "";

    document.getElementById("scheduleStartTime").value = "";

    document.getElementById("scheduleEndTime").value = "";

    document.getElementById("scheduleMemo").value = "";


    // 画面を閉じる

    closeScheduleModal();


    // 予定一覧を更新

    displaySchedules();


    // カレンダーを更新

    if(typeof updateCalendar === "function"){

        updateCalendar();

    }

}


// =======================================
// 予定一覧を表示
// =======================================

function displaySchedules(){

    const scheduleList =
        document.getElementById("scheduleList");

    if(!scheduleList){

        return;

    }


    const schedules =
        JSON.parse(localStorage.getItem("schedules")) || [];


    // 予定がない場合

    if(schedules.length === 0){

        scheduleList.innerHTML =
            "予定はありません。";

        return;

    }


    // 日付順に並べる

    schedules.sort((a,b) => {

        const dateA =
            `${a.date} ${a.startTime}`;

        const dateB =
            `${b.date} ${b.startTime}`;

        return dateA.localeCompare(dateB);

    });


    scheduleList.innerHTML = "";


    schedules.forEach(schedule => {

        const card =
            document.createElement("div");

        card.className = "schedule-card";


        card.innerHTML = `

            <h3>${escapeHtml(schedule.title)}</h3>

            <p>
                📅 ${schedule.date}
            </p>

            <p>
                🕐 ${schedule.startTime}
                ～ ${schedule.endTime}
            </p>

            ${
                schedule.memo
                ?
                `<p>📝 ${escapeHtml(schedule.memo)}</p>`
                :
                ""
            }

            <button
                class="schedule-delete-btn"
                onclick="deleteSchedule(${schedule.id})">

                削除

            </button>

        `;


        scheduleList.appendChild(card);

    });

}


// =======================================
// 予定を削除
// =======================================

function deleteSchedule(id){

    const schedules =
        JSON.parse(localStorage.getItem("schedules")) || [];


    const newSchedules =
        schedules.filter(schedule => schedule.id !== id);


    localStorage.setItem(
        "schedules",
        JSON.stringify(newSchedules)
    );


    displaySchedules();


    if(typeof updateCalendar === "function"){

        updateCalendar();

    }

}


// =======================================
// HTMLとして解釈されないようにする
// =======================================

function escapeHtml(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}