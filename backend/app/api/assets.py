from fastapi import APIRouter
from ..core.db import get_pg_pool

router = APIRouter()

@router.get("")
async def list_assets(limit: int = 200):
    pool = await get_pg_pool()
    try:
        rows = await pool.fetch("SELECT id, claim_id, type, properties, ST_AsGeoJSON(geom)::json AS geometry FROM assets LIMIT $1", limit)
        return {"assets": [dict(r) for r in rows]}
    except Exception:
        return {"assets": []}