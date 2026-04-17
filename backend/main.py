"""
FastAPI application entry point.
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import crud
import database
import ai_agent
import config

# Create tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title=config.APP_TITLE, version=config.APP_VERSION)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MedSync AI HCP CRM API", "status": "online"}

# ── AI Chat Interface ────────────────────────────────────────────────────────

@app.post("/chat", response_model=schemas.ChatResponse)
async def chat_interaction(request: schemas.ChatRequest):
    """Process natural language input via LangGraph agent."""
    try:
        result = await ai_agent.process_chat(request.message)
        return schemas.ChatResponse(
            reply=result["reply"],
            extracted_data=result["extracted_data"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Interaction Endpoints ───────────────────────────────────────────────────

@app.post("/interactions", response_model=schemas.InteractionResponse)
def log_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(database.get_db)):
    """Log a new interaction with an HCP."""
    return crud.create_interaction(db, interaction)

@app.get("/interactions", response_model=List[schemas.InteractionResponse])
def get_interactions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Fetch all interactions."""
    interactions = crud.get_interactions(db, skip, limit)
    return interactions

@app.get("/interactions/{interaction_id}", response_model=schemas.InteractionResponse)
def get_single_interaction(interaction_id: int, db: Session = Depends(database.get_db)):
    """Fetch single interaction."""
    db_interaction = crud.get_interaction(db, interaction_id)
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.put("/edit/{interaction_id}", response_model=schemas.InteractionResponse)
def edit_interaction(interaction_id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(database.get_db)):
    """Edit an existing interaction."""
    db_interaction = crud.update_interaction(db, interaction_id, interaction)
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.delete("/interactions/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(database.get_db)):
    """Delete an existing interaction."""
    result = crud.delete_interaction(db, interaction_id)
    if not result:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return result

# ── Reminder Endpoints ──────────────────────────────────────────────────────

@app.get("/reminders", response_model=List[schemas.ReminderResponse])
def get_reminders(db: Session = Depends(database.get_db)):
    """Fetch all follow-up reminders."""
    return crud.get_reminders(db)

# ── Insights Endpoints ──────────────────────────────────────────────────────

@app.get("/insights")
def get_insights(db: Session = Depends(database.get_db)):
    """Generate interactions analytics/insights."""
    return crud.get_insights(db)

# ── Profile Endpoints ───────────────────────────────────────────────────────

@app.get("/profile", response_model=schemas.ProfileResponse)
def get_profile(db: Session = Depends(database.get_db)):
    """Fetch rep profile."""
    return crud.get_profile(db)

@app.put("/profile", response_model=schemas.ProfileResponse)
def update_profile(profile_data: schemas.ProfileUpdate, db: Session = Depends(database.get_db)):
    """Update rep profile."""
    return crud.update_profile(db, profile_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
