# Backend API

FastAPI service for the Alpaki Planner fitness features.

## Requirements

- Python 3.10+ recommended

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

API base URL: `http://127.0.0.1:8000`

## API Documentation

- **Swagger UI**: `http://127.0.0.1:8000/docs` - Interactive API explorer with request/response examples
- **Redoc**: `http://127.0.0.1:8000/redoc` - Alternative API documentation view
- **OpenAPI JSON**: `http://127.0.0.1:8000/openapi.json` - Machine-readable OpenAPI specification

## Endpoints

### Workout History
- `GET /api/history?page=1&page_size=20` - Get paginated workout history
- `POST /api/history` - Create a new workout history entry

### Training Plans
- `GET /api/training-plans` - Get all training plans
- `GET /api/training-plans/{plan_id}` - Get a specific training plan
- `POST /api/training-plans` - Create a new training plan
- `PUT /api/training-plans/{plan_id}` - Update an existing training plan
- `DELETE /api/training-plans/{plan_id}` - Delete a training plan

## Database

Default database is SQLite at `backend/app.db`.

Override with:

```bash
set DATABASE_URL=sqlite:///./app.db
```

## Notes

- Tables are created automatically on startup.
- All endpoints with request bodies are documented in Swagger UI with schema validation
- Endpoints are organized by tags for easier navigation in Swagger
- Workout history is seeded on startup when the `workout_history` table is empty.
  - Seed data is read from `components/pages/fitnes/data/workouts.csv`.
  - To re-seed, delete `backend/app.db` (or clear the table) and restart the API.
