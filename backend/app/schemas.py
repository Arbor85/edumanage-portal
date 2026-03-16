from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator

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
    name: str = Field(min_length=1)
    email: str = Field(min_length=1)
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
    reps: int | None = None
    weight: float | None = None
    notes: str | None = None


class RoutineExcercise(BaseModel):
    name: str = Field(min_length=1)
    isBodyweight: bool
    sets: list[RoutineSet]


class RoutineBase(BaseModel):
    name: str = Field(min_length=1)
    notes: str | None = None


class RoutineCreate(RoutineBase):
    excercises: list[RoutineExcercise] = Field(default_factory=list)


class RoutineUpdate(RoutineBase):
    excercises: list[RoutineExcercise]


class RoutineOut(RoutineBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    userId: str | None = Field(default=None, validation_alias="user_id")
    excercises: list[RoutineExcercise]


class PlanWorkout(RoutineOut):
    date: str = Field(min_length=1)


PlanStatus = Literal["Draft", "Published", "Revoked"]


class PlanBase(BaseModel):
    name: str = Field(min_length=1)
    clientId: str = Field(min_length=1)
    notes: str | None = None
    status: PlanStatus = "Draft"


class PlanCreate(PlanBase):
    workouts: list[PlanWorkout] = Field(default_factory=list)


class PlanUpdate(PlanBase):
    workouts: list[PlanWorkout]


class PlanOut(PlanBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    clientId: str = Field(validation_alias="client_id")
    workouts: list[PlanWorkout]
    client: ClientOut | None = None


class PlanStatusUpdate(BaseModel):
    status: PlanStatus


RoutineCompleteMode = Literal["plan", "routine"]


class CompletedRoutineSet(RoutineSet):
    completed: bool = False


class CompletedRoutineExcercise(BaseModel):
    name: str = Field(min_length=1)
    isBodyweight: bool
    sets: list[CompletedRoutineSet]


class CompletedSourceWorkout(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    date: str = Field(min_length=1)


class CompleteRoutineCreate(BaseModel):
    mode: RoutineCompleteMode
    startedAt: str = Field(min_length=1)
    completedAt: str = Field(min_length=1)
    durationSeconds: int = Field(ge=0)
    totalSets: int = Field(ge=0)
    completedSets: int = Field(ge=0)
    excercises: list[CompletedRoutineExcercise] = Field(
        default_factory=list,
        validation_alias=AliasChoices("excercises", "exercises"),
    )
    sourceWorkout: CompletedSourceWorkout

    @field_validator("mode", mode="before")
    @classmethod
    def normalize_mode(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value


class WorkoutHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    currentUserId: str = Field(validation_alias="current_user_id")
    mode: RoutineCompleteMode
    startedAt: str = Field(validation_alias="started_at")
    completedAt: str = Field(validation_alias="completed_at")
    durationSeconds: int = Field(validation_alias="duration_seconds")
    totalSets: int = Field(validation_alias="total_sets")
    completedSets: int = Field(validation_alias="completed_sets")
    excercises: list[CompletedRoutineExcercise]
    sourceWorkout: CompletedSourceWorkout = Field(validation_alias="source_workout")


# --- Meetings ---

class MeetingBase(BaseModel):
    clientId: str = Field(min_length=1)
    startsAt: str = Field(min_length=1)
    price: float = Field(ge=0)

    @field_validator("startsAt")
    @classmethod
    def validate_starts_at(cls, value: str) -> str:
        try:
            date.fromisoformat(value)
        except ValueError:
            raise ValueError("startsAt must be a valid ISO 8601 date (e.g. 2026-03-16)")
        return value


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(MeetingBase):
    pass


class MeetingOut(MeetingBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    clientId: str = Field(validation_alias="client_id")
    startsAt: str = Field(validation_alias="starts_at")
    userId: str | None = Field(default=None, validation_alias="user_id")

    @field_validator("price", mode="before")
    @classmethod
    def coerce_price(cls, value: object) -> float:
        return float(value)  # type: ignore[arg-type]


# --- Courses ---

CourseType = Literal["Individual", "Group"]


class CoursePrice(BaseModel):
    value: float = Field(ge=0)
    currency: str = Field(min_length=1)


class CourseBase(BaseModel):
    name: str = Field(min_length=1)
    type: CourseType
    size: int | None = None
    price: CoursePrice
    description: str | None = None

    @model_validator(mode="after")
    def validate_group_size(self) -> "CourseBase":
        if self.type == "Group":
            if self.size is None or self.size < 2:
                raise ValueError("size must be >= 2 when type is Group")
        return self


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    pass


class CourseOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    userId: str | None = None
    name: str
    type: CourseType
    size: int | None = None
    price: CoursePrice
    description: str | None = None

