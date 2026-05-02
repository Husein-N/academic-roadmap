from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    country: Optional[str] = None
    academic_status: Optional[str] = None
    language: Optional[str] = None

@router.get("/me")
def get_profile(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "country": user.country,
        "academic_status": user.academic_status,
        "language": user.language,
        "created_at": user.created_at
    }

@router.put("/me")
def update_profile(data: ProfileUpdate, authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    if data.full_name: user.full_name = data.full_name
    if data.country: user.country = data.country
    if data.academic_status: user.academic_status = data.academic_status
    if data.language: user.language = data.language
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "full_name": user.full_name}