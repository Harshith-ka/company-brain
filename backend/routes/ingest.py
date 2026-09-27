from fastapi import APIRouter, HTTPException
from models import IngestDocRequest, IngestResponse
from services.ingestion_pipeline import ingestion_pipeline

router = APIRouter(prefix="/api/memory", tags=["Ingestion"])

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(request: IngestDocRequest):
    res = await ingestion_pipeline.ingest_document(request)
    if not res.success:
        raise HTTPException(status_code=400, detail=res.message)
    return res
