import * as fs from 'fs';

interface WorkoutRecord {
    date: string;
    workout_type: string;
    summary: string;
}

export function appendWorkoutHistory(record: WorkoutRecord) {
    const historyFilePath = 'workoutHistory.json';
    let historyList: WorkoutRecord[] = [];

    if (fs.existsSync(historyFilePath)) {
        const rawData = fs.readFileSync(historyFilePath, 'utf-8');
        historyList = JSON.parse(rawData);
    }

    historyList.push(record);

    fs.writeFileSync(historyFilePath, JSON.stringify(historyList, null, 4));
    console.log(`\n[系統後台] 💾 已成功將今日訓練寫入歷史紀錄檔 (${historyFilePath})`);
}