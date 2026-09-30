import { r as React, j as jsx } from './runtime/components-BdJai906.js';

// English is the only published language while the site copy is being written.
export function LanguageSelector({ id = 'brand-language' }) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef(null);
  const trigger = React.useRef(null);
  const english = React.useRef(null);
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    if (!open) return;
    english.current?.focus({ preventScroll: true });
    const outside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open]);

  return jsx.jsxs('div', {
    ref: root,
    className: 'brand-language',
    'data-section-name': 'language',
    'data-preacherman-english': 'true',
    lang: 'en',
    onBlur: event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    },
    children: [
      jsx.jsxs('button', {
        ref: trigger,
        id: `${id}-trigger`,
        type: 'button',
        className: 'brand-language__trigger navButton text-label-1',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': `${id}-menu`,
        onClick: () => setOpen(value => !value),
        onKeyDown: event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            english.current?.focus({ preventScroll: true });
          }
        },
        children: ['Language', jsx.jsx('span', { className: 'brand-language__chevron', 'aria-hidden': 'true' })],
      }),
      jsx.jsxs('div', {
        id: `${id}-menu`,
        className: 'brand-language__menu',
        role: 'menu',
        'aria-labelledby': `${id}-trigger`,
        hidden: !open,
        onKeyDown: event => {
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            english.current?.focus({ preventScroll: true });
          }
          if (event.key === 'Tab') close();
        },
        children: [
          jsx.jsxs('button', {
            ref: english,
            type: 'button',
            className: 'brand-language__option',
            role: 'menuitemradio',
            'aria-checked': true,
            tabIndex: -1,
            onClick: () => close(true),
            children: ['English', jsx.jsx('span', { className: 'brand-language__check', 'aria-hidden': 'true', children: '✓' })],
          }),
          jsx.jsxs('button', {
            type: 'button',
            className: 'brand-language__option',
            role: 'menuitemradio',
            'aria-checked': false,
            'aria-disabled': true,
            disabled: true,
            tabIndex: -1,
            children: ['Chinese', jsx.jsx('span', { className: 'brand-language__soon', children: 'Coming soon' })],
          }),
        ],
      }),
    ],
  });
}
