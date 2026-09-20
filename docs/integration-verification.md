# Integrated repository snapshot — 2026-09-21

The presentation site and browser edition were copied into an isolated checkout of `Phobia007/preacherman.ai`, based on production commit `e1e0b2b03b3903fbebabd9ee9bc1686f06f916f0`. The browser source is based on its verified `e98938c` delivery.

The import contains 3,621 source/asset copies, approximately 1.45 GB. File hashes were compared with the local source. Models, animations, images and fonts were preserved byte-for-byte. Root entry handling and two archived Gallery bundles are deliberate exceptions: the website entry preserves the supported presentation route, and embedded legacy provider credentials were removed from both Gallery bundle copies. No local environment files, authentication sessions, runtime databases, dependency trees or native executables were imported.

Validation completed:

- `npm ci` with the existing pinned Wrangler dependency.
- `npm run check`: complete presentation build and Cloudflare dry run; no deployment was performed.
- Browser verification against the built repository website in both appearance modes: the page renders, the original character scene loads, and Try It navigates in the current tab to the existing local browser edition.
- Browser Home reaches ready character state in both appearances.
- Gallery loads and reaches ready state using the credential-free imported client bundle.
- No failed resource requests or new browser errors. The browser edition retains its previously documented hydration message.
- All original tracked browser files and all copied presentation assets are included; no file exceeds 100 MiB.
- Temporary verification browsers and the website preview process were closed after testing. Existing user previews were reused and preserved.

The presentation deploy configuration and production domains remain unchanged. This branch is a complete local source delivery, not a public browser-service deployment. Follow the root README and browser deployment notes before promoting it to `main`.
