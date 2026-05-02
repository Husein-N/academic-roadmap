from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.routers.auth import get_current_user
from app.models.assessment import Assessment

router = APIRouter(prefix="/assessment", tags=["assessment"])

QUESTIONS = [
    {"id": 1, "text": "I enjoy solving complex mathematical problems.", "category": "analytical"},
    {"id": 2, "text": "I like creating art, music, or writing stories.", "category": "creative"},
    {"id": 3, "text": "I enjoy helping and supporting other people.", "category": "social"},
    {"id": 4, "text": "I like building or fixing things with my hands.", "category": "practical"},
    {"id": 5, "text": "I enjoy leading groups and organizing projects.", "category": "leadership"},
    {"id": 6, "text": "I am curious about how the human body and medicine work.", "category": "medical"},
    {"id": 7, "text": "I enjoy working with computers and technology.", "category": "technical"},
    {"id": 8, "text": "I like studying history, languages, or social issues.", "category": "humanities"},
    {"id": 9, "text": "I enjoy doing experiments and scientific research.", "category": "scientific"},
    {"id": 10, "text": "I like managing money, budgets, and business plans.", "category": "business"},
    {"id": 11, "text": "I enjoy designing websites, apps, or visual interfaces.", "category": "technical"},
    {"id": 12, "text": "I like working outdoors and studying nature.", "category": "environmental"},
    {"id": 13, "text": "I enjoy teaching or explaining things to others.", "category": "social"},
    {"id": 14, "text": "I am interested in laws, justice, and political systems.", "category": "humanities"},
    {"id": 15, "text": "I like analyzing data and finding patterns.", "category": "analytical"},
]

class Answer(BaseModel):
    question_id: int
    score: int  # 1-5 Likert scale

class SubmitRequest(BaseModel):
    answers: List[Answer]
    profile_data: Optional[dict] = None

@router.get("/questions")
def get_questions():
    return {"questions": QUESTIONS}

@router.post("/submit")
def submit_assessment(
    data: SubmitRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)

    # Calculate interest vector by category
    category_scores = {}
    category_counts = {}
    for answer in data.answers:
        q = next((q for q in QUESTIONS if q["id"] == answer.question_id), None)
        if q:
            cat = q["category"]
            category_scores[cat] = category_scores.get(cat, 0) + answer.score
            category_counts[cat] = category_counts.get(cat, 0) + 1

    interest_vector = {
        cat: round(category_scores[cat] / category_counts[cat], 2)
        for cat in category_scores
    }
    total_score = sum(a.score for a in data.answers) / len(data.answers)

    # If frontend sends full profile_data, store it in interest_vector
    final_vector = data.profile_data if hasattr(data, 'profile_data') and data.profile_data else interest_vector

    assessment = Assessment(
        user_id=user.id,
        answers=[a.dict() for a in data.answers],
        interest_vector=final_vector,
        total_score=round(total_score, 2),
        status="completed"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "assessment_id": assessment.id,
        "interest_vector": interest_vector,
        "total_score": assessment.total_score,
        "message": "Assessment completed successfully"
    }