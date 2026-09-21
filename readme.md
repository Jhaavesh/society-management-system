# SocietyOS

Multi-society management platform based on MERN.

## Current structure

- `backend/`: Node.js + Express + MongoDB API foundation
- `web-admin/`: React + Vite admin dashboard starter
- `mobile-app/`: planned React Native resident app

The backend already exposes protected foundation routes for `/api/auth`, `/api/societies`, `/api/dashboard`, `/api/buildings`, `/api/flats`, `/api/residents`, `/api/maintenance`, `/api/payments`, `/api/complaints`, `/api/notices`, and `/api/visitors`. The web dashboard keeps demo data until a token is present, and `web-admin/src/lib/api.js` is the shared API layer for the next wiring step.

## Local setup

1. Install Node.js 20 or newer and create a MongoDB Atlas database.
2. Copy `.env.example` to `.env`.
3. Fill `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Never commit `.env`.
4. Run `npm install` from this folder.
5. Run `npm run seed` from the `backend` workspace to create the first platform admin and sample society.
6. Run `npm run dev` to start the API and React admin dashboard.

The dashboard opens at `http://localhost:5173` and the API health check is `http://localhost:5000/health`.

## Deployment plan

- React admin: Vercel
- Express API: Render or Railway
- Database: MongoDB Atlas
- Files: Cloudinary when document uploads are added

This project is standalone. It will receive its own API, authentication, billing and resident app features.

## Multi-society security

Every user has society memberships. Protected API routes verify that the requested society belongs to the authenticated user, while the platform admin can manage the portfolio. This prevents one society from reading another society's records.

## GitHub

Owner profile: `https://github.com/Jhaavesh`

Create an empty private repository first. Then this folder can be connected and pushed without putting database passwords or API keys into GitHub.
