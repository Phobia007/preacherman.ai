# Preacherman — website and browser edition

This repository brings the scroll-driven presentation website and the existing Preacherman browser application together. The website's **Try It** button opens the browser edition in the current tab.

## Contents

- `public/`: the complete presentation website, including the oil-painting backgrounds, character artwork, WebGL scenes, burn transitions and pinned Continuity marquee.
- `browser/`: the independently maintained browser edition's source and authored assets, including Home, Task, Gallery, Market, Account and Settings. Build and API details are in [browser/README.md](browser/README.md).
- `scripts/`: website build and local preview.
- `docs/website/`: the presentation website's source notes and asset replacement guide.
- `wrangler.jsonc`: the existing Cloudflare website deployment configuration.

The `codex/complete-web-experience` branch contains the integrated local version. `main` remains the production branch; pushing to `main` triggers the existing Cloudflare Workers build and deployment.

## Run both parts locally

Use Node.js 22.12 or later and npm. Clone the repository, then run:

```sh
npm ci
npm run browser:setup
npm run browser:build
npm run build
```

Start the browser application in one terminal:

```sh
npm run browser:preview
```

Start the presentation website in a second terminal:

```sh
npm run preview
```

Open **http://127.0.0.1:8128/**. **Try It** opens **http://localhost:5173/**. The browser preview owns port 5173 and a separate local API on 8791; the website preview owns 8128. Stop each with Ctrl+C in its terminal. Reuse an already-running browser preview instead of starting a duplicate. Local application data belongs under `browser/.runtime-tmp/`, which is ignored by Git.

All required authored source assets are included. Dependencies, generated builds, caches, credentials and native desktop executables are not committed. The large media/model files make the initial clone substantial.

## Website build and public URL

`npm run build` produces the presentation website in `dist/`. It uses the local browser URL by default. To point **Try It** at an independently hosted browser edition, set `PREACHERMAN_WEB_URL` during the build, for example:

```sh
PREACHERMAN_WEB_URL=https://app.example.com/ npm run build
```

On PowerShell:

```powershell
$env:PREACHERMAN_WEB_URL = 'https://app.example.com/'
npm run build
```

This updates both initial HTML and hydrated navigation. `npm run browser:build` separately produces `browser/web-dist/`. That browser bundle needs hosting with the documented SPA routes; AI, tools, voice and authenticated accounts require the backend/redirect setup documented in the browser edition. A production browser URL and public API have not been configured by this import.

## Existing production deployment

| Setting | Value |
| --- | --- |
| GitHub repository | `Phobia007/preacherman.ai` |
| Production branch | `main` |
| Cloudflare Worker | `preacherman-ai` |
| Build directory | Repository root |
| Build command | `npm run build` |
| Deployment command | `npx wrangler deploy` |
| Static output | `dist/` |
| Primary domain | `https://preacherman.ai` |
| Alternate domain | `https://www.preacherman.ai` (zone-level redirect to primary) |

The Worker name, asset directory, custom domains and Wrangler dependency are preserved. `npm run check` builds the website and runs a deployment dry run. Before merging this branch into production, configure the browser's public URL and hosting, remove the temporary noindex directives from `public/_headers` and `public/robots.txt`, and verify canonical metadata. The current import does not publish the browser edition or alter the existing desktop installation.

Do not commit API/provider keys, service-role secrets, authentication sessions, `.env` files or local runtime databases. The checked-in Supabase publishable key is intentionally public client configuration; secret credentials stay outside the repository.
