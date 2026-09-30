import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observeComponentActivity } from '../../public/assets/component-activity.js';

test('expensive component lifecycle pauses, releases and recovers without idle polling', () => {
  const original = { document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver, setTimeout, clearTimeout };
  const timers = new Map(); let sequence = 0, observer;
  const doc = new EventTarget(); doc.hidden = false;
  globalThis.document = doc;
  globalThis.setTimeout = (fn, delay) => { const id = ++sequence; timers.set(id, { fn, delay }); return id; };
  globalThis.clearTimeout = id => timers.delete(id);
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { this.disconnected = true; }
    show(ratio) { this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]); }
  };
  try {
    const events = [];
    const stop = observeComponentActivity({}, { onActive: value => events.push(value), onRelease: () => events.push('release') });
    assert.equal(timers.size, 0, 'nothing starts outside the viewport');
    observer.show(.05); assert.deepEqual(events, []);
    observer.show(.5); assert.deepEqual(events, [true]);
    observer.show(0); assert.deepEqual(events, [true, false]);
    assert.equal([...timers.values()][0].delay, 3000);
    observer.show(.8); assert.equal(timers.size, 0, 'quick return cancels disposal');
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(events.at(-1), false, 'background tab pauses immediately');
    const release = [...timers.values()][0].fn; timers.clear(); release();
    assert.equal(events.at(-1), 'release');
    doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(events.at(-1), true, 'return starts the component again');
    observer.show(0); stop();
    assert.equal(timers.size, 0); assert.ok(observer.disconnected);
    const count = events.length;
    doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(events.length, count, 'no listener remains after unmount');
  } finally { Object.assign(globalThis, original); }
});

test('the bounded card pool covers the native orbit for the entire six-second scene', async () => {
  const { readFile } = await import('node:fs/promises');
  const { transform } = await import('../../browser/apps/preacherman-demo-host/node_modules/esbuild/lib/main.js');
  const { GALLERY_SECONDS } = await import('../../public/assets/avatar-showcase/showcase.js');
  const source = await readFile(new URL('../../browser/apps/preacherman-demo-host/src/surfaces/gallery/galleryOrbitMath.ts', import.meta.url), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const { galleryOrbitPose, GALLERY_LEAD_OFFSET } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  for (let step = 0; step <= GALLERY_SECONDS * 100; step++) {
    const scroll = GALLERY_LEAD_OFFSET + step / 100;
    for (let index = 0; index < 31; index++) {
      if (galleryOrbitPose(index, scroll, 1, 31).visible) assert.ok(index < 12, `missing visible card ${index} at scroll ${scroll}`);
    }
  }
});
