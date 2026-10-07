# Mesay API — Cloudflare Worker

Same routes as the Express server in `../server/`:

- `GET  /api/health`
- `POST /api/quotes`, `GET /api/quotes`, `PATCH /api/quotes/:id`, `DELETE /api/quotes/:id`
- `GET/POST/PUT/DELETE /api/proformas[/:id]`
- `GET/POST/PUT/DELETE /api/projects[/:id]`
- `GET /api/reviews`, `GET /api/reviews/all`, `POST /api/reviews`, `PATCH/DELETE /api/reviews/:id`
- `GET/PUT /api/business`
- `POST /api/uploads`

## Setup

    cd worker
    npm install
    npx wrangler login
    npx wrangler secret put SUPABASE_URL
    npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

For local dev, copy `.dev.vars.example` to `.dev.vars` and fill it in.

## Run

    npm run dev       # http://localhost:8787
    npm run deploy    # pushes to Cloudflare

## Frontend

Add to your root `.env`:

    VITE_API_BASE=http://localhost:8787

Or proxy in `vite.config.js`:

    server: { proxy: { '/api': 'http://localhost:8787' } }

For production, set `CORS_ORIGIN` in `wrangler.toml` (or via `wrangler secret put CORS_ORIGIN`) to your deployed frontend URL.
