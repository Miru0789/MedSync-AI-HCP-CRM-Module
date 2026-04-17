"""
Pydantic schemas for request / response validation.
"""

from __future__ import annotations
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────────
class InteractionTypeEnum(str, Enum):
    Visit = "Visit"
    Call = "Call"
    Meeting = "Meeting"


class ReminderStatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    overdue = "overdue"


# ── Interaction ───────────────────────────────────────────────────────────────
class InteractionCreate(BaseModel):
    doctor_name: str = Field(..., min_length=1, max_length=255)
    hospital: Optional[str] = None
    interaction_type: InteractionTypeEnum = InteractionTypeEnum.Visit
    notes: Optional[str] = None
    summary: Optional[str] = None
    facility: Optional[str] = None
    hospital: Optional[str] = None
    products_discussed: Optional[str] = None
    sentiment: Optional[str] = "Neutral"
    interaction_date: Optional[datetime] = None
    follow_up_date: Optional[date] = None


class InteractionUpdate(BaseModel):
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    interaction_type: Optional[InteractionTypeEnum] = None
    notes: Optional[str] = None
    summary: Optional[str] = None
    facility: Optional[str] = None
    hospital: Optional[str] = None
    products_discussed: Optional[str] = None
    sentiment: Optional[str] = None
    interaction_date: Optional[datetime] = None
    follow_up_date: Optional[date] = None


class InteractionResponse(BaseModel):
    id: int
    doctor_name: Optional[str]
    facility: Optional[str] = None
    hospital: Optional[str]
    interaction_type: Optional[str]
    notes: Optional[str]
    summary: Optional[str] = None
    products_discussed: Optional[str] = None
    sentiment: Optional[str] = None
    interaction_date: Optional[datetime] = None
    follow_up_date: Optional[date] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Reminder ──────────────────────────────────────────────────────────────────
class ReminderResponse(BaseModel):
    id: int
    interaction_id: int
    reminder_date: Optional[date]
    status: Optional[str]
    created_at: Optional[datetime]
    doctor_name: Optional[str]
    hospital: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    interaction_id: int
    hcp_name: Optional[str]
    follow_up_date: Optional[date]
    message: Optional[str]
    status: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    reply: str
    extracted_data: Optional[dict] = None
    action: Optional[str] = None


# ── Insights ──────────────────────────────────────────────────────────────────
class InsightsResponse(BaseModel):
    total_interactions: int = 0
    interactions_by_type: dict = {}
    top_doctors: List[dict] = []
    top_hospitals: List[dict] = []
    products_frequency: dict = {}
    monthly_trend: List[dict] = []
    upcoming_followups: int = 0
    overdue_followups: int = 0

# ── Profile ───────────────────────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    region: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    region: str
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
