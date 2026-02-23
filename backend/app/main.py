from __future__ import annotations

import csv
import json
import math
from fastapi import Depends, FastAPI, HTTPException, Query, Body
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, func, select, text
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine
from .models import TrainingPlan, WorkoutHistory, Mentee
from .schemas import TrainingPlanCreate, TrainingPlanOut, WorkoutHistoryCreate, WorkoutHistoryOut, WorkoutHistoryPage, MenteeCreate, MenteeOut, AcceptInvitationRequest
from .auth import router as auth_router

# PATCH endpoint for updating mentee will be placed after app is defined


from datetime import datetime
from pathlib import Path

# Load environment variables BEFORE importing local modules that use them
from dotenv import load_dotenv

# Get the backend directory path (parent of app directory)
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)



app = FastAPI(
    title="Alpaki Planner Fitness API",
    version="1.0.0",
    description="API for managing training plans and workout history",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_workout_history_columns()
    seed_workout_history()


def ensure_workout_history_columns() -> None:
    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('workout_history')")).fetchall()
        column_names = {column[1] for column in columns}
        if "start_time" not in column_names:
            connection.execute(text("ALTER TABLE workout_history ADD COLUMN start_time DATETIME"))
        if "end_time" not in column_names:
            connection.execute(text("ALTER TABLE workout_history ADD COLUMN end_time DATETIME"))
        connection.commit()


def seed_workout_history() -> None:
    def parse_int(value: str | None) -> int | None:
        if value is None:
            return None
        raw = value.strip()
        if not raw:
            return None
        try:
            return int(float(raw))
        except ValueError:
            return None

    def parse_float(value: str | None) -> float | None:
        if value is None:
            return None
        raw = value.strip()
        if not raw:
            return None
        try:
            return float(raw)
        except ValueError:
            return None

    db = SessionLocal()
    try:
        existing = db.execute(select(func.count(WorkoutHistory.id))).scalar_one()
        if existing > 0:
            return

        csv_path = (
            Path(__file__).resolve().parents[2]
            / "components"
            / "pages"
            / "fitnes"
            / "data"
            / "workouts.csv"
        )
        if not csv_path.exists():
            return

        workouts: dict[tuple[datetime, datetime], dict[str, object]] = {}
        with csv_path.open("r", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                title = (row.get("title") or "").strip()
                start_raw = (row.get("start_time") or "").strip()
                end_raw = (row.get("end_time") or "").strip()
                if not title or not start_raw or not end_raw:
                    continue

                try:
                    start_dt = datetime.strptime(start_raw, "%d %b %Y, %H:%M")
                    end_dt = datetime.strptime(end_raw, "%d %b %Y, %H:%M")
                except ValueError:
                    continue

                key = (start_dt, end_dt)
                if key not in workouts:
                    duration_minutes = max(
                        0, int((end_dt - start_dt).total_seconds() / 60)
                    )
                    workouts[key] = {
                        "title": title,
                        "workout_date": start_dt.date(),
                        "duration_minutes": duration_minutes,
                        "volume_kg": 0.0,
                        "sets": 0,
                        "workout_sets": [],
                    }

                workout = workouts[key]
                workout["sets"] = int(workout["sets"]) + 1

                workout_set = {
                    "exercise_title": (row.get("exercise_title") or "").strip(),
                    "superset_id": parse_int(row.get("superset_id")),
                    "exercise_notes": (row.get("exercise_notes") or "").strip()
                    or None,
                    "set_index": parse_int(row.get("set_index")) or 0,
                    "set_type": (row.get("set_type") or "").strip(),
                    "weight_kg": parse_float(row.get("weight_kg")),
                    "reps": parse_int(row.get("reps")),
                }
                workout["workout_sets"].append(workout_set)

                weight = workout_set["weight_kg"]
                reps = workout_set["reps"]
                if weight is not None and reps is not None:
                    workout["volume_kg"] = float(workout["volume_kg"]) + (
                        weight * reps
                    )

        if workouts:
            db.add_all(
                WorkoutHistory(
                    title=payload["title"],
                    workout_date=payload["workout_date"],
                    duration_minutes=payload["duration_minutes"],
                    volume_kg=payload["volume_kg"],
                    sets=payload["sets"],
                    workout_sets=payload["workout_sets"],
                )
                for payload in workouts.values()
            )
            db.commit()
    finally:
        db.close()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/history", response_model=WorkoutHistoryPage, tags=["Workout History"], summary="Get workout history with pagination")
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> WorkoutHistoryPage:
    total = db.execute(select(func.count(WorkoutHistory.id))).scalar_one()
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    offset = (page - 1) * page_size

    items = (
        db.execute(
            select(WorkoutHistory)
            .order_by(desc(WorkoutHistory.workout_date), desc(WorkoutHistory.created_at))
            .offset(offset)
            .limit(page_size)
        )
        .scalars()
        .all()
    )

    return WorkoutHistoryPage(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@app.post("/api/history", response_model=WorkoutHistoryOut, status_code=201, tags=["Workout History"], summary="Create a new workout history entry")
def create_history(
    payload: WorkoutHistoryCreate,
    db: Session = Depends(get_db),
) -> WorkoutHistoryOut:
    history = WorkoutHistory(
        title=payload.title,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
        volume_kg=payload.volume_kg,
        sets=payload.sets,
        workout_sets=jsonable_encoder(payload.workout_sets),
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


@app.get("/api/training-plans", response_model=list[TrainingPlanOut], tags=["Training Plans"], summary="Get training plans for current user")
def get_training_plans(
    user_id: str = Query(...),
    db: Session = Depends(get_db),
) -> list[TrainingPlanOut]:
    from sqlalchemy import or_

    mentee_ids_by_user = db.execute(
        select(Mentee.id).where(Mentee.user_id == user_id)
    ).scalars().all()
    mentee_ids: set[str] = set(mentee_ids_by_user)
    mentee_ids.add(user_id)

    # Filter plans where requester is creator OR assigned mentee
    query = (
        select(TrainingPlan)
        .where(
            or_(
                TrainingPlan.creator_id == user_id,
                TrainingPlan.mentee_id.in_(mentee_ids),
            )
        )
        .order_by(desc(TrainingPlan.created_at))
    )
    
    plans = db.execute(query).scalars().all()

    results: list[TrainingPlanOut] = []
    for plan in plans:
        days = [day for day in plan.days_of_week.split(",") if day]
        try:
            exercises_by_day = json.loads(plan.exercises_by_day) if plan.exercises_by_day else {}
        except json.JSONDecodeError:
            exercises_by_day = {}

        results.append(
            TrainingPlanOut(
                id=plan.id,
                name=plan.name,
                description=plan.description,
                template_id=plan.template_id,
                template_name=plan.template_name,
                days_of_week=days,
                exercises_by_day=exercises_by_day,
                creator_id=plan.creator_id,
                mentee_id=plan.mentee_id,
                created_at=plan.created_at,
            )
        )

    return results


@app.get("/api/training-plans/{plan_id}", response_model=TrainingPlanOut, tags=["Training Plans"], summary="Get a specific training plan by ID")
def get_training_plan(
    plan_id: int,
    db: Session = Depends(get_db),
) -> TrainingPlanOut:
    plan = db.get(TrainingPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Training plan not found.")

    days = [day for day in plan.days_of_week.split(",") if day]
    try:
        exercises_by_day = json.loads(plan.exercises_by_day) if plan.exercises_by_day else {}
    except json.JSONDecodeError:
        exercises_by_day = {}

    return TrainingPlanOut(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        template_id=plan.template_id,
        template_name=plan.template_name,
        days_of_week=days,
        exercises_by_day=exercises_by_day,
        creator_id=plan.creator_id,
        mentee_id=plan.mentee_id,
        created_at=plan.created_at,
    )


@app.post("/api/training-plans", response_model=TrainingPlanOut, status_code=201, tags=["Training Plans"], summary="Create a new training plan")
def create_training_plan(
    payload: TrainingPlanCreate,
    db: Session = Depends(get_db),
) -> TrainingPlanOut:
    days_value = ",".join(payload.days_of_week)
    exercises_value = json.dumps(jsonable_encoder(payload.exercises_by_day))
    plan = TrainingPlan(
        name=payload.name,
        description=payload.description,
        template_id=payload.template_id,
        template_name=payload.template_name,
        days_of_week=days_value,
        exercises_by_day=exercises_value,
        creator_id=payload.creator_id,
        mentee_id=payload.mentee_id,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return TrainingPlanOut(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        template_id=plan.template_id,
        template_name=plan.template_name,
        days_of_week=payload.days_of_week,
        exercises_by_day=payload.exercises_by_day,
        creator_id=plan.creator_id,
        mentee_id=plan.mentee_id,
        created_at=plan.created_at,
    )


@app.put("/api/training-plans/{plan_id}", response_model=TrainingPlanOut, tags=["Training Plans"], summary="Update an existing training plan")
def update_training_plan(
    plan_id: int,
    payload: TrainingPlanCreate,
    db: Session = Depends(get_db),
) -> TrainingPlanOut:
    plan = db.get(TrainingPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Training plan not found.")

    plan.name = payload.name
    plan.description = payload.description
    plan.template_id = payload.template_id
    plan.template_name = payload.template_name
    plan.days_of_week = ",".join(payload.days_of_week)
    plan.exercises_by_day = json.dumps(jsonable_encoder(payload.exercises_by_day))
    plan.mentee_id = payload.mentee_id

    db.commit()
    db.refresh(plan)

    return TrainingPlanOut(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        template_id=plan.template_id,
        template_name=plan.template_name,
        days_of_week=payload.days_of_week,
        exercises_by_day=payload.exercises_by_day,
        creator_id=plan.creator_id,
        mentee_id=plan.mentee_id,
        created_at=plan.created_at,
    )


@app.delete("/api/training-plans/{plan_id}", tags=["Training Plans"], summary="Delete a training plan")
def delete_training_plan(
    plan_id: int,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    plan = db.get(TrainingPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Training plan not found.")

    db.delete(plan)
    db.commit()

    return {"message": "Training plan deleted successfully."}


# Mentees endpoints


@app.get("/api/mentees", response_model=list[MenteeOut], tags=["Mentees"], summary="Get all mentees for current user")
def get_mentees(db: Session = Depends(get_db), user_id: str = Query(...)) -> list[MenteeOut]:
    mentees = db.execute(select(Mentee).where(Mentee.creator_id == user_id).order_by(desc(Mentee.created))).scalars().all()
    return [MenteeOut.model_validate(m) for m in mentees]


@app.post("/api/mentees", response_model=MenteeOut, tags=["Mentees"], summary="Create a new mentee")
def create_mentee(
    payload: MenteeCreate,
    db: Session = Depends(get_db),
) -> MenteeOut:
    if payload.email_address:
        existing = db.execute(select(Mentee).where(Mentee.email_address == payload.email_address)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Mentee with this email already exists.")

    mentee = Mentee(
        name=payload.name,
        email_address=payload.email_address,
        creator_id=payload.creator_id,
        type=payload.type,
        status=payload.status,
        notes=payload.notes
    )
    db.add(mentee)
    db.commit()
    db.refresh(mentee)
    return MenteeOut.model_validate(mentee)


@app.post("/api/mentees/accept-invitation/{invite_key}", tags=["Mentees"], summary="Accept mentee invitation")
def accept_invitation(
    invite_key: str,
    payload: AcceptInvitationRequest,
    db: Session = Depends(get_db),
):
    mentee = db.execute(select(Mentee).where(Mentee.invite_key == invite_key)).scalar_one_or_none()
    if not mentee:
        raise HTTPException(status_code=404, detail="Invalid invitation key.")

    mentee.name = payload.name
    mentee.user_id = payload.user_id
    mentee.status = "accepted"
    db.commit()
    return {"success": True, "message": "Invitation accepted successfully."}


@app.delete("/api/mentees/{mentee_id}", tags=["Mentees"], summary="Delete a mentee")
def delete_mentee(
    mentee_id: str,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    mentee = db.get(Mentee, mentee_id)
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found.")

    db.delete(mentee)
    db.commit()

    return {"message": "Mentee deleted successfully."}


@app.patch("/api/mentees/{mentee_id}", response_model=MenteeOut, tags=["Mentees"], summary="Update a mentee")
def update_mentee(
    mentee_id: str,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
) -> MenteeOut:
    mentee = db.get(Mentee, mentee_id)
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found.")
    # Only update provided fields
    for key, value in payload.items():
        if hasattr(mentee, key):
            setattr(mentee, key, value)
    db.commit()
    db.refresh(mentee)
    return MenteeOut.model_validate(mentee)


