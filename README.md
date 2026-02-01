
# AutoDevOps AI 🚀

![Status](https://img.shields.io/badge/Status-Beta-blue)
![Tech](https://img.shields.io/badge/Tech-React_19_•_TypeScript_•_Tailwind-black)
![AI](https://img.shields.io/badge/AI-Google_Gemini_3-8ab4f8)
![Backend](https://img.shields.io/badge/Backend-Firebase-orange)

**The world's first browser-based Autonomous Self-Healing Codebase Agent.**

AutoDevOps AI mimics a senior DevOps engineer by autonomously detecting, diagnosing, and patching software failures in real-time. Powered by **Google Gemini 3.0**, it reasons through build logs, understands repository context, and generates verified code fixes without human intervention.

---

## 📑 Table of Contents

- [Core Capabilities](#-core-capabilities)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [The Agent Workflow](#-the-agent-workflow)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Deep Dive: AI Implementation](#-deep-dive-ai-implementation)
- [Project Structure](#-project-structure)
- [Disclaimer](#-disclaimer)

---

## 🌟 Core Capabilities

1.  **Autonomous Reasoning Core**: Uses `gemini-3-pro-preview` to analyze complex failure patterns and deduce root causes that simple linters miss.
2.  **Stack Detection Heuristics**: Hybrid analysis using file-tree scanning and AI inference to automatically configure the environment for Node.js, Python, Go, Rust, or Java.
3.  **Self-Healing Pipeline**: A 6-step loop that moves from Ingestion → Test → Diagnosis → Fix → Verification → Finalization.
4.  **Visual Reasoning Dashboard**: Real-time visualization of the AI's "thought process," displaying log streams, reasoning steps, and code diffs as they happen.
5.  **Persistent Memory**: Uses Firebase Firestore to store session history, allowing users to review past autonomous runs and audit logs.
6.  **Secure Authentication**: Integrated Firebase Authentication (Email/Password + Google Sign-In).

---

## 🏗 Architecture & Tech Stack

The application is built as a Single Page Application (SPA) using React 19, relying on client-side AI integration for low-latency reasoning.

### Frontend
-   **Framework**: React 19 (via ESM imports)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (with Typography plugin) + Custom "Google-Material" Dark Mode aesthetics.
-   **Bundling**: None (ESM-based runtime via `index.html` import maps).

### Backend / Services
-   **AI Model**: Google Gemini API (`@google/genai` SDK).
    -   *Flash Model*: Used for rapid log generation and summarization.
    -   *Pro Model*: Used for deep reasoning, root cause analysis, and code synthesis.
-   **Database**: Firebase Firestore (Session storage, audit logs).
-   **Auth**: Firebase Auth.

---

## 🤖 The Agent Workflow

The `startAutonomousRun` function in `App.tsx` orchestrates the following lifecycle:

1.  **Ingestion & Analysis**:
    *   Fetches repository metadata (via GitHub API or simulation).
    *   **AI Task**: Identifies tech stack and "Critical Files" likely to harbor bugs.
2.  **Test Execution**:
    *   Simulates a CI/CD test run.
    *   **AI Task**: Generates realistic, stack-specific failure logs (e.g., Python `KeyError` or Node.js `ModuleNotFound`).
3.  **Diagnosis**:
    *   **AI Task**: Analyzes the generated failure log against the codebase context. Output includes Root Cause, Risk Level, and Strategy.
4.  **Fix Generation**:
    *   **AI Task**: Synthesizes a code patch (Diff) based on the diagnosis. It ensures the fix is syntactically correct and preserves existing logic.
5.  **Verification**:
    *   Simulates a re-run of the test suite against the patched code.
6.  **Finalization**:
    *   **AI Task**: Generates an Executive Summary and certifies the build health.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (for local serving, though the app runs largely client-side).
-   A Google Cloud Project with **Gemini API** enabled.
-   A **Firebase** Project.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/autodevops-ai.git
    cd autodevops-ai
    ```

2.  **Environment Setup**:
    Since this project uses ES modules in the browser, API keys are currently hardcoded or injected via process env in a build step. For this codebase, ensure `services/firebase.ts` and `services/gemini.ts` have valid keys.

    *Open `services/firebase.ts` and replace the `firebaseConfig` object with your own.*
    *Ensure `process.env.API_KEY` is available for Gemini, or configure the SDK instantiation.*

3.  **Run the Application**:
    You can use any static file server.
    ```bash
    npx serve .
    ```
    Open `http://localhost:3000` in your browser.

---

## ⚙️ Configuration

### Firebase Security Rules (Firestore)
To ensure the History feature works, configure your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Gemini API
The app requires the `gemini-3-flash-preview` and `gemini-3-pro-preview` models. Ensure your API key has access to these specific versions in Google AI Studio.

---

## 🧠 Deep Dive: AI Implementation

### `services/gemini.ts`

This service layer handles all interactions with the LLM.

*   **`analyzeRepoContext`**: Uses a heuristic prompt to scan a URL and determine if it's a Python, Node, or Go project, and guesses where the entry point (`main.py`, `index.ts`) is.
*   **`diagnoseFailure`**: Uses the `ANALYSIS_PROMPT_TEMPLATE`. This enforces a strict JSON schema output requiring `root_cause`, `risk_level`, and `reasoning`. It utilizes the `thinkingBudget` config to allow the model to "think" before answering.
*   **`generateFixStrategy`**: Uses the `PATCH_PROMPT_TEMPLATE`. It asks the model to generate a specific JSON structure containing `before` and `after` lines for a side-by-side diff view.

### `components/Dashboard.tsx`

This component is the "Brain Visualization".
*   **State Management**: It tracks `AgentState` (confidence, current attempt, memory).
*   **Real-time Logs**: Displays a stream of logs categorized by type (`system`, `reasoning`, `test`, `error`).
*   **Diff Viewer**: Renders the JSON diff returned by Gemini into a color-coded, side-by-side code comparison view.

---

## 📂 Project Structure

```text
/
├── index.html              # Entry point, Import Maps, Tailwind Script
├── index.tsx               # React Root Mount
├── App.tsx                 # Main Application Logic & Router
├── types.ts                # TypeScript Interfaces (AgentState, LogEntry)
├── constants.tsx           # Initial Steps, Icons, Mock Data
├── metadata.json           # Permissions & App Meta
├── components/
│   ├── LandingPage.tsx     # Marketing Landing Page
│   ├── AuthPage.tsx        # Login/Signup UI
│   ├── SetupPage.tsx       # Repo URL Input & History
│   ├── Dashboard.tsx       # Main Active Agent View
│   ├── ReportPage.tsx      # Final Summary & Audit Log
│   └── LegalPage.tsx       # Privacy & Terms
└── services/
    ├── firebase.ts         # Firebase Config & Auth/DB Exports
    └── gemini.ts           # AI Model Interaction Layer
```

---

## ⚠️ Disclaimer

**Experimental Software**: This tool autonomously generates code patches. While it includes verification steps, AI-generated code should always be reviewed by a human engineer before being deployed to production environments. The "CI/CD execution" in this demo is simulated for demonstration purposes, though the AI reasoning is real.

---

*Built with ❤️ using Google Gemini & React.*
