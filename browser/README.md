# Preacherman Browser

Independent browser edition copied from desktop commit `b2b0c89ba64a9b8a940b3deb2a3dec7153096d61`.
Desktop source: https://github.com/Phobia007/preacherman-desktop

The authored models, fonts, animations, menus, Gallery, Market details, Account and Settings are preserved. The browser does not render native minimize, maximize, close or resize controls. GitHub uses a browser PKCE return flow with the same Supabase project and member profiles as the desktop app.

## Build

Node.js 22.12 or newer is required. From this directory:

```sh
npm run setup
npm run build
npm run preview
```

The complete static website is written to `web-dist/`. Publish that directory to the root of a domain. Serve routes under `/__screens/` and `/__surfaces/` with the root `index.html`; `_redirects` and `deploy/nginx.conf` provide examples. Use HTTPS for microphone access and production sign-in.

## Local shortcut

`tools/web/open-web.ps1` starts or reuses the preview at `http://localhost:5173`, then opens the default browser. It uses a separate local API on `127.0.0.1:8791` and separate data under `.runtime-tmp/browser-preview`. The desktop's executable, shortcut, port 8787, credentials and data are not touched.

The preview is one background Node process, owned by this project. Its PID and logs are in `.runtime-tmp/`. Stop it with `powershell -NoProfile -ExecutionPolicy Bypass -File tools/web/stop-web.ps1`. The desktop shortcut is named **Preacherman Web**.

## Deployment and accounts

- Upload all of `web-dist/`, including its models, videos and fonts.
- Add the final website root URL (including the trailing slash) to the existing Supabase Authentication redirect allowlist. Local sign-in uses `http://localhost:5173/`. Keep the existing GitHub HTTPS callback and desktop redirects.
- GitHub sign-in and member numbers share the existing Supabase project. Browser and desktop sessions are stored separately.
- The UI is deployable as static files. AI conversations, tools and voice also need an authenticated cloud API with per-account data isolation. `VITE_PREACHERMAN_SERVICE_URL` selects that API at build time; blank uses same-origin `/api`. The private local preview service must not be exposed as a public multi-user backend.
- Google/email sign-in remain in the same unconnected state as the desktop version.

No hosting provider or domain has been selected yet, and this project has not been published.
