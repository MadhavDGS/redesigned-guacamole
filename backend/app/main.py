from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import routes
from .api import ocr, claims, dashboard, rules, auth, assets, tiles
from .core import db

app = FastAPI(title="FRA Atlas API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")
app.include_router(ocr.router, prefix="/api/ocr", tags=["ocr"]) 
app.include_router(claims.router, prefix="/api/claims", tags=["claims"]) 
app.include_router(assets.router, prefix="/api/assets", tags=["assets"]) 
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"]) 
app.include_router(rules.router, prefix="/api/rules", tags=["rules"]) 
app.include_router(auth.router, prefix="/api/auth", tags=["auth"]) 
app.include_router(tiles.router, prefix="/api", tags=["tiles"]) 

@app.get("/")
def root():
    return {"status": "ok", "service": "FRA Atlas API"}

@app.on_event("shutdown")
async def shutdown_event():
    await db.close()