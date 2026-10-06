# PartsPal

PartsPal is a robotics club inventory app. This starter sets up a React frontend and a Node.js/Express API in one repository.

## Run locally

1. Install Node.js (LTS).
2. From the repository root, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The frontend calls the backend health endpoint directly.

The API runs at `http://localhost:4000`; its health endpoint is `http://localhost:4000/api/health`.

## Deploy

Deploy the `server` workspace as a Node web service (for example, on Render):

- Root directory: repository root
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Add `CLIENT_ORIGIN` with the deployed frontend URL. The service reads the hosting platform's `PORT` value.

Deploy `client` as a static Vite site (for example, on Vercel or Netlify):

- Build command: `npm run build --workspace client`
- Output directory: `client/dist`
- Add `VITE_API_URL` with the deployed backend URL, without a trailing slash.

After deployment, open the frontend and confirm its API status says the backend is connected. Free backend services may take a little time to wake after being idle.

## Current scope

- React hello-world landing page
- Express health endpoint at `GET /api/health`
- Frontend-to-backend connection

Inventory, member issues, returns, and all-or-nothing kits are the next features to build.
