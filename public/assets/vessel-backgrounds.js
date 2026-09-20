// Authored oil paintings use the existing scroll zoom and paper/burn compositor.
// Background pixels are immutable; only scroll-driven texture coordinates move.
export function mountVesselBackgrounds(uniforms, { TextureLoader, preferences }) {
  const root = document.documentElement;
  const holder = document.createElement('div');
  holder.hidden = true;
  holder.setAttribute('aria-hidden', 'true');
  holder.dataset.vesselMedia = '';
  holder.dataset.backgroundType = 'image';
  document.body.append(holder);
  const loader = new TextureLoader();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let active = false;
  let boundary = null;
  const paintings = ['scene02', 'scene07'].map(name => {
    const painting = { name, ready: false, texture: null };
    painting.texture = loader.load(`/assets/oil-backgrounds/${name}-oil-still.png`, () => {
      painting.ready = !disposed;
      holder.dataset.ready = String(paintings.every(image => image.ready));
    });
    return painting;
  });
  return {
    tick(section, overlay, height) {
      if (disposed) return false;
      boundary ||= document.getElementById('sidekick-builds-workflows-in-shopify-flow');
      const visible = section === 1 && Math.abs(overlay) < 1;
      const reduced = preferences.getState().preferReducedMotion || reducedMotion.matches;
      const progress = boundary ? Math.max(0, Math.min(1, (height - boundary.getBoundingClientRect().top) / (height * .85))) : 0;
      const enabled = visible && paintings.every(painting => painting.ready);
      uniforms.get('uVesselEnabled').value = enabled ? 1 : 0;
      uniforms.get('uVesselMix').value = progress;
      const sectionNode = document.getElementById('sidekick');
      const sectionTop = sectionNode?.getBoundingClientRect().top || 0;
      const boundaryTop = boundary?.getBoundingClientRect().top || height;
      const split = boundaryTop - sectionTop;
      const smooth = p => { p = Math.max(0, Math.min(1, p)); return p * p * (3 - 2 * p); };
      const zoom02 = reduced ? 1 : 1 + .20 * smooth((-sectionTop - height) / Math.max(height, split - height));
      const zoom07 = reduced ? 1 : 1 + .20 * smooth(-boundaryTop / Math.max(height, (sectionNode?.offsetHeight || height) - split - height));
      uniforms.get('uVesselZoom02').value = zoom02;
      uniforms.get('uVesselZoom07').value = zoom07;
      holder.dataset.zoom02 = zoom02.toFixed(4);
      holder.dataset.zoom07 = zoom07.toFixed(4);
      paintings.forEach((painting, index) => {
        uniforms.get(index === 0 ? 'tVessel02' : 'tVessel07').value = painting.texture;
      });
      if (enabled !== active) {
        active = enabled;
        // Existing page chrome uses this legacy marker for its readable ink.
        if (active) root.dataset.vesselVideo = 'true';
        else delete root.dataset.vesselVideo;
      }
      holder.dataset.scene = enabled ? (progress <= 0 ? 'scene02' : progress >= 1 ? 'scene07' : 'transition') : 'inactive';
      holder.dataset.progress = progress.toFixed(4);
      return enabled;
    },
    dispose() {
      disposed = true;
      paintings.forEach(painting => painting.texture.dispose());
      holder.remove();
      delete root.dataset.vesselVideo;
    }
  };
}
