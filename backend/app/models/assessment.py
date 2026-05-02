from sqlalchemy import Column, String, DateTime, JSON, Float
from datetime import datetime
import uuid
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    answers = Column(JSON, nullable=False)
    interest_vector = Column(JSON, nullable=True)
    total_score = Column(Float, nullable=True)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)