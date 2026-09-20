# Web companion platform sync

The independent browser edition now uses the same decorative platform as desktop source commit `44838bc`: fine silver edges, a continuous 24-second soft light sweep and a 7.8-second breathing cycle with a longer exhale. The platform no longer has a button, pointer/focus effect, voice-wake dispatch or activated lighting state. Reduced motion and hidden rendering pause the material without a resume jump.

The patch preserves browser viewport scaling, browser authentication and the absence of native window chrome. The packaged renderer and jaw/speech motion bindings are otherwise unchanged. The original desktop executable, sidecar, manifest and shortcut were not updated or restarted by this browser task.

Verification: TypeScript and 13 focused ring/theme/browser-service tests passed. The production web-dist was checked in both appearances at eight viewport sizes, with 16 decorative-ring interaction checks and 60 viewport/route checks. Existing navigation, Gallery search, Market Details/back/views, Account font/profile and Settings checks passed. No new browser errors or missing local assets were observed. Every file in preacherman-web.zip was verified by SHA-256 against web-dist.

The existing preview at http://localhost:5173 is reused (project-owned PID 41212 at verification). The Preacherman Web desktop shortcut opens this build; tools/web/stop-web.ps1 stops its documented preview service. Temporary verification browsers are closed. No public domain deployment was performed.

Evidence: D:/preacherman/output/playwright/web-platform-ring-20260920/.
