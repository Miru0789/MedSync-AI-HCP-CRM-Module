"""
CRUD operations for Interaction and Reminder models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
import models
import schemas


def create_interaction(db: Session, interaction: schemas.InteractionCreate):
    db_interaction = models.Interaction(
        doctor_name=interaction.doctor_name,
        facility=interaction.facility,
        hospital=interaction.hospital or interaction.facility,
        interaction_date=interaction.interaction_date or datetime.utcnow(),
        interaction_type=interaction.interaction_type,
        notes=interaction.notes,
        summary=interaction.summary,
        products_discussed=interaction.products_discussed,
        sentiment=interaction.sentiment,
        follow_up_date=interaction.follow_up_date
    )
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)

    # If follow-up date is provided, Create a reminder
    if interaction.follow_up_date:
        create_reminder(db, db_interaction.id, interaction.follow_up_date)

    return db_interaction


def get_interactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Interaction).order_by(models.Interaction.created_at.desc()).offset(skip).limit(limit).all()


def get_interaction(db: Session, interaction_id: int):
    return db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()


def update_interaction(db: Session, interaction_id: int, interaction_update: schemas.InteractionUpdate):
    db_interaction = get_interaction(db, interaction_id)
    if not db_interaction:
        return None

    update_data = interaction_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)

    # Update, Create or Delete reminder based on follow_up_date
    if "follow_up_date" in update_data:
        db_reminder = db.query(models.Reminder).filter(models.Reminder.interaction_id == interaction_id).first()
        if update_data["follow_up_date"]:
            if db_reminder:
                db_reminder.reminder_date = update_data["follow_up_date"]
            else:
                create_reminder(db, interaction_id, update_data["follow_up_date"])
        else:
            # If follow_up_date was cleared, delete the reminder
            if db_reminder:
                db.delete(db_reminder)

    db.commit()
    db.refresh(db_interaction)
    return db_interaction


def delete_interaction(db: Session, interaction_id: int):
    db_interaction = get_interaction(db, interaction_id)
    if not db_interaction:
        return None
    # Delete associated reminders first
    db.query(models.Reminder).filter(models.Reminder.interaction_id == interaction_id).delete()
    db.delete(db_interaction)
    db.commit()
    return {"deleted": True, "id": interaction_id}


def create_reminder(db: Session, interaction_id: int, reminder_date: date):
    db_reminder = models.Reminder(
        interaction_id=interaction_id,
        reminder_date=reminder_date,
        status="pending"
    )
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder


def get_reminders(db: Session):
    # Auto-update status to overdue if past date
    today = date.today()
    db.query(models.Reminder).filter(
        models.Reminder.reminder_date < today,
        models.Reminder.status == "pending"
    ).update({"status": "overdue"})
    db.commit()

    return db.query(models.Reminder).all()

def get_notifications(db: Session):
    today = date.today()
    db.query(models.Reminder).filter(
        models.Reminder.reminder_date < today,
        models.Reminder.status == "pending"
    ).update({"status": "overdue"})
    db.commit()

    reminders = db.query(models.Reminder).all()
    notifications = []
    for r in reminders:
        notifications.append({
            "id": r.id,
            "interaction_id": r.interaction_id,
            "hcp_name": r.interaction.doctor_name if r.interaction else None,
            "follow_up_date": r.reminder_date,
            "message": r.interaction.notes if r.interaction else None,
            "status": r.status,
            "created_at": r.created_at
        })
    return notifications

def get_insights(db: Session):
    total = db.query(func.count(models.Interaction.id)).scalar()

    # Interactions by type
    by_type = db.query(models.Interaction.interaction_type, func.count(models.Interaction.id)).group_by(models.Interaction.interaction_type).all()
    
    # Handle both Enum objects and strings (SQLite)
    type_counts = {}
    for t, count in by_type:
        label = t.value if hasattr(t, "value") else str(t)
        type_counts[label] = count

    # Top Doctors
    top_docs = db.query(models.Interaction.doctor_name, func.count(models.Interaction.id).label("count")).group_by(models.Interaction.doctor_name).order_by(func.count(models.Interaction.id).desc()).limit(5).all()
    docs = [{"name": r[0], "count": r[1]} for r in top_docs]

    # Reminders
    upcoming = db.query(func.count(models.Reminder.id)).filter(models.Reminder.status == "pending").scalar() or 0
    overdue = db.query(func.count(models.Reminder.id)).filter(models.Reminder.status == "overdue").scalar() or 0

    return {
        "total_interactions": total or 0,
        "interactions_by_type": type_counts,
        "top_doctors": docs,
        "top_hospitals": [],
        "products_frequency": {},
        "monthly_trend": [],
        "upcoming_followups": upcoming,
        "overdue_followups": overdue
    }

def get_profile(db: Session):
    profile = db.query(models.UserProfile).first()
    if not profile:
        profile = models.UserProfile(
            name="Alexander Rep",
            email="alexander.rep@medsync.ai",
            role="Territory Lead",
            region="Alpha"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

def update_profile(db: Session, update_data: schemas.ProfileUpdate):
    profile = get_profile(db)
    if update_data.name is not None:
        profile.name = update_data.name
    if update_data.email is not None:
        profile.email = update_data.email
    if update_data.region is not None:
        profile.region = update_data.region
    db.commit()
    db.refresh(profile)
    return profile
