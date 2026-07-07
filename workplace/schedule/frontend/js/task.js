// =======================================
// task.js
// 課題管理
// =======================================

// 課題データを保存する配列
let tasks = [];

// -------------------------------
// 初期化
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // 保存済み課題を読み込む
    loadTasks();

    // ボタン設定
    setupButtons();

    // 課題一覧表示
    displayTasks();

});

// -------------------------------
// ボタン設定
// -------------------------------
function setupButtons() {

    const addTaskButton = document.getElementById("addTaskButton");
    const closeModal = document.getElementById("closeModal");
    const saveTask = document.getElementById("saveTask");
    const taskModal = document.getElementById("taskModal");

    // 課題追加画面を開く
    addTaskButton.addEventListener("click", () => {

        taskModal.classList.add("active");

    });

    // 閉じる
    closeModal.addEventListener("click", () => {

        taskModal.classList.remove("active");

    });

    // 保存
    saveTask.addEventListener("click", saveTaskData);

}

// -------------------------------
// 課題保存
// -------------------------------
function saveTaskData() {

    const title = document.getElementById("taskTitle").value.trim();
    const deadline = document.getElementById("deadline").value;
    const studyDate = document.getElementById("studyDate").value;
    const studyTime = document.getElementById("studyTime").value;
    const priority = document.getElementById("priority").value;

    // 入力チェック
    if (title === "" || deadline === "") {

        alert("課題名と提出期限を入力してください。");
        return;

    }

    // 課題オブジェクト
    const task = {

        id: Date.now(),

        title: title,

        deadline: deadline,

        studyDate: studyDate,

        studyTime: studyTime,

        priority: priority

    };

    // 配列へ追加
    tasks.push(task);

    // 保存
    saveTasks();

    displayTasks();

    // カレンダー更新
    if(typeof updateCalendar === "function"){

    updateCalendar();

    }

    clearForm();

    document.getElementById("taskModal").classList.remove("active");

}
// -------------------------------
// 課題一覧表示
// -------------------------------
function displayTasks() {

    const taskList = document.getElementById("taskList");

    // 一度すべて削除
    taskList.innerHTML = "";

    // 課題がない場合
    if (tasks.length === 0) {

        taskList.innerHTML = "<p>課題は登録されていません。</p>";

        return;
    }

    // 1件ずつ表示
    tasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `

            <h3>${task.title}</h3>

            <p>📅 提出期限：${task.deadline}</p>

            <p>📝 課題をする日：${task.studyDate || "未設定"}</p>

            <p>⏰ 必要時間：${task.studyTime || 0} 時間</p>

            <p>⭐ 優先順位：${task.priority}</p>

            <div class="task-buttons">

                <button class="edit-btn"
                    onclick="editTask(${task.id})">

                    編集

                </button>

                <button class="delete-btn"
                    onclick="deleteTask(${task.id})">

                    削除

                </button>

            </div>

        `;

        taskList.appendChild(card);

    });

}

// -------------------------------
// localStorageへ保存
// -------------------------------
function saveTasks() {

    localStorage.setItem(

        "tasks",

        JSON.stringify(tasks)

    );

}

// -------------------------------
// localStorageから読み込み
// -------------------------------
function loadTasks() {

    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {

        tasks = JSON.parse(savedTasks);

    } else {

        tasks = [];

    }

}

// -------------------------------
// 入力フォーム初期化
// -------------------------------
function clearForm() {

    document.getElementById("taskTitle").value = "";

    document.getElementById("deadline").value = "";

    document.getElementById("studyDate").value = "";

    document.getElementById("studyTime").value = "";

    document.getElementById("priority").value = "高";

}
// -------------------------------
// 課題削除
// -------------------------------
function deleteTask(id) {

    // 削除確認
    const result = confirm("この課題を削除しますか？");

    if (!result) {
        return;
    }

    // 配列から削除
    tasks = tasks.filter(task => task.id !== id);

    // 保存
    saveTasks();

    // 再表示
    displayTasks();

    if(typeof updateCalendar === "function"){

        updateCalendar();

    }

    // カレンダー更新（calendar.jsで定義）
    if (typeof updateCalendar === "function") {
        updateCalendar();
    }

}

// -------------------------------
// 課題編集
// -------------------------------
function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    // モーダルを開く
    document.getElementById("taskModal").classList.add("active");

    // 入力欄へセット
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("deadline").value = task.deadline;
    document.getElementById("studyDate").value = task.studyDate;
    document.getElementById("studyTime").value = task.studyTime;
    document.getElementById("priority").value = task.priority;

    // 一旦削除
    tasks = tasks.filter(t => t.id !== id);

    saveTasks();
    displayTasks();

}

// -------------------------------
// カレンダー更新
// -------------------------------
function refreshApplication() {

    displayTasks();

    if (typeof updateCalendar === "function") {

        updateCalendar();

    }

}

// -------------------------------
// デバッグ用
// -------------------------------
console.log("task.js 読み込み完了");