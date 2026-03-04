from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models import Excercise
from ..schemas import ExcerciseOut
from ..core.dependencies import get_db

router = APIRouter()

@router.get("/api/excercises", response_model=list[ExcerciseOut], tags=["Excercises"])
def list_excercises(db: Session = Depends(get_db)) -> list[ExcerciseOut]:
    excercises = db.execute(select(Excercise).order_by(Excercise.name.asc())).scalars().all()
    return [ExcerciseOut.model_validate(excercise) for excercise in excercises]
