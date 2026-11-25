# Chirp

Chirp is a full-stack social media application for sharing short posts, replies, follows, profiles, searches, and trending campus topics.

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

- Admin: `aarav@chirp.test` / `Password123!`
- User: `maya@chirp.test` / `Password123!`

## Production notes

- Replace development JWT secrets with cryptographically random values.
- Set `NODE_ENV=production` and configure HTTPS before deploying.
- Set `VITE_API_URL` to the deployed API URL.
- Configure MongoDB indexes and backups in the deployment environment.
