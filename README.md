# 🏋️‍♂️ Stronglift 5x5 AI Training Assistant

> A Deterministic, Agentic Workout Companion powered by Gemini 2.5 Flash & TypeScript.

傳統的科學化力量訓練（如 Stronglift 5x5）成效卓著，但繁瑣的重量計算、失敗降重（Deload）判定與數據追蹤，往往為訓練者帶來沉重的認知負載。

本專案旨在打造一個輕量級的終端機 AI 健力教練。透過 Separation of Concerns 架構，系統將自然語言的意圖解析交由大語言模型（LLM）處理，而核心的 5x5 訓練守則與數值計算則由 TypeScript 底層邏輯接管。這不僅徹底消除了生成式 AI 的數學幻覺，更透過動態上下文注入與嚴密的防護網，提供訓練者流暢、安全且具備長期記憶的對話式指導體驗。

## ✨ Core Features

* **Conversational Logging & Guardrails (自然語言紀錄與資料護欄)**
訓練者可使用口語回報訓練狀況。系統內建嚴謹的資料守門員（Guardrails）機制，當偵測到缺漏動作或極端不合理的數據時，會主動攔截並反問訓練者，徹底避免資料庫遭到不可逆的污染。
* **Deterministic Tool Calling (絕對精準的工具調用)**
捨棄 LLM 不可靠的運算能力，系統透過 Function Calling 介接 TypeScript 實作的底層工具（如 `addWeight`, `deload`, `recordFail`）。確保每一次的加減重推演 100% 符合 Stronglift 5x5 規則。
* **State Persistence & Snapshots (狀態持久化與進度快照)**
實作極度輕量的本地檔案 I/O 機制。每次訓練結算後，系統會於背景自動覆寫 `Current_State.json`，並將當日所有動作的重量進度作為快照（Snapshot）無縫寫入 `Workout_History.json`，達成跨會話的長期追蹤。
* **Zero-Config Cold Start (零設定冷啟動)**
針對初次使用的訓練者，系統具備自動偵測機制，於首次啟動時無感載入預設的 20kg 空槓課表，並動態注入系統提示詞，引導新手順利展開第一天的訓練。
* **In-Memory RAG Knowledge Base (本地知識庫極速檢索)**
整合開源的 `free-exercise-db.json`，捨棄龐大的外部向量資料庫，實作零延遲的記憶體內檢索。內建同義詞字典（Alias Mapping），精準彌平口語發問與靜態資料庫間的落差，並具備優雅降級（Graceful Degradation）的容錯處理。

## 🚀 Getting Started (Deployment & Usage)

本專案採用 Node.js 開發，無需架設外部資料庫即可在本地端流暢執行。

### 1. Installation

請先確認環境已安裝 Node.js (v18+)，接著克隆專案並安裝相依套件：

```bash
git clone <your-repo-url>
cd ai-training-assistant
npm install

```

### 2. Environment Setup

在專案根目錄建立 `.env` 檔案，並填入您的 Google Gemini API Key：

```env
GEMINI_API_KEY=your_api_key_here

```

### 3. Run the Agent

本專案具備正式與開發雙模式切換功能：

* **一般訓練模式 (Production Mode)**：畫面純淨，專注於教練對話。
```bash
npm start

```


* **開發者除錯模式 (Debug Mode)**：顯示所有後台工具調用、狀態更新與同義詞轉換日誌。
```bash
# Mac / Linux
DEBUG=true npm start

# Windows (PowerShell)
$env:DEBUG="true"; npm start

```



## 📅 Project Roadmap (9-Week Agile Sprint)

* [x] **Week 1:** Defined Core DB Schema (`Current State` & `Workout Logs`) and Zero-Shot Extraction Prompts.
* [x] **Week 2-3:** Decision Logic Design & Next Training Generator Prompt.
* [x] **Week 4-5:** Tool Implementation & TypeScript Function Definitions.
* [x] **Week 6:** Dynamic Prompting Implementation and First Gemini API Connection.
* [x] **Week 7:** State Persistence (File I/O) & Input Guardrails implementation.
* [x] **Week 8:** Knowledge Query Implementation (In-Memory RAG & Alias Mapping) & History Snapshots.
* [x] **Week 9:** Refactoring (Log Silencing, Error Handling) & Deployment.