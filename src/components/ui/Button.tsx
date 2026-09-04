import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-alma-gold text-alma-bg hover:bg-alma-gold/90',
  secondary:
    'border border-alma-border bg-alma-surface-elevated text-alma-text hover:border-alma-text-muted',
  ghost: 'text-alma-text-secondary hover:text-alma-text',
  danger: 'border border-alma-wine/60 text-[#e4a3ab] hover:bg-alma-wine/10',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 text-[0.95rem] font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
