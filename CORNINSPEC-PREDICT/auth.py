import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, APIRouter, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import httpx
from pydantic import BaseModel
from config import settings

import logging

# Logging configuration
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class Token(BaseModel):
    accessToken: str
    refreshToken: str
    token_type: str = "bearer"

class ApiCredentials(BaseModel):
    api_key: str
    api_secret: str

def create_token(data: dict, expires_delta: timedelta, token_type: str) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

async def validate_credentials(api_key: str, api_secret: str) -> bool:
    return api_key == settings.api_key and api_secret == settings.api_secret

@router.post("/login", response_model=Token)
async def login_for_access_token(credentials: ApiCredentials):
    if not await validate_credentials(credentials.api_key, credentials.api_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect API Key or Secret",
            headers={"WWW-Authenticate": "Bearer"}
        )
    accessToken = create_token(
        data={"sub": credentials.api_key},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type="access"
    )
    refreshToken = create_token(
        data={"sub": credentials.api_key},
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        token_type="refresh"
    )
    return {"accessToken": accessToken, "refreshToken": refreshToken, "token_type": "bearer"}
