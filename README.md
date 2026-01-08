# Simple Quiz Application

A responsive quiz app built with React + Vite. It pulls 15 questions from OpenTDB, saves progress in `localStorage`, and provides a report summary after submission.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

- Start screen with email validation and resume/start-over controls.
- 15-question quiz fetched from OpenTDB.
- One question at a time with next/previous navigation and a question overview panel.
- 30:00 countdown timer with auto-submit at 00:00.
- Full persistence in `localStorage` (answers, visited/attempted, current index, remaining time).
- Report page with summary and per-question correctness.

## Approach

- Centralized quiz state with a reducer and context.
- Questions are decoded (HTML entities) and shuffled on load.
- State is persisted on every meaningful change to support refresh/resume.
- Auto-submit guarded to trigger exactly once.

## Assumptions

- The quiz always uses 15 questions from the OpenTDB API.
- If data exists in `localStorage`, users can resume from the saved state.

## Challenges

- Avoiding double-submit on timer completion, handled via a submission guard.
- Keeping timer persistence accurate with a per-second tick tied to state.
