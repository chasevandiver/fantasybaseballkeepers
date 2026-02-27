# 2026 Keeper Manager — Pete Rose's Fantasy League

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2 — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Vercel auto-detects Vite. Leave all settings as default.
4. Click **Deploy**

> The `vercel.json` file is already configured to:
> - Use `npm run build` as the build command
> - Serve from the `dist` folder
> - Redirect all routes to `index.html` (fixes 404 on page refresh)

## Why you were getting a 404

When Vercel serves a Vite/React SPA and you navigate directly to a URL (or refresh),
the server looks for a physical file at that path and finds nothing — returning 404.
The `rewrites` rule in `vercel.json` tells Vercel to always serve `index.html` and
let React Router (or in this case, just React) handle routing client-side.
