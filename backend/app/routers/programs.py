from fastapi import APIRouter, Query
from typing import Optional
from app.university_db import get_connection

router = APIRouter(prefix="/programs", tags=["programs"])

def get_all_programs(country: Optional[str] = None, search: Optional[str] = None, tags: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT
            p.id,
            u.name AS university,
            u.full_name,
            u.country,
            u.city,
            u.website,
            p.name AS program,
            p.degree,
            p.duration_years,
            p.language,
            p.tuition_usd,
            p.grant_available,
            p.entrance_exam,
            p.min_score,
            p.difficulty,
            GROUP_CONCAT(DISTINCT pt.tag) AS tags,
            GROUP_CONCAT(DISTINCT pc.career_title) AS careers,
            GROUP_CONCAT(DISTINCT ps.subject_name) AS subjects
        FROM programs p
        JOIN universities u ON p.university_id = u.id
        LEFT JOIN program_tags pt ON p.id = pt.program_id
        LEFT JOIN program_careers pc ON p.id = pc.program_id
        LEFT JOIN program_subjects ps ON p.id = ps.program_id
        WHERE p.verified = 1
    """
    params = []

    if country:
        query += " AND u.country = ?"
        params.append(country)

    if search:
        query += " AND (p.name LIKE ? OR u.name LIKE ? OR u.full_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    if tags:
        tag_list = tags.split(",")
        placeholders = ",".join(["?" for _ in tag_list])
        query += f" AND p.id IN (SELECT DISTINCT program_id FROM program_tags WHERE tag IN ({placeholders}))"
        params.extend(tag_list)

    query += " GROUP BY p.id ORDER BY u.id, p.id"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return [dict(row) for row in rows]


@router.get("/")
def get_programs(
    country: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    tags: Optional[str] = Query(None)
):
    programs = get_all_programs(country, search, tags)
    return {"programs": programs}


@router.get("/universities")
def get_universities():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM universities WHERE verified=1 ORDER BY country")
    rows = cur.fetchall()
    conn.close()
    return {"universities": [dict(row) for row in rows]}


@router.get("/compare")
def compare_programs(ids: str):
    id_list = [int(i) for i in ids.split(",") if i.strip()]
    if len(id_list) > 3:
        return {"error": "Maximum 3 programs can be compared"}

    conn = get_connection()
    cur = conn.cursor()
    placeholders = ",".join(["?" for _ in id_list])
    cur.execute(f"""
        SELECT
            p.id,
            u.name AS university,
            u.full_name,
            u.country,
            u.city,
            p.name AS program,
            p.degree,
            p.duration_years,
            p.language,
            p.tuition_usd,
            p.grant_available,
            p.entrance_exam,
            p.difficulty,
            GROUP_CONCAT(DISTINCT pc.career_title) AS careers,
            GROUP_CONCAT(DISTINCT ps.subject_name) AS subjects
        FROM programs p
        JOIN universities u ON p.university_id = u.id
        LEFT JOIN program_careers pc ON p.id = pc.program_id
        LEFT JOIN program_subjects ps ON p.id = ps.program_id
        WHERE p.id IN ({placeholders})
        GROUP BY p.id
    """, id_list)
    rows = cur.fetchall()
    conn.close()
    return {"programs": [dict(row) for row in rows]}