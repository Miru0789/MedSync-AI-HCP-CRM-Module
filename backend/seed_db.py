
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from database import SessionLocal, engine
import models
from datetime import date, timedelta

def seed():
    db = SessionLocal()
    # Clear existing data
    db.query(models.Reminder).delete()
    db.query(models.Interaction).delete()
    db.commit()

    # Sample interactions
    interactions = [
        models.Interaction(
            doctor_name="Dr. Elena Gilbert",
            hospital="Clinic Central",
            interaction_type="Visit",
            notes="Discussed HeartCare drug, positive feedback.",
            summary="Positive feedback on HeartCare.",
            products_discussed="HeartCare",
            follow_up_date=date.today() + timedelta(days=2)
        ),
        models.Interaction(
            doctor_name="Dr. Stefan Salvatore",
            hospital="Metropolitan",
            interaction_type="Call",
            notes="Follow up on previous visit.",
            summary="Follow up call.",
            products_discussed="NeuroLink",
            follow_up_date=date.today() - timedelta(days=1)
        ),
        models.Interaction(
            doctor_name="Dr. Bonnie Bennett",
            hospital="Apollo Center",
            interaction_type="Meeting",
            notes="Full clinic presentation.",
            summary="Presentation completed.",
            products_discussed="VaxPro",
            follow_up_date=date.today() + timedelta(days=5)
        )
    ]

    for item in interactions:
        db.add(item)
    db.commit()

    # Add reminders
    for item in interactions:
        if item.follow_up_date:
            reminder = models.Reminder(
                interaction_id=item.id,
                reminder_date=item.follow_up_date,
                status="pending" if item.follow_up_date >= date.today() else "overdue"
            )
            db.add(reminder)
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
