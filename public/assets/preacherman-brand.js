import { profileState } from './preacherman-profile-state.js';

let dialog, trigger, frame = 0, opened = false, start = 0, from = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const light = matchMedia('(prefers-color-scheme: light)');

function appearance() {
  const mode = document.documentElement.dataset.appearance;
  const isLight = mode ? mode === 'light' : light.matches;
  if (dialog) dialog.dataset.appearance = isLight ? 'light' : 'dark';
  profileState.surface = isLight ? [0.93, 0.93, 0.90] : [0, 0, 0];
}
function resize() {
  const diameter = Math.min(innerWidth < 640 ? 420 : 600, innerWidth - 24, innerHeight - 80);
  profileState.radius = diameter / (2 * innerWidth);
  dialog?.style.setProperty('--profile-diameter', `${diameter}px`);
}
function tick(now) {
  const duration = reduced.matches ? 0 : opened ? 850 : 650;
  const t = duration ? Math.min(1, (now - start) / duration) : 1;
  const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  profileState.progress = from + ((opened ? 1 : 0) - from) * ease;
  profileState.squash = opened ? -0.1 * Math.max(0, 1 - (now - start) / 300) : -0.1 * t;
  if (!reduced.matches) profileState.time = now / 1000;
  dialog.style.setProperty('--profile-progress', profileState.progress);
  dialog.style.setProperty('--profile-disc-scale', profileState.progress * (1 + 0.015 * Math.sin(profileState.time * 1.6)));
  if (!opened && t === 1) {
    profileState.progress = 0;
    dialog.close();
    trigger?.focus({ preventScroll: true });
    frame = 0;
    return;
  }
  frame = opened && !reduced.matches || t < 1 ? requestAnimationFrame(tick) : 0;
}
function setOpen(value) {
  if (opened === value) return;
  opened = value;
  cancelAnimationFrame(frame);
  from = profileState.progress;
  start = performance.now();
  dialog.dataset.open = String(value);
  document.querySelectorAll('[data-brand-profile-toggle]').forEach(el => el.setAttribute('aria-expanded', String(value)));
  if (value) {
    appearance(); resize(); dialog.showModal();
    dialog.querySelector('button').focus({ preventScroll: true });
  }
  frame = requestAnimationFrame(tick);
}
function createDialog() {
  dialog = document.createElement('dialog');
  dialog.id = 'preacherman-profile';
  dialog.className = 'brand-profile';
  dialog.dataset.preachermanEnglish = 'true';
  dialog.setAttribute('lang', 'en');
  dialog.setAttribute('aria-labelledby', 'preacherman-profile-title');
  dialog.setAttribute('data-lenis-prevent', '');
  dialog.innerHTML = `<div class="brand-profile__disc"><div class="brand-profile__copy">
    <h2 id="preacherman-profile-title">Give intelligence a vessel.</h2>
    <p>Preacherman brings virtual character assets together, works with widely used engines, and uses real tools to get things done.</p>
    <p>Manage an AI that keeps learning, can be deployed, and takes action.</p>
    <p>More than a virtual character, it is your second identity in the virtual world.</p>
    <button class="brand-profile__close" type="button" aria-label="Close profile">Close <span aria-hidden="true">×</span></button>
  </div></div>`;
  dialog.addEventListener('cancel', event => { event.preventDefault(); setOpen(false); });
  dialog.querySelector('button').addEventListener('click', () => setOpen(false));
  dialog.addEventListener('click', event => {
    const rect = dialog.querySelector('.brand-profile__disc').getBoundingClientRect();
    if (Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2) > rect.width / 2) setOpen(false);
  });
  document.body.append(dialog);
  resize(); appearance();
}
document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-brand-profile-toggle]');
  if (!button) return;
  event.preventDefault();
  trigger = button;
  if (!dialog) createDialog();
  setOpen(!opened);
});
window.addEventListener('resize', resize, { passive: true });
light.addEventListener('change', appearance);
reduced.addEventListener('change', () => {
  if (!dialog) return;
  cancelAnimationFrame(frame);
  start = performance.now(); from = profileState.progress;
  frame = requestAnimationFrame(tick);
});
window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
