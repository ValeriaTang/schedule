// =======================================
// main.js
// アプリ全体の管理
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Study Planner 起動");

    initializeApp();

});


// ---------------------------------------
// アプリ初期化
// ---------------------------------------
function initializeApp(){

    console.log("初期化完了");

    updateClock();

    // 1秒ごとに現在時刻を更新
    setInterval(updateClock,1000);

    updateDashboard();

}

// ---------------------------------------
// 現在時刻表示
// ---------------------------------------
function updateClock(){

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth()+1).padStart(2,"0");

    const day = String(now.getDate()).padStart(2,"0");

    const hour = String(now.getHours()).padStart(2,"0");

    const minute = String(now.getMinutes()).padStart(2,"0");

    const second = String(now.getSeconds()).padStart(2,"0");

    const text =
    `${year}/${month}/${day}
     ${hour}:${minute}:${second}`;

    const clock = document.getElementById("clock");

    if(clock){

        clock.textContent = text;

    }

}
// -------------------------------
// ダッシュボード更新
// -------------------------------
function updateDashboard(){

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // 登録課題数
    document.getElementById("taskCount").textContent = tasks.length;

    // 今日の日付
    const today = new Date().toISOString().split("T")[0];

    // 今日締切
    const todayTasks = tasks.filter(task => task.deadline === today);

    document.getElementById("todayTaskCount").textContent = todayTasks.length;

    // 優先度：高
    const highPriority = tasks.filter(task => task.priority === "高");

    document.getElementById("highPriorityCount").textContent = highPriority.length;

}