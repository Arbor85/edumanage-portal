from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.auth import get_current_token_claims, get_current_user_id
from ..core.dependencies import get_db
from ..models import Course
from ..schemas import CourseCreate, CourseOut, CourseUpdate

router = APIRouter()


def _course_out(course: Course) -> CourseOut:
    return CourseOut.model_validate(
        {
            "id": course.id,
            "userId": course.user_id,
            "name": course.name,
            "type": course.type,
            "size": course.size,
            "price": {"value": float(course.price_value), "currency": course.price_currency},
            "description": course.description,
        }
    )


@router.get("/api/courses", response_model=list[CourseOut], tags=["Courses"])
def list_courses(
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> list[CourseOut]:
    user_id = get_current_user_id(claims)
    courses = (
        db.execute(
            select(Course).where(Course.user_id == user_id).order_by(Course.name.asc())
        )
        .scalars()
        .all()
    )
    return [_course_out(c) for c in courses]


@router.post("/api/courses", response_model=CourseOut, status_code=201, tags=["Courses"])
def add_course(
    payload: CourseCreate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> CourseOut:
    user_id = get_current_user_id(claims)
    course = Course(
        id=str(uuid4()),
        user_id=user_id,
        name=payload.name,
        type=payload.type,
        size=payload.size,
        price_value=str(payload.price.value),
        price_currency=payload.price.currency,
        description=payload.description,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return _course_out(course)


@router.put("/api/courses/{course_id}", response_model=CourseOut, tags=["Courses"])
def update_course(
    course_id: str,
    payload: CourseUpdate,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> CourseOut:
    user_id = get_current_user_id(claims)
    course = db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == user_id)
    ).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    course.name = payload.name
    course.type = payload.type
    course.size = payload.size
    course.price_value = str(payload.price.value)
    course.price_currency = payload.price.currency
    course.description = payload.description
    db.commit()
    db.refresh(course)
    return _course_out(course)


@router.delete("/api/courses/{course_id}", tags=["Courses"])
def delete_course(
    course_id: str,
    claims: dict[str, object] = Depends(get_current_token_claims),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user_id = get_current_user_id(claims)
    course = db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == user_id)
    ).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully."}
