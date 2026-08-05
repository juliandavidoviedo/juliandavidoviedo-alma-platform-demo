/**
 * Contract types for the demo's mock API layer.
 *
 * Shapes are deliberately close to `docs/03-api-contract.md` and `Mappers.gs`
 * in the backend repo (commit 92f4815) — not identical, since the demo omits
 * fields that only matter once a real client and real auth exist (tokens,
 * error envelopes, pagination). The goal is that wiring the real Apps Script
 * backend later is a matter of swapping the adapter in `mock-api.ts`, not
 * rewriting every screen's props.
 *
 * This file also carries the demo's business-model evolution beyond what the
 * backend implements today: attendance as a confirm → check-in → cancel
 * lifecycle (not a single event), student engagement signals, package
 * purchase history, and physical rooms. These are realistic mock indicators,
 * not predictive models or a booking system — see mock-data.ts for the
 * fixtures and mock-api.ts for the (deliberately simple) rules.
 */

export type Role = 'DIRECCION' | 'RECEPCION' | 'ALUMNO';

export type StudentLevel = 'INICIAL' | 'INTERMEDIO' | 'AVANZADO';
export type DanceRole = 'LIDER' | 'SEGUIDOR' | 'AMBOS';
export type LoyaltyTier = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';
export type ConsumptionType = 'PAQUETE' | 'SIN_PAQUETE';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'QR' | 'OTRO';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  QR: 'QR',
  OTRO: 'Otro',
};

export interface Room {
  roomId: string;
  name: string;
  floor: 1 | 2;
  capacity: number;
}

export interface PackageInfo {
  packageId: string;
  name: string;
  totalClasses: number;
  balance: number;
  expiresOn: string; // ISO date, e.g. "2026-09-14"
  daysUntilExpiry: number;
}

/** One purchase event — the package sale that produced (or topped up) `PackageInfo`. */
export interface PackagePurchase {
  packageId: string;
  name: string;
  purchaseDate: string; // ISO date
  expiresOn: string;
  paymentMethod: PaymentMethod;
  amount: number; // COP
  classesIncluded: number;
  classesRemaining: number;
}

export interface PointsInfo {
  balance: number;
  tier: LoyaltyTier;
  tierLabel: string;
  nextTier: string | null;
  pointsToNextTier: number;
  progress: number; // 0-100
}

/**
 * A hand-classified read of how a student is trending — not a prediction.
 * CRECIENDO / ESTABLE / EN_RIESGO are set directly in the fixtures from
 * plausible attendance patterns, the same way a receptionist would eyeball it.
 */
export type EngagementStatus = 'CRECIENDO' | 'ESTABLE' | 'EN_RIESGO';

export const ENGAGEMENT_LABELS: Record<EngagementStatus, string> = {
  CRECIENDO: 'Creciendo',
  ESTABLE: 'Estable',
  EN_RIESGO: 'En riesgo',
};

export interface EngagementInfo {
  status: EngagementStatus;
  attendancesLast30Days: number;
  daysSinceLastAttendance: number | null;
  noShowCount: number;
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
  roomId: string;
  roomName: string;
  floor: 1 | 2;
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
  packageHistory: PackagePurchase[];
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  engagement: EngagementInfo;
  upcomingClasses: UpcomingClassStatus[];
  attendanceHistory: AttendanceRecord[];
  todayClass: TodayClassStatus | null;
}

export interface SearchResult {
  studentId: string;
  name: string;
  level: StudentLevel;
  availableClasses: number;
  status: 'ACTIVO' | 'INACTIVO';
}

/**
 * Attendance lifecycle for one class occurrence. Confirmation reserves an
 * expected seat; check-in consumes the class; cancellation is allowed up to
 * 30 minutes before the class starts (communicated in copy — the demo does
 * not gate this against real wall-clock time, since that would make a fixed
 * demo date fragile against whenever it's actually opened).
 */
export type RegistrationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'MISSING';

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  CONFIRMED: 'Confirmado',
  CHECKED_IN: 'Llegó',
  CANCELLED: 'Canceló',
  MISSING: 'No llegó',
};

export interface ClassRegistration {
  registrationId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: RegistrationStatus;
  confirmedAt: string | null; // "18:40"
  checkedInAt: string | null;
  cancelledAt: string | null;
  consumptionType: ConsumptionType | null; // set once checked in
  remainingClasses: number | null; // set once checked in
}

export interface ClassRoster {
  danceClass: DanceClassInfo | null;
  registrations: ClassRegistration[];
}

export interface TodayClassStatus {
  danceClass: DanceClassInfo;
  registrationStatus: RegistrationStatus | null; // null = not registered at all
}

/**
 * An upcoming class as seen by one student — the same DanceClassInfo plus
 * their own reservation state for it, so each class in "Próximas clases" can
 * carry its own Reservar/Cancelar control (a student may reserve more than
 * one class the same day).
 */
export interface UpcomingClassStatus extends DanceClassInfo {
  registrationStatus: RegistrationStatus | null;
}

export interface SellPackageInput {
  studentId: string;
  packageTypeName: string;
  classes: number;
  amountPaid: number;
  validityDays: number;
  paymentMethod: PaymentMethod;
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

export interface ConfirmAttendanceResult {
  ok: true;
  status: RegistrationStatus;
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
  roomName: string;
  floor: 1 | 2;
  averageAttendees: number;
  capacity: number;
  occupancy: number; // 0-1
}

export interface RoomStatus {
  roomId: string;
  name: string;
  floor: 1 | 2;
  capacity: number;
  status: 'OCUPADO' | 'LIBRE';
  currentClassName: string | null;
}

export interface EngagementBreakdown {
  creciendo: number;
  estable: number;
  enRiesgo: number;
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
  rooms: RoomStatus[];
  engagementBreakdown: EngagementBreakdown;
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
    roomName: string;
    floor: 1 | 2;
  } | null;
}

/**
 * Renewal / reactivation. The demo never touches real money: "requesting"
 * either flags reception for a callback or shows a transfer QR the student
 * says they already used — either way it lands as one pending request that
 * a human at the front desk resolves.
 */
export type RenewalMethod = 'ALARMA_RECEPCION' | 'QR_TRANSFERENCIA';
export type RenewalStatus = 'PENDIENTE' | 'CONTACTADO';

export const RENEWAL_METHOD_LABELS: Record<RenewalMethod, string> = {
  ALARMA_RECEPCION: 'Aviso a recepción',
  QR_TRANSFERENCIA: 'Transferencia por QR',
};

export interface RenewalRequest {
  requestId: string;
  studentId: string;
  studentName: string;
  method: RenewalMethod;
  requestedAt: string; // "18:40"
  status: RenewalStatus;
}

export interface RequestRenewalResult {
  ok: true;
  request: RenewalRequest;
  message: string;
}
