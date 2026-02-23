from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class WorkoutSet(BaseModel):
    exercise_title: str
    superset_id: int | None = None
    exercise_notes: str | None = None
    set_index: int
    set_type: str
    weight_kg: float | None = None
    reps: int | None = None


class WorkoutHistoryOut(BaseModel):
    id: int
    title: str
    workout_date: date
    duration_minutes: int
    volume_kg: float
    sets: int
    workout_sets: list[WorkoutSet]
    start_time: datetime | None = None
    end_time: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutHistoryPage(BaseModel):
    items: list[WorkoutHistoryOut]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0)


class WorkoutHistoryCreate(BaseModel):
    title: str
    workout_date: date
    duration_minutes: int
    volume_kg: float
    sets: int
    workout_sets: list[WorkoutSet]
    start_time: datetime | None = None
    end_time: datetime | None = None


class TrainingPlanSet(BaseModel):
    type: str
    weight: str
    reps: str


class TrainingPlanExercise(BaseModel):
    name: str
    sets: list[TrainingPlanSet]


class TrainingPlanCreate(BaseModel):
    name: str
    description: str | None = None
    template_id: str
    template_name: str
    days_of_week: list[str] = Field(min_length=1)
    exercises_by_day: dict[str, list[TrainingPlanExercise]] = Field(default_factory=dict)
    creator_id: str | None = None
    mentee_id: str | None = None


class TrainingPlanOut(TrainingPlanCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True



class MenteeCreate(BaseModel):
    name: str
    email_address: str | None = None
    creator_id: str
    type: str = "InPerson"  # InPerson, Online, Group
    status: str = "Active"   # Active, Suspended
    notes: str | None = None



class MenteeOut(MenteeCreate):
    id: str
    invite_key: str
    created: datetime

    class Config:
        from_attributes = True


class AcceptInvitationRequest(BaseModel):
    name: str
    user_id: str

