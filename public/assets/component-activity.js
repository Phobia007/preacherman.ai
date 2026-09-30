// Shared lifecycle for expensive embedded components. No polling while idle.
export function observeComponentActivity(element, { onActive, onRelease, releaseAfter = 3000 }) {
  let intersecting = false, active = false, disposed = false, releaseTimer = 0;
  const sync = () => {
    const next = intersecting && !document.hidden;
    if (next === active || disposed) return;
    active = next;
    clearTimeout(releaseTimer);
    onActive(active);
    if (!active && onRelease) releaseTimer = setTimeout(() => {
      releaseTimer = 0;
      if (!active && !disposed) onRelease();
    }, releaseAfter);
  };
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting && entry.intersectionRatio >= .1;
    sync();
  }, { threshold: [0, .1] });
  observer.observe(element);
  document.addEventListener('visibilitychange', sync);
  return () => {
    disposed = true;
    clearTimeout(releaseTimer);
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  };
}
