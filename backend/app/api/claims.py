from fastapi import APIRouter
from ..core.db import get_pg_pool

router = APIRouter()

from fastapi import APIRouter
from ..core.db import get_pg_pool

router = APIRouter()

@router.get("/sample")
async def sample_claims():
    # Enhanced sample data for demo
    return {
        "claims": [
            {
                "id": "IFR-001",
                "village": "Kanha Village",
                "state": "Madhya Pradesh",
                "holder_name": "Ravi Kumar",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[80.1,23.1],[80.15,23.1],[80.15,23.15],[80.1,23.15],[80.1,23.1]]]
                },
                "status": "approved",
                "area_ha": 2.3
            },
            {
                "id": "IFR-002", 
                "village": "Bandhavgarh Village",
                "state": "Madhya Pradesh",
                "holder_name": "Priya Devi",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[80.2,23.2],[80.25,23.2],[80.25,23.25],[80.2,23.25],[80.2,23.2]]]
                },
                "status": "pending",
                "area_ha": 1.8
            },
            {
                "id": "CFR-001",
                "village": "Pench Community",
                "state": "Madhya Pradesh", 
                "holder_name": "Tribal Community Group",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[79.9,22.9],[80.0,22.9],[80.0,23.0],[79.9,23.0],[79.9,22.9]]]
                },
                "status": "approved",
                "area_ha": 15.7
            },
            {
                "id": "IFR-003",
                "village": "Satpura Village",
                "state": "Madhya Pradesh",
                "holder_name": "Amit Sharma",
                "geometry": {
                    "type": "Polygon", 
                    "coordinates": [[[78.8,22.5],[78.85,22.5],[78.85,22.55],[78.8,22.55],[78.8,22.5]]]
                },
                "status": "rejected",
                "area_ha": 0.9
            }
        ]
    }

@router.get("")
async def list_claims():
    # Return enhanced sample data for demo - in production this would query database
    pool = await get_pg_pool()
    try:
        rows = await pool.fetch("SELECT id, village, state, status, area_ha, ST_AsGeoJSON(geom)::json as geometry FROM claims LIMIT 100")
        claims = [dict(r) for r in rows]
        return {"claims": claims}
    except Exception:
        # Fallback to sample data for demo
        sample_data = await sample_claims()
        return sample_data