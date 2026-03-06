from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.auth import get_current_token_claims, get_current_user_id
from ..core.dependencies import get_db
from ..models import Client, Plan
from ..schemas import ClientOut, PlanCreate, PlanOut, PlanUpdate

router = APIRouter()


@router.get("/api/plans", response_model=list[PlanOut], tags=["Plans"])
def list_plans(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[PlanOut]:
    user_id = get_current_user_id(claims)
    plans = db.execute(
        select(Plan).where(Plan.user_id == user_id).order_by(Plan.name.asc())
    ).scalars().all()

    client_ids = {plan.client_id for plan in plans}
    clients = (
        db.execute(
            select(Client).where(
                Client.user_id == user_id,
                Client.invitation_code.in_(client_ids),
            )
        )
        .scalars()
        .all()
        if client_ids
        else []
    )
    clients_by_invitation_code = {client.invitation_code: client for client in clients}

    return [
        PlanOut.model_validate(
            {
                "id": plan.id,
                "name": plan.name,
                "clientId": plan.client_id,
                "workouts": plan.workouts,
                "client": (
                    ClientOut.model_validate(clients_by_invitation_code[plan.client_id])
                    if plan.client_id in clients_by_invitation_code
                    else None
                ),
            }
        )
        for plan in plans
    ]


@router.get("/api/plans/{plan_id}", response_model=PlanOut, tags=["Plans"])
def get_plan(
    plan_id: str,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> PlanOut:
    user_id = get_current_user_id(claims)
    plan = db.execute(
        select(Plan).where(Plan.id == plan_id, Plan.user_id == user_id)
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    client = db.execute(
        select(Client).where(
            Client.user_id == user_id,
            Client.invitation_code == plan.client_id,
        )
    ).scalar_one_or_none()

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
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> PlanOut:
    user_id = get_current_user_id(claims)
    client = db.execute(
        select(Client).where(
            Client.user_id == user_id,
            Client.invitation_code == payload.clientId,
        )
    ).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    plan = Plan(
        id=str(uuid4()),
        name=payload.name,
        client_id=payload.clientId,
        user_id=user_id,
        workouts=[item.model_dump() for item in payload.workouts],
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
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> PlanOut:
    user_id = get_current_user_id(claims)
    plan = db.execute(
        select(Plan).where(Plan.id == plan_id, Plan.user_id == user_id)
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    client = db.execute(
        select(Client).where(
            Client.user_id == user_id,
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
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user_id = get_current_user_id(claims)
    plan = db.execute(
        select(Plan).where(Plan.id == plan_id, Plan.user_id == user_id)
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully."}
