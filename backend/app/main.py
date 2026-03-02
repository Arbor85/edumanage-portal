from __future__ import annotations

import base64
import json
from collections.abc import Generator

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine
from .models import Client, User
from .schemas import AcceptClientInvitationRequest, ClientCreate, ClientOut, ClientUpdate

app = FastAPI(
    title="EduManage API",
    version="0.1.0",
    description="Client CRUD API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_clients_columns()


def ensure_clients_columns() -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info('clients')")).fetchall()
        column_names = {column[1] for column in columns}
        if "current_user_id" not in column_names:
            connection.execute(text("ALTER TABLE clients ADD COLUMN current_user_id INTEGER"))
            connection.commit()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _decode_jwt_payload(token: str) -> dict[str, object]:
    parts = token.split(".")
    if len(parts) < 2:
        raise HTTPException(status_code=401, detail="Invalid bearer token format.")

    payload_segment = parts[1]
    padding = "=" * (-len(payload_segment) % 4)
    try:
        decoded = base64.urlsafe_b64decode(payload_segment + padding)
        payload = json.loads(decoded.decode("utf-8"))
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=401, detail="Invalid bearer token payload.")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=401, detail="Invalid bearer token payload.")
    return payload


def get_current_token_claims(authorization: str | None = Header(default=None)) -> dict[str, object]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Bearer token is required.")
    return _decode_jwt_payload(token)


@app.get("/api/clients", response_model=list[ClientOut], tags=["Clients"])
def list_clients(db: Session = Depends(get_db)) -> list[ClientOut]:
    clients = db.execute(select(Client).order_by(Client.id.desc())).scalars().all()
    return [ClientOut.model_validate(client) for client in clients]


@app.post("/api/clients", response_model=ClientOut, status_code=201, tags=["Clients"])
def add_client(payload: ClientCreate, db: Session = Depends(get_db)) -> ClientOut:
    existing = db.execute(
        select(Client).where(Client.invitation_code == payload.invitationCode)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Client with this invitationCode already exists.")

    client = Client(
        name=payload.name,
        tags=payload.tags,
        image_url=payload.imageUrl,
        status=payload.status,
        invitation_code=payload.invitationCode,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)


@app.put("/api/clients/{invitation_code}", response_model=ClientOut, tags=["Clients"])
def edit_client(
    invitation_code: str,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
) -> ClientOut:
    client = db.execute(
        select(Client).where(Client.invitation_code == invitation_code)
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    if payload.invitationCode != invitation_code:
        conflict = db.execute(
            select(Client).where(Client.invitation_code == payload.invitationCode)
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
def delete_client(invitation_code: str, db: Session = Depends(get_db)) -> dict[str, str]:
    client = db.execute(
        select(Client).where(Client.invitation_code == invitation_code)
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
    client = db.execute(
        select(Client).where(Client.invitation_code == invitation_code)
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    external_id = str(claims.get("sub") or claims.get("user_id") or "").strip()
    if not external_id:
        raise HTTPException(status_code=401, detail="Token does not include user identifier.")

    token_name = str(claims.get("name") or claims.get("nickname") or external_id)
    token_email = str(claims.get("email") or f"{external_id}@local.invalid")

    user = db.execute(select(User).where(User.external_id == external_id)).scalar_one_or_none()
    if not user:
        user = User(name=token_name, email=token_email, external_id=external_id)
        db.add(user)
        db.flush()
    else:
        user.name = token_name
        user.email = token_email

    client.current_user_id = user.id
    client.image_url = payload.imageUrl

    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)
