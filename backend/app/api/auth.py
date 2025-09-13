from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..core.config import settings

router = APIRouter()
security = HTTPBearer()

# Very simple token-based role auth for demo purposes
USERS = {
    "admin-token": {"role": "admin"},
    "officer-token": {"role": "officer"},
    "community-token": {"role": "community"},
}

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    user = USERS.get(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user

@router.get("/me")
async def me(user = Depends(get_current_user)):
    return user