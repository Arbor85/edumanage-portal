from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import uuid4
from ..models import Routine
from ..schemas import RoutineCreate, RoutineOut, RoutineUpdate
from ..core.auth import get_current_token_claims, get_current_user_id
from ..core.dependencies import get_db

router = APIRouter()

@router.get("/api/routines", response_model=list[RoutineOut], tags=["Routines"])
def list_routines(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[RoutineOut]:
    user_id = get_current_user_id(claims)
    routines = db.execute(
        select(Routine).where(Routine.user_id == user_id).order_by(Routine.name.asc())
    ).scalars().all()
    return [RoutineOut.model_validate(routine) for routine in routines]

@router.post("/api/routines", response_model=RoutineOut, status_code=201, tags=["Routines"])
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

@router.put("/api/routines/{routine_id}", response_model=RoutineOut, tags=["Routines"])
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

@router.delete("/api/routines/{routine_id}", tags=["Routines"])
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
