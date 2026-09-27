from fastapi import APIRouter
from typing import List
from models import TimelineItem
from services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/timeline", tags=["Organizational Timeline"])

@router.get("", response_model=List[TimelineItem])
async def get_timeline():
    memories = hindsight_service.get_all_memories()
    
    # Sort by date ascending
    sorted_mems = sorted(memories, key=lambda x: x.date)
    timeline_items = []
    
    for m in sorted_mems:
        category = "Decision" if m.type == "architecture_decision" else ("Incident" if m.type == "engineering_incident" else "Engineering")
        item = TimelineItem(
            id=m.id,
            date=m.date,
            title=m.title,
            category=category,
            type=m.type,
            summary=m.summary or m.event or m.title,
            lesson=m.lesson,
            related_ids=[m.source_id] if m.source_id else []
        )
        timeline_items.append(item)
        
    return timeline_items
