import json
import os
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import IncidentItem
from config import settings

router = APIRouter(prefix="/api/incidents", tags=["Engineering Incidents"])

def load_incidents() -> List[IncidentItem]:
    if os.path.exists(settings.DATA_PATH):
        with open(settings.DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [IncidentItem(**i) for i in data.get("incidents", [])]
    return []

@router.get("", response_model=List[IncidentItem])
async def get_incidents(severity: Optional[str] = None, system: Optional[str] = None):
    incidents = load_incidents()
    if severity:
        incidents = [i for i in incidents if severity.lower() in i.severity.lower()]
    if system:
        incidents = [i for i in incidents if system.lower() in i.system.lower()]
    return incidents

@router.get("/{incident_id}", response_model=IncidentItem)
async def get_incident_by_id(incident_id: str):
    incidents = load_incidents()
    inc = next((i for i in incidents if i.id.lower() == incident_id.lower()), None)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc
