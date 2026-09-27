# 60-Second Judge Pitch & Live Demonstration Script

---

## ⏱️ The 60-Second Judge Pitch

> "Every company suffers from institutional amnesia.
> 
> Architecture decisions are lost in Slack threads. Outage root causes are buried in closed tickets. When engineers leave, their hard-won experience disappears.
> 
> Traditional RAG can search static documents, but it cannot answer: **'What has our company learned?'**
> 
> That's why we built **CompanyBrain** — powered by **Hindsight**.
> 
> CompanyBrain doesn't just search documents. It remembers institutional experiences — **Decisions $\to$ Incidents $\to$ Outcomes $\to$ Lessons** — and applies them to future engineering problems.
> 
> Let's watch the learning loop in action:"

---

## 🎬 6-Step Demonstration Walkthrough

### Step 1: The Cold Start (Before Memory)
- **Action:** Click **Step 1** in the 60s Judge Demo tab.
- **Prompt:** *"Why did NovaStack stop using Redis?"*
- **Agent Response:** *"I don't have enough organizational memory yet on this topic."*
- **Judge Takeaway:** Shows the agent starts without hallucinating fabricated knowledge.

---

### Step 2: Feed Historical Experiences
- **Action:** Click **Step 2** to feed NovaStack's engineering journey into Hindsight.
- **Stream Ingested:**
  - June 2023: ADR-002 (Redis introduced for caching)
  - Jan 2024: INC-101 (P1 cache stampede outage)
  - Jan 2024: GH-102 (Single-flight mutex hotfix)
  - Feb 2024: ADR-006 (Pivot to Local LRU + DynamoDB)
  - March 2025: ADR-020 (Company-wide Caching Policy v2)

---

### Step 3: Ask Again (Causal Memory Recall)
- **Action:** Click **Step 3**.
- **Prompt:** *"Why did NovaStack stop using Redis?"*
- **Agent Response:** Fully reconstructs the causal chain: Redis was introduced in ADR-002 $\to$ suffered cache stampede in INC-101 $\to$ replaced with Local LRU in ADR-006 with p99 drop from 145ms to 8ms.
- **Confidence:** `Known Fact (96%)` with direct citations.

---

### Step 4: Apply to a New Situation (Project Nova)
- **Action:** Click **Step 4**.
- **Prompt:** *"We're considering Redis for our new payment service (Project Nova). What should we know?"*
- **Agent Response:** Connects past failure modes to the new scenario, warning against thundering herds and enforcing Caching Policy v2 safeguards (single-flight coalescing + randomized TTL jitter).
- **Confidence:** `Inferred Synthesis (88%)`.

---

### Step 5: Visual Knowledge Graph & Timeline
- **Action:** Click **Step 5** $\to$ explore the interactive **Memory Graph** and **Evolution Timeline** connecting Elena Vance, Priya Sharma, Redis, INC-101, and ADR-006.

---

### Step 6: The Killer Question
- **Action:** Click **Step 6**.
- **Prompt:** *"What has the company learned about caching?"*
- **Agent Response:** Synthesizes 2 years of institutional memory into 4 core architectural principles.

---

## 🏁 Concluding Statement

> **"CompanyBrain transforms company history into persistent AI intelligence. Don't just search what your company knows. Ask what your company has learned."**
