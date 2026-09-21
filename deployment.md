# Deployment checklist

## Database

1. Create a MongoDB Atlas database.
2. Add the deployment server IP access rule required by the chosen hosting provider.
3. Keep the connection string private.

## Backend on Render

1. Create a new Web Service from this repository.
2. Set the root directory to `backend`.
3. Use `npm install` as the build command and `npm start` as the start command.
4. Add `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as secret environment variables.
5. Confirm `/health` returns `{ "ok": true }`.

The included `render.yaml` keeps these settings documented for a later Blueprint deployment.

## Frontend on Vercel

1. Import this repository into Vercel.
2. Set the project root directory to `web-admin`.
3. Add `VITE_API_URL` with the deployed Render API URL ending in `/api`.
4. Deploy and open the generated HTTPS URL.

The included `web-admin/vercel.json` provides the Vite build defaults.

## Production checklist

- Use a long random `JWT_SECRET`.
- Use a strong admin password and change it after the first login.
- Set `CLIENT_URL` to the exact Vercel URL.
- Do not commit `.env` files, payment keys, or database passwords.
- Enable MongoDB backups before onboarding real societies.
