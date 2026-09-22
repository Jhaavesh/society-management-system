# Resident mobile app

This folder contains the Expo / React Native resident app starter. It will use the same Express API as the admin dashboard.

Current starter screens:

- Resident profile
- Maintenance bills and payment history
- Society notices and events
- Home overview with quick actions
- Resident login with API session
- Complaint and visitor request forms

Run locally:

```bash
npm install
npm start
```

The app uses `EXPO_PUBLIC_API_URL` for the Express API and keeps a preview mode for UI review without a database. Live bills, notices, complaints, and visitor requests use the resident's society and flat scope. Next work is payment gateway integration, parking workflows, push notifications, and durable session storage.
