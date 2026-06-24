# Bookly

React/Vite frontend + Express/Prisma/PostgreSQL backend.

## Local run

1. Copy `server/.env.example` to `server/.env` and place your Render **External Database URL** there.
2. In `server`: `npm install`, `npx prisma db push`, `npx prisma generate`, `npm run seed`, `npm run dev`.
3. In the project root: `npm install`, `npm run dev`.

## Deployment on Render

Create a Web Service with Root Directory `server` and a Static Site from the repository root. Configure variables documented in `.env.example`; do not commit real secrets.
