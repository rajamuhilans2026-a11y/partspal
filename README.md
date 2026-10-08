# RoboRack

RoboRack is a robotics-lab inventory and checkout app. It helps the Robotics Club at VIT Chennai track parts, issue them to members, and check out complete kits safely.

## Live links

- **Frontend:** [https://partspal-taupe.vercel.app](https://partspal-taupe.vercel.app)
- **Backend health:** [https://partspal.onrender.com/api/health](https://partspal.onrender.com/api/health)
- **GitHub repository:** [rajamuhilans2026-a11y/partspal](https://github.com/rajamuhilans2026-a11y/partspal)

## Features

- Responsive dashboard with inventory totals, available counts, low-stock labels, and a category chart.
- Search and filter parts by category.
- Add parts manually, edit part details and total stock, and record newly purchased stock with Restock.
- Issue individual parts and return them once.
- Issue a Line Follower Kit only when every component is available. A rejected kit checkout leaves every component's stock unchanged and identifies any shortage.
- Search checkout history by member or registration number; filter active, overdue, and returned issues.
- Accessible forms, keyboard focus states, and clear loading, success, validation, and error messages.

## Example inventory

Prefilled quantities are examples, not verified Robotics Club counts. Use **Edit** to enter the actual part name, category, and total units owned; use **Add Part** for missing items. **Restock** adds newly acquired units to both total and available counts. Returns restore previously issued units and do not increase the total.

## Run locally

1. Install Node.js LTS.
2. From the repository root, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

The API runs at `http://localhost:4000`; its health endpoint is `http://localhost:4000/api/health`. In development, the frontend uses this local API if `VITE_API_URL` is not set.

## Deployment settings

### Render backend

- Repository: `rajamuhilans2026-a11y/partspal`, branch `main`.
- Root directory: `.`
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Health check path: `/api/health`
- Set `CLIENT_ORIGIN` to the exact Vercel Production origin (scheme and host only, with no trailing slash). The server accepts multiple exact origins separated by commas. Do not use `*`.

### Vercel frontend

- Repository: `rajamuhilans2026-a11y/partspal`, branch `main`.
- Framework: Vite; root directory: `client`.
- Build command: `npm run build`; output directory: `dist`.
- Set the Production environment variable `VITE_API_URL` to `https://partspal.onrender.com`, with no trailing slash, then deploy again.

Render's `CLIENT_ORIGIN` should be `https://partspal-taupe.vercel.app`. If the Vercel Production domain changes, update that value in Render and redeploy the backend. Vercel deployment-specific URLs change between builds; keep this stable Production domain in the README.

## Screenshots

Add one desktop and one mobile screenshot of the working Production app here before submission.

## Data and limitations

Inventory, kit definitions, and checkout records are held in backend memory. Inventory edits, restocks, issues, and returns reset when the backend restarts or is redeployed. The app does not currently use a database.

## How I used AI

AI assistants were used to help review the project, explain and debug the frontend/API connection, improve the interface, and check implementation details. The code and workflows were reviewed and validated against the app's requirements.
