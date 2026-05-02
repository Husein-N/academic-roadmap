from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
import uuid
from app.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    assessment_id = Column(String, nullable=False)
    content = Column(JSON, nullable=False)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)