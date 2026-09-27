from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import MemoryItem
from services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/memories", tags=["Hindsight Memories"])

@router.get("", response_model=List[MemoryItem])
async def get_memories(
    query: Optional[str] = None,
    technology: Optional[str] = None,
    project: Optional[str] = None,
    type: Optional[str] = None
):
    memories = hindsight_service.get_all_memories()
    
    if query:
        memories = hindsight_service.search_memories(query, limit=50)
    
    if technology:
        memories = [m for m in memories if technology.lower() in m.technology.lower()]
        
    if project:
        memories = [m for m in memories if project.lower() in m.project.lower()]
        
    if type:
        memories = [m for m in memories if m.type.lower() == type.lower()]
        
    return memories

@router.get("/{memory_id}", response_model=MemoryItem)
async def get_memory_by_id(memory_id: str):
    mem = hindsight_service.get_memory(memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found in Hindsight")
    return mem
