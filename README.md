# PartsPal

PartsPal is a robotics club inventory app built with React, Tailwind CSS, and a Node.js/Express API.

## Run locally

1. Install Node.js (LTS).
2. From the repository root, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The dashboard checks the backend readiness endpoint.

The API runs at `http://localhost:4000`; its readiness endpoint is `http://localhost:4000/api/health`.

## Deploy

Deploy the `server` workspace as a Node web service on Render:

- Root directory: repository root (`.`)
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Environment variable: `CLIENT_ORIGIN` = the deployed frontend origin, with no trailing slash (for example, `https://your-site.netlify.app`).
- The service reads Render's `PORT` value automatically.

Deploy the React app as a Netlify static site:

- Base directory: repository root (leave blank / `.`).
- Build command: `npm run build --workspace client`
- Publish directory: `client/dist`
- Environment variable: `VITE_API_URL` = the deployed Render backend URL, with no trailing slash (for example, `https://your-api.onrender.com`).

After the first deploy, copy the Netlify site origin into Render's `CLIENT_ORIGIN`, then copy the Render service URL into Netlify's `VITE_API_URL` and redeploy the frontend. Open the site and confirm its backend status says "API connected". Free backend services may take a little time to wake after being idle.

## Current scope

- Responsive Tailwind inventory dashboard
- Inventory list with part name, category, total stock, and available stock
- Search and category filtering backed by `GET /api/inventory`
- Individual part checkout and return with server-side validation
- Checkout records with member name, registration number, part, quantity, and due date
- Express readiness endpoint at `GET /api/health`

Inventory and checkout records use in-memory starter data in `server/index.js`. Issues, returns, and stock changes reset whenever the backend process restarts or is redeployed. Upcoming milestones are all-or-nothing kit issuing, member and overdue views, and finally the Recharts category chart.
