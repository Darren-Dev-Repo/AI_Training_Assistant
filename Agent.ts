import { GoogleGenerativeAI, type FunctionDeclaration } from '@google/generative-ai';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import 'dotenv/config';

import { agentTools } from './AgentToolsDescription.js';
import { buildSystemPrompt } from './SystemPrompt.js'; 
import { myTools } from './AgentTrainingTools.js';

// ==========================================
// 初始化 Gemini API
// ==========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const geminiFormattedTools = [{
    functionDeclarations: agentTools.map(t => t.function as unknown as FunctionDeclaration)
}];

// 設定模型
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // 使用最快、最適合 Tool Calling 的免費模型
    systemInstruction: buildSystemPrompt(),
    tools: geminiFormattedTools,
});

// ==========================================
// 啟動 CLI 對話迴圈 (Agent 工作流)
// ==========================================
async function startAgent() {
    const rl = readline.createInterface({ input, output });
    
    // 建立一個帶有歷史記憶的對話 Session
    const chatSession = model.startChat();

    console.log("==================================================");
    console.log("🏋️ Stronglift 5x5 智能教練已上線！(輸入 exit 離開)");
    console.log("==================================================\n");

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
                        console.error(`\n[系統錯誤] LLM 試圖呼叫不存在的工具：${call.name}`);
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
                        console.error(`\n[系統錯誤] 工具 ${call.name} 執行時崩潰！`);
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
            console.error("\n發生錯誤：", error);
        }
    }

    rl.close();
    console.log("系統關閉，下次訓練見！");
}

startAgent();