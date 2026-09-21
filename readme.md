# SocietyOS

Multi-society management platform based on MERN.

## Current structure

- `backend/`: Node.js + Express + MongoDB API foundation
- `web-admin/`: React + Vite admin dashboard starter
- `mobile-app/`: Expo/React Native resident app starter

Product behavior and the mobile-first requirement are documented in `PRODUCT_REQUIREMENTS.md`.

The backend already exposes protected foundation routes for `/api/auth`, `/api/societies`, `/api/dashboard`, `/api/buildings`, `/api/flats`, `/api/residents`, `/api/maintenance`, `/api/payments`, `/api/complaints`, `/api/notices`, and `/api/visitors`. The web dashboard has an admin login screen, keeps demo data available through preview mode, and loads society/dashboard data from the API when a token is present. `web-admin/src/lib/api.js` is the shared API layer.

## Local setup

1. Install Node.js 20 or newer and create a MongoDB Atlas database.
2. Copy `.env.example` to `.env`.
3. Fill `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Never commit `.env`.
4. Run `npm install` from this folder.
5. Run `npm run seed` from the `backend` workspace to create the first platform admin and sample society.
6. Run `npm run dev` to start the API and React admin dashboard.

The dashboard opens at `http://localhost:5173` and the API health check is `http://localhost:5000/health`.

The resident starter runs with `npm install` and `npm start` from `mobile-app/`. It currently includes Home, Bills, Notices, and Profile tabs with touch-friendly cards sized for mobile screens. It uses demo content until the shared API authentication flow is connected.

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

The working repository is `https://github.com/Jhaavesh/society-management-system`. Keep secrets in environment variables; never commit `.env` files or production credentials.
