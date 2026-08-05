/**
 * Scaffold placeholder.
 *
 * Its only job is to prove the build and deployment pipeline end to end.
 * Routing, the design system and the five product screens land in later
 * commits — nothing here is meant to survive them.
 */
function App() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <span className="rounded-full border border-alma-gold/40 bg-alma-gold/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-alma-gold uppercase">
        Demo
      </span>

      <h1 className="mt-8 font-display text-5xl leading-tight text-alma-cream sm:text-6xl">
        Alma Platform
      </h1>

      <p className="mt-4 max-w-md text-lg text-alma-cream/70">
        Demostración de validación para{' '}
        <span className="text-alma-gold">Alma de Tango</span>
      </p>

      <div className="mt-10 h-px w-16 bg-alma-wine" aria-hidden="true" />

      <p className="mt-10 max-w-sm text-sm text-alma-cream/50">
        Datos de demostración. No hay conexión a un sistema real.
      </p>
    </div>
  )
}

export default App
