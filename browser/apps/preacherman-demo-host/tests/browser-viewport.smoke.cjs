const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = process.env.VIEWPORT_REPORT_DIR;
if (!out) throw new Error('Set VIEWPORT_REPORT_DIR to the screenshot/report directory.');
fs.mkdirSync(out, { recursive: true });
const url = process.env.PREACHERMAN_WEB_URL || 'http://localhost:5173';
const sizes = [[1912,948],[1920,1080],[2560,1080],[1366,768],[1280,720],[1440,900],[1024,768],[768,1024]];
const report = { checks: [], errors: [], failedLocal: [] };
const screenshot = (page, name) => page.screenshot({ path: path.join(out, name + '.png') });
async function fills(page, selector, label) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  report.checks.push({ label, viewport, box });
  assert.ok(box, label + ' is visible');
  for (const [actual, expected] of [[box.x,0],[box.y,0],[box.width,viewport.width],[box.height,viewport.height]]) {
    assert.ok(Math.abs(actual - expected) < 1, label + ' must fill viewport: ' + JSON.stringify(box));
  }
}
async function shell(page, label) {
  for (const selector of ['.demo-app-shell','.demo-app-shell__screen-content']) await fills(page, selector, label + ' ' + selector);
  assert.equal(await page.locator('.demo-window-controls,.demo-window-resize-handles').count(), 0);
  const scroll = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, vw: innerWidth, vh: innerHeight }));
  assert.equal(scroll.w, scroll.vw); assert.equal(scroll.h, scroll.vh);
  const scale = await page.locator('.demo-app-shell').evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return [m.a, m.d]; });
  assert.equal(scale[0], scale[1], 'Models and fonts must use uniform scaling');
}
async function nav(page, name, surface) {
  const toggle = page.locator('.demo-app-shell__brand-trigger');
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.press('Enter');
  const dock = page.locator('.demo-account-dock');
  assert.equal(await dock.getAttribute('data-menu-hidden'), 'true', 'Signed-out account icon must hide with navigation');
  assert.equal(await dock.getAttribute('aria-hidden'), 'true');
  assert.equal(await dock.getAttribute('tabindex'), '-1');
  await page.waitForFunction(() => {
    const style = getComputedStyle(document.querySelector('.demo-account-dock'));
    return style.opacity === '0' && style.pointerEvents === 'none';
  });
  if (name === 'Account') await screenshot(page, 'navigation-' + await page.locator('html').getAttribute('data-appearance'));
  await page.getByRole('navigation', { name: 'Preacherman sections' }).getByRole('button', { name, exact: true }).click();
  if (await toggle.getAttribute('aria-expanded') === 'true') await toggle.click();
  assert.equal(await dock.getAttribute('aria-hidden'), 'false');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.demo-account-dock')).opacity === '1');
  await page.locator('.demo-app-shell[data-active-surface="' + surface + '"]').waitFor();
}
async function frame(page, selector) { return (await page.locator(selector).elementHandle()).contentFrame(); }
(async () => {
  let browser, context, page;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist'],
      ...(process.env.PLAYWRIGHT_PROXY ? { proxy: { server: process.env.PLAYWRIGHT_PROXY, bypass: 'localhost,127.0.0.1' } } : {}) });
    for (const appearance of ['dark','light']) {
      context = await browser.newContext({ viewport: { width: 1912, height: 948 }, deviceScaleFactor: 1 });
      await context.addInitScript(appearance => localStorage.setItem('preacherman.preferences', JSON.stringify({ appearance, locale: 'en', activeModelId: 'apex-legend-pathfinder' })), appearance);
      page = await context.newPage(); page.setDefaultTimeout(30000); page.setDefaultNavigationTimeout(30000);
      page.on('pageerror', e => report.errors.push(String(e)));
      page.on('console', m => { if (m.type() === 'error') report.errors.push(m.text()); });
      page.on('response', r => { if (r.status() >= 400 && new URL(r.url()).origin === url) report.failedLocal.push(r.url()); });
      await page.goto(url);
      await fills(page, '.demo-intro-splash__stage', appearance + ' startup');
      await page.locator('.demo-intro-splash').waitFor({ state: 'detached' });
      await page.locator('[data-avatar-load-state="ready"]').first().waitFor();
      assert.equal(await page.locator('html').getAttribute('data-appearance'), appearance);
      for (const [width,height] of sizes) {
        await page.setViewportSize({ width, height }); await page.waitForTimeout(350);
        await shell(page, appearance + ' Home ' + width + 'x' + height);
        if ([1912,2560,1024].includes(width)) await screenshot(page, appearance + '-home-' + width);
      }
      await page.setViewportSize({ width: 1912, height: 948 });
      for (const [name,surface] of [['Task','workspace'],['Gallery','market'],['Market','ledger'],['Account','account'],['Settings','settings']]) {
        await nav(page, name, surface);
        if (name === 'Task') {
          await page.locator('.gallery-surface[data-reveal-state="complete"]').waitFor();
          await (await frame(page, '.gallery-surface__frame')).getByRole('link', { name: '全部', exact: true }).waitFor();
        }
        if (name === 'Gallery') {
          await page.waitForFunction(() => { const raw = document.querySelector('canvas[data-gallery-orbit]')?.dataset.galleryOrbit; return raw && JSON.parse(raw).entry === 1; });
          const input = (await frame(page, '.active-theory-gallery-surface__frame')).getByRole('searchbox', { name: 'Search characters' });
          await input.fill('Cortana'); await input.press('Enter');
          await page.waitForFunction(() => { const d = JSON.parse(document.querySelector('canvas[data-gallery-orbit]').dataset.galleryOrbit); return d.leadProject === 'secret-sky' && Math.abs(d.scroll-d.target) < .001; });
        }
        if (name === 'Market') {
          await page.locator('.market-surface[data-entrance="complete"][data-status="ready"]').waitFor();
          await (await frame(page, '.market-surface__frame')).locator('[data-character-id="cortana"] a[href^="love-configurator.html"]').first().click();
          await page.locator('.market-details[data-model-id="cortana"][data-status="ready"][data-reveal="complete"]').waitFor();
          await page.setViewportSize({ width: 2560, height: 1080 }); await page.waitForTimeout(500);
          await shell(page, appearance + ' resized Details'); await fills(page, '.market-details', 'Details overlay');
          await page.getByRole('navigation', { name: 'Model views' }).getByRole('button', { name: 'Side', exact: true }).click();
          assert.equal(await page.locator('.market-details').getAttribute('data-view'), 'Side');
          await screenshot(page, appearance + '-details-wide');
          await page.getByRole('button', { name: 'Back to Market', exact: true }).click();
          await page.locator('.market-details').waitFor({ state: 'detached' });
          await page.locator('.market-surface[data-details-phase="idle"]').waitFor();
          await page.setViewportSize({ width: 1912, height: 948 });
        }
        if (name === 'Account') {
          await page.locator('.account[data-entrance="complete"]').waitFor();
          const navFont = await page.locator('.demo-app-shell__brand-menu-item').first().evaluate(e => getComputedStyle(e).fontFamily);
          for (const selector of ['.account__heading h1','.account__heading p','.account__provider','.account__email','.account__continue']) {
            assert.equal(await page.locator(selector).first().evaluate(e => getComputedStyle(e).fontFamily), navFont, selector + ' uses navigation font');
          }
          await page.locator('.account__signature').click();
          await page.locator('.account[data-phase="open"]').waitFor();
          await page.keyboard.press('Escape'); await page.locator('.account[data-phase="closed"]').waitFor();
        }
        if (name === 'Settings') await page.locator('[data-settings-state="ready"]').waitFor();
        await shell(page, appearance + ' ' + name);
        await page.waitForTimeout(500); await screenshot(page, appearance + '-' + name.toLowerCase());
        console.log('Verified ' + appearance + ' ' + name);
      }
      await page.close(); page = undefined; await context.close(); context = undefined;
    }
    const baseline = ['Hydration completed but contains mismatches.', 'TypeError: _this.initSync is not a function'];
    report.inheritedErrors = [...new Set(report.errors.filter(e => baseline.includes(e)))];
    report.newErrors = [...new Set(report.errors.filter(e => !baseline.includes(e)))];
    assert.deepEqual(report.failedLocal, []); assert.deepEqual(report.newErrors, []);
    report.passed = true;
  } catch (error) {
    report.failure = String(error.stack); process.exitCode = 1;
    if (page) await screenshot(page, 'failure').catch(() => {});
  } finally {
    await page?.close().catch(() => {}); await context?.close().catch(() => {}); await browser?.close().catch(() => {});
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, failure: report.failure, newErrors: report.newErrors }));
})();
