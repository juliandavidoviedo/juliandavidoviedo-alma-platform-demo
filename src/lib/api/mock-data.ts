import type {
  AttendanceRecord,
  ClassRegistration,
  DanceClassInfo,
  DirectorDashboard,
  EngagementInfo,
  PackageInfo,
  PackagePurchase,
  PointsInfo,
  Room,
  RoomBooking,
  ScheduledClass,
  StudentLevel,
  DanceRole,
} from './types';

/**
 * Fixed reference date for the demo. Every "days until expiry" / "days
 * absent" figure below is hand-computed against this date so the numbers
 * stay deterministic no matter when the demo is actually opened — the
 * director should see the same story in the room tomorrow as in tonight's
 * preview.
 */
export const DEMO_TODAY = '2026-08-05';

/**
 * The academy: two floors, four rooms. Every class belongs to exactly one.
 */
export const ROOMS: Room[] = [
  { roomId: 'SALA-1', name: 'Salón Principal', floor: 1, capacity: 20 },
  { roomId: 'SALA-2', name: 'Salón Milonga', floor: 1, capacity: 24 },
  { roomId: 'SALA-3', name: 'Estudio Norte', floor: 2, capacity: 16 },
  { roomId: 'SALA-4', name: 'Estudio Sur', floor: 2, capacity: 12 },
];

export interface DemoStudentRecord {
  studentId: string;
  firstName: string;
  level: StudentLevel;
  danceRole: DanceRole;
  status: 'ACTIVO' | 'INACTIVO';
  package: PackageInfo | null;
  packageHistory: PackagePurchase[];
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  engagement: EngagementInfo;
  upcomingClasses: DanceClassInfo[];
  attendanceHistory: AttendanceRecord[];
}

/** Today's live class — the one Check-in, Reception's roster and the
 * Student "clase de hoy" card all share. */
export const CURRENT_CLASS: DanceClassInfo = {
  classId: 'CL-20260805-1900-TG1',
  name: 'Tango salón intermedio',
  teacher: 'Laura',
  date: DEMO_TODAY,
  startTime: '19:00',
  endTime: '20:30',
  level: 'INTERMEDIO',
  capacity: 20,
  attendeeCount: 2,
  roomId: 'SALA-1',
  roomName: 'Salón Principal',
  floor: 1,
};

/**
 * Julián is the demo's protagonist student — every screen in the "Alumno"
 * story and most of the reception flow center on him.
 */
export const JULIAN: DemoStudentRecord = {
  studentId: 'ST-JULIAN',
  firstName: 'Julián',
  level: 'INTERMEDIO',
  danceRole: 'SEGUIDOR',
  status: 'ACTIVO',
  package: {
    packageId: 'PQ-0187',
    name: 'Paquete 8 clases',
    totalClasses: 8,
    balance: 5,
    expiresOn: '2026-09-14',
    daysUntilExpiry: 40,
  },
  packageHistory: [
    {
      packageId: 'PQ-0187',
      name: 'Paquete 8 clases',
      purchaseDate: '2026-07-15',
      expiresOn: '2026-09-14',
      paymentMethod: 'TRANSFERENCIA',
      amount: 280_000,
      classesIncluded: 8,
      classesRemaining: 5,
    },
    {
      packageId: 'PQ-0102',
      name: 'Paquete 4 clases',
      purchaseDate: '2026-05-20',
      expiresOn: '2026-07-04',
      paymentMethod: 'EFECTIVO',
      amount: 150_000,
      classesIncluded: 4,
      classesRemaining: 0,
    },
  ],
  points: {
    balance: 340,
    tier: 'PLATA',
    tierLabel: 'Plata',
    nextTier: 'Oro',
    pointsToNextTier: 160,
    progress: 68,
  },
  streak: { consecutiveWeeks: 3 },
  engagement: {
    status: 'CRECIENDO',
    attendancesLast30Days: 6,
    daysSinceLastAttendance: 8,
    noShowCount: 0,
  },
  upcomingClasses: [
    {
      classId: 'CL-20260806-1900-TG1',
      name: 'Tango salón intermedio',
      teacher: 'Laura',
      date: '2026-08-06',
      startTime: '19:00',
      endTime: '20:30',
      level: 'INTERMEDIO',
      capacity: 20,
      attendeeCount: 12,
      roomId: 'SALA-1',
      roomName: 'Salón Principal',
      floor: 1,
    },
    {
      classId: 'CL-20260808-1830-TG2',
      name: 'Práctica guiada',
      teacher: 'Diego',
      date: '2026-08-08',
      startTime: '18:30',
      endTime: '19:30',
      level: 'INTERMEDIO',
      capacity: 16,
      attendeeCount: 9,
      roomId: 'SALA-3',
      roomName: 'Estudio Norte',
      floor: 2,
    },
    {
      classId: 'CL-20260811-1900-TG1',
      name: 'Tango salón intermedio',
      teacher: 'Laura',
      date: '2026-08-11',
      startTime: '19:00',
      endTime: '20:30',
      level: 'INTERMEDIO',
      capacity: 20,
      attendeeCount: 7,
      roomId: 'SALA-1',
      roomName: 'Salón Principal',
      floor: 1,
    },
  ],
  attendanceHistory: [
    {
      attendanceId: 'AS-001198',
      date: '2026-07-28',
      className: 'Tango salón intermedio',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001181',
      date: '2026-07-21',
      className: 'Práctica guiada',
      teacher: 'Diego',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001164',
      date: '2026-07-14',
      className: 'Tango salón intermedio',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001149',
      date: '2026-07-09',
      className: 'Milonga social',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 15,
    },
    {
      attendanceId: 'AS-001132',
      date: '2026-07-02',
      className: 'Tango salón intermedio',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
  ],
};

/** Reception search / roster supporting cast — fictional, first names only. */
export const CAMILA: DemoStudentRecord = {
  studentId: 'ST-CAMILA',
  firstName: 'Camila',
  level: 'AVANZADO',
  danceRole: 'LIDER',
  status: 'ACTIVO',
  package: {
    packageId: 'PQ-0233',
    name: 'Paquete 4 clases',
    totalClasses: 4,
    balance: 3,
    expiresOn: '2026-08-28',
    daysUntilExpiry: 23,
  },
  packageHistory: [
    {
      packageId: 'PQ-0233',
      name: 'Paquete 4 clases',
      purchaseDate: '2026-07-22',
      expiresOn: '2026-08-28',
      paymentMethod: 'TARJETA',
      amount: 150_000,
      classesIncluded: 4,
      classesRemaining: 3,
    },
  ],
  points: {
    balance: 120,
    tier: 'BRONCE',
    tierLabel: 'Bronce',
    nextTier: 'Plata',
    pointsToNextTier: 80,
    progress: 60,
  },
  streak: { consecutiveWeeks: 1 },
  engagement: {
    status: 'ESTABLE',
    attendancesLast30Days: 3,
    daysSinceLastAttendance: 0,
    noShowCount: 1,
  },
  upcomingClasses: [],
  attendanceHistory: [],
};

export const ANDRES: DemoStudentRecord = {
  studentId: 'ST-ANDRES',
  firstName: 'Andrés',
  level: 'INICIAL',
  danceRole: 'AMBOS',
  status: 'ACTIVO',
  package: null,
  packageHistory: [
    {
      packageId: 'PQ-0055',
      name: 'Clase suelta',
      purchaseDate: '2026-06-10',
      expiresOn: '2026-07-10',
      paymentMethod: 'EFECTIVO',
      amount: 40_000,
      classesIncluded: 1,
      classesRemaining: 0,
    },
  ],
  points: {
    balance: 30,
    tier: 'BRONCE',
    tierLabel: 'Bronce',
    nextTier: 'Plata',
    pointsToNextTier: 170,
    progress: 15,
  },
  streak: { consecutiveWeeks: 0 },
  engagement: {
    status: 'EN_RIESGO',
    attendancesLast30Days: 0,
    daysSinceLastAttendance: 24,
    noShowCount: 2,
  },
  upcomingClasses: [],
  attendanceHistory: [],
};

export const INITIAL_STUDENTS: Record<string, DemoStudentRecord> = {
  [JULIAN.studentId]: JULIAN,
  [CAMILA.studentId]: CAMILA,
  [ANDRES.studentId]: ANDRES,
};

/**
 * Today's roster for CURRENT_CLASS — the richer replacement for a flat
 * "who's here" list. Valentina and Mariana are the same two names used in
 * the director's at-risk list: Valentina confirmed and didn't show, Mariana
 * cancelled in time. Reinforces one story instead of introducing new cast.
 */
export const INITIAL_ROSTER: ClassRegistration[] = [
  {
    registrationId: 'RG-000401',
    classId: CURRENT_CLASS.classId,
    studentId: CAMILA.studentId,
    studentName: 'Camila',
    status: 'CHECKED_IN',
    confirmedAt: '18:40',
    checkedInAt: '19:02',
    cancelledAt: null,
    consumptionType: 'PAQUETE',
    remainingClasses: CAMILA.package?.balance ?? 0,
  },
  {
    registrationId: 'RG-000402',
    classId: CURRENT_CLASS.classId,
    studentId: ANDRES.studentId,
    studentName: 'Andrés',
    status: 'CHECKED_IN',
    confirmedAt: null,
    checkedInAt: '19:05',
    cancelledAt: null,
    consumptionType: 'SIN_PAQUETE',
    remainingClasses: 0,
  },
  {
    registrationId: 'RG-000403',
    classId: CURRENT_CLASS.classId,
    studentId: 'ST-VALENTINA',
    studentName: 'Valentina',
    status: 'MISSING',
    confirmedAt: '17:50',
    checkedInAt: null,
    cancelledAt: null,
    consumptionType: null,
    remainingClasses: null,
  },
  {
    registrationId: 'RG-000404',
    classId: CURRENT_CLASS.classId,
    studentId: 'ST-MARIANA',
    studentName: 'Mariana',
    status: 'CANCELLED',
    confirmedAt: '12:10',
    checkedInAt: null,
    cancelledAt: '18:20',
    consumptionType: null,
    remainingClasses: null,
  },
];

/**
 * The week's schedule — the operational catalog reception manages: confirm
 * with the teacher, or cancel for low turnout. `attendeeCount` here is a
 * static snapshot, same simplification as the rest of the demo's "aforo"
 * (see bumpOwnUpcomingCount in mock-api.ts) — it does not stay in sync with
 * a given student's own reservation count on their personal agenda.
 */
export const INITIAL_SCHEDULE: ScheduledClass[] = [
  {
    ...CURRENT_CLASS,
    status: 'CONFIRMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260806-1900-TG1',
    name: 'Tango salón intermedio',
    teacher: 'Laura',
    date: '2026-08-06',
    startTime: '19:00',
    endTime: '20:30',
    level: 'INTERMEDIO',
    capacity: 20,
    attendeeCount: 12,
    roomId: 'SALA-1',
    roomName: 'Salón Principal',
    floor: 1,
    status: 'CONFIRMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260806-1800-TB1',
    name: 'Tango básico',
    teacher: 'Diego',
    date: '2026-08-06',
    startTime: '18:00',
    endTime: '19:00',
    level: 'INICIAL',
    capacity: 18,
    attendeeCount: 3,
    roomId: 'SALA-4',
    roomName: 'Estudio Sur',
    floor: 2,
    status: 'PROGRAMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260807-1900-MI1',
    name: 'Milonga social',
    teacher: 'Laura',
    date: '2026-08-07',
    startTime: '19:00',
    endTime: '21:00',
    level: 'INTERMEDIO',
    capacity: 24,
    attendeeCount: 19,
    roomId: 'SALA-2',
    roomName: 'Salón Milonga',
    floor: 1,
    status: 'CONFIRMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260808-1100-TP1',
    name: 'Tap',
    teacher: 'Camila',
    date: '2026-08-08',
    startTime: '11:00',
    endTime: '12:00',
    level: 'INICIAL',
    capacity: 16,
    attendeeCount: 5,
    roomId: 'SALA-3',
    roomName: 'Estudio Norte',
    floor: 2,
    status: 'PROGRAMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260808-1830-TG2',
    name: 'Práctica guiada',
    teacher: 'Diego',
    date: '2026-08-08',
    startTime: '18:30',
    endTime: '19:30',
    level: 'INTERMEDIO',
    capacity: 16,
    attendeeCount: 9,
    roomId: 'SALA-3',
    roomName: 'Estudio Norte',
    floor: 2,
    status: 'PROGRAMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260809-1000-TE1',
    name: 'Tango Escenario',
    teacher: 'Laura',
    date: '2026-08-09',
    startTime: '10:00',
    endTime: '13:00',
    level: 'AVANZADO',
    capacity: 20,
    attendeeCount: 9,
    roomId: 'SALA-1',
    roomName: 'Salón Principal',
    floor: 1,
    status: 'CONFIRMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260810-2000-SA1',
    name: 'Salsa',
    teacher: 'Camila',
    date: '2026-08-10',
    startTime: '20:00',
    endTime: '21:00',
    level: 'INICIAL',
    capacity: 24,
    attendeeCount: 14,
    roomId: 'SALA-2',
    roomName: 'Salón Milonga',
    floor: 1,
    status: 'PROGRAMADA',
    cancelReason: null,
  },
  {
    classId: 'CL-20260811-1900-TG1',
    name: 'Tango salón intermedio',
    teacher: 'Laura',
    date: '2026-08-11',
    startTime: '19:00',
    endTime: '20:30',
    level: 'INTERMEDIO',
    capacity: 20,
    attendeeCount: 7,
    roomId: 'SALA-1',
    roomName: 'Salón Principal',
    floor: 1,
    status: 'PROGRAMADA',
    cancelReason: null,
  },
];

/** Seeded room bookings — private lessons and rehearsals outside the group schedule. */
export const INITIAL_ROOM_BOOKINGS: RoomBooking[] = [
  {
    bookingId: 'RB-0001',
    roomId: 'SALA-4',
    roomName: 'Estudio Sur',
    title: 'Clase personalizada — preparación de boda',
    teacher: 'Laura',
    date: '2026-08-06',
    startTime: '17:00',
    endTime: '18:00',
    type: 'PERSONALIZADA',
    status: 'CONFIRMADA',
  },
  {
    bookingId: 'RB-0002',
    roomId: 'SALA-3',
    roomName: 'Estudio Norte',
    title: 'Ensayo grupo de exhibición',
    teacher: 'Diego',
    date: '2026-08-09',
    startTime: '14:00',
    endTime: '15:00',
    type: 'ENSAYO',
    status: 'CONFIRMADA',
  },
];

/**
 * Director dashboard fixture (Iván). Plausible, round, clearly simulated
 * COP figures — never derived from any real academy record.
 */
export const DIRECTOR_DASHBOARD: DirectorDashboard = {
  month: '2026-08',
  monthLabel: 'agosto 2026',
  activeStudents: 128,
  activeStudentsDelta: 6,
  monthlyCash: 18_400_000,
  monthlyCashDelta: 0.08,
  attendances: 412,
  attendancesDelta: 0.05,
  packagesExpiringSoon: 9,
  deferredRevenue: 6_200_000,
  studentsAtRisk: [
    {
      studentId: ANDRES.studentId,
      name: 'Andrés',
      daysAbsent: 24,
      availableClasses: 0,
    },
    {
      studentId: 'ST-VALENTINA',
      name: 'Valentina',
      daysAbsent: 22,
      availableClasses: 2,
    },
    {
      studentId: 'ST-MARIANA',
      name: 'Mariana',
      daysAbsent: 21,
      availableClasses: 1,
    },
  ],
  occupancyByClass: [
    {
      className: 'Milonga social',
      teacher: 'Laura',
      roomName: 'Salón Milonga',
      floor: 1,
      averageAttendees: 19,
      capacity: 20,
      occupancy: 0.95,
    },
    {
      className: 'Tango salón intermedio',
      teacher: 'Laura',
      roomName: 'Salón Principal',
      floor: 1,
      averageAttendees: 16,
      capacity: 20,
      occupancy: 0.8,
    },
    {
      className: 'Práctica guiada',
      teacher: 'Diego',
      roomName: 'Estudio Norte',
      floor: 2,
      averageAttendees: 9,
      capacity: 16,
      occupancy: 0.56,
    },
    {
      className: 'Tango básico',
      teacher: 'Diego',
      roomName: 'Estudio Sur',
      floor: 2,
      averageAttendees: 11,
      capacity: 18,
      occupancy: 0.61,
    },
  ],
  /**
   * A snapshot, not a live poll — floor 1 busy with class, floor 2 quieter.
   * Sets up the "unused rooms, future capability" framing without wiring
   * anything to real time.
   */
  rooms: [
    { roomId: 'SALA-1', name: 'Salón Principal', floor: 1, capacity: 20, status: 'OCUPADO', currentClassName: 'Tango salón intermedio' },
    { roomId: 'SALA-2', name: 'Salón Milonga', floor: 1, capacity: 24, status: 'OCUPADO', currentClassName: 'Milonga social' },
    { roomId: 'SALA-3', name: 'Estudio Norte', floor: 2, capacity: 16, status: 'LIBRE', currentClassName: null },
    { roomId: 'SALA-4', name: 'Estudio Sur', floor: 2, capacity: 12, status: 'LIBRE', currentClassName: null },
  ],
  engagementBreakdown: { creciendo: 92, estable: 24, enRiesgo: 12 },
  insights: [
    '9 paquetes vencen en los próximos 7 días — contactar antes del viernes evita que se venzan en silencio.',
    '3 alumnos llevan 21 días o más sin venir con clases disponibles: hoy es un buen momento para escribirles.',
  ],
};
