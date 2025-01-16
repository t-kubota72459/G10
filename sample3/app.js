import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import 'https://cdn.jsdelivr.net/npm/chart.js'; // Chart.jsの読み込み
import 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns'; // Date adapterをインポート

// Firebaseの設定
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ボタンと状態表示をセットアップ
const setupToggleButton = (id, path, labelId) => {
    const button = document.getElementById(id);
    const label = document.getElementById(labelId);
    let currentState = false; // 初期状態

    // 初期値をデータベースから取得
    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            currentState = snapshot.val();
            label.textContent = currentState ? "ON" : "OFF";
        }
    });

    // ボタンクリックでトグル処理
    button.addEventListener("click", () => {
        currentState = !currentState;
        set(dbRef, currentState); // データベースに保存
    });
};

// 各ボタンの初期化
setupToggleButton("button-d121", "PLCs/PLC001/D121", "label-d121");
setupToggleButton("button-d122", "PLCs/PLC001/D122", "label-d122");
setupToggleButton("button-d123", "PLCs/PLC001/D123", "label-d123");

// グラフの初期化
const ctx = document.getElementById("myChart").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "D3 Value",
            data: [],
            borderColor: "rgba(75, 192, 192, 1)",
            tension: 0.1,
        }],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: "time", // 時間軸を使用
                time: {
                    unit: "second", // 秒単位で表示
                },
            },
            y: { beginAtZero: true },
        },
    },
});

// データのリアルタイム取得と処理（最新20件に制限）
const dbRef = ref(database, "PLCs/PLC001/D3");
const MAX_DATA_POINTS = 20; // 最大データ数

onValue(dbRef, (snapshot) => {
    const dataList = document.getElementById("dataList");
    if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Data:", data);

        // データを配列に変換して timestamp でソート
        const sortedData = Object.entries(data)
            .map(([key, value]) => ({ key, ...value })) // オブジェクト形式に変換
            .sort((a, b) => a.timestamp - b.timestamp); // timestamp で昇順ソート

        // 最新20件のデータを取得
        const limitedData = sortedData.slice(-MAX_DATA_POINTS);

        // グラフとリストをクリア
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        dataList.innerHTML = "";

        // 最新20件のデータをグラフとリストに追加
        limitedData.forEach(({ key, timestamp, D3 }) => {
            const date = new Date(timestamp);

            // グラフ更新
            chart.data.labels.push(date);
            chart.data.datasets[0].data.push(D3);

            // リスト更新
            const listItem = document.createElement("li");
            listItem.textContent = `Key: ${key}, Timestamp: ${date}, D3: ${D3}`;
            dataList.appendChild(listItem);
        });

        chart.update();
    } else {
        console.log("No data available");
    }
});
