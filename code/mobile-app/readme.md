# Resident Mobile App

This folder contains the Expo / React Native resident app starter. It will use the same Express API as the admin dashboard.

## Current Screens

- Resident profile
- Maintenance bills and payment history
- Society notices and events
- Home overview with quick actions
- Resident login with API session
- Complaint and visitor request forms

## Run Locally

```bash
npm install
npm start
```

## Environment Variables

Create a `.env` file with:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

The app automatically uses the `/api/v1` prefix for all API calls.

## API Integration

The app uses `EXPO_PUBLIC_API_URL` for the Express API and keeps a preview mode for UI review without a database. Live bills, notices, complaints, and visitor requests use the resident'"'"'s society and flat scope.

## Next Work

- Payment gateway integration
- Parking workflows
- Push notifications
- Durable session storage
