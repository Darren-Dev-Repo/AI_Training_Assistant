export const agentTools = [
  {
    type: "function",
    function: {
      name: "addWeight",
      description: "當使用者完成 5x5 訓練，表示他挑戰成功時，使用此工具計算下一次的訓練重量。",
      parameters: {
        type: "object",
        properties: {
          exerciseName: {
              type: "string",
              description: "使用者執行的動作名稱，必須完全符合 currentState.json 中的 key (例如: barbell_squat, bench_press 等)。"
          },
          reasoning: { 
            type: "string", 
            description: "在決定呼叫此工具前，請詳細寫下你的比對過程。例如：'深蹲目標為70kg 5x5，使用者實際完成70kg 5組5下，完全達標，故呼叫 addWeight'。"
          },
          currentWeightKg: {
            type: "number",
            description: "使用者今天完成的重量，單位為公斤 (kg)。"
          },
          minWeightChangeInKg: {
            type: "number",
            description: "要增加的重量，通常是 2.5 kg。"
          }
        },
        required: ["exerciseName", "reasoning", "currentWeightKg", "minWeightChangeInKg"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getNextWorkoutType",
      description: "需要知道使用者下一次訓練是課表的哪一天時，使用此工具取得訓練日的名稱。",
      parameters: {
        type: "object",
        properties: {
          currentWorkoutType: {
            type: "string",
            description: "使用者最近一次完成的訓練日的名稱。"
          },
          dayTag: {
            type: "array",
            description: "存放使用者訓練課表中，所有訓練日的名稱 (例如 ['A', 'B'])",
            items: {
              type: "string"
            }
          }
        },
        required: ["currentWorkoutType", "dayTag"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deload",
      description: "使用者未完成預計重量，挑戰失敗時，使用此工具計算下一次的訓練重量。",
      parameters: {
        type: "object",
        properties: {
          exerciseName: {
              type: "string",
              description: "使用者執行的動作名稱，必須完全符合 currentState.json 中的 key (例如: barbell_squat, bench_press 等)。"
          },
          reasoning: { 
            type: "string", 
            description: "在決定呼叫此工具前，請詳細寫下你的比對過程。例如：'深蹲目標為70kg 5x5，使用者實際完成65kg 5組4下，未達標，且目前連續失敗次數為2，故呼叫 deload'。"
          },
          currentWeightKg: {
            type: "number",
            description: "使用者今天完成的重量，單位為公斤 (kg)。"
          },
          minWeightChangeInKg: {
            type: "number",
            description: "要增加的重量，通常是 2.5 kg。"
          },
          deloadPercentage: {
            type: "number",
            description: "降低重量的比率 (如 0.9 代表降重 10%)。"
          }
        },
        required: ["exerciseName", "reasoning", "currentWeightKg", "minWeightChangeInKg", "deloadPercentage"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "recordFail",
      description: "當使用者未完成預計重量與組數，且目前的連續失敗次數 (consecutive_fails) 小於 2 時，使用此工具來紀錄失敗次數。",
      parameters: {
        type: "object",
        properties: {
          exerciseName: {
            type: "string",
            description: "使用者執行的動作名稱，必須完全符合 currentState.json 中的 key。"
          },
          reasoning: { 
            type: "string", 
            description: "在決定呼叫此工具前，請詳細寫下你的比對過程。例如：'深蹲目標為70kg 5x5，使用者實際完成65kg 5組4下，未達標，且目前連續失敗次數為2，故呼叫 recordFail'。"
          }
        },
        required: ["exerciseName", "reasoning"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "queryExercise",
      description: "當使用者詢問某個健身動作的姿勢、步驟或練哪裡時，使用此工具檢索動作指南。",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "動作的英文關鍵字，例如 'squat', 'bench press', 'sit-up'。"
          }
        },
        required: ["keyword"]
      }
    }
  }
];