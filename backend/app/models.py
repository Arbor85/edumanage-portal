from __future__ import annotations

from sqlalchemy import JSON, Column, Integer, String

from .db import Base


class Client(Base):
	__tablename__ = "clients"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(200), nullable=False)
	tags = Column(JSON, nullable=False, default=list)
	image_url = Column(String(1000), nullable=False)
	status = Column(String(50), nullable=False)
	invitation_code = Column(String(100), nullable=False, unique=True, index=True)
	user_id = Column(String(255), nullable=True, index=True)
	current_user_id = Column(Integer, nullable=True, index=True)


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(200), nullable=False)
	email = Column(String(255), nullable=False, unique=True, index=True)
	external_id = Column(String(255), nullable=False, unique=True, index=True)


class Excercise(Base):
	__tablename__ = "excercises"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(255), nullable=False, unique=True, index=True)
	short_description = Column(String(2000), nullable=False)
	primary_muscle = Column(String(255), nullable=False)
	muscles = Column(JSON, nullable=False, default=list)
	tags = Column(JSON, nullable=False, default=list)


class Routine(Base):
	__tablename__ = "routines"

	id = Column(String(100), primary_key=True, index=True)
	name = Column(String(255), nullable=False)
	notes = Column(String, nullable=True)
	user_id = Column(String(255), nullable=True, index=True)
	excercises = Column(JSON, nullable=False, default=list)


class Plan(Base):
	__tablename__ = "plans"

	id = Column(String(100), primary_key=True, index=True)
	name = Column(String(255), nullable=False)
	notes = Column(String, nullable=True)
	status = Column(String(50), nullable=False, default="Draft")
	client_id = Column(String(100), nullable=False, index=True)
	user_id = Column(String(255), nullable=True, index=True)
	workouts = Column(JSON, nullable=False, default=list)


class WorkoutHistory(Base):
	__tablename__ = "workoutHistory"

	id = Column(String(100), primary_key=True, index=True)
	current_user_id = Column(String(255), nullable=False, index=True)
	mode = Column(String(50), nullable=False)
	started_at = Column(String(64), nullable=False)
	completed_at = Column(String(64), nullable=False)
	duration_seconds = Column(Integer, nullable=False)
	total_sets = Column(Integer, nullable=False)
	completed_sets = Column(Integer, nullable=False)
	excercises = Column(JSON, nullable=False, default=list)
	source_workout = Column(JSON, nullable=False, default=dict)
