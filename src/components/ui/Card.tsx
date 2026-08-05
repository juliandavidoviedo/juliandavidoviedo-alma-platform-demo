import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
};

export function Card({ className = '', elevated = false, ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-alma-border p-5 sm:p-6',
        elevated ? 'bg-alma-surface-elevated' : 'bg-alma-surface',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
