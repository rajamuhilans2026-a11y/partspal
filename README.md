# PartsPal

PartsPal is a robotics club inventory app built with React, Tailwind CSS, and a Node.js/Express API.

## Run locally

1. Install Node.js (LTS).
2. From the repository root, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The dashboard checks the backend readiness endpoint.

The API runs at `http://localhost:4000`; its readiness endpoint is `http://localhost:4000/api/health`.

## Deploy

### Backend: Render Web Service

- Connect this GitHub repository and select the `main` branch.
- Root directory: repository root (`.`).
- Runtime: Node 22 LTS (use the latest 22.x version available in Render).
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Health check path: `/api/health`
- Environment variables:
  - `CLIENT_ORIGIN` = the deployed Vercel site origin, with no path or trailing slash (for example, `https://partspal.vercel.app`).
- Render provides `PORT` automatically; do not set it manually.

### Frontend: Vercel

- Import the same GitHub repository and select the `main` branch.
- Framework preset: Vite.
- Root directory: `client`.
- Install command: `npm install` (or the default detected command).
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL` = the deployed Render service URL, with no trailing slash (for example, `https://partspal-api.onrender.com`).

Deployment order: deploy Vercel once to obtain its site URL; set that origin in Render as `CLIENT_ORIGIN` and deploy the API; then set the Render URL in Vercel as `VITE_API_URL` and redeploy the frontend. Confirm the dashboard loads inventory and displays the chart. Free Render instances may take a little time to wake after being idle.

Only the two public service URLs belong in these settings; do not put private credentials in the frontend environment.

## Current scope

- Responsive Tailwind inventory dashboard
- Inventory list with part name, category, total stock, and available stock
- Search and category filtering backed by `GET /api/inventory`
- Individual part checkout and return with server-side validation
- Line Follower Kit checkout that validates all component stock before changing any count
- Kit returns that restore all components once
- Searchable member checkout view with active, returned, and overdue filters
- Checkout records with member name, registration number, part/kit contents, quantity, and due date
- Responsive Recharts comparison of total and available stock by category
- Express readiness endpoint at `GET /api/health`

Inventory, kit definitions, and checkout records use in-memory starter data in `server/index.js`. Issues, returns, and stock changes reset whenever the backend process restarts or is redeployed. Overdue status compares date-only due dates against the current UTC date so the API and interface use a consistent calendar day. The chart's accessible data table shows the same live category totals as its bars.
