import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { appendWorkoutHistory } from './RecordWorkoutHistory.js';
import { sysLog } from './SysLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stateFilePath = path.join(__dirname, 'currentState.json');

const dbPath = path.join(__dirname, 'free-exercise-db.json');
let staticExerciseDB: any[] = [];
try {
    staticExerciseDB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    sysLog(`[系統啟動] 成功載入動作資料庫，共 ${staticExerciseDB.length} 筆資料入列。`);
} catch (error) {
    sysLog("\n[系統啟動錯誤] 無法讀取 free-exercise-db.json，詳細錯誤如下：\n" + String(error));
    console.log("\n⚠️ [系統提示] 動作知識庫暫時無法連線。");
    console.log("👉 智能教練的「動作檢索功能」將暫時關閉，但您的「日常訓練課表」與「紀錄結算」仍可正常運作，請安心訓練！\n");
}

export const myTools: Record<string, Function> = {
    addWeight: (args: any) => {
        const nextWeight = args.currentWeightKg + args.minWeightChangeInKg;
        sysLog(`\n[系統後台] 更新 ${args.exerciseName} 重量：${args.currentWeightKg} -> ${nextWeight}`);
        
        const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        if (currentState.lifts_status[args.exerciseName]) {
            currentState.lifts_status[args.exerciseName].current_weight_kg = nextWeight;
            currentState.lifts_status[args.exerciseName].consecutive_fails = 0;            
        }

        fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');

        return { nextWeight: nextWeight };
    },

    deload: (args: any) => {
        sysLog(`\n[系統後台] 執行降重計算：${args.currentWeightKg} * ${args.deloadPercentage}`);
        let rawWeight = args.currentWeightKg * args.deloadPercentage;
        let finalWeight = Math.floor(rawWeight / args.minWeightChangeInKg) * args.minWeightChangeInKg;

        const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        if (currentState.lifts_status[args.exerciseName]) {
            currentState.lifts_status[args.exerciseName].current_weight_kg = finalWeight;
            currentState.lifts_status[args.exerciseName].consecutive_fails = 0;            
        }

        fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');

        return { nextWeight: finalWeight };
    },

    recordFail: (args: any) => {
        const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        let currentFails = 0;

        if (currentState.lifts_status[args.exerciseName]) {
            currentState.lifts_status[args.exerciseName].consecutive_fails += 1;
            currentFails = currentState.lifts_status[args.exerciseName].consecutive_fails;
        }

        sysLog(`\n[系統後台] 紀錄 ${args.exerciseName} 失敗！目前連續失敗次數：${currentFails}`);

        fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');

        return { currentConsecutiveFails: currentFails };
    },

    getNextWorkoutType: (args: any) => {
        const currentIndex = args.dayTag.indexOf(args.currentWorkoutType);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % args.dayTag.length;
        const nextDay = args.dayTag[nextIndex];
        
        sysLog(`\n[系統後台] 計算下次訓練日：切換為 ${nextDay}`);

        try {
            const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
            currentState.current_workout_type = nextDay; 
            fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');
        } catch (error) {
            sysLog(`\n[系統錯誤] 無法更新訓練日至 currentState.json，詳細錯誤如下：\n${String(error)}`);
            console.log("\n⚠️ [系統提示] 無法成功將這次訓練添加到歷史紀錄。");
            console.log("👉 智能教練的「歷史紀錄功能」將暫時關閉，但您的「日常訓練課表」與「動作檢索功能」仍可正常運作，請安心訓練！\n");
        }

        const today = new Date().toISOString().split('T')[0] || "Unknown Date";
        const latestState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        const newRecord = {
            date: today,
            workout_type: args.currentWorkoutType,
            summary: `順利結算 ${args.currentWorkoutType} 日訓練課表。`,
            snapshot: latestState.lifts_status
        };
        appendWorkoutHistory(newRecord);

        return { nextDay: nextDay };
    },

    queryExercise: (args: { keyword: string }) => {
        sysLog(`\n[系統後台] 檢索動作資料庫，關鍵字：${args.keyword}`);
        
        try {
            
            let searchTarget = args.keyword.toLowerCase();
            // Alias Mapping
            const aliasMap: Record<string, string> = {
                "overhead press": "military press",
                "barbell overhead press": "military press",
                "shoulder press": "military press",
            };

            // 如果使用者的關鍵字在字典裡有對應，就強制轉換成資料庫看得懂的名稱
            for (const [alias, realName] of Object.entries(aliasMap)) {
                if (searchTarget.includes(alias)) {
                    sysLog(`[系統後台] 觸發同義詞轉換：${searchTarget} -> ${realName}`);
                    searchTarget = realName;
                    break;
                }
            }

            const foundExercise = staticExerciseDB.find((ex: any) => 
                ex.name.toLowerCase().includes(searchTarget) ||
                ex.id.toLowerCase().includes(searchTarget)
            );

            if (foundExercise) {
                return {
                    name: foundExercise.name,
                    primaryMuscles: foundExercise.primaryMuscles,
                    instructions: foundExercise.instructions
                };
            } else {
                return { error: `資料庫中找不到與 "${args.keyword}" 相關的動作。` };
            }
        } catch (error) {
            sysLog("\n[[系統錯誤] 檢索動作時發生異常，詳細錯誤如下：\n" + String(error));
            console.log("\n⚠️ [系統提示] 動作知識庫暫時無法連線。");
            console.log("👉 智能教練的「動作檢索功能」將暫時關閉，但您的「日常訓練課表」與「紀錄結算」仍可正常運作，請安心訓練！\n");
            return { error: "檢索系統發生異常。" };
        }
    }
};