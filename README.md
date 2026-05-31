# SocialAppZ

Compact README with local dev and deployment instructions.

## Requirements
- Node.js (18+ recommended)
- npm
- MongoDB (or a hosted MongoDB URI)

## Environment variables
Create a `.env` file in the project root with at least:

- `PORT` (optional, default 8000)
- `MONGODB_URI` (connection string)
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `FRONTEND_URL` (production URL for socket CORS)
- `NODE_ENV` (set to `production` when deploying)

## Development

Install dependencies and run backend + frontend (dev):

```bash
npm install
npm run dev
```

The backend dev server runs via `nodemon backend/server.js`. The frontend uses Vite.

## Build (for production)

Build the frontend and install server dependencies:

```bash
npm run build
```

This runs `npm install --prefix frontend` and builds the frontend into `frontend/dist`.

## Start (production)

Set your environment variables and run:

```bash
npm start
```

This serves the API on `PORT` and, when `NODE_ENV=production`, serves the frontend static files from `frontend/dist`.

Ensure `FRONTEND_URL` is set to your production frontend origin so Socket.IO CORS works correctly.


## Deployment

This project is intended to deploy the frontend on Vercel and the backend on Render (or similar PaaS).

### Frontend — Vercel

- In Vercel, create a new project and point it at the `frontend` folder of this repository.
- Build command: `npm run build`
- Output directory: `dist`
- Vercel will detect the Vite app automatically for the `frontend` folder; you can also set a project-level `Framework Preset` to `Vite`.

If you prefer to deploy the entire repo as a monorepo project, set the Root Directory to `frontend`.

### Backend — Render

- Create a new Web Service on Render and connect the repo.
- Start command: `node backend/server.js` (Procfile is included as an alternative)
- Environment: set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*` vars, and `FRONTEND_URL` to your deployed frontend origin (e.g., `https://your-app.vercel.app`).
- Render will set the `PORT` env var automatically; the server uses `process.env.PORT`.

### Other PaaS (Heroku, Fly, etc.)

- The included `Procfile` (`web: node backend/server.js`) works for Heroku-like platforms. Ensure environment variables are configured on the host.

## Notes
- The backend serves the built frontend from `frontend/dist` when `NODE_ENV=production`.
- Set `FRONTEND_URL` to the frontend's production origin so Socket.IO CORS works correctly.

