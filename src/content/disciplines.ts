/**
 * Marketing content for /clases — the class portfolio. Presentation-only:
 * unlike ROOMS or the mock student/class data in lib/api, these don't feed
 * any operational screen (Reception, Director). Extending the real catalog
 * of disciplines is a data-model decision for the actual product, not this
 * demo's job.
 */
export interface Discipline {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  level: string;
  schedule: string;
  teacher: string;
  featured?: boolean;
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: 'tango',
    name: 'Tango',
    tagline: 'La base de todo lo que enseñamos',
    description:
      'Postura, caminata, marca y musicalidad desde el primer día. Grupos por nivel para que nadie se quede corriendo detrás de la clase ni aburrido esperando al resto.',
    level: 'Inicial · Intermedio · Avanzado',
    schedule: 'Martes y jueves, 19:00 y 20:30',
    teacher: 'Laura',
    featured: true,
  },
  {
    slug: 'milonga',
    name: 'Milonga',
    tagline: 'El tango rápido, con humor',
    description: 'Ritmo binario, tráfico de pista y esa alegría que se nota apenas suena la orquesta.',
    level: 'Intermedio',
    schedule: 'Miércoles, 19:00',
    teacher: 'Diego',
  },
  {
    slug: 'vals',
    name: 'Vals',
    tagline: 'Giros continuos, vuelo en tres tiempos',
    description: 'La clase que más pide la gente que ya camina bien y quiere que la pista se sienta ligera.',
    level: 'Intermedio · Avanzado',
    schedule: 'Viernes, 18:00',
    teacher: 'Laura',
  },
  {
    slug: 'salsa',
    name: 'Salsa',
    tagline: 'Nueva en el portafolio',
    description:
      'Salsa en línea y rueda, con la misma exigencia técnica que le ponemos al tango. Para quien quiere variar el pie sin perder el nivel.',
    level: 'Todos los niveles',
    schedule: 'Lunes y miércoles, 20:00',
    teacher: 'Camila',
    featured: true,
  },
  {
    slug: 'tap',
    name: 'Tap',
    tagline: 'Nueva en el portafolio',
    description: 'Percusión con los pies, técnica de zapateo y coordinación — un contraste divertido con la elegancia del tango.',
    level: 'Inicial',
    schedule: 'Sábados, 11:00',
    teacher: 'Camila',
  },
  {
    slug: 'tango-escenario',
    name: 'Tango Escenario',
    tagline: 'Para quienes ya bailan y quieren actuar',
    description:
      'Coreografía, expresión corporal y trabajo de puesta en escena. La clase de domingo, más larga, pensada para preparar las presentaciones de la academia.',
    level: 'Avanzado · coreográfico',
    schedule: 'Domingos, 10:00 a 13:00 (3 horas)',
    teacher: 'Laura',
    featured: true,
  },
  {
    slug: 'personalizadas',
    name: 'Clases personalizadas',
    tagline: 'A tu ritmo, con toda la atención del profesor',
    description:
      'Para preparar una boda, acelerar un nivel específico, o simplemente aprender sin compararte con nadie. Horario flexible, según disponibilidad.',
    level: 'Cualquier nivel',
    schedule: 'Agenda flexible — coordinar con recepción',
    teacher: 'Laura o Diego',
  },
];
