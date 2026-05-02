from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, profile, assessment, roadmap, programs, chat
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Academic Roadmap API",
    description="AI-Powered Academic Roadmap Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(assessment.router)
app.include_router(roadmap.router)
app.include_router(programs.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "Academic Roadmap API is running!"}