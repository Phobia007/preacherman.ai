# Preacherman website

This repository is the website published at https://preacherman.ai.
It currently contains a temporary coming-soon page. The finished website is being designed separately.

## Publishing

| Setting | Value |
| --- | --- |
| GitHub repository | `Phobia007/preacherman.ai` |
| Production branch | `main` |
| Cloudflare Worker | `preacherman-ai` |
| Build directory | Repository root |
| Build command | `npm run build` |
| Deployment command | `npx wrangler deploy` |
| Static output | `dist/` |
| Primary domain | https://preacherman.ai |
| Alternate domain | https://www.preacherman.ai (redirects to primary) |

Cloudflare Workers Builds is connected to GitHub. A push to `main` starts a production build and deploy; other branches do not deploy to production. Build results appear in Cloudflare → Workers & Pages → preacherman-ai → Builds.

## Local checks

Use Node.js 22 or later:

```sh
npm ci
npm run check
npm run dev
```

The current build copies `public/` into `dist/`. Only that output is published.
The lockfile pins deployment dependencies. No Cloudflare token or login secret belongs in this public repository.

## Handoff to the new website task

1. Pull the latest `main` before adding the finished design. Do not force-push over this setup.
2. Replace the temporary content and build script with the finished website. Keep `npm run build` working from the repository root and producing the complete website in `dist/`.
3. Preserve `wrangler.jsonc`, especially Worker name `preacherman-ai`, asset output, and the two custom domains. Keep Wrangler in development dependencies and update the lockfile if dependencies change.
4. The starter supports static HTML and static builds such as Vite. If the new design uses server rendering or a server backend, add the appropriate Cloudflare framework adapter before deploying; that is not provided by this placeholder.
5. The www-to-apex redirect is managed in Cloudflare zone Redirect Rules, independently of the site's static files. Preserve that rule when changing infrastructure.
6. Before the real launch, remove the temporary `noindex` directives from the HTML, `public/_headers`, and `public/robots.txt`. Add the finished site's canonical URLs and sitemap.
7. Run `npm ci` and `npm run check`, review the generated output, then push to `main`. Verify the successful Cloudflare build and the live domain.

The desktop source, packaged executable, existing browser rendition, and the old preachermanai.com website are separate projects. This repository does not replace those files. Add the website's button/link to the browser rendition once its final public URL is chosen.
