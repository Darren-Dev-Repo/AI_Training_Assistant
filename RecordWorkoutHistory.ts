import * as fs from 'fs';

// 定義歷史紀錄的介面 (TypeScript 的好處，讓資料格式嚴謹)
interface WorkoutRecord {
    date: string;
    workout_type: string; // 'A' 或 'B'
    summary: string;      // 例如："深蹲 65kg 5x5 成功, 臥推 40kg 失敗..."
}

// 寫入歷史紀錄的輔助函式 (不開放給 LLM 呼叫，由系統自己用)
export function appendWorkoutHistory(record: WorkoutRecord) {
    const historyFilePath = 'Workout_History.json';
    let historyList: WorkoutRecord[] = [];

    // 1. 如果檔案已經存在，先讀取舊紀錄
    if (fs.existsSync(historyFilePath)) {
        const rawData = fs.readFileSync(historyFilePath, 'utf-8');
        historyList = JSON.parse(rawData);
    }

    // 2. 將今天的新紀錄塞進陣列
    historyList.push(record);

    // 3. 漂亮地寫回 JSON 檔案 (null, 4 代表縮排 4 空格，讓檔案易讀)
    fs.writeFileSync(historyFilePath, JSON.stringify(historyList, null, 4));
    console.log(`\n[系統後台] 💾 已成功將今日訓練寫入歷史紀錄檔 (${historyFilePath})`);
}