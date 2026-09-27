from fastapi import APIRouter
from pydantic import BaseModel
from services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/demo", tags=["Demo Controller"])

class DemoStageRequest(BaseModel):
    stage: int  # 1: Cold Start, 2: Intro only, 3: Full Memory

@router.post("/set-stage")
async def set_demo_stage(req: DemoStageRequest):
    hindsight_service.set_demo_stage(req.stage)
    stage_names = {
        1: "Stage 1: Cold Start (Agent has no organizational knowledge of Redis)",
        2: "Stage 2: Early Adoption (Redis introduced for caching in ADR-002)",
        3: "Stage 3: Full Institutional Memory (Postmortems INC-101, ADR-006, ADR-020 fully learned)"
    }
    return {
        "stage": req.stage,
        "description": stage_names.get(req.stage, "Custom Stage"),
        "active_memory_count": len(hindsight_service.get_all_memories())
    }

@router.post("/reset")
async def reset_demo():
    hindsight_service.set_demo_stage(3)
    hindsight_service.seed_from_dataset()
    return {
        "status": "reset_complete",
        "active_memory_count": len(hindsight_service.get_all_memories())
    }

@router.get("/status")
async def get_demo_status():
    return {
        "current_stage": hindsight_service.demo_stage,
        "total_available_memories": len(hindsight_service.memories),
        "active_memories": len(hindsight_service.get_all_memories())
    }
