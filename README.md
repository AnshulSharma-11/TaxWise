# TaxWise

A full-stack Indian income-tax planner: compare the old vs. new tax regime side by
side, save your calculations, and track them over time.

- **Full project context / architecture**: see [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
  — hand this file to any AI assistant (or a new teammate) to get complete context
  on the codebase in one read.
- **Backend**: `backend/taxwisebe` — Spring Boot 4 / Java 26 / MySQL / JWT auth.
- **Frontend**: `frontend/taxwise` — React 19 / Vite / React Query.

## Quick start

**Backend**
```bash
cd backend/taxwisebe
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`. Needs a local MySQL server (or set `DB_URL` env var).

**Frontend**
```bash
cd frontend/taxwise
npm install
npm run dev
```
Runs on `http://localhost:5173`, expects the API at `http://localhost:8080/api`
(see `.env.example`).

For everything else — data model, API reference, design system, known gaps — see
[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).
