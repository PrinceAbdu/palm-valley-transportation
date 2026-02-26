# Standalone Backend (Express + MongoDB)

This folder is a **separate Node.js backend**. It does **not** replace your Next.js `app/api/` routes.

## Run locally

1) Create an env file:
- Copy `backend/env.example` to `backend/.env` and fill values.

2) Start Mongo (optional helper):

```bash
cd backend
docker compose up -d
```

3) Install + run:

```bash
cd backend
npm install
npm run dev
```

> Important: don’t run `node src/server.ts`. That will fail because it’s TypeScript + ES imports.
> Use `npm run dev` (runs TS directly) or `npm run build && npm start` (runs compiled JS from `dist/`).

Backend will start on `PORT` (default `4000`).

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me` (requires `Authorization: Bearer <token>`)

