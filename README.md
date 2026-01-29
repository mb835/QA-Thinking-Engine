#  QA Thinking Engine ⚡ 

**AI-assisted Risk-Based Test Design Tool**

> **From test intent → structured scenarios → Playwright-ready skeletons**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/status-PoC_(Proof_of_Concept)-orange.svg)
![Stack](https://img.shields.io/badge/stack-React_Node_AI-blueviolet)

---

## 🧠 About the Project

**QA Thinking Engine** solves the "blank page" problem in software testing. It combines the power of **OpenAI (GPT-4)** with structured QA engineering principles.

Instead of hours spent on manual writing, you provide a test intent, and the engine transforms it into structured risk driven analysis, test scenarios, and Playwright ready automation skeletons.

---

##  Why This Matters?

Business and development teams often struggle with the "QA bottleneck." Here is how **QA Thinking Engine** compares to the traditional approach:

| Feature | Traditional QA Design | **QA Engine** |
| :--- | :--- | :--- |
| **Design Time** | 2-4 Hours / Sprint | **< 1 Minute** |
| **Risk Identification** | Subjective / Human Error | **Objective / AI-Powered** |
| **Code Output** | Manual implementation | **Instant Playwright Skeleton** |
| **Jira Sync** | Manual ticket creation | **Automatic REST API Export** |

---

## 🛡️ Security-First Approach: Expert QA Insight

The engine incorporates security and validation awareness inspired by common OWASP Top 10 risk areas.

During scenario analysis, it highlights potential gaps or missing validation related to:
- CSRF protection
- SQL Injection
- Cross-Site Scripting (XSS)
- Authentication and authorization risks

This helps testers systematically consider security and abuse risks early in the test design phase, rather than only during later security testing stages.

In addition, each generated test includes a clear business and risk rationale explaining *why* the test is important for product stability and quality.

---

## 🏗️  High-Level Architecture

The application follows a clean separation of concerns, ensuring modularity between the UI, the logical engine, and the AI integration.

```mermaid
graph TD
    A["User Intent (Natural Language)"] -->|Input| B("React Frontend")
    B -->|API Request| C{"Node.js Backend"}
    C -->|Context & Prompt Engineering| D["OpenAI LLM (Configurable)"]
    D -->|Structured JSON| C
    C -->|Response| B
    B --> E["Test Scenarios & Insight"]
    B --> F["Playwright Code Skeleton"]
    
    %% JIRA Integration link
    B -->|Export via REST API| G[("Atlassian JIRA")]
    style G fill:#0052CC,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 📸 Application Preview

### 1. 📊 QA Dashboard
*Visual dashboard showcasing the future direction of QA metrics and system observability. Currently driven by mock data for UI validation and prototyping.*
![Dashboard View](./docs/Dashboard.png)

### 2. 🎬 Workflow: Intent to Structure
*Live demonstration of entering a test intent. The engine interprets natural language (Czech) and immediately suggests a test structure.*
![Input Workflow](./docs/TC1.gif)

### 3. 🧠 AI Analysis & Processing
*Visual feedback while the specialized AI agent analyzes the intent, constructs logic, and identifies potential risks.*
![AI Processing](./docs/Loading1.gif)

### 4. 📋 Deep Dive: Test Case Detail
*The final output: A structured Acceptance test with distinct steps, preconditions, and a dedicated "Expert QA Insight" panel.*
![Detail View](./docs/TCD01.png)

### 5. 🛠️ Automated Playwright Code
*One-click generation of production-ready Playwright (TypeScript) code skeletons, fully commented and typed.*
![Code Generation](./docs/Skeleton.png)

### 6. 🎫 JIRA Integration (Proof of Concept)
*Direct integration with Atlassian JIRA. Scenarios can be exported as Tasks/Epics via REST API, bridging the gap between design and management.*
![JIRA Export](./docs/JiraExport.png)

---

## 📦 Output Structure

Unlike generic chat bots, this engine enforces **strict structured outputs** suitable for professional QA workflows.

### 1️⃣ Test Scenarios (The "What" & "Why")
Defines the scope and business goal before jumping into steps.

```json
{
  "id": "SC-01",
  "title": "User Login Validation",
  "goal": "Verify that a registered user can access the account with valid credentials.",
  "risk": "Unauthorized access potential if validation fails."
}
```

### 2️⃣ Test Cases (The "How")
Generates actionable steps for manual or automated execution.

```json
{
  "id": "TC-01",
  "scenarioId": "SC-01",
  "steps": [
    "Navigate to /login page",
    "Enter valid email: user@test.com",
    "Enter valid password",
    "Click 'Login' button"
  ],
  "expectedResult": "User is redirected to Dashboard"
}
```

### 3️⃣ Expert QA Insight
The engine acts as a "second pair of eyes," analyzing coverage and risks.

* **Strategic Rationale:** Explains the business context and why this specific test is critical for the product.
* **Coverage:** Validates if the test covers "Acceptance flows" or "Negative scenarios".
* **Risks:** Identifies edge cases (e.g., SQL Injection, Brute Force).
* **Automation Tips:** Suggests locators (e.g., `data-testid`) for stability.

---

##  Core Capabilities

*  **Accelerated Test Design & Automation:** From intent to Playwright skeletons in seconds.
*  **Complex Flow Fidelity:** Handles large scenarios (20+ steps) with strict adherence to Acceptance Criteria.
*  **Risk Awareness:** Systematically highlights functional, security, and abuse risks.
*  **AI Guardrails:** Heuristic validators to minimize hallucinations and enforce logical step order.
*  **Localized Output:** Optimized for Czech output by default (configurable via prompt settings).
*  **Seamless JIRA Integration:** Experimental export of scenarios directly to JIRA (Epics / Tasks).

---

##  Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

---

##  Getting Started

### Prerequisites
* Node.js (v18+)
* NPM or Yarn
* OpenAI API Key
* JIRA API Token (optional, for export features)

### 1. Installation

**Clone the repository and install dependencies:**

```bash
# 1. Clone repo
git clone https://github.com/mb835/QA-Thinking-Engine.git
cd QA-Thinking-Engine

# 2. Install Backend dependencies
npm install

# 3. Install Frontend dependencies
cd ui
npm install
```

### 2. Configuration

Return to the root directory, create a `.env` file and update it with your credentials:

```env
# --- OpenAI ---
OPENAI_API_KEY=sk-proj-xxxxxxxx...

# --- JIRA Integration (Optional) ---
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0...
JIRA_PROJECT_KEY=KAN
# Generate at: https://id.atlassian.com/manage-profile/security/api-tokens

```

### 3. Run the Application

You need to run Backend and Frontend in separate terminals.

**Terminal 1: Backend (API)**
```bash
# From root directory
npm run dev
# Server starts on http://localhost:3000
```

**Terminal 2: Frontend (UI)**
```bash
# From /ui directory
cd ui
npm run dev
# App starts on http://localhost:5173
```
## 🚫 What This Is NOT

- Not a replacement for QA engineers or human judgment.
- Not a test execution or automation runner platform.
- Not a magic box – output quality depends on input quality.
- Not a generic AI chatbot or random script generator.

---

## 🔮 Roadmap & Future Vision

### ✅ Phase 1: Foundation (Implemented)
* [x] **QA Design Engine:** Core Logic & AI Agent for requirement interpretation.
* [x] **Playwright Export:** Automated TypeScript code generation for end-to-end testing.
* [x] **JIRA Integration:** Seamless bridge between AI design and project management.

### 🚀 Phase 2: Intelligence & Stability (Planned)
* [ ] **Analysis Profiles:** Configurable analysis modes controlling depth, coverage, and test granularity (e.g., *Balanced* vs *Deep Analysis*).
* [ ] **Privacy-First Masking:** Automatic masking of sensitive data before AI processing.
* [ ] **Contextual Awareness:** Integration with Confluence/Documentation to align tests with specific business logic.
* [ ] **Self-Healing Scripts:** AI-driven updates for Playwright locators when the UI changes.
* [ ] **Persistent Storage:** MongoDB integration for saving test history and user preferences.
* [ ] **Risk-Based Heatmaps:** Visual analytics to identify the most vulnerable parts of the application.

### 🛠️ Phase 3: Scaling & Automation (Planned)
* [ ] **CI/CD Pipeline:** GitHub Actions integration for automated test execution.
* [ ] **Synthetic Data Generation:** AI-powered creation of safe, anonymized test data for privacy compliance.
* [ ] **Cloud Testing:** Integration with SauceLabs/BrowserStack for cross-browser validation.
* [ ] **Visual Testing:** Pixel-perfect regression checks using AI computer vision.

---

## 👤 Author

**Martin Bělov**
* QA Tester | Test Design | API, SQL | AI-Assisted Development
* *This project demonstrates the intersection of QA methodology, AI Engineering, and Software Development.*

---

##  License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.
