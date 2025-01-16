import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

//
// Firebaseの設定
// 自分のプロジェクトのコンフィグにしてください
//
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const path = "/PLCs/PLC001/D3";
const dbRef = ref(database, path);

const ctx = document.getElementById('realtimeChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // X軸: タイムスタンプ
        datasets: [{
            label: 'D3の値',
            data: [], // Y軸: D3の値
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0,
            fill: false,
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second'
                },
                title: {
                    display: true,
                    text: '時間'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'D3の値'
                }
            }
        }
    }
});

function updateDataList(timestamp, value) {
    const dataList = document.getElementById('dataItems');
    const listItem = document.createElement('li');
    const formattedTime = new Date(timestamp).toLocaleString();
    listItem.textContent = `時間: ${formattedTime}, D3の値: ${value}`;
    dataList.prepend(listItem);

    while (dataList.children.length > 20) {
        dataList.removeChild(dataList.lastChild);
    }
}

onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach(entry => {
            const timestamp = entry.timestamp;
            const d3Value = entry.D3;

            chart.data.labels.push(new Date(timestamp));
            chart.data.datasets[0].data.push(d3Value);

            if (chart.data.labels.length > 50) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }

            chart.update();
            updateDataList(timestamp, d3Value);
        });
    } else {
        console.log("データがありません。");
    }
}, (error) => {
    console.error("データの読み込みエラー:", error);
});
