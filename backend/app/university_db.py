import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "university.db")
print(f"Looking for university.db at: {DB_PATH}")
print(f"File exists: {os.path.exists(DB_PATH)}")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_programs_for_prompt() -> str:
    """Returns a formatted string of all verified programs for injection into AI prompt."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            u.name AS university,
            u.full_name,
            u.country,
            u.city,
            u.website,
            u.type,
            p.id AS program_id,
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
        WHERE p.verified = 1 AND u.verified = 1
        GROUP BY p.id
        ORDER BY u.id, p.id
    """)

    rows = cur.fetchall()
    conn.close()

    if not rows:
        return "No verified programs available."

    result = "VERIFIED UNIVERSITY PROGRAMS DATABASE:\n"
    result += "=" * 60 + "\n"

    current_uni = None
    for row in rows:
        if row["university"] != current_uni:
            current_uni = row["university"]
            result += f"\n🏛️ {row['full_name']} ({row['university']}) — {row['country']}, {row['city']}\n"
            result += f"   Website: {row['website']} | Type: {row['type']}\n"
            result += "-" * 50 + "\n"

        grant = "✅ Grant available" if row["grant_available"] else "❌ No grant"
        result += f"\n  📚 {row['program']} ({row['degree']}, {row['duration_years']} years)\n"
        result += f"     💰 Tuition: ${row['tuition_usd']:,}/year | {grant}\n"
        result += f"     🌐 Language: {row['language']} | Difficulty: {row['difficulty']}/5\n"
        result += f"     📝 Entrance: {row['entrance_exam'] or 'Not specified'}"
        if row['min_score']:
            result += f" (Min: {row['min_score']})"
        result += "\n"
        if row['subjects']:
            result += f"     📖 Subjects: {row['subjects']}\n"
        if row['careers']:
            result += f"     💼 Careers: {row['careers']}\n"
        if row['tags']:
            result += f"     🏷️ Interest tags: {row['tags']}\n"

    return result


def get_programs_by_tags(tags: list) -> list:
    """Returns programs matching given interest tags."""
    if not tags:
        return []

    conn = get_connection()
    cur = conn.cursor()

    placeholders = ','.join(['?' for _ in tags])
    cur.execute(f"""
        SELECT
            u.name AS university,
            u.full_name,
            u.country,
            u.city,
            u.website,
            p.id,
            p.name AS program,
            p.tuition_usd,
            p.grant_available,
            p.entrance_exam,
            p.difficulty,
            GROUP_CONCAT(DISTINCT pt.tag) AS tags,
            GROUP_CONCAT(DISTINCT pc.career_title) AS careers
        FROM programs p
        JOIN universities u ON p.university_id = u.id
        LEFT JOIN program_tags pt ON p.id = pt.program_id
        LEFT JOIN program_careers pc ON p.id = pc.program_id
        WHERE p.id IN (
            SELECT DISTINCT program_id FROM program_tags
            WHERE tag IN ({placeholders})
        )
        AND p.verified = 1
        GROUP BY p.id
        ORDER BY u.id
    """, tags)

    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_universities_summary() -> list:
    """Returns list of all universities."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM universities WHERE verified=1")
    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]