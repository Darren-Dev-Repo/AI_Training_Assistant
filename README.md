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
- [v] **Week 1:** Defined Core DB Schema (`Current State` & `Workout Logs`) and Zero-Shot Extraction Prompts.
- [ ] **Week 2:** Decision Logic Design & State Freeze Implementation.
- [ ] **Week 3-9:** *To be updated...*
