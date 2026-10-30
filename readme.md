# SocietyOS

Multi-tenant society management platform based on the MERN stack and Expo React Native.

## Project Structure

- `backend/`: Node.js + Express + MongoDB REST API with strict tenant isolation and role-based access control.
- `frontend/web-admin/`: React + Vite admin dashboard for platform super-admins, society admins, and accountants.
- `frontend/mobile-app/`: Expo / React Native mobile application for residents, security gate staff, and accountants.
- `tests/`: End-to-end Playwright tests and hermetic test runners.
- `docs/`: Comprehensive QA feature matrix and release audit documentation.

Product behavior and requirements are documented in `PRODUCT_REQUIREMENTS.md`.

---

## Verification & Automated Testing

### 1. Backend Automated Tests (Jest + In-Memory MongoDB)
Run the complete backend test suite covering Authentication, Tenant Isolation, RBAC Matrix, CRUD Validation, and Security Headers:
```bash
npm --workspace backend test
```
*Current Baseline: 47 passed out of 47 tests (0 failures).*

### 2. Frontend Web Admin Build
Validate the production Vite bundle:
```bash
npm --workspace frontend/web-admin run build
```

### 3. Mobile Health & Diagnostics
Check the Expo project configuration:
```bash
npx expo-doctor
```

### 4. End-to-End System Tests (Playwright)
Spins up a hermetic in-memory MongoDB replica set, seeds sample societies and multi-role users, boots the Express API, serves the Web Admin portal and Expo Web, and runs automated browser tests:
```bash
npx playwright test
```
*Current Baseline: 3 passed out of 3 E2E test suites.*

---

## Documentation

- **QA Feature Matrix**: [`docs/QA_FEATURE_MATRIX.md`](docs/QA_FEATURE_MATRIX.md)
- **Final Release Audit**: [`docs/FINAL_RELEASE_AUDIT.md`](docs/FINAL_RELEASE_AUDIT.md)

---

## Local Setup

1. Install Node.js 20 or newer.
2. Copy `backend/.env.example` to `backend/.env`.
3. Fill `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Never commit `.env`.
4. Run `npm install` from the repository root.
5. Run `npm run seed` from the `backend` workspace to create the initial platform admin and sample society.
6. Run `npm run dev` from the repository root to start both the Express API (port 5000) and Web Admin (port 5173).

The Web Admin opens at `http://localhost:5173` and the API health check is available at `http://localhost:5000/health`.

### Mobile Application
To start the Expo development server:
```bash
cd frontend/mobile-app
npx expo start
```
For native Android builds using EAS:
```bash
cd frontend/mobile-app
npx eas-cli build --platform android --profile preview
```

---

## Multi-Tenant Security Architecture

- **Single-Society Tenancy**: Every non-platform user belongs strictly to one society.
- **Role Hierarchy**:
  - `platform_admin`: Cross-society platform management, society provisioning, and system auditing.
  - `society_admin`: Full management scoped strictly to their assigned society.
  - `accountant`: Financial dues, maintenance billing, and payment tracking.
  - `security`: Gate visitor check-in, verification, and passcodes.
  - `resident`: Scoped to personal flat data, society notices, and helpdesk complaints.
- **Tenant Isolation**: Backend middleware and queries strictly scope all queries and mutations to `req.user.societyId`, returning `404 Not Found` for any cross-tenant resource enumeration.
- **Zombie Session Revocation**: Every authenticated request validates active status in the database, immediately terminating deactivated user sessions.

---

## GitHub Repository

Repository: [https://github.com/Jhaavesh/society-management-system](https://github.com/Jhaavesh/society-management-system)  
Owner: [Jhaavesh](https://github.com/Jhaavesh)
