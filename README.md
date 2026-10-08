# PartsPal

PartsPal is a responsive robotics-lab inventory and checkout workspace built with React, Vite, Tailwind CSS, Recharts, Lucide React, and a Node.js/Express API.

## Live services

- **Backend:** [https://partspal.onrender.com](https://partspal.onrender.com) — verified healthy at `/api/health`; `/api/inventory` returns live inventory JSON.
- **Latest Production frontend deployment:** [https://partspal-nexq851lf-nothing-72fe.vercel.app](https://partspal-nexq851lf-nothing-72fe.vercel.app) — GitHub's Vercel deployment record reports Production and success for this deployment. It is an immutable deployment URL, not a stable project domain; Vercel access protection prevented an anonymous browser check during this update. Use the stable Production domain listed in the Vercel project's **Settings → Domains** for Render CORS.

## Run locally

1. Install Node.js (LTS).
2. From the repository root, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). With no `VITE_API_URL` in development, the client uses `http://localhost:4000`.

The API runs at `http://localhost:4000`; its readiness endpoint is `http://localhost:4000/api/health`.

## Deploy

### Backend: Render Web Service

- Connect this GitHub repository and select the `main` branch.
- Root directory: repository root (`.`).
- Runtime: Node 22 LTS.
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Health check path: `/api/health`
- Set `CLIENT_ORIGIN` to the exact stable Vercel Production origin copied from **Vercel → Project → Settings → Domains**. Include only the scheme and host, with no path or trailing slash. For the latest Production deployment URL recorded by GitHub at the time of writing, the exact value is `https://partspal-nexq851lf-nothing-72fe.vercel.app`; that URL is deployment-specific, so use the stable project domain instead for ongoing deployments. For multiple explicitly trusted frontend origins, separate exact origins with commas; wildcard origins are not supported.
- Render provides `PORT` automatically; do not set it manually.

**Current deployment evidence:** Render's CORS response currently identifies `https://partspal-ea5ifq71l-nothing-72fe.vercel.app`, an older deployment-specific origin. GitHub's latest successful Production deployment record identifies `https://partspal-nexq851lf-nothing-72fe.vercel.app`. A request from the latest deployment URL receives the old origin in `Access-Control-Allow-Origin`, which browsers reject. These are different immutable deployment URLs; neither should be treated as the stable project domain. After confirming the stable Production domain in Vercel, set `CLIENT_ORIGIN` to that exact value and redeploy the Render service.

### Frontend: Vercel

- Import the same GitHub repository and select the `main` branch.
- Framework preset: Vite.
- Root directory: `client`.
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to **`https://partspal.onrender.com`** in the Vercel Production environment. The value must not have a trailing slash. Vite substitutes this value when it builds the client, so changing it requires a new Production deployment.
- Set the same variable for Preview builds only if Preview sites should use the API; their origins must also be explicitly included in Render's `CLIENT_ORIGIN`.

There is no production fallback to localhost. If `VITE_API_URL` is missing from a Production build, PartsPal displays a configuration error instead of silently requesting `http://localhost:4000`.

### Connection troubleshooting

The browser calls `${VITE_API_URL}/api/inventory` and the other `/api/...` endpoints. The Render API is healthy, but the observed CORS origin belongs to an older immutable Vercel deployment. Verify the Production build has `VITE_API_URL=https://partspal.onrender.com`, verify Render's `CLIENT_ORIGIN` exactly matches the stable Production domain (no slash), and confirm the Vercel deployment is Production rather than Preview. Network errors identify the API address, the exact browser origin Render must allow, and the possibility of a sleeping/unavailable Render service.

## Features

- Responsive inventory dashboard with category stock charts and accessible chart data table
- Inventory search and category filtering
- Server-validated individual part checkout and one-time return
- Line Follower Kit details, issue, and return; the API checks every component before changing stock and rejects shortages without changing any component
- Checkout history searchable by member name or registration number, with active, overdue, and returned filters
- Readiness endpoint at `GET /api/health`
- Keyboard-accessible controls with visible focus states

Inventory, kit definitions, and checkout records are currently held in backend process memory. Stock changes, issues, and returns reset whenever the backend restarts or is redeployed; this project does not currently persist data in a database. Overdue status compares date-only due dates against the current UTC date.

## How I used AI

AI assistance was used to inspect the existing project, trace frontend/API configuration and CORS behavior, refine the interface, and review the implementation. Changes were checked against the existing server routes and validated with the production build and live API.
