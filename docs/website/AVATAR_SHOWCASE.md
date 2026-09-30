# Avatar showcase (2026-09-24)

The first `sidekick-pulse` / AVATAR media now has two scenes: the six avatar cards for 4 seconds, followed immediately by the desktop Gallery for 6 seconds. Playback pauses offscreen and in background tabs, automatically loops every 10 seconds with no playback controls. Reduced-motion visitors get the static six-card composition.

## Preserved component sources

- `public/assets/reference/pulse_12_10-986ab9f.riv` is unchanged. Its `digestMain` state machine still renders, positions, rotates and layers the first six cards. `public/assets/avatar-showcase/showcase.js` replaces the image assets and text runs, seeks the first authored second over four seconds and resets it for each loop, and never advances into the middle single-card/product scene.
- The last scene bundles the existing `GalleryOrbitCards`, `GalleryOrbitCard`, `galleryOrbitMath`, and `InteractiveAvatarViewport` from `browser/`. The adapter in `scripts/avatar-showcase/gallery.tsx` feeds the existing wheel input, using its 620-pixel-per-card conversion and its existing damping and helix. It uses the real Cortana model and current Gallery card covers/logos. It is not a video or a replacement CSS card animation.
- The desktop application source and installation were not changed. The website's `RiveInner` wrapper routes only `digestMain` through this adapter; other Rive components retain their behavior.

## Captures and copy

Six native desktop detail screens were opened and captured through Preacherman Desktop Demo: Cortana, Master Chief, Pathfinder, Magik, Jubilee, Clove. Original captures are in `evidence/avatar-showcase/`; website JPGs crop only the window edge and preserve the actual captured model/background. Short biographies summarize the detail-page text. Each biography is no longer than its corresponding original English card text (characters including spaces and punctuation). Left-to-right order matches the requested list.

The new poster replaces the old Pulse preview/fallback references. Outer AVATAR section copy and page navigation retain existing edits.

## Build and review

- Run `node scripts/build-avatar-showcase.mjs` when the Gallery adapter or imported desktop components/assets change. This bundles those existing sources and copies local images, logos, font and Cortana assets; it needs the already-installed browser application dependencies.
- Run `PREACHERMAN_WEB_URL=http://127.0.0.1:5174 npm run build` for the local website.
- Direct review: `http://127.0.0.1:8128/avatar-showcase.html`.
- Website context: `http://127.0.0.1:8128/shopify-winter2026.html#sidekick-pulse`.

Validation: website build and JS syntax checks; six unique replacement slots and requested order; all six description length budgets; all copied Gallery image/logo paths exist. Native screenshots and Gallery wheel behavior were checked. Browser review verified first-scene substitutions, Gallery rendering and movement, automatic looping across the 10-second boundary, and mounting inside the original AVATAR section. The original Gallery currently contains legacy background images/logos; this task preserves those existing Gallery assets. No publication or desktop rebuild was performed.

## Automatic playback and resource budget

Playback keeps the original 4 + 6 second automatic loop with no Play/Replay controls. Expensive components use `public/assets/component-activity.js`: enter the viewport to mount, pause immediately below 10% visibility or in a background document, and release after three inactive seconds. Returning within three seconds cancels disposal; returning later mounts a fresh scene. The `digestMain` wrapper releases both the original Rive instance and the Gallery root, leaving a static poster. Its bounds do not change during unloading.

The presentation's animation-frame clock only exists while active. It owns the Gallery render schedule as well: the website build sets that Canvas to manual rendering, with preparation limited to 30 fps and visible playback allowed up to 60 fps. Actual achieved frame rate depends on rendering cost; playback is not artificially locked to 30 fps. Rive keeps its own authored first-scene motion and stops while Gallery is visible. No 3D frames run during the four-second card scene after initial preparation. Loop reset sets the existing orbit's scroll and target back to the lead offset without rendering an invisible reverse scroll or repeating warm-up.

The website build retains 12 card slots sufficient for the six-second native orbit, instead of all 31 Gallery cards. It preserves the complete card metadata and original orbit math, geometry, shaders and model. Card texture upload is spread over frames during preparation; per-frame material traversal stops afterward. There is no global Three image cache. Continuous diagnostic DOM writes are disabled in normal use; append `?showcaseDebug=1` when profiling. The Rive canvas and Gallery both retain DPR 1, with WebGL antialiasing enabled. Layout/style containment bounds component invalidation.

Validation (2026-09-24):

- Full-page browser check: no showcase canvases before entering the AVATAR section; two canvases after entry; zero after scrolling away and allowing the release delay. Scrolling back recreated the scene and resumed automatic loops without console errors.
- GPU texture counts in the preview changed from about 80 to 42; the resident card pool changed from 31 to 12. These are resource counts, not a claim about total browser RAM.
- Node tests cover visibility thresholds, background pause, delayed release, cancellation on quick return, listener/timer cleanup, and native orbit coverage of every visible card throughout the six-second scroll.
- Gallery build, website build and JavaScript syntax checks pass. Desktop application sources and installation remain untouched.

Use this same visibility lifecycle for future heavy website components, so offscreen sections do not accumulate running render loops or GPU contexts. The three-second grace interval avoids repeatedly rebuilding scenes during small scroll adjustments.
