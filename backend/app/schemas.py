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
    userId: str | None = Field(default=None, validation_alias="user_id")
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


class ExcerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str
    shortDescription: str = Field(validation_alias="short_description")
    primaryMuscle: str = Field(validation_alias="primary_muscle")
    muscles: list[dict[str, object]]
    tags: list[str]


RoutineSetType = Literal["warmup", "normal", "fail"]


class RoutineSet(BaseModel):
    type: RoutineSetType
    reps: int | None
    weight: float | None


class RoutineExcercise(BaseModel):
    name: str = Field(min_length=1)
    isBodyweight: bool
    sets: list[RoutineSet]


class RoutineBase(BaseModel):
    name: str = Field(min_length=1)


class RoutineCreate(RoutineBase):
    pass


class RoutineUpdate(RoutineBase):
    excercises: list[RoutineExcercise]


class RoutineOut(RoutineBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    userId: str | None = Field(default=None, validation_alias="user_id")
    excercises: list[RoutineExcercise]
