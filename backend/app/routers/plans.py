from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.dependencies import get_db
from ..models import Client, Plan
from ..schemas import ClientOut, PlanCreate, PlanOut, PlanUpdate

router = APIRouter()


@router.get("/api/plans", response_model=list[PlanOut], tags=["Plans"])
def list_plans(
    db: Session = Depends(get_db),
) -> list[PlanOut]:
    rows = (
        db.execute(
            select(Plan, Client)
            .outerjoin(Client, Client.invitation_code == Plan.client_id)
            .order_by(Plan.name.asc())
        )
        .all()
    )

    return [
        PlanOut.model_validate(
            {
                "id": plan.id,
                "name": plan.name,
                "clientId": plan.client_id,
                "workouts": plan.workouts,
                "client": ClientOut.model_validate(client) if client else None,
            }
        )
        for plan, client in rows
    ]


@router.get("/api/plans/{plan_id}", response_model=PlanOut, tags=["Plans"])
def get_plan(
    plan_id: str,
    db: Session = Depends(get_db),
) -> PlanOut:
    row = (
        db.execute(
            select(Plan, Client)
            .outerjoin(Client, Client.invitation_code == Plan.client_id)
            .where(Plan.id == plan_id)
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Plan not found.")
    plan, client = row

    return PlanOut.model_validate(
        {
            "id": plan.id,
            "name": plan.name,
            "clientId": plan.client_id,
            "workouts": plan.workouts,
            "client": ClientOut.model_validate(client) if client else None,
        }
    )


@router.post("/api/plans", response_model=PlanOut, status_code=201, tags=["Plans"])
def add_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
) -> PlanOut:
    client = db.execute(
        select(Client).where(
            Client.invitation_code == payload.clientId,
        )
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    plan = Plan(
        id=str(uuid4()),
        name=payload.name,
        client_id=payload.clientId,
        user_id=None,
        workouts=[item.model_dump(by_alias=True) for item in payload.workouts],
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return PlanOut.model_validate(
        {
            "id": plan.id,
            "name": plan.name,
            "clientId": plan.client_id,
            "workouts": plan.workouts,
            "client": ClientOut.model_validate(client),
        }
    )


@router.put("/api/plans/{plan_id}", response_model=PlanOut, tags=["Plans"])
def update_plan(
    plan_id: str,
    payload: PlanUpdate,
    db: Session = Depends(get_db),
) -> PlanOut:
    plan = db.execute(select(Plan).where(Plan.id == plan_id)).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    client = db.execute(
        select(Client).where(
            Client.invitation_code == payload.clientId,
        )
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    plan.name = payload.name
    plan.client_id = payload.clientId
    plan.workouts = [item.model_dump() for item in payload.workouts]
    db.commit()
    db.refresh(plan)

    return PlanOut.model_validate(
        {
            "id": plan.id,
            "name": plan.name,
            "clientId": plan.client_id,
            "workouts": plan.workouts,
            "client": ClientOut.model_validate(client),
        }
    )


@router.delete("/api/plans/{plan_id}", tags=["Plans"])
def delete_plan(
    plan_id: str,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    plan = db.execute(select(Plan).where(Plan.id == plan_id)).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully."}
