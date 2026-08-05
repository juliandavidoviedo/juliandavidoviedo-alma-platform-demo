import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'gold' | 'danger' | 'success';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-alma-border bg-alma-surface-elevated text-alma-text-secondary',
  gold: 'border-alma-gold/40 bg-alma-gold/10 text-alma-gold',
  danger: 'border-alma-wine/50 bg-alma-wine/15 text-[#e4a3ab]',
  success: 'border-[#3a5a3a] bg-[#1c2b1c] text-[#8fd18f]',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
