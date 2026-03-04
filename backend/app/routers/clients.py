from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models import Client, User
from ..schemas import ClientCreate, ClientOut, ClientUpdate, AcceptClientInvitationRequest
from ..core.auth import get_current_token_claims, get_current_user_id
from ..core.dependencies import get_db

router = APIRouter()

@router.get("/api/clients", response_model=list[ClientOut], tags=["Clients"])
def list_clients(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[ClientOut]:
    user_id = get_current_user_id(claims)
    clients = db.execute(
        select(Client).where(Client.user_id == user_id).order_by(Client.id.desc())
    ).scalars().all()
    return [ClientOut.model_validate(client) for client in clients]

@router.post("/api/clients", response_model=ClientOut, status_code=201, tags=["Clients"])
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
    
    # If 'Group' tag is selected, set status to 'Active' by default
    status = payload.status
    if payload.tags and 'Group' in payload.tags and status != 'Suspended':
        status = 'Active'
    
    client = Client(
        name=payload.name,
        tags=payload.tags,
        image_url=payload.imageUrl,
        status=status,
        invitation_code=payload.invitationCode,
        user_id=user_id,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)

@router.put("/api/clients/{invitation_code}", response_model=ClientOut, tags=["Clients"])
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
    
    # If 'Group' tag is selected, set status to 'Active' by default
    status = payload.status
    if payload.tags and 'Group' in payload.tags and status != 'Suspended':
        status = 'Active'
    client.status = status
    
    client.invitation_code = payload.invitationCode
    db.commit()
    db.refresh(client)
    return ClientOut.model_validate(client)

@router.delete("/api/clients/{invitation_code}", tags=["Clients"])
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

@router.post("/api/clients/{invitation_code}/accept", response_model=ClientOut, tags=["Clients"])
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

