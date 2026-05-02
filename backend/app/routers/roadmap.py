from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.routers.auth import get_current_user
from app.models.roadmap import Roadmap
from app.models.assessment import Assessment
from app.university_db import get_all_programs_for_prompt, get_programs_by_tags
import google.generativeai as genai
import os
import json
router = APIRouter(prefix="/roadmap", tags=["roadmap"])

# ─── Configure Gemini ───
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def build_prompt(profile_data: dict, user: object) -> str:
    status = user.academic_status or "Unknown"

    # Get verified university database
    university_database = get_all_programs_for_prompt()

    # Get matching programs based on student interests
    top_interests = profile_data.get('top_interests', [])
    matching_programs = get_programs_by_tags(top_interests)
    
    matching_text = ""
    if matching_programs:
        matching_text = "\nPROGRAMS THAT MATCH THIS STUDENT'S INTERESTS:\n"
        matching_text += "-" * 40 + "\n"
        for p in matching_programs[:10]:
            grant = "Grant available" if p['grant_available'] else "No grant"
            matching_text += f"• {p['program']} at {p['full_name']} ({p['country']})\n"
            matching_text += f"  ${p['tuition_usd']:,}/year | {grant} | Difficulty: {p['difficulty']}/5\n"
            matching_text += f"  Careers: {p['careers']}\n\n"

    if status in ["Grade 7", "Grade 8", "Grade 9"]:
        recommendation_focus = """
This is a middle school student (age ~12-15).
DO NOT recommend specific universities or programs yet — they are too young.
Instead:
- Identify 2-3 broad fields that match their interests
- Suggest school subjects to focus on
- Recommend extracurricular activities
- Show them what professionals in matching fields actually do
- Keep it fun, inspiring, and age-appropriate
For the universities section — use the database to show inspiring examples
of what they COULD study in the future, framed as "future possibilities".
"""
    elif status in ["Grade 10", "Grade 11"]:
        recommendation_focus = """
This is a high school student (age ~15-17) with 1-2 years before university.
Give clear, actionable direction:
- Recommend 2-3 specific programs from the database that match their profile
- Explain what entrance exams to prepare for
- Tell them which school subjects to prioritize
- Describe what studying each field is really like day-to-day
IMPORTANT: Only recommend programs that exist in the verified database above.
"""
    else:
        recommendation_focus = """
This student is in Grade 12 or actively applying to university RIGHT NOW.
Be very specific and urgent:
- Recommend the single best matching program from the database
- Give exact tuition, grant availability, and entrance exam requirements
- Provide step-by-step application timeline
- Mention scholarship opportunities
IMPORTANT: Only recommend programs that exist in the verified database above.
Do NOT invent programs or universities not in the database.
"""

    return f"""
You are an expert academic career counselor for school students in Central Asia.
You have access to a verified database of real university programs.

STUDENT PROFILE:
- Name: {user.full_name}
- Country: {user.country}
- Academic Status: {status}
- Preferred Language: {user.language}
- Top Interests: {', '.join(profile_data.get('top_interests', []))}
- Strongest Aptitudes: {', '.join(profile_data.get('top_aptitudes', []))}
- Core Values: {', '.join(profile_data.get('top_values', []))}
- Personality Style: {profile_data.get('personality_style', '')}
- Best Matching Fields: {', '.join(profile_data.get('best_fields', []))}
- What they lose track of time doing: {profile_data.get('open_q1', 'Not provided')}
- Problem they want to solve: {profile_data.get('open_q2', 'Not provided')}

{university_database}

{matching_text}

INSTRUCTIONS BASED ON ACADEMIC STATUS:
{recommendation_focus}

CRITICAL RULES:
- ONLY recommend universities and programs from the verified database above
- Use exact program names, tuition amounts, and entrance exams from the database
- Never invent or hallucinate university programs
- Match programs to the student's interest tags from the database
- NATIONALITY RULE: The first university must be in the student's own country ({user.country}) if a suitable program exists there. If no suitable program exists in their country in the database, pick the closest regional option and explain why
- The second and third universities must be in DIFFERENT countries from the student's country
- ALWAYS include the city name for each university so the student knows exactly where it is
- If the student is from Kyrgyzstan, ALWAYS use AUCA (Bishkek, Kyrgyzstan) as the first local university option
- If the student is from Kazakhstan, prioritize NU or KBTU as the local option
- If the student is from Uzbekistan, prioritize NewUU or Westminster as the local option
Respond ONLY with a valid JSON object, no extra text:

{{
  "recommended_major": "Exact program name from the database (or broad field for Grade 7-9)",
  "why_this_major": "2-3 sentences explaining why this fits them based on their assessment results",
  "top_interests": {json.dumps(profile_data.get('top_interests', []))},
  "personality_style": "{profile_data.get('personality_style', '')}",
  "steps": [
    {{
      "step": 1,
      "title": "Step title appropriate for their grade",
      "description": "Specific actionable advice for this student"
    }},
    {{
      "step": 2,
      "title": "Step title",
      "description": "Specific actionable advice"
    }},
    {{
      "step": 3,
      "title": "Step title",
      "description": "Specific actionable advice"
    }},
    {{
      "step": 4,
      "title": "Step title",
      "description": "Specific actionable advice"
    }},
    {{
      "step": 5,
      "title": "Step title",
      "description": "Specific actionable advice"
    }}
  ],
  "universities": [
    {{
      "name": "University short name — MUST be from the student's own country if a suitable program exists there",
      "full_name": "Full university name from database",
      "country": "Must match student's country: {user.country}",
      "city": "City where university is located",
      "program": "Exact program name from database",
      "tuition": "$X,XXX/year",
      "grant_available": true or false,
      "entrance_exam": "Exact entrance exam from database",
      "location_type": "local",
      "why_recommended": "One sentence explaining why this local option fits them"
    }},
    {{
      "name": "University in a different country than the student",
      "full_name": "Full university name from database",
      "country": "Different country from student's country",
      "city": "City where university is located",
      "program": "Exact program name from database that matches their interests",
      "tuition": "$X,XXX/year",
      "grant_available": true or false,
      "entrance_exam": "Entrance exam",
      "location_type": "abroad",
      "why_recommended": "One sentence on why studying abroad here is valuable for them"
    }},
    {{
      "name": "Another university in a different country",
      "full_name": "Full university name from database",
      "country": "Another country different from student",
      "city": "City where university is located",
      "program": "Exact program name from database",
      "tuition": "$X,XXX/year",
      "grant_available": true or false,
      "entrance_exam": "Entrance exam",
      "location_type": "abroad",
      "why_recommended": "One sentence on the unique benefit of this option"
    }}
  ],
  "key_skills_to_develop": ["skill1", "skill2", "skill3", "skill4"],
  "career_paths": ["Career 1", "Career 2", "Career 3"],
  "motivational_message": "Short personal encouraging message for this student"
}}
"""

class GenerateRequest(BaseModel):
    assessment_id: str
    language: str = "en"
    profile_data: Optional[dict] = None

@router.post("/generate")
def generate_roadmap(
    data: GenerateRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)

    assessment = db.query(Assessment).filter(
        Assessment.id == data.assessment_id,
        Assessment.user_id == user.id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    profile_data = data.profile_data or assessment.interest_vector or {}

    try:
        prompt = build_prompt(profile_data, user)
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Clean response in case Gemini wraps in markdown
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        content = json.loads(raw)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Check if roadmap already exists for this assessment
    existing = db.query(Roadmap).filter(
        Roadmap.assessment_id == assessment.id,
        Roadmap.user_id == user.id
    ).first()

    if existing:
        return {
            "roadmap_id": existing.id,
            "content": existing.content,
            "cached": True
        }

    roadmap = Roadmap(
        user_id=user.id,
        assessment_id=assessment.id,
        content=content,
        language=data.language
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return {
        "roadmap_id": roadmap.id,
        "content": content,
        "cached": False
    }

@router.get("/my")
def get_my_roadmaps(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user.id).all()
    return {
        "roadmaps": [
            {"id": r.id, "created_at": r.created_at, "content": r.content}
            for r in roadmaps
        ]
    }
@router.get("/by-assessment/{assessment_id}")
def get_roadmap_by_assessment(
    assessment_id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)

    roadmap = db.query(Roadmap).filter(
        Roadmap.assessment_id == assessment_id,
        Roadmap.user_id == user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found for this assessment")

    return {"roadmap_id": roadmap.id, "content": roadmap.content}
