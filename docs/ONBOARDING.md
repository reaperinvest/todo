# Onboarding Checklist

## Prerequisites
- Node.js 18+ and npm installed
- PostgreSQL running locally
- Git, Postman (desktop), a code editor

## First-Time Setup
- Clone repo and install deps: `npm install`
- Create DB and env file:
  - Create database `todo`
  - Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`
- Ensure schema: `npm -w backend run migrate` (or start backend once)

## Run The Apps
- Start backend: `npm -w backend run dev` → check `http://localhost:4000/api/health`
- Frontend dev watch: `npm -w frontend run dev`
- Or build once then open `frontend/src/index.html`: `npm -w frontend run build`

## Data Source Modes (Frontend)
- Auto (default): tries API, falls back to localStorage
- Force API (browser console):
  - `localStorage.setItem('data-source','api')`
  - `localStorage.setItem('api-base','http://localhost:4000')`
  - `location.reload()`

## Test The API (Postman)
- Import collection: `postman/todo-api.min.postman_collection.json`
- Import env: `postman/local.postman_environment.json` → select "Todo Local"
- Run collection (Runner): Health → List → Create → Update → Delete → Clear

## Daily Dev Workflow
- Run services (backend + frontend)
- Implement change and manually verify
- Run Postman collection (green end-to-end)
- Update docs: edit both `README.md` and `README-TH.md` if behavior/scripts change
- Commit and push

## Quick Commands
- Backend: `npm -w backend run dev`
- Frontend dev: `npm -w frontend run dev`
- Frontend build: `npm -w frontend run build`
- Migrate: `npm -w backend run migrate`

## Troubleshooting
- 500 from API: verify `backend/.env` and DB is reachable
- 404 on PATCH/DELETE: wrong `id` (GET `/api/todos` and copy one)
- Postman import fails: use Raw text import with the minimal collection
- Commit blocked: update both READMEs (pre-commit docs-check)
