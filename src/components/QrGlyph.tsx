import { useMemo } from 'react';

/**
 * Deterministic decorative grid standing in for a QR code — never a
 * scannable, real one. Shared between the check-in scanner and the payment
 * "transfer QR" so both read as the same visual language.
 */
export function QrGlyph({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let hash = 0;
    for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return Array.from({ length: 64 }, (_, i) => ((hash >> (i % 24)) & 1) === 1);
  }, [seed]);

  return (
    <div className="grid grid-cols-8 gap-1 rounded-xl bg-alma-text p-3">
      {cells.map((filled, i) => (
        <div key={i} className={['aspect-square rounded-[2px]', filled ? 'bg-alma-bg' : 'bg-alma-text'].join(' ')} />
      ))}
    </div>
  );
}
