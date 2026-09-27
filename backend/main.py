import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import chat, memories, decisions, incidents, timeline, graph, insights, ingest, demo, simulate, integrations
from services.hindsight_service import hindsight_service

# Version 1.0.4 - GitHub Guard & Slack War-Room Integration
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Organizational Intelligence & Persistent Memory Platform powered by Hindsight (Vectorize)"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router)
app.include_router(memories.router)
app.include_router(decisions.router)
app.include_router(incidents.router)
app.include_router(timeline.router)
app.include_router(graph.router)
app.include_router(insights.router)
app.include_router(ingest.router)
app.include_router(demo.router)
app.include_router(simulate.router)
app.include_router(integrations.router)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "memory_layer": "Hindsight (Vectorize)",
        "active_memories": len(hindsight_service.get_all_memories())
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "companybrain-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
