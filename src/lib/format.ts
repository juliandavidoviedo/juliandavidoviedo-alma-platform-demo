const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return COP.format(amount).replace('COP', '$').replace(/\s+/, ' ').trim();
}

const LONG_DATE = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
});

export function formatDateLong(iso: string): string {
  return LONG_DATE.format(new Date(`${iso}T00:00:00`));
}

const WEEKDAY_DATE = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function formatDateWithWeekday(iso: string): string {
  const label = WEEKDAY_DATE.format(new Date(`${iso}T00:00:00`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatPercentDelta(fraction: number): string {
  const pct = Math.round(fraction * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

export function formatSignedInt(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}
