export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-alma-border"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-alma-gold transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
