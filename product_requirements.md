# SocietyOS product requirements

## Product direction

SocietyOS is a multi-society platform. One platform admin can onboard many societies, while each society admin, resident, accountant, and security guard can only access the records allowed by their membership.

## Mobile-first requirement

Mobile usability is a release requirement, not a later enhancement.

- Every admin screen must work at 320px width without horizontal scrolling.
- Primary actions must be easy to tap with at least a 44px touch target.
- Dense desktop tables must become stacked cards or horizontal scroll containers on small screens.
- Navigation must collapse into a drawer on mobile; resident workflows will use a bottom navigation pattern.
- Forms must use mobile-friendly inputs, clear validation, and visible success/error states.
- Charts must resize to the viewport and remain readable without hover-only information.
- The resident experience will be built as a responsive web/PWA first, followed by React Native packaging when core workflows are stable.

## Release order

1. Platform admin and society admin login with protected tenant access.
2. Society onboarding, buildings, flats, and resident management.
3. Maintenance bills, offline payment records, receipts, and dashboard reports.
4. Complaints, notices, and visitor approval workflows.
5. Mobile resident home, bills, complaints, notices, visitor approval, and profile.
6. Razorpay, push notifications, documents, parking, audit logs, and subscription billing.

## Quality gates

- Backend syntax and API tests pass in CI.
- Admin dashboard builds in CI.
- Mobile viewport checks cover 320px, 390px, 768px, and desktop widths.
- Tenant isolation is tested for every society-scoped endpoint.
- No production secrets are committed to GitHub.
