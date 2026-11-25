# Twitter

Twitter is a full-stack social media application for sharing short posts, replies, follows, profiles, searches, and trending campus topics.

## Stack

- React, React Router, SweetAlert2, Lucide
- Node.js, Express, Socket.IO
- MongoDB and Mongoose
- JWT access/refresh authentication with HTTP-only refresh cookies

## Setup

1. Install MongoDB locally or provide a MongoDB Atlas connection string.
2. Copy `backend/.env.example` to `backend/.env` and set real secrets.
3. Install dependencies:

   ```bash
   npm run install:all
   ```

4. Seed the demo data:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev:backend
   ```

6. Start the web app in another terminal:

   ```bash
   npm run dev:frontend
   ```

Open `http://localhost:5173`.

## Demo accounts

After seeding:

- Admin: `aarav@twitter.test` / `Password123!`
- User: `maya@twitter.test` / `Password123!`

## Deploy to Render and Vercel

### Render API

1. In Render, create a **Blueprint** from this GitHub repository. Render will use `render.yaml` to create the API web service.
2. Set the required environment variables for the service:
   - `MONGODB_URI`: your MongoDB Atlas connection string.
   - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: separate, long, randomly generated secrets.
   - `CLIENT_URL`: the exact Vercel production origin, for example `https://your-twitter.vercel.app` (no trailing slash). Separate multiple allowed origins with commas.
3. Deploy and confirm `https://<your-render-service>.onrender.com/api/health` returns `{"ok":true}`.

### Vercel frontend

1. Import the same GitHub repository into Vercel and set **Root Directory** to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Deploy the frontend. `frontend/vercel.json` proxies `/api/*` requests to the Render API, so no `VITE_API_URL` variable is needed on Vercel.

The Vercel rewrite also supports client-side routes such as profile and hashtag pages. The app uses a same-origin API proxy in production, keeping refresh cookies on the Vercel site and avoiding browser CORS issues.

## Production notes

- Never put MongoDB credentials or JWT secrets in frontend environment variables or commit them to Git.
- Rotate any credentials that have been shared, and use distinct random JWT secrets in Render.
- Configure Atlas Network Access to allow Render's outbound connections. For production, prefer an appropriate fixed egress/IP strategy over opening access broadly.
- Run `npm run seed` only when intentionally initializing demo data; the seed script clears existing collections.
