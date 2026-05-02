from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.routers.auth import get_current_user
from app.models.assessment import Assessment
from app.models.roadmap import Roadmap
import google.generativeai as genai
import os

router = APIRouter(prefix="/chat", tags=["chat"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []

@router.post("/message")
def send_message(
    data: ChatRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)

    status = user.academic_status or "Unknown"

    # ─── Fetch latest assessment ───
    assessment = db.query(Assessment).filter(
        Assessment.user_id == user.id
    ).order_by(Assessment.created_at.desc()).first()

    # ─── Fetch latest roadmap ───
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id
    ).order_by(Roadmap.created_at.desc()).first()

    # ─── Build assessment context ───
    assessment_context = "The student has not completed an assessment yet."
    if assessment and assessment.interest_vector:
        profile = assessment.interest_vector
        if isinstance(profile, dict) and "top_interests" in profile:
            assessment_context = f"""
The student completed an interest and aptitude assessment with these results:
- Top Interest Areas: {', '.join(profile.get('top_interests', []))}
- Strongest Aptitudes: {', '.join(profile.get('top_aptitudes', []))}
- Core Values: {', '.join(profile.get('top_values', []))}
- Personality Style: {profile.get('personality_style', 'Not specified')}
- Best Matching Fields: {', '.join(profile.get('best_fields', []))}
- What they lose track of time doing: {profile.get('open_q1', 'Not provided')}
- Problem they want to solve: {profile.get('open_q2', 'Not provided')}
"""
        else:
            interest_summary = ", ".join([f"{k}: {v}" for k, v in list(profile.items())[:5]])
            assessment_context = f"The student completed an assessment. Interest scores: {interest_summary}"

    # ─── Build roadmap context ───
    roadmap_context = "The student has not generated a roadmap yet."
    if roadmap and roadmap.content:
        content = roadmap.content
        roadmap_context = f"""
The student already has a personalized roadmap:
- Recommended Major/Direction: {content.get('recommended_major', 'Not specified')}
- Why this was recommended: {content.get('why_this_major', 'Not specified')}
- Career Paths suggested: {', '.join(content.get('career_paths', []))}
- Key Skills to develop: {', '.join(content.get('key_skills_to_develop', []))}
- Recommended Universities:
{chr(10).join([f"  • {u.get('name')} ({u.get('country')}) — {u.get('program')}" for u in content.get('universities', [])])}
"""

    # ─── Status guidance ───
    if any(g in status for g in ["Grade 7", "Grade 8", "Grade 9"]):
        status_guidance = """This is a middle school student (age 12-15).
Give fun, age-appropriate advice. Focus on exploring interests,
school subjects to enjoy, and activities that match what they like.
Do NOT overwhelm them with university details."""
    elif any(g in status for g in ["Grade 10", "Grade 11"]):
        status_guidance = """This is a high school student (age 15-17) with 1-2 years before university.
Give clear direction about fields that suit them, entrance exam preparation
(UNT in Kazakhstan, DTM in Uzbekistan, SET in Tajikistan), and what to focus on now."""
    else:
        status_guidance = """This student is in Grade 12 or actively applying to university.
Give very concrete advice: specific majors, universities, deadlines, documents, scholarships."""

    system_prompt = f"""You are a personal AI academic advisor for a specific student in Central Asia.
You have full access to their assessment results and roadmap — use this to give deeply personalized advice.

═══ STUDENT PROFILE ═══
Name: {user.full_name}
Country: {user.country}
Academic Status: {status}
Preferred Language: {user.language}

═══ ASSESSMENT RESULTS ═══
{assessment_context}

═══ GENERATED ROADMAP ═══
{roadmap_context}

═══ HOW TO ADVISE THIS STUDENT ═══
{status_guidance}

Your behavior:
- Always refer to their specific assessment results and roadmap when relevant
- If they ask "what should I study?" — use their roadmap recommendation, not a generic answer
- If they ask about their interests — refer to their actual assessment scores
- If they haven't done assessment yet — encourage them to take it first
- Be personal, use their name occasionally
- Keep answers concise (3-5 sentences) unless they ask for more detail
- Respond in the same language the student writes in
- Only answer questions related to education, careers, and academic planning
- NEVER start your response with "Hi", "Hello", or any greeting — just answer directly
- Do not use the student's name at the beginning of responses"""

    history_text = ""
    for msg in data.history[-8:]:
        role = "Student" if msg.role == "user" else "Advisor"
        history_text += f"{role}: {msg.content}\n"

    full_prompt = f"{system_prompt}\n\nConversation:\n{history_text}\nStudent: {data.message}\nAdvisor:"

    try:
        response = model.generate_content(full_prompt)
        reply = response.text.strip()
    except Exception as e:
        reply = "I'm having trouble connecting right now. Please try again in a moment."

    return {"reply": reply}