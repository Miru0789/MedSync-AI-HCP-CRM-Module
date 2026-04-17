"""
SQLAlchemy ORM models for the HCP CRM database.
"""

from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, Enum, ForeignKey
)
from sqlalchemy.orm import relationship

from database import Base


class Interaction(Base):
    """Records an interaction between a field rep and a doctor."""

    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_name = Column(String(255), nullable=False, index=True)
    facility = Column(String(255), nullable=True)
    hospital = Column(String(255), nullable=True)
    interaction_date = Column(DateTime, default=datetime.utcnow)
    interaction_type = Column(
        Enum("Visit", "Call", "Meeting", name="interaction_type_enum"),
        default="Visit",
    )
    notes = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    products_discussed = Column(String(500), nullable=True)
    sentiment = Column(String(50), nullable=True, default="Neutral")
    follow_up_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reminders = relationship(
        "Reminder", back_populates="interaction", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_name": self.doctor_name,
            "facility": self.facility,
            "hospital": self.hospital,
            "interaction_date": str(self.interaction_date) if self.interaction_date else None,
            "interaction_type": self.interaction_type,
            "notes": self.notes,
            "summary": self.summary,
            "products_discussed": self.products_discussed,
            "sentiment": self.sentiment,
            "follow_up_date": str(self.follow_up_date) if self.follow_up_date else None,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }


class Reminder(Base):
    """Follow-up reminders linked to interactions."""

    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interaction_id = Column(
        Integer, ForeignKey("interactions.id", ondelete="CASCADE"), nullable=False
    )
    reminder_date = Column(Date, nullable=False)
    status = Column(
        Enum("pending", "completed", "overdue", name="reminder_status_enum"),
        default="pending",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interaction = relationship("Interaction", back_populates="reminders")

    @property
    def doctor_name(self):
        return self.interaction.doctor_name if self.interaction else None

    @property
    def hospital(self):
        return self.interaction.hospital if self.interaction else None

    @property
    def notes(self):
        return self.interaction.notes if self.interaction else None

    def to_dict(self):
        return {
            "id": self.id,
            "interaction_id": self.interaction_id,
            "reminder_date": str(self.reminder_date) if self.reminder_date else None,
            "status": self.status,
            "created_at": str(self.created_at) if self.created_at else None,
            "doctor_name": self.interaction.doctor_name if self.interaction else None,
            "hospital": self.interaction.hospital if self.interaction else None,
        }

class UserProfile(Base):
    """User profile for the rep settings."""

    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False, default="Territory Representative")
    region = Column(String(255), nullable=False, default="Alpha")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "region": self.region,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }
