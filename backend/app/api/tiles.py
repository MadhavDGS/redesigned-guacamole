from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import math

router = APIRouter()

# Simple XYZ tile endpoint returning a transparent PNG (placeholder)
@router.get("/tiles/{z}/{x}/{y}.png")
async def get_tile(z: int, x: int, y: int):
    try:
        # For demo: return a 256x256 transparent PNG
        from PIL import Image
        import io
        img = Image.new('RGBA', (256,256), (0,0,0,0))
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return Response(content=buf.getvalue(), media_type='image/png')
    except Exception:
        raise HTTPException(status_code=500, detail="Tile generation failed")