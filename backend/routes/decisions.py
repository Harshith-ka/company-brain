import json
import os
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import DecisionItem
from config import settings

router = APIRouter(prefix="/api/decisions", tags=["Architecture Decision Records"])

def load_decisions() -> List[DecisionItem]:
    if os.path.exists(settings.DATA_PATH):
        with open(settings.DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [DecisionItem(**d) for d in data.get("decisions", [])]
    return []

@router.get("", response_model=List[DecisionItem])
async def get_decisions(technology: Optional[str] = None, status: Optional[str] = None):
    decisions = load_decisions()
    if technology:
        decisions = [d for d in decisions if technology.lower() in d.technology.lower()]
    if status:
        decisions = [d for d in decisions if status.lower() in d.status.lower()]
    return decisions

@router.get("/{decision_id}", response_model=DecisionItem)
async def get_decision_by_id(decision_id: str):
    decisions = load_decisions()
    dec = next((d for d in decisions if d.id.lower() == decision_id.lower()), None)
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    return dec
