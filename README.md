# todo
สร้างโปรแกรม จาก Ai CODEX

---

## Todo Monorepo (Frontend + Backend)

This repo is split into two apps using npm workspaces:

- `frontend/`: TypeScript + React Todo app with TailwindCSS (no heavy bundler)
  - React 18 is loaded via CDN in `frontend/src/index.html`.
  - App source is TypeScript: `frontend/src/react-app.ts` and components under `frontend/src/components/`.
  - TypeScript compiles to `frontend/public/build/` and HTML loads `../public/build/react-app.js`.
- `backend/`: Minimal Node HTTP server exposing a stub Todo API (no DB yet)

## Quick start

From the repo root:

- Frontend dev (Tailwind + TypeScript watch):

  ```bash
  npm run dev:frontend
  ```

  Then open `frontend/src/index.html` in your browser (or serve the folder via a static server).
  Note: Ensure the TS watcher has produced `frontend/public/build/react-app.js` (the dev script handles this).

### React + TypeScript frontend

- The page loads React 18 from CDN and mounts the app compiled to `frontend/public/build/react-app.js` (source: `frontend/src/react-app.ts`).
- No bundler required. If you later adopt Vite/Next, you can move components over without changing the repository layer.

- Frontend build once:

  ```bash
  npm run build:frontend
  ```

- Backend dev server:

  ```bash
  npm run dev:backend
  ```

  The API runs on `http://localhost:4000` with routes like:

  - `GET    /api/todos`
  - `POST   /api/todos`        (body: `{ text, priority }`)
  - `PATCH  /api/todos/:id`    (body: partial `{ text?, completed?, priority? }`)
  - `DELETE /api/todos/:id`
  - `DELETE /api/todos?only=completed` (clears completed)

## Notes

- The frontend uses a repository abstraction (`frontend/src/data/repository.ts`) and defaults to `localStorage`. It can switch to the backend API without UI changes (see below).
- The backend is in-memory only. Replace with a real DB later and keep the HTTP contract stable.
- Tailwind outputs to `frontend/public/styles.css`. Run dev/build before opening the HTML.
 - TypeScript outputs to `frontend/public/build/`. The `dev` script watches and emits automatically.

## Switch frontend to use the backend API

By default, the frontend uses `localStorage`. To switch it to the HTTP API:

1) Start the backend: `npm run dev:backend`
2) In the browser devtools console, run:

```js
localStorage.setItem('data-source', 'api');
localStorage.setItem('api-base', 'http://localhost:4000');
location.reload();
```

To switch back to local mode:

```js
localStorage.setItem('data-source', 'local');
location.reload();
```

The UI already handles loading and basic error states for API operations.

## Scripts reference

At repo root (workspace scripts):

- `npm run dev:frontend` ΓÇö runs Tailwind (watch) and TypeScript (watch) in `frontend/`
- `npm run build:frontend` ΓÇö builds CSS + TypeScript once
- `npm run dev:backend` ΓÇö starts the stub API server
- `npm run start:backend` ΓÇö same as above (production-like)

Inside `frontend/` (if you prefer local scripts):

- `npm run dev` ΓÇö same as root `dev:frontend`
- `npm run build` ΓÇö same as root `build:frontend`
- `npm run type-check` ΓÇö TypeScript type checking only


## Contributing

- Documentation: When making functional or structural changes (scripts, setup, structure, endpoints), update both README.md and README-TH.md to keep them consistent.
## Backend database (PostgreSQL)

- The backend now supports PostgreSQL for persistence.
- Configure connection via env vars (either `DATABASE_URL` or discrete `PG*` vars):
  - `DATABASE_URL` (e.g. `postgres://user:pass@localhost:5432/todo`)
  - or: `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` (optional `PGSSL=1`)
- Run the server and it will auto-create the `todos` table if missing.
- Optional migration command: `npm -w backend run migrate`.

Example (Windows PowerShell):

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/todo"; npm -w backend run dev
```

Example (bash):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo npm -w backend run dev
```

### Using .env (recommended)

- Copy `backend/.env.example` to `backend/.env` and fill in your credentials.
- The backend auto-loads `.env` via dotenv, so you can simply run:

```bash
npm -w backend run dev
```


- Pre-commit check: A Husky hook runs a docs check. If code/config changes are staged without updating both READMEs, the commit will fail. Run 
pm install once to enable hooks.

