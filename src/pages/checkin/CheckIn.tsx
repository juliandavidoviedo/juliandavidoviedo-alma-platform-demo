import { useEffect, useMemo, useState } from 'react';
import { PartyPopper, ScanLine, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { CheckInScenario, CheckInSimulateResult, RotatingCode } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActionFeedback } from '../../components/ui/ActionFeedback';

const SCENARIOS: { value: CheckInScenario; label: string }[] = [
  { value: 'SUCCESS', label: 'Éxito' },
  { value: 'ALREADY_CHECKED_IN', label: 'Ya registrado' },
  { value: 'NO_PACKAGE', label: 'Sin paquete' },
];

/** Deterministic decorative grid standing in for a QR code — never a scannable, real one. */
function QrGlyph({ seed }: { seed: string }) {
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

export function CheckIn() {
  const [rotating, setRotating] = useState<RotatingCode | null>(null);
  const [scenario, setScenario] = useState<CheckInScenario>('SUCCESS');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<CheckInSimulateResult | null>(null);

  useEffect(() => {
    let active = true;
    function poll() {
      api.checkIn.getRotatingCode().then((r) => {
        if (active) setRotating(r);
      });
    }
    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function handleSimulate() {
    setSimulating(true);
    setResult(null);
    const r = await api.checkIn.simulate(scenario);
    setResult(r);
    setSimulating(false);
  }

  const windowSeconds = 90;
  const progress = rotating ? (rotating.secondsRemaining / windowSeconds) * 100 : 100;

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <p className="text-sm text-alma-text-muted">Check-in por QR</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text">
        {rotating?.classInProgress?.name ?? 'Sin clase abierta'}
      </h1>
      {rotating?.classInProgress && (
        <p className="text-xs text-alma-text-muted">
          Comenzó a las {rotating.classInProgress.startTime} · {rotating.classInProgress.roomName} (piso{' '}
          {rotating.classInProgress.floor}) · Prof. {rotating.classInProgress.teacher}
        </p>
      )}

      <Card elevated className="mt-6 flex flex-col items-center gap-4 text-center">
        <ScanLine className="h-5 w-5 text-alma-gold" aria-hidden="true" />
        <p className="text-xs text-alma-text-muted">
          El código en recepción cambia cada 90 segundos. Aquí simulamos el escaneo — sin cámara real.
        </p>

        {rotating && <QrGlyph seed={rotating.code} />}

        <p className="font-display text-3xl tracking-[0.3em] text-alma-text">{rotating?.code ?? '······'}</p>

        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-alma-border">
            <div
              className="h-full rounded-full bg-alma-gold transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-alma-text-muted">
            Cambia en {rotating?.secondsRemaining ?? '…'} s
          </p>
        </div>
      </Card>

      {/* Demo scenario selector — presenter control, not part of the real product */}
      <div className="mt-6">
        <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">
          Estado de demostración
        </p>
        <div className="mt-2 inline-flex w-full rounded-full border border-alma-border bg-alma-surface p-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setScenario(s.value);
                setResult(null);
              }}
              className={[
                'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                scenario === s.value ? 'bg-alma-gold text-alma-bg' : 'text-alma-text-secondary',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" className="mt-5 w-full" onClick={handleSimulate} disabled={simulating}>
        {simulating ? 'Simulando escaneo…' : 'Simular escaneo'}
      </Button>

      {result && (
        <div className="mt-5 flex flex-col gap-3">
          <ActionFeedback
            tone={result.scenario === 'SUCCESS' ? 'success' : 'warning'}
            message={result.message}
          />

          {result.scenario === 'SUCCESS' && (
            <Card elevated className="flex flex-col items-center gap-2 text-center">
              <PartyPopper className="h-6 w-6 text-alma-gold" aria-hidden="true" />
              <p className="font-display text-4xl text-alma-gold">{result.remainingClasses}</p>
              <p className="text-xs text-alma-text-muted">clases disponibles ahora</p>
              {result.bonus && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-alma-gold">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {result.bonus.label}
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
