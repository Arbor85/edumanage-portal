from __future__ import annotations

import json
import logging
import os
from collections.abc import Generator
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import Body, Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine
from .models import Client, Excercise, Plan, Routine, User, WorkoutHistory
from .schemas import (
    AcceptClientInvitationRequest,
    ClientCreate,
    ClientOut,
    ClientUpdate,
    CompleteRoutineCreate,
    ExcerciseOut,
    RoutineCreate,
    RoutineOut,
    RoutineUpdate,
    WorkoutHistoryOut,
)
from .routers import plans as plans_router

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env.local")

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "").strip()
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "").strip()
AUTH0_ISSUER = f"https://{AUTH0_DOMAIN}/" if AUTH0_DOMAIN else ""
AUTH0_JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json" if AUTH0_DOMAIN else ""

_jwks_cache: dict[str, Any] | None = None
logger = logging.getLogger("edumanage.routines")

app = FastAPI(
    title="EduManage API",
    version="0.1.0",
    description="Client CRUD API",
)

bearer_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Paste Auth0 access token here.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans_router.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_clients_columns()
    ensure_routines_columns()
    ensure_plans_columns()
    ensure_workout_history_table()
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


def ensure_plans_columns() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('plans')")).fetchall()
        if not columns:
            return

        column_names = {column[1] for column in columns}
        if "user_id" not in column_names:
            connection.execute(text("ALTER TABLE plans ADD COLUMN user_id VARCHAR(255)"))
            connection.commit()


def ensure_workout_history_table() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('workoutHistory')")).fetchall()
        if not columns:
            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS workoutHistory (
                        id VARCHAR(100) PRIMARY KEY,
                        current_user_id VARCHAR(255) NOT NULL,
                        mode VARCHAR(50) NOT NULL,
                        started_at VARCHAR(64) NOT NULL,
                        completed_at VARCHAR(64) NOT NULL,
                        duration_seconds INTEGER NOT NULL,
                        total_sets INTEGER NOT NULL,
                        completed_sets INTEGER NOT NULL,
                        excercises JSON NOT NULL,
                        source_workout JSON NOT NULL
                    )
                    """
                )
            )
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_workoutHistory_id ON workoutHistory (id)"))
            connection.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_workoutHistory_current_user_id ON workoutHistory (current_user_id)"
                )
            )
            connection.commit()
            logger.info("Created missing workoutHistory table on startup")
            return

        column_names = {column[1] for column in columns}
        required_columns: list[tuple[str, str]] = [
            ("current_user_id", "VARCHAR(255)"),
            ("mode", "VARCHAR(50)"),
            ("started_at", "VARCHAR(64)"),
            ("completed_at", "VARCHAR(64)"),
            ("duration_seconds", "INTEGER"),
            ("total_sets", "INTEGER"),
            ("completed_sets", "INTEGER"),
            ("excercises", "JSON"),
            ("source_workout", "JSON"),
        ]
        for column_name, column_type in required_columns:
            if column_name not in column_names:
                connection.execute(
                    text(f"ALTER TABLE workoutHistory ADD COLUMN {column_name} {column_type}")
                )
        connection.commit()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


def _require_auth0_domain() -> None:
    if not AUTH0_DOMAIN:
        raise HTTPException(
            status_code=500,
            detail="AUTH0_DOMAIN is not configured in environment.",
        )


def _get_jwks() -> dict[str, Any]:
    global _jwks_cache

    _require_auth0_domain()
    if _jwks_cache is not None:
        return _jwks_cache

    response = httpx.get(AUTH0_JWKS_URL, timeout=5.0)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict) or "keys" not in payload:
        raise HTTPException(status_code=401, detail="Unable to load Auth0 signing keys.")

    _jwks_cache = payload
    return payload


def _decode_auth0_jwt(token: str) -> dict[str, object]:
    if token.count(".") != 2:
        raise HTTPException(status_code=401, detail="Bearer token is not a JWT.")

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = str(unverified_header.get("kid") or "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid bearer token header.")

    if not kid:
        raise HTTPException(status_code=401, detail="Invalid bearer token header.")

    jwks = _get_jwks()
    jwk_key = next((key for key in jwks.get("keys", []) if key.get("kid") == kid), None)
    if not jwk_key:
        raise HTTPException(status_code=401, detail="Unable to match Auth0 signing key.")

    options: dict[str, bool] = {"verify_aud": bool(AUTH0_AUDIENCE)}
    decode_kwargs: dict[str, Any] = {
        "key": jwk_key,
        "algorithms": ["RS256"],
        "issuer": AUTH0_ISSUER,
        "options": options,
    }
    if AUTH0_AUDIENCE:
        decode_kwargs["audience"] = AUTH0_AUDIENCE

    try:
        claims = jwt.decode(token, **decode_kwargs)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid bearer token: {str(exc)}")

    if not isinstance(claims, dict):
        raise HTTPException(status_code=401, detail="Invalid bearer token claims.")
    return claims


def _fetch_auth0_userinfo(token: str) -> dict[str, object]:
    _require_auth0_domain()
    response = httpx.get(
        f"https://{AUTH0_DOMAIN}/userinfo",
        headers={"Authorization": f"Bearer {token}"},
        timeout=5.0,
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid bearer token.")

    payload = response.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=401, detail="Invalid bearer token claims.")
    return payload


def get_current_token_claims(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
) -> dict[str, object]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header is required.")

    if credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Bearer token is required.")

    token = credentials.credentials
    try:
        return _decode_auth0_jwt(token)
    except HTTPException:
        return _fetch_auth0_userinfo(token)


def get_current_user_id(claims: dict[str, object]) -> str:
    user_id = str(claims.get("sub") or claims.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(status_code=401, detail="Token does not include user identifier.")
    return user_id


@app.get("/api/clients", response_model=list[ClientOut], tags=["Clients"])
def list_clients(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[ClientOut]:
    user_id = get_current_user_id(claims)
    clients = db.execute(
        select(Client).where(Client.user_id == user_id).order_by(Client.id.desc())
    ).scalars().all()
    return [ClientOut.model_validate(client) for client in clients]


@app.get("/api/excercises", response_model=list[ExcerciseOut], tags=["Excercises"])
def list_excercises(db: Session = Depends(get_db)) -> list[ExcerciseOut]:
    excercises = db.execute(select(Excercise).order_by(Excercise.name.asc())).scalars().all()
    return [ExcerciseOut.model_validate(excercise) for excercise in excercises]


@app.get("/api/routines", response_model=list[RoutineOut], tags=["Routines"])
def list_routines(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[RoutineOut]:
    user_id = get_current_user_id(claims)
    routines = db.execute(
        select(Routine).where(Routine.user_id == user_id).order_by(Routine.name.asc())
    ).scalars().all()
    return [RoutineOut.model_validate(routine) for routine in routines]


@app.post("/api/routines", response_model=RoutineOut, status_code=201, tags=["Routines"])
def add_routine(
    payload: RoutineCreate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> RoutineOut:
    user_id = get_current_user_id(claims)
    routine = Routine(
        id=str(uuid4()),
        name=payload.name,
        user_id=user_id,
        excercises=[item.model_dump() for item in payload.excercises],
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return RoutineOut.model_validate(routine)


@app.put("/api/routines/{routine_id}", response_model=RoutineOut, tags=["Routines"])
def update_routine(
    routine_id: str,
    payload: RoutineUpdate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> RoutineOut:
    user_id = get_current_user_id(claims)
    routine = db.execute(
        select(Routine).where(Routine.id == routine_id, Routine.user_id == user_id)
    ).scalar_one_or_none()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found.")

    routine.name = payload.name
    routine.excercises = [item.model_dump() for item in payload.excercises]

    db.commit()
    db.refresh(routine)
    return RoutineOut.model_validate(routine)


@app.delete("/api/routines/{routine_id}", tags=["Routines"])
def delete_routine(
    routine_id: str,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user_id = get_current_user_id(claims)
    routine = db.execute(
        select(Routine).where(Routine.id == routine_id, Routine.user_id == user_id)
    ).scalar_one_or_none()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found.")

    db.delete(routine)
    db.commit()
    return {"message": "Routine deleted successfully."}


@app.post("/api/routines/complete", response_model=WorkoutHistoryOut, status_code=201, tags=["Routines"])
def complete_routine(
    payload: dict[str, Any] = Body(...),
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> WorkoutHistoryOut:
    logger.info("/api/routines/complete request received")
    normalized_payload: dict[str, Any] = {
        "mode": payload.get("mode"),
        "startedAt": payload.get("startedAt", payload.get("started_at")),
        "completedAt": payload.get("completedAt", payload.get("completed_at")),
        "durationSeconds": payload.get("durationSeconds", payload.get("duration_seconds")),
        "totalSets": payload.get("totalSets", payload.get("total_sets")),
        "completedSets": payload.get("completedSets", payload.get("completed_sets")),
        "excercises": payload.get("excercises", payload.get("exercises", [])),
        "sourceWorkout": payload.get(
            "sourceWorkout",
            payload.get("source_workout", payload.get("sourceRoutine", payload.get("sourcePlan"))),
        ),
    }
    mode_value = normalized_payload.get("mode")
    if isinstance(mode_value, str):
        normalized_payload["mode"] = mode_value.strip().lower()

    raw_excercises = normalized_payload.get("excercises")
    if isinstance(raw_excercises, list):
        for excercise in raw_excercises:
            if not isinstance(excercise, dict):
                continue
            if "isBodyweight" not in excercise and "isBodyWeight" in excercise:
                excercise["isBodyweight"] = excercise.get("isBodyWeight")
            sets = excercise.get("sets")
            if isinstance(sets, list):
                for set_item in sets:
                    if isinstance(set_item, dict) and "completed" not in set_item and "isCompleted" in set_item:
                        set_item["completed"] = set_item.get("isCompleted")

    if normalized_payload.get("sourceWorkout") is None:
        started_at = normalized_payload.get("startedAt")
        fallback_date = "1970-01-01"
        if isinstance(started_at, str) and len(started_at) >= 10:
            fallback_date = started_at[:10]
        normalized_payload["sourceWorkout"] = {
            "id": "ad-hoc",
            "name": "Ad-hoc workout",
            "date": fallback_date,
        }
        logger.info(
            "Routine completion payload missing sourceWorkout; using fallback sourceWorkout=%s",
            normalized_payload["sourceWorkout"],
        )

    try:
        validated_payload = CompleteRoutineCreate.model_validate(normalized_payload)
    except ValidationError as exc:
        logger.warning(
            "Routine completion payload validation failed. errors=%s normalized_payload=%s",
            exc.errors(),
            normalized_payload,
        )
        raise HTTPException(status_code=422, detail=exc.errors())

    current_user_id = get_current_user_id(claims)
    history = WorkoutHistory(
        id=str(uuid4()),
        current_user_id=current_user_id,
        mode=validated_payload.mode,
        started_at=validated_payload.startedAt,
        completed_at=validated_payload.completedAt,
        duration_seconds=validated_payload.durationSeconds,
        total_sets=validated_payload.totalSets,
        completed_sets=validated_payload.completedSets,
        excercises=[item.model_dump(by_alias=True) for item in validated_payload.excercises],
        source_workout=validated_payload.sourceWorkout.model_dump(by_alias=True),
    )
    try:
        db.add(history)
        db.commit()
        db.refresh(history)
    except Exception as exc:
        db.rollback()
        logger.exception(
            "Routine completion persistence failed. current_user_id=%s mode=%s source_workout=%s",
            current_user_id,
            validated_payload.mode,
            validated_payload.sourceWorkout.model_dump(by_alias=True),
        )
        raise HTTPException(status_code=500, detail=f"Failed to save completed routine: {str(exc)}")

    logger.info(
        "Routine completion saved. history_id=%s current_user_id=%s duration_seconds=%s",
        history.id,
        history.current_user_id,
        history.duration_seconds,
    )
    return WorkoutHistoryOut.model_validate(history)


@app.post("/api/clients", response_model=ClientOut, status_code=201, tags=["Clients"])
def add_client(
    payload: ClientCreate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> ClientOut:
    user_id = get_current_user_id(claims)
    existing = db.execute(
        select(Client).where(
            Client.invitation_code == payload.invitationCode,
            Client.user_id == user_id,
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Client with this invitationCode already exists.")

    client = Client(
        name=payload.name,
        tags=payload.tags,
        image_url=payload.imageUrl,
        status=payload.status,
        invitation_code=payload.invitationCode,
        user_id=user_id,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)


@app.put("/api/clients/{invitation_code}", response_model=ClientOut, tags=["Clients"])
def edit_client(
    invitation_code: str,
    payload: ClientUpdate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> ClientOut:
    user_id = get_current_user_id(claims)
    client = db.execute(
        select(Client).where(
            Client.invitation_code == invitation_code,
            Client.user_id == user_id,
        )
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    if payload.invitationCode != invitation_code:
        conflict = db.execute(
            select(Client).where(
                Client.invitation_code == payload.invitationCode,
                Client.user_id == user_id,
            )
        ).scalar_one_or_none()
        if conflict:
            raise HTTPException(status_code=400, detail="Client with this invitationCode already exists.")

    client.name = payload.name
    client.tags = payload.tags
    client.image_url = payload.imageUrl
    client.status = payload.status
    client.invitation_code = payload.invitationCode

    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)


@app.delete("/api/clients/{invitation_code}", tags=["Clients"])
def delete_client(
    invitation_code: str,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user_id = get_current_user_id(claims)
    client = db.execute(
        select(Client).where(
            Client.invitation_code == invitation_code,
            Client.user_id == user_id,
        )
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully."}


@app.post("/api/clients/{invitation_code}/accept", response_model=ClientOut, tags=["Clients"])
def accept_client_invitation(
    invitation_code: str,
    payload: AcceptClientInvitationRequest,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> ClientOut:
    user_id = get_current_user_id(claims)
    client = db.execute(select(Client).where(Client.invitation_code == invitation_code)).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    external_id = user_id
    if not external_id:
        raise HTTPException(status_code=401, detail="Token does not include user identifier.")

    name = payload.name.strip()
    email = payload.email.strip()
    if not name or not email:
        raise HTTPException(status_code=400, detail="name and email are required.")

    user = db.execute(select(User).where(User.external_id == external_id)).scalar_one_or_none()
    if not user:
        email_owner = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if email_owner and email_owner.external_id != external_id:
            raise HTTPException(status_code=400, detail="Email is already associated with another user.")

        user = User(name=name, email=email, external_id=external_id)
        db.add(user)
        db.flush()
    else:
        email_owner = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if email_owner and email_owner.id != user.id:
            raise HTTPException(status_code=400, detail="Email is already associated with another user.")

        user.name = name
        user.email = email

    if client.current_user_id and client.current_user_id != user.id:
        raise HTTPException(status_code=400, detail="Invitation already accepted by another user.")

    client.current_user_id = user.id
    client.image_url = payload.imageUrl
    client.status = "Active"

    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)
