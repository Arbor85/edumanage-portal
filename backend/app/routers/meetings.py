from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.auth import get_current_token_claims, get_current_user_id
from ..core.dependencies import get_db
from ..models import Meeting
from ..schemas import MeetingCreate, MeetingOut, MeetingUpdate

router = APIRouter()


@router.get("/api/meetings", response_model=list[MeetingOut], tags=["Meetings"])
def list_meetings(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[MeetingOut]:
    user_id = get_current_user_id(claims)
    meetings = (
        db.execute(
            select(Meeting).where(Meeting.user_id == user_id).order_by(Meeting.starts_at.asc())
        )
        .scalars()
        .all()
    )
    return [MeetingOut.model_validate(m) for m in meetings]


@router.post("/api/meetings", response_model=MeetingOut, status_code=201, tags=["Meetings"])
def add_meeting(
    payload: MeetingCreate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> MeetingOut:
    user_id = get_current_user_id(claims)
    meeting = Meeting(
        id=str(uuid4()),
        user_id=user_id,
        client_id=payload.clientId,
        starts_at=payload.startsAt,
        price=payload.price,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return MeetingOut.model_validate(meeting)


@router.put("/api/meetings/{meeting_id}", response_model=MeetingOut, tags=["Meetings"])
def update_meeting(
    meeting_id: str,
    payload: MeetingUpdate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> MeetingOut:
    user_id = get_current_user_id(claims)
    meeting = db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == user_id)
    ).scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    meeting.client_id = payload.clientId
    meeting.starts_at = payload.startsAt
    meeting.price = payload.price
    db.commit()
    db.refresh(meeting)
    return MeetingOut.model_validate(meeting)


@router.delete("/api/meetings/{meeting_id}", tags=["Meetings"])
def delete_meeting(
    meeting_id: str,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user_id = get_current_user_id(claims)
    meeting = db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == user_id)
    ).scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully."}
