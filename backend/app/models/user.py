from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.sqlite import TEXT
from datetime import datetime
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    country = Column(String, nullable=True)
    academic_status = Column(String, nullable=True)
    language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)