import { useEffect, useState } from 'react';
import { DancerSpin } from './art/DancerSpin';

/**
 * One-time loading intro, shown for ~1.8s on first mount. Pure CSS/SVG
 * animation — no animation library, keeps the bundle small. Respects
 * prefers-reduced-motion by skipping straight to the app. Not persisted:
 * every fresh load (including a demo reset) sees it again, which is
 * consistent with the rest of the demo's "reload resets everything" design.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onDone();
      return;
    }

    const duration = 1600;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed < duration) {
        frame = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        setTimeout(onDone, 350);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-alma-bg transition-opacity duration-300',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      ].join(' ')}
      role="status"
      aria-label="Cargando Alma de Tango"
    >
      <DancerSpin className="h-24 w-24 animate-[spin_2.4s_linear_infinite] text-alma-gold" />

      <div className="text-center">
        <p className="font-display text-3xl tracking-wide text-alma-text">Alma de Tango</p>
        <p className="mt-1 text-xs tracking-[0.3em] text-alma-text-muted uppercase">
          Alma Platform
        </p>
      </div>

      <div className="w-48">
        <div className="h-1 w-full overflow-hidden rounded-full bg-alma-border">
          <div
            className="h-full rounded-full bg-alma-gold transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
