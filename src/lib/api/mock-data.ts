import type {
  AttendanceRecord,
  DanceClassInfo,
  DirectorDashboard,
  LiveRoomEntry,
  PackageInfo,
  PointsInfo,
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

export interface DemoStudentRecord {
  studentId: string;
  firstName: string;
  level: StudentLevel;
  danceRole: DanceRole;
  status: 'ACTIVO' | 'INACTIVO';
  package: PackageInfo | null;
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  upcomingClasses: DanceClassInfo[];
  attendanceHistory: AttendanceRecord[];
}

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
  points: {
    balance: 340,
    tier: 'PLATA',
    tierLabel: 'Plata',
    nextTier: 'Oro',
    pointsToNextTier: 160,
    progress: 68,
  },
  streak: { consecutiveWeeks: 3 },
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

/** Reception search / live-room supporting cast — fictional, first names only. */
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
  points: {
    balance: 120,
    tier: 'BRONCE',
    tierLabel: 'Bronce',
    nextTier: 'Plata',
    pointsToNextTier: 80,
    progress: 60,
  },
  streak: { consecutiveWeeks: 1 },
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
  points: {
    balance: 30,
    tier: 'BRONCE',
    tierLabel: 'Bronce',
    nextTier: 'Plata',
    pointsToNextTier: 170,
    progress: 15,
  },
  streak: { consecutiveWeeks: 0 },
  upcomingClasses: [],
  attendanceHistory: [],
};

export const INITIAL_STUDENTS: Record<string, DemoStudentRecord> = {
  [JULIAN.studentId]: JULIAN,
  [CAMILA.studentId]: CAMILA,
  [ANDRES.studentId]: ANDRES,
};

export const INITIAL_LIVE_ROOM: LiveRoomEntry[] = [
  {
    attendanceId: 'AS-001204',
    studentId: CAMILA.studentId,
    name: 'Camila',
    time: '19:02',
    consumptionType: 'PAQUETE',
    remainingClasses: CAMILA.package?.balance ?? 0,
  },
  {
    attendanceId: 'AS-001205',
    studentId: ANDRES.studentId,
    name: 'Andrés',
    time: '19:05',
    consumptionType: 'SIN_PAQUETE',
    remainingClasses: 0,
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
      averageAttendees: 19,
      capacity: 20,
      occupancy: 0.95,
    },
    {
      className: 'Tango salón intermedio',
      teacher: 'Laura',
      averageAttendees: 16,
      capacity: 20,
      occupancy: 0.8,
    },
    {
      className: 'Práctica guiada',
      teacher: 'Diego',
      averageAttendees: 9,
      capacity: 16,
      occupancy: 0.56,
    },
    {
      className: 'Tango básico',
      teacher: 'Diego',
      averageAttendees: 11,
      capacity: 18,
      occupancy: 0.61,
    },
  ],
  insights: [
    '9 paquetes vencen en los próximos 7 días — contactar antes del viernes evita que se venzan en silencio.',
    '3 alumnos llevan 21 días o más sin venir con clases disponibles: hoy es un buen momento para escribirles.',
  ],
};
