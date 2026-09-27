# Hindsight Memory Integration Specification

> **Persistent Organizational Experience & Causal Memory Engine**

---

## 1. Why Hindsight Over Standard Vector RAG?

Standard RAG systems treat all documentation as flat, independent chunks of text. When queried, they perform raw similarity retrieval, frequently missing the critical temporal and causal links between decisions and downstream incidents:

| Dimension | Standard Vector RAG | CompanyBrain with Hindsight |
| :--- | :--- | :--- |
| **Data Model** | Flat text document chunks | Connected Experience Tuples (`Event $\to$ Context $\to$ Decision $\to$ Outcome $\to$ Lesson`) |
| **Causal Reasoning** | ❌ Cannot trace why a decision failed | ✅ Reconstructs full causal sequence from proposal to postmortem |
| **Learning Over Time** | ❌ Static index, no behavioral learning | ✅ Accumulated experiences dynamically inform future advisories |
| **Evidence Attribution** | Unstructured snippet excerpts | Explicit citations to ADRs, postmortems, and authors |
| **Confidence Scoring** | Similarity cosine score only | Causal verification rating (**Known**, **Inferred**, **Unknown**) |

---

## 2. The Learning Feedback Loop

```text
       ┌──────────────────────────────┐
       │   Engineering Experiences    │
       │ (ADRs, Outages, PR Reviews)  │
       └──────────────┬───────────────┘
                      ↓
       ┌──────────────────────────────┐
       │ Experience Extraction &      │
       │ Memory Formation Pipeline    │
       └──────────────┬───────────────┘
                      ↓
       ┌──────────────────────────────┐
       │    HINDSIGHT PERSISTENT      │
       │    ORGANIZATIONAL GRAPH      │
       └──────────────┬───────────────┘
                      ↓
       ┌──────────────────────────────┐
       │   Agent Recall & Causal      │
       │   Backward Trace ("Why?")    │
       └──────────────┬───────────────┘
                      ↓
       ┌──────────────────────────────┐
       │ Future Project Advisory &    │
       │ Organizational Synthesis     │
       └──────────────┬───────────────┘
                      ↓
               New Experience
                      │
                      └──────────────→ Ingest into Hindsight
```

---

## 3. Configuration & Compatibility

CompanyBrain is designed for immediate zero-config local demo execution, while offering seamless drop-in connectivity to live Hindsight and LLM endpoints:

```env
# Vectorize / Hindsight API Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.vectorize.io/v1/hindsight
HINDSIGHT_PROJECT_ID=companybrain_novastack

# Optional LLM Inference Engine (Groq / OpenAI / Gemini)
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```
