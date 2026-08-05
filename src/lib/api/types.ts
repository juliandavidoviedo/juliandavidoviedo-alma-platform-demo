/**
 * Contract types for the demo's mock API layer.
 *
 * Shapes are deliberately close to `docs/03-api-contract.md` and `Mappers.gs`
 * in the backend repo (commit 92f4815) — not identical, since the demo omits
 * fields that only matter once a real client and real auth exist (tokens,
 * error envelopes, pagination). The goal is that wiring the real Apps Script
 * backend later is a matter of swapping the adapter in `mock-api.ts`, not
 * rewriting every screen's props.
 */

export type Role = 'DIRECCION' | 'RECEPCION' | 'ALUMNO';

export type StudentLevel = 'INICIAL' | 'INTERMEDIO' | 'AVANZADO';
export type DanceRole = 'LIDER' | 'SEGUIDOR' | 'AMBOS';
export type LoyaltyTier = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';
export type ConsumptionType = 'PAQUETE' | 'SIN_PAQUETE';

export interface PackageInfo {
  packageId: string;
  name: string;
  totalClasses: number;
  balance: number;
  expiresOn: string; // ISO date, e.g. "2026-09-14"
  daysUntilExpiry: number;
}

export interface PointsInfo {
  balance: number;
  tier: LoyaltyTier;
  tierLabel: string;
  nextTier: string | null;
  pointsToNextTier: number;
  progress: number; // 0-100
}

export interface DanceClassInfo {
  classId: string;
  name: string;
  teacher: string;
  date: string; // ISO date
  startTime: string; // "19:00"
  endTime: string;
  level: StudentLevel;
  capacity: number;
  attendeeCount: number;
}

export interface AttendanceRecord {
  attendanceId: string;
  date: string; // ISO date
  className: string;
  teacher: string;
  consumptionType: ConsumptionType;
  points: number;
}

export interface StudentSummary {
  studentId: string;
  firstName: string;
  level: StudentLevel;
  danceRole: DanceRole;
  availableClasses: number;
  package: PackageInfo | null;
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  upcomingClasses: DanceClassInfo[];
  attendanceHistory: AttendanceRecord[];
}

export interface SearchResult {
  studentId: string;
  name: string;
  level: StudentLevel;
  availableClasses: number;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface LiveRoomEntry {
  attendanceId: string;
  studentId: string;
  name: string;
  time: string; // "19:04"
  consumptionType: ConsumptionType;
  remainingClasses: number;
}

export interface LiveRoom {
  danceClass: DanceClassInfo | null;
  attendees: LiveRoomEntry[];
}

export interface SellPackageInput {
  studentId: string;
  packageTypeName: string;
  classes: number;
  amountPaid: number;
  validityDays: number;
}

export interface SellPackageResult {
  packageId: string;
  addedClasses: number;
  availableClasses: number;
  expiresOn: string;
  message: string;
}

export interface ManualCheckInResult {
  attendanceId: string;
  studentId: string;
  consumptionType: ConsumptionType;
  remainingClasses: number;
  message: string;
}

export interface RiskStudent {
  studentId: string;
  name: string;
  daysAbsent: number;
  availableClasses: number;
}

export interface ClassOccupancy {
  className: string;
  teacher: string;
  averageAttendees: number;
  capacity: number;
  occupancy: number; // 0-1
}

export interface DirectorDashboard {
  month: string; // "2026-08"
  monthLabel: string; // "agosto 2026"
  activeStudents: number;
  activeStudentsDelta: number;
  monthlyCash: number; // COP
  monthlyCashDelta: number; // fraction, e.g. 0.08
  attendances: number;
  attendancesDelta: number;
  packagesExpiringSoon: number;
  deferredRevenue: number; // COP
  studentsAtRisk: RiskStudent[];
  occupancyByClass: ClassOccupancy[];
  insights: string[];
}

export type CheckInScenario = 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'NO_PACKAGE';

export interface CheckInSimulateResult {
  scenario: CheckInScenario;
  ok: true;
  message: string;
  attendanceId?: string;
  className?: string;
  remainingClasses?: number;
  bonus?: { label: string } | null;
}

export interface RotatingCode {
  code: string;
  secondsRemaining: number;
  classInProgress: {
    classId: string;
    name: string;
    teacher: string;
    startTime: string;
  } | null;
}
