from fastapi import APIRouter, HTTPException
from models import SimulationRequest, SimulationResponse
from services.simulator_service import simulator_service

router = APIRouter(prefix="/api/simulate-change", tags=["simulator"])

@router.post("", response_model=SimulationResponse)
async def simulate_architectural_change(request: SimulationRequest):
    try:
        response = await simulator_service.simulate_change(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
