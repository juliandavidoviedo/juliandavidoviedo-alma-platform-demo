import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  MessageCircleMore,
  UserRound,
  Sheet,
  TrendingDown,
  LineChart,
  Users,
  Smartphone,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const PAIN_POINTS = [
  {
    icon: BookOpen,
    title: 'La operación vive en un cuaderno',
    description: 'Cada clase, cada pago, cada saldo se anota a mano. Si el cuaderno no está, la información tampoco.',
  },
  {
    icon: MessageCircleMore,
    title: 'WhatsApp y hojas sueltas',
    description: 'Recordatorios, comprobantes de pago y horarios se dispersan entre chats y Excel sin dueño único.',
  },
  {
    icon: UserRound,
    title: 'Todo depende de recepción',
    description: 'Solo una persona sabe cuántas clases le quedan a cada alumno. Si no está, nadie más lo sabe.',
  },
  {
    icon: TrendingDown,
    title: 'Los paquetes vencen sin que nadie lo note',
    description: 'Un alumno termina su paquete, nadie le avisa, y se va en silencio. El costo no es administrativo: es retención.',
  },
];

const BENEFITS = [
  {
    to: '/admin',
    role: 'Dirección',
    person: 'Iván, director ejecutivo',
    icon: LineChart,
    points: [
      'Caja del mes, ingreso diferido y ocupación por clase en un solo lugar',
      'Alumnos en riesgo de fuga, identificados antes de que se vayan',
      'Decisiones con datos, no con la memoria de recepción',
    ],
  },
  {
    to: '/reception',
    role: 'Recepción',
    person: 'Jonathan, recepción',
    icon: Users,
    points: [
      'Vender un paquete y registrar asistencia en segundos',
      'Ver quién está en la sala ahora mismo',
      'Nunca bloquear a un alumno en la puerta, aunque su saldo esté en cero',
    ],
  },
  {
    to: '/student',
    role: 'Alumno',
    person: 'Julián, alumno',
    icon: Smartphone,
    points: [
      'Saber cuántas clases le quedan sin llamar a nadie',
      'Registrar su asistencia en la puerta en cinco segundos',
      'Ver sus puntos, su racha y su próxima clase desde el celular',
    ],
  },
];

export function Landing() {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="rounded-full border border-alma-border bg-alma-surface px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-alma-text-muted uppercase">
          Alma Platform
        </span>

        <h1 className="mt-8 font-display text-4xl leading-tight text-alma-text sm:text-6xl">
          El sistema operativo para{' '}
          <span className="text-alma-gold">academias de baile</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-alma-text-secondary sm:text-xl">
          Construido para <span className="text-alma-text">Alma de Tango</span>: que un
          alumno sepa cuántas clases le quedan sin preguntar, y que la dirección deje de
          reconstruir el mes a fin de mes.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a href="#explorar">
            <Button variant="primary" className="px-8">
              Explorar demostración
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </section>

      {/* Pain points */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl text-alma-text sm:text-3xl">
          El problema hoy
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-alma-text-secondary">
          No es falta de esfuerzo. Es que la operación entera pasa por una sola persona y un
          sistema que no avisa cuando algo se está por romper.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PAIN_POINTS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-alma-border bg-alma-surface-elevated">
                <Icon className="h-5 w-5 text-alma-gold" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-medium text-alma-text">{title}</h3>
                <p className="mt-1.5 text-sm text-alma-text-secondary">{description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-alma-wine/40 bg-alma-wine/10 p-5">
          <Sheet className="mt-0.5 h-5 w-5 shrink-0 text-[#e4a3ab]" aria-hidden="true" />
          <p className="text-sm text-[#e4a3ab]">
            El costo real no es administrativo, es de retención: un alumno que termina su
            paquete y nadie lo nota, se va en silencio.
          </p>
        </div>
      </section>

      {/* Benefits / role entry points */}
      <section id="explorar" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-display text-2xl text-alma-text sm:text-3xl">
          Un beneficio distinto para cada persona
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-alma-text-secondary">
          Elige una perspectiva para recorrer la demostración.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {BENEFITS.map(({ to, role, person, icon: Icon, points }) => (
            <Card key={to} elevated className="flex flex-col">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-alma-gold/30 bg-alma-gold/10">
                <Icon className="h-5 w-5 text-alma-gold" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-xl text-alma-text">{role}</h3>
              <p className="text-xs text-alma-text-muted">{person} · demo</p>

              <ul className="mt-4 flex-1 space-y-2.5 text-sm text-alma-text-secondary">
                {points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-alma-gold" />
                    {point}
                  </li>
                ))}
              </ul>

              <Link to={to} className="mt-6">
                <Button variant="secondary" className="w-full">
                  Ver como {role.toLowerCase()}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Pilot CTA */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <Card elevated className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl text-alma-text">
            ¿Validamos un piloto en Alma de Tango?
          </h2>
          <p className="max-w-xl text-alma-text-secondary">
            Esta demostración usa datos ficticios. El siguiente paso, si el problema y los
            flujos hacen sentido, es probarlo con datos reales de la academia.
          </p>
          <Link to="/admin">
            <Button variant="primary">
              Empezar por el panel de dirección
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
