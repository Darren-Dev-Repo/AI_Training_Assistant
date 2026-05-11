export const agentTools = [
  {
    type: "function",
    function: {
      name: "addWeight",
      description: "當使用者完成 5x5 訓練，表示他挑戰成功時，使用此工具計算下一次的訓練重量。",
      parameters: {
        type: "object",
        properties: {
          currentWeightKg: {
            type: "number",
            description: "使用者今天完成的重量，單位為公斤 (kg)。"
          },
          minWeightChangeInKg: {
            type: "number",
            description: "要增加的重量，通常是 2.5 kg。"
          }
        },
        required: ["currentWeightKg", "minWeightChangeInKg"]
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
        required: ["currentWeightKg", "minWeightChangeInKg", "deloadPercentage"]
      }
    }
  }
];