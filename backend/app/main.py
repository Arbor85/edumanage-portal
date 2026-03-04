from __future__ import annotations

import json
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables BEFORE importing any modules that need them
BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env.local")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text

from .db import Base, SessionLocal, engine
from .models import Excercise
from .routers.clients import router as clients_router
from .routers.exercises import router as exercises_router
from .routers.routines import router as routines_router

app = FastAPI(
    title="EduManage API",
    version="0.1.0",
    description="Client CRUD API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3000/",
        "http://localhost:5173",
        "http://localhost:5173/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(clients_router)
app.include_router(exercises_router)
app.include_router(routines_router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_clients_columns()
    ensure_routines_columns()
    seed_excercises()


def ensure_clients_columns() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('clients')")).fetchall()
        column_names = {column[1] for column in columns}
        if "current_user_id" not in column_names:
            connection.execute(text("ALTER TABLE clients ADD COLUMN current_user_id INTEGER"))
        if "user_id" not in column_names:
            connection.execute(text("ALTER TABLE clients ADD COLUMN user_id VARCHAR(255)"))
        connection.commit()


def ensure_routines_columns() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('routines')")).fetchall()
        if not columns:
            return

        column_names = {column[1] for column in columns}
        if "user_id" not in column_names:
            connection.execute(text("ALTER TABLE routines ADD COLUMN user_id VARCHAR(255)"))
            connection.commit()


def _excercises_file_path() -> Path:
    return BACKEND_DIR / "excercises.json"


def seed_excercises() -> None:
    data_path = _excercises_file_path()
    if not data_path.exists():
        return

    db = SessionLocal()
    try:
        existing = db.execute(select(func.count(Excercise.id))).scalar_one()
        if existing > 0:
            return

        with data_path.open("r", encoding="utf-8") as data_file:
            payload = json.load(data_file)

        if not isinstance(payload, list):
            return

        entities: list[Excercise] = []
        for item in payload:
            if not isinstance(item, dict):
                continue

            name = str(item.get("Name") or "").strip()
            if not name:
                continue

            short_description = str(item.get("ShortDescription") or "").strip()
            primary_muscle = str(item.get("PrimaryMuscle") or "").strip()
            muscles = item.get("Muscles")
            tags = item.get("Tags")

            entities.append(
                Excercise(
                    name=name,
                    short_description=short_description,
                    primary_muscle=primary_muscle,
                    muscles=muscles if isinstance(muscles, list) else [],
                    tags=tags if isinstance(tags, list) else [],
                )
            )

        if entities:
            db.add_all(entities)
            db.commit()
    finally:
        db.close()
