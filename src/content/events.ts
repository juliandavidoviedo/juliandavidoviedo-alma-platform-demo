/** Marketing content for /eventos. Fictional, illustrative — the registration form is simulated. */
export type EventType = 'MILONGA' | 'PUESTA_EN_ESCENA' | 'CONVOCATORIA' | 'TALLER';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  MILONGA: 'Milonga',
  PUESTA_EN_ESCENA: 'Puesta en escena',
  CONVOCATORIA: 'Convocatoria',
  TALLER: 'Taller',
};

export interface AcademyEvent {
  eventId: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  spotsLeft: number | null;
}

export const EVENTS: AcademyEvent[] = [
  {
    eventId: 'EV-001',
    title: 'Milonga de fin de mes',
    type: 'MILONGA',
    date: '2026-08-29',
    time: '20:00',
    location: 'Salón Milonga · piso 1',
    description:
      'La cita mensual para bailar sin clase, con DJ en vivo y cortinas clásicas. Entrada libre para alumnos activos, con invitado.',
    spotsLeft: null,
  },
  {
    eventId: 'EV-002',
    title: 'Puesta en escena: "Café de los Sentidos"',
    type: 'PUESTA_EN_ESCENA',
    date: '2026-09-20',
    time: '19:30',
    location: 'Teatro Municipal (invitados especiales)',
    description:
      'El grupo de Tango Escenario presenta la coreografía trabajada durante el semestre. Cupo limitado para familiares y acompañantes.',
    spotsLeft: 40,
  },
  {
    eventId: 'EV-003',
    title: 'Convocatoria: bailarines para el grupo de exhibición',
    type: 'CONVOCATORIA',
    date: '2026-08-16',
    time: '11:00',
    location: 'Salón Principal · piso 1',
    description:
      'Buscamos 4 parejas de nivel avanzado para representar a Alma de Tango en eventos externos durante el segundo semestre. Se requiere disponibilidad los sábados.',
    spotsLeft: 8,
  },
  {
    eventId: 'EV-004',
    title: 'Taller intensivo de Vals',
    type: 'TALLER',
    date: '2026-08-23',
    time: '15:00',
    location: 'Salón Principal · piso 1',
    description:
      'Tres horas enfocadas solo en giros y musicalidad de vals, con Laura. Recomendado para nivel intermedio en adelante.',
    spotsLeft: 14,
  },
];
