import { r as React, j as jsx, p as getReactDOM } from './runtime/components-BdJai906.js';
import { a as scenes, b as loadingUI } from './runtime/(_locale).editions.winter2026-DhFtUF58.js';

// The layout slot preserves the original space. A body portal lets the ticker
// span the actual viewport instead of inheriting the centered page's clipping.
export function ContinuityMarquee() {
  const [host, setHost] = React.useState(null);
  const layerRef = React.useRef(null);
  const viewportRef = React.useRef(null);
  const trackRef = React.useRef(null);
  React.useEffect(() => { setHost(document.body); }, []);
  React.useEffect(() => {
    if (!host) return;
    const layer = layerRef.current, viewport = viewportRef.current, track = trackRef.current;
    const item = track.firstElementChild;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, frame = 0, disposed = false, measuredWidth = 0;
    function syncPlayback() {
      track.style.animationPlayState = visible && !document.hidden && !reduced.matches ? 'running' : 'paused';
    }
    function syncChapter() {
      const state = scenes.getState();
      const last = [...state.sectionMap.values()].find(section => section.name === 'shop-app');
      // Appear as the burn finishes, then stay pinned through the whole chapter.
      // Require isActive: an old transitionProgress survives backward navigation.
      visible = Boolean(loadingUI.getState().isLoaded && last?.isActive &&
        (state.sectionMap.get(state.activeSection)?.name === 'shop-app' || last.transitionProgress >= .90));
      layer.dataset.visible = String(visible);
      layer.setAttribute('aria-hidden', String(!visible));
      syncPlayback();
    }
    function measure() {
      if (disposed) return;
      const distance = item.getBoundingClientRect().width;
      if (!distance) return;
      track.querySelectorAll('[data-ticker-copy]').forEach(copy => copy.remove());
      if (!reduced.matches) {
        const copies = Math.ceil(viewport.clientWidth / distance) + 1;
        for (let i = 0; i < copies; i++) {
          const copy = item.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('data-ticker-copy', '');
          track.append(copy);
        }
      }
      measuredWidth = viewport.clientWidth;
      track.style.setProperty('--ticker-distance', `${distance}px`);
      track.style.setProperty('--ticker-duration', `${distance / 64}s`);
      track.dataset.speed = '64';
      syncPlayback();
    }
    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const resize = new ResizeObserver(() => {
      if (viewport.clientWidth !== measuredWidth) scheduleMeasure();
    });
    resize.observe(viewport);
    const stopScenes = scenes.subscribe(syncChapter);
    const stopLoading = loadingUI.subscribe(syncChapter);
    document.addEventListener('visibilitychange', syncPlayback);
    reduced.addEventListener('change', scheduleMeasure);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    measure(); syncChapter();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); resize.disconnect(); stopScenes(); stopLoading();
      document.removeEventListener('visibilitychange', syncPlayback);
      reduced.removeEventListener('change', scheduleMeasure);
      track.querySelectorAll('[data-ticker-copy]').forEach(copy => copy.remove());
    };
  }, [host]);
  const ticker = jsx.jsx('div', { className: 'continuity-marquee', ref: layerRef, 'data-visible': 'false', 'aria-hidden': 'true', children:
    jsx.jsx('div', { className: 'continuity-marquee__viewport', ref: viewportRef, children:
      jsx.jsx('div', { className: 'continuity-marquee__track', ref: trackRef, children:
        jsx.jsx('div', { className: 'continuity-marquee__item', children:
          jsx.jsxs('p', { className: 'continuity-marquee__title', children: [
            jsx.jsx('strong', { children: 'Preach' }), ' the value of yours'
          ] })
        })
      })
    })
  });
  return jsx.jsxs(React.Fragment, { children: [
    jsx.jsx('div', { className: 'continuity-marquee-slot', 'aria-hidden': 'true' }),
    host ? getReactDOM().createPortal(ticker, host) : null
  ] });
}
