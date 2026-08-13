/**
 * Reusable Alma loading indicator: a thin horizontal bar with a minimalist
 * ballet-dancer glyph traveling along it. Pure CSS + inline SVG, no
 * dependency. Indeterminate by default (a simulated network delay, not a
 * real progress number) — pass `progress` (0-100) for a determinate bar
 * instead. Respects `prefers-reduced-motion` (see `index.css`): the
 * animation is disabled and the dancer sits static at its resting position.
 */
export function AlmaLoader({ label, progress }: { label?: string; progress?: number }) {
  const determinate = typeof progress === 'number';
  const clamped = determinate ? Math.min(100, Math.max(0, progress)) : null;

  return (
    <div className="w-full" role="status" aria-label={label ?? 'Cargando'}>
      <div className="alma-loader-track relative h-2 w-full overflow-visible rounded-full bg-alma-border">
        <div
          className={[
            'h-full rounded-full bg-alma-text/60',
            determinate ? 'transition-[width] duration-300' : 'alma-loader-fill',
          ].join(' ')}
          style={determinate ? { width: `${clamped}%` } : undefined}
        />
        <svg
          className={determinate ? '' : 'alma-loader-dancer'}
          style={determinate ? { left: `calc(${clamped}% - 7px)` } : undefined}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2.1" fill="currentColor" className="text-alma-text" />
          <path
            d="M12 6.5 L12 13 M12 8.5 L7 6 M12 8.5 L17 6.5 M12 13 L8 21 M12 13 L16 20"
            stroke="currentColor"
            className="text-alma-text"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="0.9" fill="currentColor" className="text-alma-gold" />
        </svg>
      </div>
      {label && <p className="mt-1.5 text-xs text-alma-text-muted">{label}</p>}
    </div>
  );
}
