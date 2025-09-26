"""
Geospatial Data API
FRA Atlas - AI-powered Forest Rights Act Atlas and Decision Support System
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, Optional, List
import json
import logging

from app.core.config import settings
from app.core.database import get_db, AsyncSession

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/layers/{layer_id}.geojson", response_model=Dict[str, Any])
async def get_layer_geojson(
    layer_id: str,
    bbox: Optional[str] = Query(None, description="Bounding box: minx,miny,maxx,maxy"),
    db: AsyncSession = Depends(get_db)
):
    """Get geospatial layer as GeoJSON"""
    # Mock GeoJSON for now
    mock_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "village": "Dhanpura",
                    "district": "Betul", 
                    "state": "Madhya Pradesh",
                    "fra_claims": 15,
                    "titles_distributed": 12
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.9, 22.4], [77.95, 22.4], [77.95, 22.45], [77.9, 22.45], [77.9, 22.4]]]
                }
            }
        ]
    }
    
    return mock_geojson


@router.get("/villages/{village_id}", response_model=Dict[str, Any])
async def get_village_details(
    village_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed village information"""
    return {
        "village_id": village_id,
        "name": "Dhanpura",
        "district": "Betul",
        "state": "Madhya Pradesh",
        "fra_status": "active",
        "total_claims": 15,
        "approved_claims": 12,
        "rejected_claims": 2,
        "pending_claims": 1
    }