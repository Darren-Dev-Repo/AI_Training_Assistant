# 🏋️‍♂️ AI Training Assistant (Work in Progress)

> A dynamic, LLM-powered workout companion for busy beginners.

Traditional weightlifting apps demand rigid adherence to static programs (like Stronglift 5x5). However, busy beginners often face real-world friction: occupied squat racks, high fatigue from work, or minor injuries. 

This project aims to build an **Agentic Training Assistant** that parses natural language inputs, understands context, and dynamically adjusts the workout state (e.g., substituting exercises while freezing core progression) to keep users motivated and on track.

## ✨ Core Features (In Development)
* **Natural Language Logging:** Users can log workouts via conversational text.
* **LLM Intent Parsing:** Translates unstructured text into strict, actionable JSON schemas for the database.
* **Dynamic Routine Adjustment:** Automatically handles edge cases like unavailable equipment or high fatigue using domain knowledge.
* **State Preservation:** Implements a "State Freeze" mechanism to protect core lifting progression when temporary substitute exercises are performed.

## 📅 Project Roadmap (9-Week Agile Sprint)
- [x] **Week 1:** Defined Core DB Schema (`Current State` & `Workout Logs`) and Zero-Shot Extraction Prompts.
- [x] **Week 2-3:** Decision Logic Design & Next Training Generator Prompt.
- [x] **Week 4-5:** Tool Implementation & Function Definitions.
- [X] **Week 6:** Dynamic Prompting Implementation and First Genimi API Connection.
- [X] **Week 7:** State & Guardrails.
- [X] **Week 8:** Knowledge Query Implementation.
- [ ] **Week 9:** Deployment.
