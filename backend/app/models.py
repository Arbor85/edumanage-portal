from __future__ import annotations

from datetime import date, datetime
import uuid

from sqlalchemy import Column, Date, DateTime, Float, Integer, JSON, String

from .db import Base


class WorkoutHistory(Base):
    __tablename__ = "workout_history"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    workout_date = Column(Date, nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False)
    volume_kg = Column(Float, nullable=False)
    sets = Column(Integer, nullable=False)
    workout_sets = Column(JSON, nullable=False)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(String(255), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    template_id = Column(String(100), nullable=False)
    template_name = Column(String(200), nullable=False)
    days_of_week = Column(String(200), nullable=False)
    exercises_by_day = Column(String(4000), nullable=False)
    mentee_id = Column(String(36), nullable=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Mentee(Base):
    __tablename__ = "mentees"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(String(255), nullable=True, index=True)
    user_id = Column(String(255), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    email_address = Column(String(255), nullable=True, unique=False, index=True)  # Now optional
    invite_key = Column(String(36), nullable=False, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    status = Column(String(50), nullable=False, default="Active", index=True)  # Default to Active
    type = Column(String(50), nullable=False, default="InPerson", index=True)  # New: InPerson, Online, Group
    notes = Column(String(1000), nullable=True)  # New: free text notes
    created = Column(DateTime, nullable=False, default=datetime.utcnow)

