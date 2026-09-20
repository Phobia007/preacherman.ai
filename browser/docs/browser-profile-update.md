# Browser profile update

Synchronized desktop source change ebc3096314b0ecddb1a940463ac237a2c8f56511 into the independent browser edition. Task no longer loads or renders the falling-animal effect. Task, timeline, direct project entries, Market and all model Details profiles use English introduction, Close, Email and Copied labels. The fallback profile is also English; Account was already English and is covered by verification.

The existing lens shaders, fonts, transitions, browser viewport adaptation and omitted native window controls remain unchanged. The desktop application and shortcut were not modified.

The production browser build and 18 focused regression checks passed. Browser verification at 1912x948 covered all six navigation destinations, ten profile open/close checks across light/dark appearance, full-window sizing, absent desktop controls and no animal resource requests. No new console errors occurred; the existing hydration diagnostic remains recorded.

Run tests/browser-profile.smoke.cjs from apps/preacherman-demo-host against the existing http://localhost:5173 preview. PLAYWRIGHT_MODULE and PLAYWRIGHT_EXECUTABLE can select an installed Playwright runtime and Chromium. PROFILE_REPORT_DIR optionally selects the evidence directory. The default reports are in output/playwright/profile-sync-20260917.

web-dist/ and preacherman-web.zip contain the latest production site. Every file in the ZIP was checked against web-dist. Archive hash and byte size are recorded in output/playwright/profile-sync-20260917/archive.json. The Preacherman Web desktop shortcut still opens the independent local preview. No public deployment was performed.
