import { useState } from 'react';
import { CalendarDays, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { EVENTS, EVENT_TYPE_LABELS } from '../../content/events';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDateWithWeekday } from '../../lib/format';

function RegistrationForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Simulated: nothing is sent anywhere, nothing typed here is stored.
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 500);
  }

  if (done) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-alma-gold/30 bg-alma-gold/10 p-3.5 text-sm text-alma-gold">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        Inscripción registrada (simulación). No se envió ni se guardó ningún dato real.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" className="mt-4 w-full" onClick={() => setOpen(true)}>
        Inscribirme
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5">
      <input
        type="text"
        required
        placeholder="Nombre (de práctica, no se guarda)"
        className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
      />
      <input
        type="text"
        placeholder="WhatsApp o correo (opcional)"
        className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
      />
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Confirmar inscripción (simulación)'}
      </Button>
    </form>
  );
}

export function Events() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="text-xs font-semibold tracking-[0.2em] text-alma-gold uppercase">Eventos</span>
      <h1 className="mt-3 font-display text-4xl text-alma-text sm:text-5xl">Novedades y convocatorias</h1>
      <p className="mt-4 max-w-xl text-lg text-alma-text-secondary">
        Milongas, puestas en escena, talleres y convocatorias abiertas para bailarines de la academia.
      </p>

      <div className="mt-12 flex flex-col gap-5">
        {EVENTS.map((event) => (
          <Card key={event.eventId}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge tone="gold">{EVENT_TYPE_LABELS[event.type]}</Badge>
                <h2 className="mt-2 font-display text-xl text-alma-text">{event.title}</h2>
              </div>
              {event.spotsLeft !== null && (
                <span className="flex items-center gap-1.5 text-xs text-alma-text-muted">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.spotsLeft} cupos disponibles
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-alma-text-secondary">{event.description}</p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-alma-border pt-3 text-xs text-alma-text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDateWithWeekday(event.date)} · {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {event.location}
              </span>
            </div>

            <RegistrationForm />
          </Card>
        ))}
      </div>
    </div>
  );
}
