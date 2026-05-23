import { GoogleGenerativeAI, type FunctionDeclaration } from '@google/generative-ai';
import * as fs from 'fs';
import * as readline from 'node:readline/promises';
import 'dotenv/config';

import { agentTools } from './AgentToolsDescription.js';
import { buildSystemPrompt } from './SystemPrompt.js'; 
import { myTools } from './AgentTrainingTools.js';
import { sysLog } from './SysLog.js';

// ==========================================
// 初始化 Gemini API
// ==========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const geminiFormattedTools = [{
    functionDeclarations: agentTools.map(t => t.function as unknown as FunctionDeclaration)
}];

// ==========================================
// 啟動 CLI 對話迴圈 (Agent 工作流)
// ==========================================
async function startAgent() {
    const stateFilePath = 'currentState.json';
    const defaultFilePath = 'defaultState.json';
    let dynamicContext = "";

    // ------------------------------------------------
    // 處理實體檔案與動態 Context
    // ------------------------------------------------
    if (!fs.existsSync(stateFilePath)) {
        fs.copyFileSync(defaultFilePath, stateFilePath);
        dynamicContext += `\n\n[系統狀態注入] 偵測到此為新訓練者的首次對話，系統已自動載入預設課表（包含深蹲、臥推、划船等空槓重量）。請主動向訓練者打招呼，歡迎他開始 Stronglift 5x5 計畫，並列出他第一次訓練（A日）的動作與預定重量，引導他開始。`;
    } else {
        const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        const todayWorkoutType = currentState.next_workout; 
        const workoutDetails = todayWorkoutType === 'A' 
            ? "深蹲 (Squat)、臥推 (Bench Press)、划船 (Row)" 
            : "深蹲 (Squat)、肩推 (Overhead Press)、硬舉 (Deadlift)";
            
        dynamicContext += `\n\n[系統狀態注入] 根據最新紀錄，訓練者今日預定進行：${todayWorkoutType} 日課表，包含動作：${workoutDetails}。`;
    }

    // ------------------------------------------------
    // 組合最終 System Prompt
    // ------------------------------------------------
    const baseSystemPrompt = buildSystemPrompt(); 
    const finalSystemPrompt = baseSystemPrompt + dynamicContext;

    // ------------------------------------------------
    // 正式建立模型與對話 Session
    // ------------------------------------------------
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: finalSystemPrompt,
        tools: geminiFormattedTools,
    });

    const chatSession = model.startChat();

    // ------------------------------------------------
    // 啟動終端機互動
    // ------------------------------------------------
    console.log("==================================================");
    console.log("🏋️ Stronglift 5x5 智能教練已上線！(輸入 exit 離開)");
    console.log("==================================================\n");

    process.stdout.write("💪🤖 教練準備中...\r");
    const initMsg = await chatSession.sendMessage("【系統隱形指令】訓練者已上線，請依照系統設定，主動打招呼並列出今日預定課表引導訓練者。");
    console.log("💪🤖 教練：\n" + initMsg.response.text() + "\n");
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    while (true) {
        const userInput = await rl.question('👤 你：');
        if (userInput.toLowerCase() === 'exit') break;

        process.stdout.write('💪🤖 教練思考中...');

        try {
            // 第一步：把使用者的話傳給 LLM
            let result = await chatSession.sendMessage(userInput);
            let response = result.response;
            let functionCalls = response.functionCalls();

            // 多工迴圈 + 防禦性檢查
            while (functionCalls && functionCalls.length > 0) {
                // 準備一個陣列，用來裝這回合所有工具算出來的答案
                const functionResponses = [];

                for (const call of functionCalls) {
                    // 確保 call 不是 undefined
                    if (!call) continue;

                    // 確保這個工具存在於 myTools 裡
                    const toolFunction = myTools[call.name as keyof typeof myTools];
                    
                    if (!toolFunction) {
                        sysLog(`\n[系統錯誤] LLM 試圖呼叫不存在的工具：${call.name}`);
                        console.log("⚠️ 抱歉，智能教練出了點狀況，請稍後再嘗試！\n");
                        // 如果工具不存在，依然要回傳一個錯誤給 LLM，不然 API 會報錯說「你少回傳了結果」
                        functionResponses.push({
                            functionResponse: {
                                name: call.name,
                                response: { error: `找不到名為 ${call.name} 的工具，請確認。` }
                            }
                        });
                        continue; 
                    }

                    process.stdout.write(`\n[系統後台] 執行工具 ${call.name}...`);
                    
                    try {
                        // 第三步：呼叫對應的 TypeScript 函數
                        const apiResponse = toolFunction(call.args);
                        
                        functionResponses.push({
                            functionResponse: {
                                name: call.name,
                                response: apiResponse
                            }
                        });
                    } catch (err) {
                        sysLog(`\n[系統錯誤] 工具 ${call.name} 執行時崩潰！`);
                        console.log("⚠️ 抱歉，智能教練出了點狀況，請稍後再嘗試！\n");
                        functionResponses.push({
                            functionResponse: {
                                name: call.name,
                                response: { error: "工具內部執行失敗" }
                            }
                        });
                    }
                }

                process.stdout.write('\n💪🤖 教練正在計算數據與彙整課表...');

                // 第四步：把所有算完的答案「一次打包」還給 LLM
                result = await chatSession.sendMessage(functionResponses);
                response = result.response;
                
                // 檢查教練是不是還有話要說，或者又要呼叫新工具（更新迴圈條件）
                functionCalls = response.functionCalls();
            }

            // 第五步：當 while 迴圈結束，代表教練真正準備好開口了！
            console.log(`\n\n💪🤖 教練：${response.text()}\n`);

        } catch (error) {
            sysLog(`\n[系統錯誤] 處理使用者輸入時發生異常：\n${String(error)}`);
            console.log("⚠️ 抱歉，智能教練出了點狀況，請稍後再嘗試！\n");
        }
    }

    rl.close();
    console.log("系統關閉，下次訓練見！");
}

startAgent();