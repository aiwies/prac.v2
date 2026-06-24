# Deploy to Render

## 1. Database schema and seed (one time, locally)

Create `server/.env` from `server/.env.example`. Paste the **External Database URL** from your Render PostgreSQL database, then run:

```powershell
cd server
npm install
npx prisma db push
npx prisma generate
npm run seed
npm run dev
```

`db push` applies the table structure. `seed` creates the four catalog cards plus the two demo accounts:

- admin@bookly.ru / admin123
- owner@bookly.ru / owner123

## 2. Backend Web Service

Render → New → Web Service → connect the same GitHub repository.

- Root Directory: `server`
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm run start`
- Region: Oregon (the same region as `booking-db`)

Environment variables:

- `DATABASE_URL`: use **Internal Database URL** from `booking-db`
- `JWT_SECRET`: a long random value
- `CLIENT_URL`: URL of the deployed Static Site
- `PORT`: `10000` (Render also supplies a port automatically; this value is safe)

After the first deploy, open the service URL and append `/api/health`. Expected response: `{"status":"ok","database":"connected"}`.

## 3. Frontend Static Site

Render → New → Static Site → same GitHub repository.

- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Environment variable:

- `VITE_API_URL`: URL of the Web Service, for example `https://bookly-api.onrender.com`

Redeploy the Static Site after adding `VITE_API_URL` because Vite embeds it during build.
