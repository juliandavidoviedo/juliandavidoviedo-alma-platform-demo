/**
 * Persistent, non-dismissible marker that this is a simulation.
 * Present on every screen via AppShell — never conditionally hidden.
 */
export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-alma-gold/40 bg-alma-gold/10 px-3 py-1 text-xs font-semibold tracking-[0.15em] text-alma-gold uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-alma-gold" aria-hidden="true" />
      Demo
    </span>
  );
}
