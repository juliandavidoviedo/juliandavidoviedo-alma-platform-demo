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

export type Role = 'DIRECCION' | 'GESTION' | 'ALUMNO';

export type StudentLevel = 'INICIAL' | 'INTERMEDIO' | 'AVANZADO';
export type DanceRole = 'LIDER' | 'SEGUIDOR' | 'AMBOS';
export type LoyaltyTier = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';
export type ConsumptionType = 'PAQUETE' | 'SIN_PAQUETE';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'QR' | 'OTRO';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  QR: 'QR Davivienda',
  OTRO: 'Otro',
};

/**
 * The academy's current commercial offer, informational only — this demo
 * never processes payments. Newer students typically start on the monthly
 * Alma Open plan; the others are program tracks tied to a package purchase.
 */
export type ProgramName = 'ALMA_OPEN' | 'ALMA_KIDS' | 'ALMA_EVOLUTION' | 'ALMA_PRO' | 'ALMA_PROJECT';

export const PROGRAM_LABELS: Record<ProgramName, string> = {
  ALMA_OPEN: 'Alma Open',
  ALMA_KIDS: 'Alma Kids',
  ALMA_EVOLUTION: 'Alma Evolution',
  ALMA_PRO: 'Alma Pro',
  ALMA_PROJECT: 'Alma Project · Universo Tango',
};

/**
 * Class category, used for grouping the operational schedule. Matches how
 * Alma itself groups its offering (tango technique/social vs. the broader
 * dance-fundamentals catalog vs. salsa/bachata) — not a predictive label.
 */
export type ClassCategory = 'TANGO' | 'FUNDAMENTACION' | 'SALSA_BACHATA';

export const CATEGORY_LABELS: Record<ClassCategory, string> = {
  TANGO: 'Tango',
  FUNDAMENTACION: 'Fundamentación',
  SALSA_BACHATA: 'Salsa y bachata',
};

/**
 * Rooms use neutral, temporary demo labels — Alma has not assigned official
 * names yet. The two large rooms' `capacity` is a conservative planning
 * value for this demo ("capacidad operativa demo"), not a stated maximum.
 */
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
  category: ClassCategory;
  teacher: string;
  date: string; // ISO date
  startTime: string; // "19:00"
  endTime: string;
  level: StudentLevel;
  capacity: number; // "comfortable" / operational capacity, not a hard maximum
  confirmedCount: number;
  cancelledCount: number;
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
  program: ProgramName;
  availableClasses: number;
  package: PackageInfo | null;
  packageHistory: PackagePurchase[];
  points: PointsInfo;
  streak: { consecutiveWeeks: number };
  engagement: EngagementInfo;
  upcomingClasses: UpcomingClassStatus[];
  attendanceHistory: AttendanceRecord[];
  todayClass: TodayClassStatus | null;
  paymentReports: PaymentReport[];
  auditTrail: AuditEntry[];
}

export interface SearchResult {
  studentId: string;
  name: string;
  level: StudentLevel;
  availableClasses: number;
  status: 'ACTIVO' | 'INACTIVO';
}

/**
 * Attendance INTENT vs. RESULT, kept as explicitly separate concepts —
 * confirming never means the student physically showed up:
 *
 *   CONFIRMED = student intends to attend (self-managed, up to T-30)
 *   CANCELLED = student cancelled before class (self-managed, up to T-30)
 *   ATTENDED  = physically validated later (check-in, manual or QR)
 *   NO_SHOW   = confirmed/expected but did not attend
 *
 * Cancellation is allowed up to 30 minutes before the class starts
 * (communicated in copy — the demo does not gate this against real
 * wall-clock time, since that would make a fixed demo date fragile against
 * whenever it's actually opened).
 */
export type AttendanceIntentStatus = 'CONFIRMED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW';

export const ATTENDANCE_INTENT_LABELS: Record<AttendanceIntentStatus, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Canceló',
  ATTENDED: 'Asistió',
  NO_SHOW: 'No asistió',
};

export interface ClassRegistration {
  registrationId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: AttendanceIntentStatus;
  confirmedAt: string | null; // "18:40"
  checkedInAt: string | null;
  cancelledAt: string | null;
  consumptionType: ConsumptionType | null; // set once attended
  remainingClasses: number | null; // set once attended
}

export interface ClassRoster {
  danceClass: DanceClassInfo | null;
  registrations: ClassRegistration[];
}

export interface TodayClassStatus {
  danceClass: DanceClassInfo;
  registrationStatus: AttendanceIntentStatus | null; // null = no intent registered at all
}

/**
 * An upcoming class as seen by one student — the same DanceClassInfo plus
 * their own reservation state for it, so each class in "Próximas clases" can
 * carry its own Confirmar/Cancelar control (a student may reserve more than
 * one class the same day).
 */
export interface UpcomingClassStatus extends DanceClassInfo {
  registrationStatus: AttendanceIntentStatus | null;
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
  status: AttendanceIntentStatus;
  message: string;
}

export interface RiskStudent {
  studentId: string;
  name: string;
  daysAbsent: number;
  availableClasses: number;
}

/**
 * A room's operational reality for today: several classes may run back to
 * back or simultaneously with other rooms (Alma has simultaneous classes),
 * so a single OCUPADO/LIBRE snapshot does not describe a room — this is a
 * same-day rollup instead. `peakOccupancy` is the busiest class in the room
 * today, confirmed / comfortable capacity.
 */
export interface RoomOccupancyToday {
  roomId: string;
  name: string;
  comfortableCapacity: number;
  classesToday: number;
  peakOccupancy: number; // 0-1
  nearCapacity: boolean; // peakOccupancy >= 0.85
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
  classesToday: ScheduledClass[];
  roomOccupancyToday: RoomOccupancyToday[];
  engagementBreakdown: EngagementBreakdown;
  insights: string[];
}

/** A short, human-triaged reason a student needs Gestión's attention today. */
export interface AttentionItem {
  studentId: string;
  name: string;
  reason: string;
}

/**
 * Who performed an action — the student themselves, or Gestión acting on
 * the student's behalf. Every on-behalf action is audited: never silently
 * attributed to the student.
 */
export type ActorKind = 'STUDENT' | 'GESTION';

export interface AuditEntry {
  entryId: string;
  action: string; // 'class.confirm' | 'class.cancel' | 'payment.report' | 'payment.approve' | 'payment.reject' | 'class.restore'
  actedBy: ActorKind;
  actedByName: string;
  actedForStudentId: string;
  actedForName: string;
  timestamp: string;
  reason: string | null;
}

/**
 * Payment reporting is report-then-review, not instant self-checkout: a
 * report only starts the plan once Jonathan or Iván approves it and assigns
 * the physical sale/receipt consecutive. Approval timestamp starts the
 * 30-day validity window — see docs/PROJECT_CONTEXT.md decision #27 in the
 * backend repo.
 */
export type PaymentReportStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export const PAYMENT_REPORT_STATUS_LABELS: Record<PaymentReportStatus, string> = {
  PENDING_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

/**
 * The physical sale/receipt consecutive (`saleConsecutive`) is the primary
 * validation reference for every payment method — it is always assigned at
 * approval, by Jonathan or Iván, from the physical receipt book.
 *
 * `transferReference` is different: it's the bank's own transfer reference
 * for `QR` (Davivienda QR/transfer) only, optionally entered by the student
 * or Gestión at report time — never required, since a student reporting a
 * remote payment should never be blocked for lacking a physical consecutive
 * that doesn't exist yet on their end.
 *
 * `receiptFileName` is a filename the reporter types in — there is no real
 * upload/persistence in this demo (see PROJECT_CONTEXT.md "still mock"),
 * it just lets the review card show "attached" vs. not.
 */
export interface PaymentReport {
  reportId: string;
  studentId: string;
  studentName: string;
  planName: string;
  classes: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transferReference: string | null;
  receiptFileName: string | null;
  proofNote: string | null;
  status: PaymentReportStatus;
  reportedAt: string;
  reportedBy: ActorKind;
  reportedByName: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  saleConsecutive: string | null;
}

export interface ReportPaymentInput {
  studentId: string;
  planName: string;
  classes: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transferReference?: string;
  receiptFileName?: string;
  proofNote?: string;
  actedBy: ActorKind;
  actedByName: string;
  reason?: string; // required in practice when actedBy = GESTION
}

export interface ReportPaymentResult {
  ok: true;
  report: PaymentReport;
  message: string;
}

export interface ApprovePaymentInput {
  reportId: string;
  approverName: string; // 'Jonathan' | 'Iván'
  saleConsecutive: string;
}

export interface RejectPaymentInput {
  reportId: string;
  approverName: string;
  reason: string;
}

export interface ReviewPaymentResult {
  ok: true;
  report: PaymentReport;
  message: string;
}

/** Manual class restoration is exceptional, not a general credit tool. */
export type ClassRestorationReason = 'MEDICAL' | 'CALAMITY';

export const CLASS_RESTORATION_LABELS: Record<ClassRestorationReason, string> = {
  MEDICAL: 'Incapacidad médica',
  CALAMITY: 'Calamidad doméstica',
};

export interface RestoreClassInput {
  studentId: string;
  reason: ClassRestorationReason;
  note: string;
  actedByName: string;
}

export interface RestoreClassResult {
  ok: true;
  availableClasses: number;
  message: string;
}

/** Minor enrollment requires a guardian/responsible person on file. */
export type GuardianRelationship = 'MADRE' | 'PADRE' | 'ACUDIENTE';

export const GUARDIAN_RELATIONSHIP_LABELS: Record<GuardianRelationship, string> = {
  MADRE: 'Madre',
  PADRE: 'Padre',
  ACUDIENTE: 'Acudiente',
};

/**
 * Four separate, independently-gated consent choices — none implies
 * another. Legal copy for all four is explicitly pending legal validation;
 * this prototype ships placeholder text only.
 */
export interface ConsentChoices {
  personalData: boolean;
  sensitiveHealth: boolean;
  internalImage: boolean;
  publicImage: boolean;
}

export interface EnrollmentInput {
  isMinor: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  level: StudentLevel;
  eps: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: GuardianRelationship;
  consents: ConsentChoices;
}

export interface EnrollmentResult {
  ok: true;
  studentId: string;
  message: string;
}

/**
 * The academy's schedule — the canonical class catalog Gestión manages.
 * Distinct from a student's `upcomingClasses` (their own agenda): this is
 * the operational view, one row per class occurrence for the week, and the
 * single source of truth for `confirmedCount`/`cancelledCount` that Gestión
 * and Admin both read.
 */
export type ClassStatus = 'PROGRAMADA' | 'CONFIRMADA' | 'CANCELADA';

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada con profesor',
  CANCELADA: 'Cancelada',
};

export interface ScheduledClass extends DanceClassInfo {
  status: ClassStatus;
  cancelReason: string | null;
}

export interface ConfirmTeacherResult {
  ok: true;
  message: string;
}

export interface CancelClassResult {
  ok: true;
  message: string;
}

/** A same-day operational snapshot for Gestión — not the director's monthly view. */
export interface ReceptionSummary {
  classesToday: number;
  classesThisWeek: number;
  hoursThisWeek: number;
  activeStudents: number;
  checkInsToday: number;
  pendingPayments: number;
  averageOccupancy: number; // 0-1, across non-cancelled scheduled classes
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  phone: string;
  level: StudentLevel;
  danceRole: DanceRole;
  dataConsent: boolean;
}

export interface CreateStudentResult {
  ok: true;
  studentId: string;
  pin: string;
  message: string;
}

/**
 * Room booking for anything outside the regular group schedule — a private
 * lesson, a rehearsal, free practice. The "future capability" the director
 * dashboard only gestures at (unused rooms → private lessons, rental) —
 * here it's an actual Gestión-facing module, still with no real payment.
 */
export type RoomBookingType = 'PERSONALIZADA' | 'ENSAYO' | 'PRACTICA';

export const ROOM_BOOKING_TYPE_LABELS: Record<RoomBookingType, string> = {
  PERSONALIZADA: 'Clase personalizada',
  ENSAYO: 'Ensayo',
  PRACTICA: 'Práctica libre',
};

export interface RoomBooking {
  bookingId: string;
  roomId: string;
  roomName: string;
  title: string;
  teacher: string;
  date: string;
  startTime: string;
  endTime: string;
  type: RoomBookingType;
  status: 'CONFIRMADA' | 'CANCELADA';
}

export interface CreateRoomBookingInput {
  roomId: string;
  title: string;
  teacher: string;
  date: string;
  startTime: string;
  endTime: string;
  type: RoomBookingType;
}

export interface CreateRoomBookingResult {
  ok: true;
  booking: RoomBooking;
  message: string;
}
