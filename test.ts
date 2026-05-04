import * as fs from 'fs/promises';

async function readMyLog() {
    try {
        // 1. 讀取本機的 JSON 檔案 (Workout_Log.json)
        const fileText = await fs.readFile('./Workout_Log.json', 'utf-8');
        
        // 2. 還原成 JS 物件
        const workoutLog = JSON.parse(fileText);
        
        // 3. 測試列印 (date)
        console.log("成功讀取 JSON!");
        console.log("訓練日期: ", workoutLog.date);
        
    } catch (error) {
        console.error("讀取失敗，可能是檔名打錯或找不到檔案: ", error);
    }
}

// 執行函數
readMyLog();