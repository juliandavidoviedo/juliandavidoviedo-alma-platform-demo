import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DISCIPLINES } from '../../content/disciplines';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DancerCouple } from '../../components/art/DancerCouple';
import { DanceShoe } from '../../components/art/DanceShoe';

export function Classes() {
  return (
    <div className="relative overflow-hidden">
      <DancerCouple className="pointer-events-none absolute -top-10 -right-24 h-[420px] w-[340px] text-alma-text opacity-[0.05] sm:right-0" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-2">
          <DanceShoe className="h-6 w-6 text-alma-gold" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-[0.2em] text-alma-gold uppercase">Portafolio</span>
        </div>
        <h1 className="mt-3 font-display text-4xl text-alma-text sm:text-5xl">Nuestras clases</h1>
        <p className="mt-4 max-w-2xl text-lg text-alma-text-secondary">
          Tango en el centro, y cada vez más ritmos alrededor. Elige por nivel, por horario, o simplemente por
          las ganas del momento.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {DISCIPLINES.map((d) => (
            <Card key={d.slug} elevated={d.featured} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-alma-text">{d.name}</h2>
                  <p className="text-sm text-alma-gold">{d.tagline}</p>
                </div>
                {d.featured && (
                  <Badge tone="gold">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Destacada
                  </Badge>
                )}
              </div>

              <p className="text-sm text-alma-text-secondary">{d.description}</p>

              <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-alma-border pt-3 text-xs text-alma-text-muted sm:grid-cols-2">
                <span>
                  <span className="text-alma-text-secondary">Nivel:</span> {d.level}
                </span>
                <span>
                  <span className="text-alma-text-secondary">Profesor:</span> {d.teacher}
                </span>
                <span className="sm:col-span-2">
                  <span className="text-alma-text-secondary">Horario:</span> {d.schedule}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card elevated className="mt-12 flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl text-alma-text">¿No sabes por dónde empezar?</h2>
          <p className="max-w-xl text-alma-text-secondary">
            Una clase de prueba resuelve la duda en una hora. Sin compromiso, sin necesidad de pareja ni de
            experiencia previa.
          </p>
          <Link to="/eventos">
            <Button variant="primary">
              Ver próximos eventos y talleres
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
