import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stateFilePath = path.join(__dirname, 'Current_State.json');

const dbPath = path.join(__dirname, 'free-exercise-db.json');
let staticExerciseDB: any[] = [];
try {
    staticExerciseDB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    console.log(`[系統啟動] 成功載入動作資料庫，共 ${staticExerciseDB.length} 筆資料入列。`);
} catch (error) {
    console.error("[系統啟動錯誤] 無法讀取動作資料庫。", error);
}

export const myTools: Record<string, Function> = {
    addWeight: (args: any) => {
        const nextWeight = args.currentWeightKg + args.minWeightChangeInKg;
        console.log(`\n[系統後台] 更新 ${args.exerciseName} 重量：${args.currentWeightKg} -> ${nextWeight}`);
        
        const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        if (currentState.lifts_status[args.exerciseName]) {
            currentState.lifts_status[args.exerciseName].current_weight_kg = nextWeight;
            currentState.lifts_status[args.exerciseName].consecutive_fails = 0;            
        }

        fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');

        return { nextWeight: nextWeight };
    },

    deload: (args: any) => {
        console.log(`\n[系統後台] 執行降重計算：${args.currentWeightKg} * ${args.deloadPercentage}`);
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

        console.log(`\n[系統後台] 紀錄 ${args.exerciseName} 失敗！目前連續失敗次數：${currentFails}`);

        fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');

        return { currentConsecutiveFails: currentFails };
    },

    getNextWorkoutType: (args: any) => {
        const currentIndex = args.dayTag.indexOf(args.currentWorkoutType);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % args.dayTag.length;
        const nextDay = args.dayTag[nextIndex];
        
        console.log(`\n[系統後台] 計算下次訓練日：切換為 ${nextDay}`);

        try {
            const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
            currentState.program_state.current_workout_type = nextDay; 
            fs.writeFileSync(stateFilePath, JSON.stringify(currentState, null, 4), 'utf-8');
        } catch (error) {
            console.error("\n[系統錯誤] 無法更新訓練日至 Current_State.json", error);
        }

        return { nextDay: nextDay };
    },

    queryExercise: (args: { keyword: string }) => {
        console.log(`\n[系統後台] 檢索動作資料庫，關鍵字：${args.keyword}`);
        
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
                    console.log(`[系統後台] 觸發同義詞轉換：${searchTarget} -> ${realName}`);
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
            console.error("[系統錯誤] 檢索動作時發生異常", error);
            return { error: "檢索系統發生異常。" };
        }
    }
};