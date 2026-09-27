from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from services.agent_orchestrator import agent_orchestrator

router = APIRouter(prefix="/api/chat", tags=["Chat & Reasoning"])

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = await agent_orchestrator.process_query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent reasoning failed: {str(e)}")
