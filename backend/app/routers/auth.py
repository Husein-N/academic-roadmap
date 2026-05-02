from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
import hashlib
import hmac
import os
import jwt
import bcrypt

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# ─── Schemas ───
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    country: str
    academic_status: str
    language: str = "en"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    full_name: str
    email: str

# ─── Helpers ───
def hash_password(password: str) -> str:
    # SHA256 first to avoid bcrypt 72-byte limit
    password_bytes = password.encode("utf-8")
    sha256_hash = hashlib.sha256(password_bytes).hexdigest().encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(sha256_hash, salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    password_bytes = plain.encode("utf-8")
    sha256_hash = hashlib.sha256(password_bytes).hexdigest().encode("utf-8")
    return bcrypt.checkpw(sha256_hash, hashed.encode("utf-8"))

def create_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Routes ───
@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        country=data.country,
        academic_status=data.academic_status,
        language=data.language
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    
    )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )