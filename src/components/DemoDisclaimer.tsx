/**
 * The two disclaimers required on every screen. Kept as one component so the
 * exact wording lives in a single place instead of being retyped per page.
 */
export function DemoDisclaimer() {
  return (
    <p className="mx-auto max-w-2xl px-4 py-6 text-center text-xs leading-relaxed text-alma-text-muted">
      Datos de demostración. No hay conexión a un sistema real.
      <br />
      Datos simulados. Los nombres se usan únicamente con fines de demostración.
    </p>
  );
}
