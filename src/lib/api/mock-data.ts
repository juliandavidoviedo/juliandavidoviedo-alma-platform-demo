import type {
  AttendanceRecord,
  AttentionItem,
  AuditEntry,
  ClassCategory,
  ClassRegistration,
  ClassStatus,
  DanceClassInfo,
  DirectorDashboard,
  EngagementInfo,
  PackageInfo,
  PackagePurchase,
  PaymentReport,
  PointsInfo,
  ProgramName,
  Room,
  RoomBooking,
  RoomOccupancyToday,
  ScheduledClass,
  StudentLevel,
  DanceRole,
} from './types';

/**
 * Fixed reference date for the demo. Every "days until expiry" / "days
 * absent" figure below is hand-computed against this date so the numbers
 * stay deterministic no matter when the demo is actually opened — the
 * director should see the same story in the room tomorrow as in tonight's
 * preview. It also happens to be a Wednesday, which is Alma's busiest day
 * in the real weekly schedule (see ACADEMY_SCHEDULE below) — useful for
 * demonstrating several simultaneous classes across rooms.
 */
export const DEMO_TODAY = '2026-08-05';

/**
 * Alma's four rooms. They have no official names yet, so these are neutral,
 * temporary demo labels — not to be presented as the academy's real room
 * names. The two large rooms' `capacity` is a conservative planning value
 * for this demo ("capacidad operativa demo"), not a confirmed maximum.
 */
export const ROOMS: Room[] = [
  { roomId: 'SALON-G1', name: 'Salón Grande 1', floor: 1, capacity: 20 },
  { roomId: 'SALON-G2', name: 'Salón Grande 2', floor: 1, capacity: 20 },
  { roomId: 'SALON-P1', name: 'Salón Pequeño 1', floor: 1, capacity: 12 },
  { roomId: 'SALON-P2', name: 'Salón Pequeño 2', floor: 1, capacity: 12 },
];

const ROOM_BY_ID: Record<string, Room> = Object.fromEntries(ROOMS.map((r) => [r.roomId, r]));

/**
 * Fictional teacher roster — real assignments have not been confirmed yet.
 * Names are used directly on `DanceClassInfo.teacher`; kept in one place so
 * tomorrow's real roster is a one-file swap, not a hunt through every class.
 */
const TEACHERS = {
  laura: 'Laura',
  diego: 'Diego',
  sebastian: 'Sebastián',
  fernanda: 'Fernanda',
  paula: 'Paula',
  rodrigo: 'Rodrigo',
  mateo: 'Mateo',
} as const;

interface ClassSeed {
  id: string;
  name: string;
  category: ClassCategory;
  teacher: string;
  date: string;
  startTime: string;
  endTime: string;
  level: StudentLevel;
  roomId: string;
  confirmedCount: number;
  cancelledCount?: number;
  status?: ClassStatus;
  cancelReason?: string | null;
}

function scheduledClass(seed: ClassSeed): ScheduledClass {
  const room = ROOM_BY_ID[seed.roomId];
  return {
    classId: seed.id,
    name: seed.name,
    category: seed.category,
    teacher: seed.teacher,
    date: seed.date,
    startTime: seed.startTime,
    endTime: seed.endTime,
    level: seed.level,
    capacity: room.capacity,
    confirmedCount: seed.confirmedCount,
    cancelledCount: seed.cancelledCount ?? 0,
    roomId: room.roomId,
    roomName: room.name,
    floor: room.floor,
    status: seed.status ?? 'CONFIRMADA',
    cancelReason: seed.cancelReason ?? null,
  };
}

/**
 * Alma's real weekly schedule (confirmed on-site, Aug 2026), one row per
 * class occurrence for the week of DEMO_TODAY. Every class below matches an
 * exact day/time from the source material — nothing here is invented.
 * Teacher and room assignments ARE synthetic (not yet confirmed by Alma) and
 * `confirmedCount`/`cancelledCount` are plausible demo numbers, not real
 * attendance data.
 *
 * Alma runs simultaneous classes across its four rooms — this is why each
 * occurrence is modeled independently with its own room/teacher/counts,
 * instead of assuming one global "current class" for the whole academy.
 */
export const ACADEMY_SCHEDULE: ScheduledClass[] = [
  // ---- Monday 2026-08-03
  scheduledClass({
    id: 'CL-20260803-1930-TECM', name: 'Técnica masculina', category: 'TANGO',
    teacher: TEACHERS.diego, date: '2026-08-03', startTime: '19:30', endTime: '21:00',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 15, cancelledCount: 1,
  }),
  scheduledClass({
    id: 'CL-20260803-1930-SALB', name: 'Salsa básica', category: 'SALSA_BACHATA',
    teacher: TEACHERS.mateo, date: '2026-08-03', startTime: '19:30', endTime: '21:00',
    level: 'INICIAL', roomId: 'SALON-G2', confirmedCount: 16,
  }),

  // ---- Tuesday 2026-08-04
  scheduledClass({
    id: 'CL-20260804-0800-TGB1', name: 'Tango básico', category: 'TANGO',
    teacher: TEACHERS.sebastian, date: '2026-08-04', startTime: '08:00', endTime: '09:30',
    level: 'INICIAL', roomId: 'SALON-P1', confirmedCount: 8,
  }),
  scheduledClass({
    id: 'CL-20260804-1800-BACI', name: 'Bachata intermedia', category: 'SALSA_BACHATA',
    teacher: TEACHERS.mateo, date: '2026-08-04', startTime: '18:00', endTime: '19:30',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 10, cancelledCount: 1,
  }),
  scheduledClass({
    id: 'CL-20260804-1830-TECF1', name: 'Técnica femenina', category: 'TANGO',
    teacher: TEACHERS.laura, date: '2026-08-04', startTime: '18:30', endTime: '20:00',
    level: 'INTERMEDIO', roomId: 'SALON-G2', confirmedCount: 17,
  }),
  scheduledClass({
    id: 'CL-20260804-1930-BALL', name: 'Ballet adulto', category: 'FUNDAMENTACION',
    teacher: TEACHERS.fernanda, date: '2026-08-04', startTime: '19:30', endTime: '21:00',
    level: 'INTERMEDIO', roomId: 'SALON-P1', confirmedCount: 10,
  }),
  scheduledClass({
    id: 'CL-20260804-1930-JAZI', name: 'Jazz intermedio', category: 'FUNDAMENTACION',
    teacher: TEACHERS.rodrigo, date: '2026-08-04', startTime: '19:30', endTime: '21:00',
    level: 'INTERMEDIO', roomId: 'SALON-P2', confirmedCount: 9, cancelledCount: 1,
  }),

  // ---- Wednesday 2026-08-05 (DEMO_TODAY)
  scheduledClass({
    id: 'CL-20260805-0800-YOGA', name: 'Yoga y pilates', category: 'FUNDAMENTACION',
    teacher: TEACHERS.paula, date: '2026-08-05', startTime: '08:00', endTime: '09:30',
    level: 'INICIAL', roomId: 'SALON-P1', confirmedCount: 11,
  }),
  scheduledClass({
    id: 'CL-20260805-1700-ACON', name: 'Acondicionamiento y stretching', category: 'FUNDAMENTACION',
    teacher: TEACHERS.paula, date: '2026-08-05', startTime: '17:00', endTime: '18:30',
    level: 'INICIAL', roomId: 'SALON-P2', confirmedCount: 7,
  }),
  scheduledClass({
    id: 'CL-20260805-1800-TSAL', name: 'Tango salón', category: 'TANGO',
    teacher: TEACHERS.laura, date: '2026-08-05', startTime: '18:00', endTime: '19:30',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 14, cancelledCount: 1,
  }),
  scheduledClass({
    id: 'CL-20260805-1930-TGB2', name: 'Tango básico', category: 'TANGO',
    teacher: TEACHERS.diego, date: '2026-08-05', startTime: '19:30', endTime: '21:00',
    level: 'INICIAL', roomId: 'SALON-G1', confirmedCount: 6, cancelledCount: 2,
  }),
  scheduledClass({
    id: 'CL-20260805-1930-BACB', name: 'Bachata básica', category: 'SALSA_BACHATA',
    teacher: TEACHERS.mateo, date: '2026-08-05', startTime: '19:30', endTime: '21:00',
    level: 'INICIAL', roomId: 'SALON-G2', confirmedCount: 9,
  }),
  scheduledClass({
    id: 'CL-20260805-1930-CONT', name: 'Contemporáneo', category: 'FUNDAMENTACION',
    teacher: TEACHERS.rodrigo, date: '2026-08-05', startTime: '19:30', endTime: '21:00',
    level: 'INTERMEDIO', roomId: 'SALON-P2', confirmedCount: 5, cancelledCount: 1,
  }),

  // ---- Thursday 2026-08-06
  scheduledClass({
    id: 'CL-20260806-0800-BACB2', name: 'Bachata básica', category: 'SALSA_BACHATA',
    teacher: TEACHERS.mateo, date: '2026-08-06', startTime: '08:00', endTime: '09:30',
    level: 'INICIAL', roomId: 'SALON-P2', confirmedCount: 6,
  }),
  scheduledClass({
    id: 'CL-20260806-1600-TMAY', name: 'Tango mayor', category: 'TANGO',
    teacher: TEACHERS.sebastian, date: '2026-08-06', startTime: '16:00', endTime: '17:30',
    level: 'INTERMEDIO', roomId: 'SALON-P2', confirmedCount: 9,
  }),
  scheduledClass({
    id: 'CL-20260806-1700-TECF2', name: 'Técnica femenina', category: 'TANGO',
    teacher: TEACHERS.laura, date: '2026-08-06', startTime: '17:00', endTime: '18:30',
    level: 'INTERMEDIO', roomId: 'SALON-G2', confirmedCount: 12, cancelledCount: 2,
  }),
  scheduledClass({
    id: 'CL-20260806-1800-TNUE', name: 'Tango nuevo', category: 'TANGO',
    teacher: TEACHERS.diego, date: '2026-08-06', startTime: '18:00', endTime: '19:30',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 11, cancelledCount: 1,
  }),
  scheduledClass({
    id: 'CL-20260806-1830-TGB3', name: 'Tango básico', category: 'TANGO',
    teacher: TEACHERS.laura, date: '2026-08-06', startTime: '18:30', endTime: '20:00',
    level: 'INICIAL', roomId: 'SALON-P1', confirmedCount: 7,
  }),

  // ---- Friday 2026-08-07
  scheduledClass({
    id: 'CL-20260807-0800-ACON2', name: 'Acondicionamiento y stretching', category: 'FUNDAMENTACION',
    teacher: TEACHERS.paula, date: '2026-08-07', startTime: '08:00', endTime: '09:30',
    level: 'INICIAL', roomId: 'SALON-P2', confirmedCount: 6,
  }),
  scheduledClass({
    id: 'CL-20260807-1700-JAZM', name: 'Jazz multinivel', category: 'FUNDAMENTACION',
    teacher: TEACHERS.rodrigo, date: '2026-08-07', startTime: '17:00', endTime: '18:30',
    level: 'INTERMEDIO', roomId: 'SALON-P1', confirmedCount: 8,
  }),
  scheduledClass({
    id: 'CL-20260807-1800-SALI', name: 'Salsa intermedia', category: 'SALSA_BACHATA',
    teacher: TEACHERS.mateo, date: '2026-08-07', startTime: '18:00', endTime: '19:30',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 12,
  }),
  scheduledClass({
    id: 'CL-20260807-1930-JAZB', name: 'Jazz básico', category: 'FUNDAMENTACION',
    teacher: TEACHERS.fernanda, date: '2026-08-07', startTime: '19:30', endTime: '21:00',
    level: 'INICIAL', roomId: 'SALON-P1', confirmedCount: 9,
  }),

  // ---- Saturday 2026-08-08
  scheduledClass({
    id: 'CL-20260808-1500-TINT', name: 'Tango intermedio', category: 'TANGO',
    teacher: TEACHERS.diego, date: '2026-08-08', startTime: '15:00', endTime: '16:30',
    level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 13,
  }),
  scheduledClass({
    id: 'CL-20260808-1700-MILO', name: 'Milonga', category: 'TANGO',
    teacher: TEACHERS.laura, date: '2026-08-08', startTime: '17:00', endTime: '18:30',
    level: 'INTERMEDIO', roomId: 'SALON-G2', confirmedCount: 19, cancelledCount: 1,
  }),
];

/**
 * Today's live class — Gestión's manual check-in and the Student "clase de
 * hoy" card. Only the ID is the source of truth: `mock-api.ts` always looks
 * this class up fresh from `state.schedule` (never a separately-cloned
 * copy), so a confirm/cancel here is immediately visible to Gestión/Admin.
 */
export const CURRENT_CLASS_ID = 'CL-20260805-1800-TSAL';

/** Read-only convenience reference for fixtures below — never stored in state as-is. */
export const CURRENT_CLASS: DanceClassInfo =
  ACADEMY_SCHEDULE.find((c) => c.classId === CURRENT_CLASS_ID)!;

const TANGO_BASICO_WED = ACADEMY_SCHEDULE.find((c) => c.classId === 'CL-20260805-1930-TGB2')!;
const MILONGA_SAT = ACADEMY_SCHEDULE.find((c) => c.classId === 'CL-20260808-1700-MILO')!;

/** Next week's occurrences of Julián's own classes — same slot, one week later. */
const TANGO_SALON_NEXT_WEEK: DanceClassInfo = scheduledClass({
  id: 'CL-20260812-1800-TSAL', name: 'Tango salón', category: 'TANGO',
  teacher: TEACHERS.laura, date: '2026-08-12', startTime: '18:00', endTime: '19:30',
  level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 9,
});
const BACHATA_INTERMEDIA_NEXT_WEEK: DanceClassInfo = scheduledClass({
  id: 'CL-20260811-1800-BACI', name: 'Bachata intermedia', category: 'SALSA_BACHATA',
  teacher: TEACHERS.mateo, date: '2026-08-11', startTime: '18:00', endTime: '19:30',
  level: 'INTERMEDIO', roomId: 'SALON-G1', confirmedCount: 8,
});

export interface DemoStudentRecord {
  studentId: string;
  firstName: string;
  level: StudentLevel;
  danceRole: DanceRole;
  program: ProgramName;
  status: 'ACTIVO' | 'INACTIVO';
  package: PackageInfo | null;
  packageHistory: PackagePurchase[];
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  engagement: EngagementInfo;
  upcomingClasses: DanceClassInfo[];
  attendanceHistory: AttendanceRecord[];
}

/**
 * Julián is the demo's protagonist student — every screen in the "Alumno"
 * story and most of the Gestión flow center on him.
 */
export const JULIAN: DemoStudentRecord = {
  studentId: 'ST-JULIAN',
  firstName: 'Julián',
  level: 'INTERMEDIO',
  danceRole: 'SEGUIDOR',
  program: 'ALMA_PRO',
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
      paymentMethod: 'QR',
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
  upcomingClasses: [MILONGA_SAT, TANGO_SALON_NEXT_WEEK, BACHATA_INTERMEDIA_NEXT_WEEK],
  attendanceHistory: [
    {
      attendanceId: 'AS-001198',
      date: '2026-07-28',
      className: 'Tango salón',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001181',
      date: '2026-07-21',
      className: 'Tango nuevo',
      teacher: 'Diego',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001164',
      date: '2026-07-14',
      className: 'Tango salón',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
    {
      attendanceId: 'AS-001149',
      date: '2026-07-09',
      className: 'Milonga',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 15,
    },
    {
      attendanceId: 'AS-001132',
      date: '2026-07-02',
      className: 'Tango salón',
      teacher: 'Laura',
      consumptionType: 'PAQUETE',
      points: 10,
    },
  ],
};

/** Gestión search / roster supporting cast — fictional, first names only. */
export const CAMILA: DemoStudentRecord = {
  studentId: 'ST-CAMILA',
  firstName: 'Camila',
  level: 'AVANZADO',
  danceRole: 'LIDER',
  program: 'ALMA_EVOLUTION',
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
  program: 'ALMA_OPEN',
  status: 'ACTIVO',
  package: null,
  packageHistory: [
    {
      packageId: 'PQ-0055',
      name: 'Alma Open (mensual)',
      purchaseDate: '2026-06-10',
      expiresOn: '2026-07-10',
      paymentMethod: 'EFECTIVO',
      amount: 220_000,
      classesIncluded: 999,
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
 * Today's roster for CURRENT_CLASS (Tango salón, Wed 6:00 PM). Valentina and
 * Mariana are the same two names used in the director's at-risk list:
 * Valentina confirmed and did not show (NO_SHOW), Mariana cancelled in time.
 */
export const INITIAL_ROSTER: ClassRegistration[] = [
  {
    registrationId: 'RG-000401',
    classId: CURRENT_CLASS.classId,
    studentId: CAMILA.studentId,
    studentName: 'Camila',
    status: 'ATTENDED',
    confirmedAt: '17:40',
    checkedInAt: '18:02',
    cancelledAt: null,
    consumptionType: 'PAQUETE',
    remainingClasses: CAMILA.package?.balance ?? 0,
  },
  {
    registrationId: 'RG-000402',
    classId: CURRENT_CLASS.classId,
    studentId: ANDRES.studentId,
    studentName: 'Andrés',
    status: 'ATTENDED',
    confirmedAt: null,
    checkedInAt: '18:05',
    cancelledAt: null,
    consumptionType: 'SIN_PAQUETE',
    remainingClasses: 0,
  },
  {
    registrationId: 'RG-000403',
    classId: CURRENT_CLASS.classId,
    studentId: 'ST-VALENTINA',
    studentName: 'Valentina',
    status: 'NO_SHOW',
    confirmedAt: '16:50',
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
    confirmedAt: '11:10',
    checkedInAt: null,
    cancelledAt: '17:20',
    consumptionType: null,
    remainingClasses: null,
  },
];

/** Seeded room bookings — private lessons and rehearsals outside the group schedule. */
export const INITIAL_ROOM_BOOKINGS: RoomBooking[] = [
  {
    bookingId: 'RB-0001',
    roomId: 'SALON-P2',
    roomName: 'Salón Pequeño 2',
    title: 'Clase personalizada — preparación de boda',
    teacher: TEACHERS.laura,
    date: '2026-08-06',
    startTime: '20:00',
    endTime: '21:00',
    type: 'PERSONALIZADA',
    status: 'CONFIRMADA',
  },
  {
    bookingId: 'RB-0002',
    roomId: 'SALON-P1',
    roomName: 'Salón Pequeño 1',
    title: 'Ensayo grupo de exhibición',
    teacher: TEACHERS.diego,
    date: '2026-08-09',
    startTime: '14:00',
    endTime: '15:00',
    type: 'ENSAYO',
    status: 'CONFIRMADA',
  },
];

/** Today's classes, chronological — the operational dataset Gestión and Admin both read. */
export function computeClassesToday(schedule: ScheduledClass[]): ScheduledClass[] {
  return schedule
    .filter((c) => c.date === DEMO_TODAY)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Room occupancy rollup for today, derived from the live schedule — never a
 * separately-tracked snapshot, so a confirm/cancel is reflected the next
 * time this is computed (Admin calls it fresh on every `getDashboard()`).
 */
export function computeRoomOccupancyToday(schedule: ScheduledClass[]): RoomOccupancyToday[] {
  const classesToday = computeClassesToday(schedule);
  return ROOMS.map((room) => {
    const classes = classesToday.filter((c) => c.roomId === room.roomId);
    const peak = classes.reduce((max, c) => Math.max(max, c.confirmedCount / c.capacity), 0);
    return {
      roomId: room.roomId,
      name: room.name,
      comfortableCapacity: room.capacity,
      classesToday: classes.length,
      peakOccupancy: peak,
      nearCapacity: peak >= 0.85,
    };
  });
}

const CLASSES_TODAY = computeClassesToday(ACADEMY_SCHEDULE);
const ROOM_OCCUPANCY_TODAY = computeRoomOccupancyToday(ACADEMY_SCHEDULE);

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
  classesToday: CLASSES_TODAY,
  roomOccupancyToday: ROOM_OCCUPANCY_TODAY,
  engagementBreakdown: { creciendo: 92, estable: 24, enRiesgo: 12 },
  insights: [
    `Salón Pequeño 1 tiene 11 confirmados para un cupo cómodo de 12 en Yoga y pilates de esta mañana — casi al tope.`,
    `Tango básico tiene solo 6 confirmaciones para la clase de las ${TANGO_BASICO_WED.startTime} de hoy — vale la pena avisar a los alumnos inscritos.`,
  ],
};

/** Students Gestión should look out for today — a short, human-triaged list, not a score. */
export const ATTENTION_ITEMS: AttentionItem[] = [
  { studentId: ANDRES.studentId, name: 'Andrés', reason: 'Sin plan activo · 24 días sin venir' },
  { studentId: 'ST-VALENTINA', name: 'Valentina', reason: 'No llegó a su última clase confirmada' },
  { studentId: CAMILA.studentId, name: 'Camila', reason: 'Paquete vence en 23 días · sin pago reportado' },
];

/**
 * Both start empty — the demo's two required scenarios (payment report →
 * approval, and confirm/cancel) are meant to be performed live, not shown
 * pre-seeded. See PROJECT_CONTEXT.md (backend repo) decisions #23/#27.
 */
export const INITIAL_PAYMENT_REPORTS: PaymentReport[] = [];
export const INITIAL_AUDIT_TRAIL: AuditEntry[] = [];
