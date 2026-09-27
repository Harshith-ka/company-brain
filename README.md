# CompanyBrain — AI Organizational Intelligence & Memory Platform

> **Your company's memory. Your team's experience. One AI brain.**
> Built with persistent memory powered by **Hindsight** (by Vectorize).

---

## 🌟 Overview

**CompanyBrain** transforms company experiences into persistent, connected organizational memory. Rather than simply retrieving raw text documents (like standard RAG), CompanyBrain remembers:

$$\text{Event} \longrightarrow \text{Context} \longrightarrow \text{Decision} \longrightarrow \text{Action} \longrightarrow \text{Outcome} \longrightarrow \text{Lesson}$$

When engineers ask questions like *"Why did we stop using Redis?"* or *"Should we use Redis for Project Nova?"*, CompanyBrain recalls historical incidents, decisions, and outcomes to provide evidence-backed, experienced guidance.

---

## 🚀 Key Features

1. **CompanyBrain Chat & "Why?" Engine**: Natural language Q&A with causal backward tracing, confidence ratings (**Known**, **Inferred**, **Unknown**), and direct memory citations.
2. **Interactive 6-Step Judge Demo Runner**: Demonstrates the core value proposition in under 60 seconds (Cold Start $\to$ Ingest Memories $\to$ Recall $\to$ Apply to New Scenario $\to$ Memory Graph $\to$ "What Have We Learned?").
3. **Organizational Memory Graph**: Interactive visual graph connecting People, Projects, Technologies, Incidents, ADRs, and Lessons.
4. **Decision (ADR) & Incident Explorers**: Deep structured inspection of architecture decisions, postmortems, and root causes.
5. **Interactive Chronological Timeline**: Evolution of organizational knowledge and practices over time.
6. **Learning & Insights Dashboard**: Metrics on recurring risks, repeated patterns, resolved incidents, and synthesized lessons.
7. **Multi-Source Ingestion Pipeline**: Ingest ADRs, Incidents, GitHub issues/PRs, and Markdown docs into Hindsight memory.
8. **NovaStack Synthetic Dataset**: Pre-populated with realistic company history (20 ADRs, 15 Incidents, 30 GitHub issues, Postmortems).

---

## 🛠️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│              CompanyBrain React Frontend                │
│ (Chat, Memory Graph, Timeline, Explorers, Demo Runner)  │
└────────────────────────────┬────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend Server                 │
│  ├── Agent Orchestrator & Reasoning Engine              │
│  ├── Memory Formation & Experience Extraction Pipeline  │
│  ├── Evidence Assembly & Confidence Scoring             │
│  └── Synthetic NovaStack Data Repository                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Hindsight Memory Layer                  │
│    Persistent Organizational Experiences & Knowledge    │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore CompanyBrain!
