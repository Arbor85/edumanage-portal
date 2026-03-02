from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ClientTag = Literal[
    "Online",
    "Inperson",
    "Group",
    "Female",
    "Male",
    "Gym",
    "Mix",
    "CrossFit",
]

ClientStatus = Literal["Active", "Suspended", "Pending"]


class ClientBase(BaseModel):
    name: str
    tags: list[ClientTag]
    imageUrl: str = Field(min_length=1)
    status: ClientStatus
    invitationCode: str = Field(min_length=1)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    pass


class ClientOut(ClientBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    imageUrl: str = Field(validation_alias="image_url")
    invitationCode: str = Field(validation_alias="invitation_code")
    currentUserId: int | None = Field(default=None, validation_alias="current_user_id")


class UserBase(BaseModel):
    name: str
    email: str
    externalId: str = Field(min_length=1)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    externalId: str = Field(validation_alias="external_id")


class AcceptClientInvitationRequest(BaseModel):
    imageUrl: str = Field(min_length=1)
