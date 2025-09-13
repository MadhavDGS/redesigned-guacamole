from fastapi import APIRouter, UploadFile, File
from typing import Dict
from ..core.db import get_mongo
from ..services.ocr_service import run_ocr
import motor.motor_asyncio

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict:
    """Accepts a scanned document image/PDF, saves to Mongo GridFS, runs OCR (stub/Paddle)."""
    mongo = await get_mongo()
    db = mongo.fra

    # Use Motor's GridFS for async operations
    fs = motor.motor_asyncio.AsyncIOMotorGridFS(db)
    content = await file.read()
    file_id = await fs.put(content, filename=file.filename, content_type=file.content_type)

    ocr_result = run_ocr(content)

    # Basic example extraction stub
    extracted = {
        "village": "Sample Village",
        "state": "Madhya Pradesh",
        "claim_type": "IFR",
        "holder": "Sample Name",
    }

    return {
        "file_id": str(file_id),
        "filename": file.filename,
        "ocr": ocr_result,
        "extracted": extracted,
    }