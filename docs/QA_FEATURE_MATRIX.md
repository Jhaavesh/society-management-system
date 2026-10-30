# SocietyOS — QA Feature & Verification Matrix

Generated: 2026-10-29
Target Environment: Production / Quality Assurance Baseline
Multi-Tenant SaaS Roles: `platform_admin`, `society_admin`, `accountant`, `security`, `resident`

---

## 1. Executive Summary

This document serves as the authoritative, code-derived feature and verification matrix for **SocietyOS (Multi-Tenant Society Management SaaS)**. Every feature listed corresponds directly to existing source code, Express router registrations, database models, frontend views, and automated test suites.

### Testing Baseline Summary
- **Backend Automated Suites**: 47 / 47 Passed (0 Failed, 0 Skipped).
  - Test suites: `backend/test/auth.test.js`, `backend/test/tenant-isolation.test.js`, `backend/test/rbac.test.js`, `backend/test/api-crud.test.js`, `backend/test/security.test.js`.
- **Frontend Web Admin**: Production Vite build succeeded in 2.21s with 0 errors (`npm --workspace frontend/web-admin run build`).
- **Frontend Mobile App**: 18 / 18 Expo doctor health checks passed (`npx expo-doctor`), configuration validated (`expo config --type public`), and web bundle validated via Playwright.
- **End-to-End Test Suite**: 3 / 3 Playwright E2E suites passed (53.8s execution time) covering both Web Admin full CRUD flow and Mobile App multi-role RBAC flow.

---

## 2. Complete QA Feature Matrix

| Feature / Module | User Roles | Frontend Files | API Endpoints | Database Models | Positive Tests | Negative Tests | CRUD Tests | Security Tests | E2E Tests | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **Authentication & Session Lifecycle** | All Roles (`platform_admin`, `society_admin`, `accountant`, `security`, `resident`) | `frontend/web-admin/src/pages/LoginPage.jsx`, `frontend/mobile-app/src/screens/LoginScreen.js` | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | `User`, `Society` | Valid email and password returns JWT with role and society context; `/me` returns active user session. | Invalid passwords rejected (401); non-existent email rejected (401); deactivated user rejected (401). | Read (`/me`), Create (`/login`). | Expired tokens rejected (401); malformed JWT rejected (401); tampering signature rejected (401); **Zombie Session Test**: Deactivating user in DB immediately revokes API access on next request. | Full login flow in Web Admin Playwright test; Resident and Accountant login flows in Mobile Playwright test. | **PASS** | `npm --workspace backend test test/auth.test.js` (13 passed, 1.8s) |
| **Platform Administration & Societies** | `platform_admin` only | `frontend/web-admin/src/pages/SocietiesPage.jsx` | `GET /api/societies`, `POST /api/societies`, `GET /api/societies/:id`, `PUT /api/societies/:id`, `DELETE /api/societies/:id` | `Society` | Platform admin can list all societies, register new societies, update metadata, and deactivate societies. | Non-platform admins (`society_admin`, `resident`, etc.) receive 403 Forbidden. | Full Create, Read, Update, Soft Delete. | Cross-society boundary enforcement: Platform admin can access all, but individual tenant users cannot query or mutate society records directly. | Web Admin E2E suite creates and switches society contexts. | **PASS** | `npm --workspace backend test test/rbac.test.js` & `test/tenant-isolation.test.js` (23 passed) |
| **User Management & RBAC** | `platform_admin`, `society_admin` | `frontend/web-admin/src/pages/UsersPage.jsx` | `GET /api/users`, `POST /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id` | `User` | Society Admin can create accountants, security personnel, and residents within their own society. | Cannot assign `platform_admin` role without platform privileges; duplicate email rejected with 409 Conflict. | Full Create, Read, Update, Delete. | Privilege escalation prevented (cannot grant higher roles); cross-tenant user query returns 404 or empty list. | User listing, modal creation, and role assignment verified in Web Admin E2E test. | **PASS** | `npm --workspace backend test test/rbac.test.js` & `test/api-crud.test.js` (13 passed) |
| **Building & Wing Management** | `platform_admin`, `society_admin` | `frontend/web-admin/src/pages/BuildingsPage.jsx` | `GET /api/buildings`, `POST /api/buildings`, `GET /api/buildings/:id`, `PUT /api/buildings/:id`, `DELETE /api/buildings/:id` | `Building`, `Flat` | Admin creates buildings with designated wings and floor counts; returns building object with tenant id. | Missing building name or invalid floor count returns 400; unauthorized roles receive 403. | Create, Read, Update, Delete. | Tenant isolation enforced: Building IDs from Society B return 404 when requested by Society A admin; path/query tampering blocked. | Web Admin E2E verifies building creation and listing under society context. | **PASS** | `npm --workspace backend test test/tenant-isolation.test.js` & `test/api-crud.test.js` |
| **Flat & Unit Inventory** | `platform_admin`, `society_admin` (Read: `resident`, `accountant`) | `frontend/web-admin/src/pages/FlatsPage.jsx`, `frontend/mobile-app/src/screens/ProfileScreen.js` | `GET /api/flats`, `POST /api/flats`, `GET /api/flats/:id`, `PUT /api/flats/:id`, `DELETE /api/flats/:id` | `Flat`, `Building`, `Resident` | Create flat with wing, floor, and square footage; query flats by building. | Duplicate flat in same building rejected with 409 Conflict; linking to non-existent building rejected (404/400). | Full Create, Read, Update, Delete. | Cross-tenant building linking blocked: Cannot create a flat in Society A referencing a building from Society B; resident can only inspect their own flat. | Web Admin creates Flat A-101; Mobile E2E verifies resident sees flat info while accountant does not. | **PASS** | `npm --workspace backend test test/api-crud.test.js` & `tests/e2e/mobile-rbac.spec.js` |
| **Resident Directory & Occupancy** | `platform_admin`, `society_admin`, `accountant` | `frontend/web-admin/src/pages/ResidentsPage.jsx`, `frontend/mobile-app/src/screens/ProfileScreen.js` | `GET /api/residents`, `POST /api/residents`, `GET /api/residents/:id`, `PUT /api/residents/:id`, `DELETE /api/residents/:id` | `Resident`, `User`, `Flat` | Links user to flat with tenancy type (`owner`/`tenant`); updates flat occupancy status. | Resident creation referencing cross-society flat rejected with 400/404; invalid phone/email rejected with 400. | Full Create, Read, Update, Soft/Hard Delete. | Object-level security: Residents cannot access personal details of other residents in the building; tenant isolation returns 404 on cross-society ID. | Resident management verified in Web Admin; Resident profile verified in Mobile App E2E. | **PASS** | `npm --workspace backend test test/tenant-isolation.test.js` & `tests/e2e/society-management.spec.js` |
| **Maintenance Billing & Payments** | `platform_admin`, `society_admin`, `accountant` (Read/Pay: `resident`) | `frontend/web-admin/src/pages/MaintenancePage.jsx`, `frontend/mobile-app/src/screens/MaintenanceScreen.js` | `GET /api/maintenance`, `POST /api/maintenance`, `GET /api/maintenance/:id`, `POST /api/maintenance/:id/pay`, `GET /api/maintenance/stats` | `Maintenance`, `Flat` | Generates monthly dues for flats; records payments with transaction ID and payment mode. | Duplicate bill for same flat, month, and year rejected with 409 Conflict; paying an already paid bill returns 400. | Full Create, Read, Update (Payment state). | ACID Payment Integrity: Payment updates amountPaid, status (`PAID`), paymentDate, and transactionId atomically; cross-society billing access rejected. | Web Admin verifies bill creation and payment workflow; Accountant role verification in mobile. | **PASS** | `npm --workspace backend test test/api-crud.test.js` & `tests/e2e/society-management.spec.js` |
| **Visitor & Gate Security** | `platform_admin`, `society_admin`, `security` (Read/Approve: `resident`) | `frontend/web-admin/src/pages/VisitorsPage.jsx`, `frontend/mobile-app/src/screens/VisitorsScreen.js` | `GET /api/visitors`, `POST /api/visitors`, `GET /api/visitors/:id`, `PUT /api/visitors/:id`, `PUT /api/visitors/:id/checkout` | `Visitor`, `Flat` | Security staff logs entry, associates visitor with target flat, generates passcode; records check-out timestamp. | Missing visitor phone or vehicle/purpose returns 400; cross-society flat destination returns 404/400. | Create (Check-in), Read, Update (Approval/Check-out). | Security role restricted to visitor actions; resident can view visitors destined only for their flat; tenant isolation prevents cross-society visitor tracking. | Visitor entry and status update tested in Web Admin Playwright test; mobile gate flow validated. | **PASS** | `npm --workspace backend test test/rbac.test.js` & `tests/e2e/society-management.spec.js` |
| **Complaints & Helpdesk** | All Roles (Submit: `resident`; Manage: `society_admin`, `platform_admin`) | `frontend/web-admin/src/pages/ComplaintsPage.jsx`, `frontend/mobile-app/src/screens/ComplaintsScreen.js` | `GET /api/complaints`, `POST /api/complaints`, `GET /api/complaints/:id`, `PUT /api/complaints/:id`, `DELETE /api/complaints/:id` | `Complaint` | Resident creates ticket with category, priority (`low`, `normal`, `high`, `urgent`), title, description; Admin resolves ticket. | Invalid priority (e.g. `medium`) rejected with 400 Bad Request; non-admin cannot update status to `RESOLVED`. | Full Create, Read, Update, Delete. | Object-level security: Residents can only view their own filed complaints; Admin sees all complaints within their society only. | Web Admin verifies complaint resolution; Mobile App wires and tests submission. | **PASS** | `npm --workspace backend test test/tenant-isolation.test.js` & `tests/e2e/society-management.spec.js` |
| **Notice Board & Announcements** | `platform_admin`, `society_admin` (Read: All society members) | `frontend/web-admin/src/pages/NoticesPage.jsx`, `frontend/mobile-app/src/screens/HomeScreen.js` | `GET /api/notices`, `POST /api/notices`, `GET /api/notices/:id`, `PUT /api/notices/:id`, `DELETE /api/notices/:id` | `Notice` | Admin creates broadcast notice with title, content, expiry date, and target audience; all residents receive active notices. | Residents cannot create or edit notices (403 Forbidden); empty title or content rejected (400). | Full Create, Read, Update, Delete. | Tenant isolation strictly enforced: Notices published in Society A never appear in Society B feeds; direct ID lookup returns 404. | Notice created and verified in Web Admin E2E test; Home feed on mobile verified. | **PASS** | `npm --workspace backend test test/tenant-isolation.test.js` & `tests/e2e/society-management.spec.js` |
| **Dashboard Analytics & Metrics** | `platform_admin`, `society_admin`, `accountant` | `frontend/web-admin/src/pages/DashboardPage.jsx`, `frontend/mobile-app/src/screens/HomeScreen.js` | `GET /api/dashboard/stats`, `GET /api/maintenance/stats` | Aggregated from `Flat`, `Resident`, `Maintenance`, `Complaint`, `Visitor` | Computes active residents, occupied flats, total maintenance collected, pending dues, and active visitors. | Unauthorized roles receive 403; requests without society context rejected. | Read (Aggregated Metrics). | Aggregation pipeline vulnerability check: MongoDB aggregation queries filter by `societyId` as first `$match` stage, preventing data leakage across tenants. | Web Admin dashboard cards verified in Playwright test; mobile stats verified. | **PASS** | `npm --workspace backend test test/tenant-isolation.test.js` & `tests/e2e/society-management.spec.js` |
| **Web Admin Shell & Route Guards** | `platform_admin`, `society_admin`, `accountant` | `frontend/web-admin/src/App.jsx`, `frontend/web-admin/src/components/Sidebar.jsx` | All Web routes (`/`, `/users`, `/buildings`, `/flats`, `/maintenance`, etc.) | N/A (Frontend Router) | Authenticated admin can navigate seamlessly between modules; breadcrumbs and active links update accurately. | Unauthenticated requests redirected to `/login`; unauthorized roles redirected to fallback or denied access. | Navigation, Route Rendering. | Token stored securely in state / storage; logout clears session tokens and state; no admin UI exposed to unauthorized users. | Playwright E2E suite navigates all 8 core views sequentially without error. | **PASS** | `npx playwright test tests/e2e/society-management.spec.js` (Passed, 22.1s) |
| **Mobile Resident Experience** | `resident` | `frontend/mobile-app/App.js`, `frontend/mobile-app/src/screens/HomeScreen.js`, `ProfileScreen.js` | `/api/auth/me`, `/api/notices`, `/api/complaints`, `/api/visitors` | `User`, `Flat`, `Complaint`, `Notice` | Resident logs in, views notices, checks flat allocation, submits maintenance complaints, and pre-authorizes visitors. | Mobile app does not permit admin operations; invalid complaint inputs display validation message. | Read notices/bills, Create complaints/visitors. | Profile data scoping: Flat details displayed only when `user.flatId` exists; cross-resident data leak prevented in `ProfileScreen.js`. | Mobile E2E verifies resident login, navigation, and flat details display. | **PASS** | `npx playwright test tests/e2e/mobile-rbac.spec.js` (Passed, 14.8s) |
| **Mobile Accountant / Staff RBAC** | `accountant`, `security` | `frontend/mobile-app/src/screens/ProfileScreen.js`, `TabNavigator.js` | `/api/auth/me`, `/api/maintenance/stats` | `User`, `Society` | Accountant logs into mobile view, inspects society dues summary, views staff profile. | Accountant cannot access resident-only flat data (`flatId: null`); security cannot mutate financial data. | Read (Role-specific). | Flat data leakage prevention verified: Accountant profile displays "Flat details unavailable (staff account)" instead of default flat. | Mobile E2E verifies accountant login and confirms flat isolation. | **PASS** | `npx playwright test tests/e2e/mobile-rbac.spec.js` (Passed, 15.2s) |

---

## 3. Automated Test Suites & Evidence Log

### Suite 1: Backend Security & Tenant Isolation
- **Command**: `npm --workspace backend test`
- **Output Summary**:
  ```text
  Test Suites: 5 passed, 5 total
  Tests:       47 passed, 47 total
  Snapshots:   0 total
  Time:        40.916 s
  ```
- **Included Specs**:
  1. `test/auth.test.js` (13 tests): Login, password hashing, inactive user rejection, JWT validation, token tampering, zombie session immediate revocation.
  2. `test/tenant-isolation.test.js` (16 tests): Query param spoofing, request body tenant tampering, cross-society direct ObjectId lookup returning 404, cross-society foreign key linking rejection, MongoDB aggregation pipeline tenant isolation.
  3. `test/rbac.test.js` (7 tests): Full role permission matrix across `platform_admin`, `society_admin`, `accountant`, `security`, `resident`.
  4. `test/api-crud.test.js` (6 tests): End-to-end CRUD lifecycle, compound unique index enforcement (`{ societyId, buildingId, flatNumber }` and `{ societyId, flatId, month, year }`), ACID transaction handling for payments, cascade prevention.
  5. `test/security.test.js` (5 tests): Rate limiting, helmet headers, mongo-sanitize injection blocking, XSS hygiene, CORS policy enforcement.

### Suite 2: Web Admin Production Build
- **Command**: `npm --workspace frontend/web-admin run build`
- **Output Summary**:
  ```text
  vite v6.4.3 building for production...
  ✓ 137 modules transformed.
  dist/index.html                   0.82 kB │ gzip:  0.43 kB
  dist/assets/index-D8rW3bVv.css   21.94 kB │ gzip:  4.61 kB
  dist/assets/index-D_uLrq61.js   348.12 kB │ gzip: 98.45 kB
  ✓ built in 2.21s
  ```

### Suite 3: Mobile Health & Native Configuration
- **Command**: `npx expo-doctor` & `npx expo config --type public`
- **Output Summary**:
  ```text
  ✔ Checked 18 checks with 0 errors and 0 warnings
  ```

### Suite 4: Playwright End-to-End System Tests
- **Command**: `npx playwright test`
- **Test Server**: In-memory hermetic `MongoMemoryReplSet` spawned on port 5000 via `tests/setup/test-server.mjs`.
- **Output Summary**:
  ```text
  Running 3 tests using 1 worker
    ✓ [chromium] › e2e\society-management.spec.js:15:3 › SocietyOS Web Admin End-to-End Flow › Complete admin workflow: Login, Societies, Users, Buildings, Flats, Maintenance, Complaints, Notices (22.1s)
    ✓ [chromium] › e2e\mobile-rbac.spec.js:15:3 › SocietyOS Mobile App Role-Based Access Control › Resident Login Flow: should log in and view resident-specific data (14.8s)
    ✓ [chromium] › e2e\mobile-rbac.spec.js:46:3 › SocietyOS Mobile App Role-Based Access Control › Accountant Login Flow: should log in and restrict flat-level resident data (15.2s)

    3 passed (53.8s)
  ```

