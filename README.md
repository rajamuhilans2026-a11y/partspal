# PartsPal

PartsPal is a responsive robotics-lab inventory and checkout workspace built with React, Vite, Tailwind CSS, Recharts, Lucide React, and a Node.js/Express API.

## Live services

- **Backend:** [https://partspal.onrender.com](https://partspal.onrender.com) — verified healthy at `/api/health`; `/api/inventory` returns live inventory JSON.
- **Frontend deployment history:** [GitHub Production deployments](https://github.com/rajamuhilans2026-a11y/partspal/deployments/production) lists Vercel's successful Production target for each build; those generated URLs change with deployments. The latest target verified during this update was [https://partspal-apyvor1y8-nothing-72fe.vercel.app](https://partspal-apyvor1y8-nothing-72fe.vercel.app), which rendered the redesigned app but could not load API data because Render CORS still had an older origin. The candidate URL `https://partspal.vercel.app` was tested and currently shows Vercel's “Deployment temporarily paused” page. The stable active Production domain must be confirmed in Vercel **Settings → Domains**; do not use an immutable deployment URL as a permanent alias.

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
- Set `CLIENT_ORIGIN` to the exact stable Vercel Production origin copied from **Vercel → Project → Settings → Domains**. Include only the scheme and host, with no path or trailing slash. The deployment-specific URL verified during this update is `https://partspal-apyvor1y8-nothing-72fe.vercel.app`; use that exact value only when allowing that particular build. For multiple explicitly trusted frontend origins, separate exact origins with commas; wildcard origins are not supported.
- Render provides `PORT` automatically; do not set it manually.

**Current deployment evidence:** Render's CORS response identifies `https://partspal-ea5ifq71l-nothing-72fe.vercel.app`, an older deployment-specific origin. A request from the latest confirmed Production deployment receives no `Access-Control-Allow-Origin` header, which browsers reject. These generated deployment URLs are different; neither should be treated as the stable project domain. After confirming the stable Production domain in Vercel, set `CLIENT_ORIGIN` to that exact value and redeploy the Render service.

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
- Manual inventory management: add parts, edit names/categories/total units, and restock newly acquired units
- Server-validated individual part checkout and one-time return
- Line Follower Kit details, issue, and return; the API checks every component before changing stock and reports each shortage without changing any component
- Checkout history searchable by member name or registration number, with active, overdue, and returned filters
- Readiness endpoint at `GET /api/health`
- Keyboard-accessible controls with visible focus states

The prefilled starter inventory quantities are example data, not verified lab counts. Use **Edit** to enter the actual part name, category, and total units owned; the app preserves currently issued units when the total changes. **Add Part** creates a part with all entered units available. **Restock** records newly acquired units by increasing both total and available stock; it is different from **Return**, which makes previously issued units available again.

Inventory edits and additions are validated by the API. The inventory endpoints are:

- `POST /api/inventory` — add a part with `name`, `category`, and positive whole-number `totalStock`; all units start available.
- `PATCH /api/inventory/:id` — edit a part's `name`, `category`, and `totalStock`; the new total cannot be lower than the outstanding (issued) quantity, and available stock is recalculated to preserve those issues.
- `POST /api/inventory/:id/restock` — add a positive whole-number `quantity` of new units to both total and available stock.

Inventory, kit definitions, and checkout records are currently held in backend process memory. Manual inventory changes, stock restocks, issues, and returns reset whenever the backend restarts or is redeployed; this project does not currently persist data in a database. Overdue status compares date-only due dates against the current UTC date.

## How I used AI

AI assistance was used to inspect the existing project, trace frontend/API configuration and CORS behavior, refine the interface, and review the implementation. Changes were checked against the existing server routes and validated with the production build and live API.
