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
- Line Follower Kit checkout that validates all component stock before changing any count
- Kit returns that restore all components once
- Searchable member checkout view with active, returned, and overdue filters
- Checkout records with member name, registration number, part/kit contents, quantity, and due date
- Express readiness endpoint at `GET /api/health`

Inventory, kit definitions, and checkout records use in-memory starter data in `server/index.js`. Issues, returns, and stock changes reset whenever the backend process restarts or is redeployed. Overdue status compares date-only due dates against the current UTC date so the API and interface use a consistent calendar day. The Recharts category chart remains deferred until required workflows are complete.
