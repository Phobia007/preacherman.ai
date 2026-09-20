# Browser edition delivery

This independent checkout is based on desktop commit b2b0c89. Only browser integration code changed; all 1,308 tracked public assets have matching source and distribution hashes. Native window controls are omitted in the startup splash and all application pages. The original desktop executable, sidecar and shortcut are unchanged.

The production static build passed TypeScript checking. Seventeen focused authentication and service-origin tests passed. Browser verification covered Home, Task, Gallery search, Market Details and its four views and reverse return animation, Account and its lens animation, Settings, and a 1280x720 viewport in both appearance modes. All local resources loaded without an HTTP failure. The two inherited console messages (`Hydration completed but contains mismatches.` and `TypeError: _this.initSync is not a function`) also occur in the source desktop preview baseline. No new browser error was introduced by this port.

Real-user OAuth has not been reauthorized for this browser session. Callback validation, PKCE exchange, cancellation, saved sessions and logout were tested with isolated authentication fixtures. The final domain still needs to be allowlisted in the existing Supabase project.

The local preview owns ports 5173 and 8791 and uses .runtime-tmp/browser-preview. The existing desktop owns port 8787 and is unaffected. Public deployment has not been performed. A public AI/tool/voice API still requires its own authenticated, account-isolated hosting; the local companion service is not exposed to the internet.

See web-build-manifest.json for artifact integrity and README.md for setup, startup, shutdown and deployment instructions.

## Browser viewport and account refinement

Browser startup and the application stage fill the available viewport at any aspect ratio. The stage uses the existing uniform scale for models and fonts, while its layout width and height follow the viewport. There is no non-uniform stretching or cover-cropping of controls. The native desktop checkout and shortcut are outside this change.

The account dock now hides whenever navigation opens, including signed-out sessions, and returns with its existing fade when navigation closes. Login headings, copy, providers, email input and Continue use the navigation's Clash Display family and weight.

Production browser verification passed 60 layout assertions in light and dark appearances, including 1912x948, 1920x1080, 2560x1080, 1366x768, 1280x720, 1440x900, 1024x768 and 768x1024 windows. Gallery search, Market Details/return, Account lens and navigation were exercised. No new browser errors or failed local resource requests occurred; the inherited hydration message remains. These checks verify viewport coverage, not a separate mobile layout redesign.

The regression script is `apps/preacherman-demo-host/tests/browser-viewport.smoke.cjs`. Run it against the local production preview using Node, with `PLAYWRIGHT_MODULE` pointing to an installed Playwright package, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` set if needed, and `VIEWPORT_REPORT_DIR` pointing to a directory under `output/playwright/`. `PREACHERMAN_WEB_URL` and `PLAYWRIGHT_PROXY` are optional.
