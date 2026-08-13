import type {
  ActorKind,
  ApprovePaymentInput,
  AttentionItem,
  AuditEntry,
  CancelClassResult,
  ClassRegistration,
  ClassRestorationReason,
  ClassRoster,
  ConfirmAttendanceResult,
  ConfirmTeacherResult,
  CreateRoomBookingInput,
  CreateRoomBookingResult,
  CreateStudentInput,
  CreateStudentResult,
  DirectorDashboard,
  EnrollmentInput,
  EnrollmentResult,
  ManualCheckInResult,
  PackageInfo,
  PackagePurchase,
  PaymentMethod,
  PaymentReport,
  ReceptionSummary,
  RejectPaymentInput,
  ReportPaymentInput,
  ReportPaymentResult,
  RestoreClassInput,
  RestoreClassResult,
  ReviewPaymentResult,
  RoomBooking,
  ScheduledClass,
  SearchResult,
  SellPackageInput,
  SellPackageResult,
  StudentSummary,
  UpcomingClassStatus,
} from './types';
import { CLASS_RESTORATION_LABELS } from './types';
import {
  ATTENTION_ITEMS,
  computeClassesToday,
  computeRoomOccupancyToday,
  CURRENT_CLASS_ID,
  DEMO_TODAY,
  DIRECTOR_DASHBOARD,
  JULIAN,
  ROOMS,
} from './mock-data';
import { getState, setState, type DemoState } from './store';
import type { DemoStudentRecord } from './mock-data';

/** Simulated network latency, matching the ~400-900ms the real backend quotes in docs/03. */
function delay(ms = 380): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

/**
 * Today's live class, looked up fresh from `state.schedule` every time —
 * never a separately-cloned copy. This is what makes a confirm/cancel on
 * today's class immediately visible to Gestión and Admin: there is only
 * ever one record of it.
 */
function currentClass(state: DemoState): ScheduledClass {
  const found = state.schedule.find((c) => c.classId === CURRENT_CLASS_ID);
  if (!found) throw new Error('NOT_FOUND: no existe la clase de hoy en el horario');
  return found;
}

function toStudentSummary(state: DemoState, record: DemoStudentRecord): StudentSummary {
  const registrationFor = (classId: string) =>
    state.roster.find((r) => r.studentId === record.studentId && r.classId === classId);

  const upcomingClasses: UpcomingClassStatus[] = record.upcomingClasses.map((cls) => ({
    ...cls,
    registrationStatus: registrationFor(cls.classId)?.status ?? null,
  }));

  const live = currentClass(state);

  return {
    studentId: record.studentId,
    firstName: record.firstName,
    level: record.level,
    danceRole: record.danceRole,
    program: record.program,
    availableClasses: record.package?.balance ?? 0,
    package: record.package,
    packageHistory: record.packageHistory,
    points: record.points,
    streak: record.streak,
    engagement: record.engagement,
    upcomingClasses,
    attendanceHistory: record.attendanceHistory,
    todayClass: {
      danceClass: live,
      registrationStatus: registrationFor(live.classId)?.status ?? null,
    },
    paymentReports: state.paymentReports
      .filter((r) => r.studentId === record.studentId)
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)),
    auditTrail: state.auditTrail
      .filter((a) => a.actedForStudentId === record.studentId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  };
}

function requireStudent(state: DemoState, studentId: string): DemoStudentRecord {
  const record = state.students[studentId];
  if (!record) {
    throw new Error(`NOT_FOUND: no existe un alumno de demo con id "${studentId}"`);
  }
  return record;
}

function findRegistration(state: DemoState, studentId: string, classId: string): ClassRegistration | undefined {
  return state.roster.find((r) => r.studentId === studentId && r.classId === classId);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextAttendanceId(state: DemoState): string {
  const all = Object.values(state.students).flatMap((s) => s.attendanceHistory);
  const max = all.reduce((acc, a) => {
    const n = Number(a.attendanceId.split('-')[1] ?? 0);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 1200);
  return `AS-${String(max + 1).padStart(6, '0')}`;
}

function nextRegistrationId(state: DemoState): string {
  const max = state.roster.reduce((acc, r) => {
    const n = Number(r.registrationId.split('-')[1] ?? 0);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 400);
  return `RG-${String(max + 1).padStart(6, '0')}`;
}

function nextReportId(state: DemoState): string {
  const max = state.paymentReports.reduce((acc, r) => {
    const n = Number(r.reportId.split('-')[1] ?? 0);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `PM-${String(max + 1).padStart(4, '0')}`;
}

function nextAuditId(state: DemoState): string {
  return `AU-${String(state.auditTrail.length + 1).padStart(4, '0')}`;
}

/** Every on-behalf or operational action is recorded here — never silently attributed to the student. */
function pushAudit(state: DemoState, entry: Omit<AuditEntry, 'entryId' | 'timestamp'>): AuditEntry[] {
  const full: AuditEntry = { ...entry, entryId: nextAuditId(state), timestamp: nowTime() };
  return [full, ...state.auditTrail];
}

/**
 * Bumps how many seats are shown reserved for one of the student's OWN
 * upcoming-class cards — a cheap stand-in for "aforo" without normalizing
 * classes into a shared, cross-student collection. Each student's copy of a
 * class only reflects their own reservation traffic, not everyone else's;
 * fine for a demo, called out as a simplification in the delivery notes.
 * A no-op when `classId` isn't on the student's own agenda.
 */
function bumpOwnUpcomingCount(record: DemoStudentRecord, classId: string, delta: number): DemoStudentRecord {
  return {
    ...record,
    upcomingClasses: record.upcomingClasses.map((cls) =>
      cls.classId === classId ? { ...cls, confirmedCount: Math.max(0, cls.confirmedCount + delta) } : cls,
    ),
  };
}

/**
 * Bumps the shared, authoritative counts on `state.schedule` — what Gestión
 * and Admin both read. A no-op when `classId` isn't in this week's schedule
 * (e.g. a future-week instance on a student's personal agenda only).
 */
function bumpScheduleCounts(
  state: DemoState,
  classId: string,
  deltaConfirmed: number,
  deltaCancelled: number,
): ScheduledClass[] {
  return state.schedule.map((c) =>
    c.classId === classId
      ? {
          ...c,
          confirmedCount: Math.max(0, c.confirmedCount + deltaConfirmed),
          cancelledCount: Math.max(0, c.cancelledCount + deltaCancelled),
        }
      : c,
  );
}

/**
 * Manual attendance validation — always today's live class. Distinct from
 * confirming (intent): this is Gestión physically marking someone present
 * at the door, no QR involved. If the student already has a CONFIRMED (or
 * NO_SHOW) registration for it, it is upgraded in place to ATTENDED —
 * confirming ahead of time and then being checked in is the same seat, not
 * two events. With no prior registration, this creates a walk-in ATTENDED
 * entry directly.
 */
function performCheckIn(
  state: DemoState,
  studentId: string,
): { next: DemoState; result: ManualCheckInResult } {
  const record = requireStudent(state, studentId);
  const classId = CURRENT_CLASS_ID;
  const existing = findRegistration(state, studentId, classId);

  if (existing?.status === 'ATTENDED') {
    return {
      next: state,
      result: {
        attendanceId: existing.registrationId,
        studentId,
        consumptionType: existing.consumptionType ?? 'SIN_PAQUETE',
        remainingClasses: existing.remainingClasses ?? 0,
        message: `${record.firstName} ya había marcado esta clase — simulación sin cambios.`,
      },
    };
  }

  const hasBalance = (record.package?.balance ?? 0) > 0;
  const attendanceId = existing ? existing.registrationId : nextAttendanceId(state);
  const time = nowTime();
  const points = hasBalance ? 10 : 0;
  const consumptionType = hasBalance ? 'PAQUETE' : 'SIN_PAQUETE';
  const live = currentClass(state);

  const updatedRecord: DemoStudentRecord = {
    ...record,
    package: hasBalance && record.package
      ? { ...record.package, balance: record.package.balance - 1 }
      : record.package,
    points: { ...record.points, balance: record.points.balance + points },
    attendanceHistory: [
      {
        attendanceId,
        date: DEMO_TODAY,
        className: live.name,
        teacher: live.teacher,
        consumptionType,
        points,
      },
      ...record.attendanceHistory,
    ],
  };

  const remainingClasses = updatedRecord.package?.balance ?? 0;

  const nextRoster: ClassRegistration[] = existing
    ? state.roster.map((r) =>
        r.registrationId === existing.registrationId
          ? { ...r, status: 'ATTENDED' as const, checkedInAt: time, consumptionType, remainingClasses }
          : r,
      )
    : [
        ...state.roster,
        {
          registrationId: attendanceId,
          classId,
          studentId,
          studentName: record.firstName,
          status: 'ATTENDED' as const,
          confirmedAt: null,
          checkedInAt: time,
          cancelledAt: null,
          consumptionType,
          remainingClasses,
        },
      ];

  const next: DemoState = {
    ...state,
    students: { ...state.students, [studentId]: updatedRecord },
    roster: nextRoster,
  };

  return {
    next,
    result: {
      attendanceId,
      studentId,
      consumptionType,
      remainingClasses,
      message: hasBalance
        ? `Check-in registrado (simulación). Le quedan ${remainingClasses} clase${remainingClasses === 1 ? '' : 's'}.`
        : `Check-in registrado sin paquete (simulación). Recepción debe resolverlo en el mostrador.`,
    },
  };
}

interface Actor {
  actedBy: ActorKind;
  actedByName: string;
  reason?: string;
}

const SELF: Actor = { actedBy: 'STUDENT', actedByName: 'Alumno' };

/** Reserves a seat for ANY class — today's or a future one on the student's agenda. Gestión may do this on the student's behalf. */
function performConfirm(
  state: DemoState,
  studentId: string,
  classId: string,
  actor: Actor,
): { next: DemoState; result: ConfirmAttendanceResult } {
  const record = requireStudent(state, studentId);
  const existing = findRegistration(state, studentId, classId);

  if (existing?.status === 'ATTENDED') {
    return {
      next: state,
      result: {
        ok: true,
        status: 'ATTENDED',
        message: `${record.firstName} ya hizo check-in en esta clase — no hace falta confirmar (simulación).`,
      },
    };
  }

  const time = nowTime();
  const holdsSeat = existing && (existing.status === 'CONFIRMED' || existing.status === 'NO_SHOW');

  const nextRoster: ClassRegistration[] = existing
    ? state.roster.map((r) =>
        r.registrationId === existing.registrationId
          ? { ...r, status: 'CONFIRMED' as const, confirmedAt: time, cancelledAt: null }
          : r,
      )
    : [
        ...state.roster,
        {
          registrationId: nextRegistrationId(state),
          classId,
          studentId,
          studentName: record.firstName,
          status: 'CONFIRMED' as const,
          confirmedAt: time,
          checkedInAt: null,
          cancelledAt: null,
          consumptionType: null,
          remainingClasses: null,
        },
      ];

  const updatedRecord = holdsSeat ? record : bumpOwnUpcomingCount(record, classId, 1);
  const schedule = holdsSeat ? state.schedule : bumpScheduleCounts(state, classId, 1, 0);
  const auditTrail = pushAudit(state, {
    action: 'class.confirm',
    actedBy: actor.actedBy,
    actedByName: actor.actedByName,
    actedForStudentId: studentId,
    actedForName: record.firstName,
    reason: actor.reason ?? null,
  });

  return {
    next: {
      ...state,
      roster: nextRoster,
      schedule,
      students: updatedRecord === record ? state.students : { ...state.students, [studentId]: updatedRecord },
      auditTrail,
    },
    result: {
      ok: true,
      status: 'CONFIRMED',
      message: actor.actedBy === 'GESTION'
        ? `Cupo reservado en nombre de ${record.firstName} (simulación). Puede cancelar hasta 30 minutos antes.`
        : 'Cupo reservado (simulación). Puedes cancelar hasta 30 minutos antes de la clase.',
    },
  };
}

function performCancel(
  state: DemoState,
  studentId: string,
  classId: string,
  actor: Actor,
): { next: DemoState; result: ConfirmAttendanceResult } {
  const record = requireStudent(state, studentId);
  const existing = findRegistration(state, studentId, classId);

  if (!existing || existing.status === 'CANCELLED') {
    return {
      next: state,
      result: {
        ok: true,
        status: 'CANCELLED',
        message: `${record.firstName} no tenía una reserva activa para esta clase (simulación).`,
      },
    };
  }

  if (existing.status === 'ATTENDED') {
    return {
      next: state,
      result: {
        ok: true,
        status: 'ATTENDED',
        message: `${record.firstName} ya hizo check-in — la clase ya se consumió (simulación).`,
      },
    };
  }

  const time = nowTime();
  const heldSeat = existing.status === 'CONFIRMED' || existing.status === 'NO_SHOW';
  const nextRoster = state.roster.map((r) =>
    r.registrationId === existing.registrationId
      ? { ...r, status: 'CANCELLED' as const, cancelledAt: time }
      : r,
  );

  const updatedRecord = heldSeat ? bumpOwnUpcomingCount(record, classId, -1) : record;
  const schedule = heldSeat ? bumpScheduleCounts(state, classId, -1, 1) : state.schedule;
  const auditTrail = pushAudit(state, {
    action: 'class.cancel',
    actedBy: actor.actedBy,
    actedByName: actor.actedByName,
    actedForStudentId: studentId,
    actedForName: record.firstName,
    reason: actor.reason ?? null,
  });

  return {
    next: {
      ...state,
      roster: nextRoster,
      schedule,
      students: updatedRecord === record ? state.students : { ...state.students, [studentId]: updatedRecord },
      auditTrail,
    },
    result: {
      ok: true,
      status: 'CANCELLED',
      message: actor.actedBy === 'GESTION'
        ? `Reserva cancelada en nombre de ${record.firstName} (simulación).`
        : 'Reserva cancelada (simulación). Recuerda: se permite hasta 30 minutos antes de la clase.',
    },
  };
}

/** Student or Gestión reports a payment — always starts PENDING_REVIEW, never activates a plan by itself. */
function performReportPayment(
  state: DemoState,
  input: ReportPaymentInput,
): { next: DemoState; result: ReportPaymentResult } {
  const record = requireStudent(state, input.studentId);
  const report: PaymentReport = {
    reportId: nextReportId(state),
    studentId: input.studentId,
    studentName: record.firstName,
    planName: input.planName,
    classes: input.classes,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    transferReference: input.transferReference?.trim() || null,
    receiptFileName: input.receiptFileName?.trim() || null,
    proofNote: input.proofNote?.trim() || null,
    status: 'PENDING_REVIEW',
    reportedAt: nowTime(),
    reportedBy: input.actedBy,
    reportedByName: input.actedByName,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    saleConsecutive: null,
  };

  const auditTrail = pushAudit(state, {
    action: 'payment.report',
    actedBy: input.actedBy,
    actedByName: input.actedByName,
    actedForStudentId: input.studentId,
    actedForName: record.firstName,
    reason: input.reason ?? null,
  });

  return {
    next: { ...state, paymentReports: [report, ...state.paymentReports], auditTrail },
    result: {
      ok: true,
      report,
      message: input.actedBy === 'GESTION'
        ? `Pago reportado en nombre de ${record.firstName} (simulación). Queda pendiente de revisión.`
        : 'Pago reportado (simulación). Jonathan o Iván lo revisan y activan tu plan.',
    },
  };
}

/** Approving assigns the sale consecutive and starts the plan: exactly 30 days from this moment. */
function performApprovePayment(
  state: DemoState,
  input: ApprovePaymentInput,
): { next: DemoState; result: ReviewPaymentResult } {
  const report = state.paymentReports.find((r) => r.reportId === input.reportId);
  if (!report) throw new Error(`NOT_FOUND: no existe el reporte "${input.reportId}"`);
  if (report.status !== 'PENDING_REVIEW') {
    return { next: state, result: { ok: true, report, message: 'Ese reporte ya fue procesado (simulación).' } };
  }
  if (!input.saleConsecutive.trim()) {
    throw new Error('VALIDATION_ERROR: falta el consecutivo de venta');
  }

  const record = requireStudent(state, report.studentId);
  const approvedAt = nowTime();
  const expiresOn = addDays(DEMO_TODAY, 30);

  const updatedReport: PaymentReport = {
    ...report,
    status: 'APPROVED',
    reviewedBy: input.approverName,
    reviewedAt: approvedAt,
    saleConsecutive: input.saleConsecutive.trim(),
  };

  const packageId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const newPackage: PackageInfo = {
    packageId,
    name: report.planName,
    totalClasses: report.classes,
    balance: report.classes,
    expiresOn,
    daysUntilExpiry: 30,
  };
  const purchase: PackagePurchase = {
    packageId,
    name: report.planName,
    purchaseDate: DEMO_TODAY,
    expiresOn,
    paymentMethod: report.paymentMethod,
    amount: report.amount,
    classesIncluded: report.classes,
    classesRemaining: report.classes,
  };
  const updatedRecord: DemoStudentRecord = {
    ...record,
    package: newPackage,
    packageHistory: [purchase, ...record.packageHistory],
  };

  const auditTrail = pushAudit(state, {
    action: 'payment.approve',
    actedBy: 'GESTION',
    actedByName: input.approverName,
    actedForStudentId: report.studentId,
    actedForName: record.firstName,
    reason: `Consecutivo ${updatedReport.saleConsecutive}`,
  });

  return {
    next: {
      ...state,
      paymentReports: state.paymentReports.map((r) => (r.reportId === report.reportId ? updatedReport : r)),
      students: { ...state.students, [report.studentId]: updatedRecord },
      auditTrail,
    },
    result: {
      ok: true,
      report: updatedReport,
      message: `Pago aprobado (simulación). Plan activo por 30 días, vence el ${expiresOn}.`,
    },
  };
}

function performRejectPayment(
  state: DemoState,
  input: RejectPaymentInput,
): { next: DemoState; result: ReviewPaymentResult } {
  const report = state.paymentReports.find((r) => r.reportId === input.reportId);
  if (!report) throw new Error(`NOT_FOUND: no existe el reporte "${input.reportId}"`);
  if (report.status !== 'PENDING_REVIEW') {
    return { next: state, result: { ok: true, report, message: 'Ese reporte ya fue procesado (simulación).' } };
  }
  if (!input.reason.trim()) throw new Error('VALIDATION_ERROR: se requiere un motivo de rechazo');

  const record = requireStudent(state, report.studentId);
  const updatedReport: PaymentReport = {
    ...report,
    status: 'REJECTED',
    reviewedBy: input.approverName,
    reviewedAt: nowTime(),
    rejectionReason: input.reason.trim(),
  };

  const auditTrail = pushAudit(state, {
    action: 'payment.reject',
    actedBy: 'GESTION',
    actedByName: input.approverName,
    actedForStudentId: report.studentId,
    actedForName: record.firstName,
    reason: input.reason.trim(),
  });

  return {
    next: {
      ...state,
      paymentReports: state.paymentReports.map((r) => (r.reportId === report.reportId ? updatedReport : r)),
      auditTrail,
    },
    result: { ok: true, report: updatedReport, message: 'Pago rechazado (simulación). El alumno puede reportar de nuevo.' },
  };
}

/** Exceptional, Gestión-only, and only within the current plan's validity window. */
function performRestoreClass(
  state: DemoState,
  input: RestoreClassInput,
): { next: DemoState; result: RestoreClassResult } {
  const record = requireStudent(state, input.studentId);
  if (!record.package) {
    throw new Error('VALIDATION_ERROR: el alumno no tiene un plan activo para restaurar una clase');
  }
  if (record.package.expiresOn < DEMO_TODAY) {
    throw new Error('VALIDATION_ERROR: el plan ya venció — la restauración solo aplica dentro de su vigencia');
  }
  if (!input.note.trim()) {
    throw new Error('VALIDATION_ERROR: se requiere una nota para restaurar la clase');
  }

  const newBalance = record.package.balance + 1;
  const updatedRecord: DemoStudentRecord = {
    ...record,
    package: { ...record.package, balance: newBalance },
  };

  const auditTrail = pushAudit(state, {
    action: 'class.restore',
    actedBy: 'GESTION',
    actedByName: input.actedByName,
    actedForStudentId: input.studentId,
    actedForName: record.firstName,
    reason: `${CLASS_RESTORATION_LABELS[input.reason]}: ${input.note.trim()}`,
  });

  return {
    next: { ...state, students: { ...state.students, [input.studentId]: updatedRecord }, auditTrail },
    result: {
      ok: true,
      availableClasses: newBalance,
      message: `Clase restaurada (simulación). Ahora tiene ${newBalance} disponibles.`,
    },
  };
}

function hoursBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

function nextStudentId(state: DemoState): string {
  const count = Object.keys(state.students).length;
  return `ST-NEW-${String(count + 1).padStart(3, '0')}`;
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function nextBookingId(state: DemoState): string {
  const max = state.roomBookings.reduce((acc, b) => {
    const n = Number(b.bookingId.split('-')[1] ?? 0);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `RB-${String(max + 1).padStart(4, '0')}`;
}

/** Public self-service enrollment — no login. Consent choices and EPS are accepted but, like the rest of this demo, never sent anywhere real. */
function performEnroll(state: DemoState, input: EnrollmentInput): { next: DemoState; result: EnrollmentResult } {
  const studentId = nextStudentId(state);
  const record: DemoStudentRecord = {
    studentId,
    firstName: input.firstName,
    level: input.level,
    danceRole: 'AMBOS',
    program: 'ALMA_OPEN',
    status: 'ACTIVO',
    package: null,
    packageHistory: [],
    points: {
      balance: 0,
      tier: 'BRONCE',
      tierLabel: 'Bronce',
      nextTier: 'Plata',
      pointsToNextTier: 100,
      progress: 0,
    },
    streak: { consecutiveWeeks: 0 },
    engagement: { status: 'ESTABLE', attendancesLast30Days: 0, daysSinceLastAttendance: null, noShowCount: 0 },
    upcomingClasses: [],
    attendanceHistory: [],
  };

  const who = input.isMinor ? `${input.firstName} (inscrito por ${input.guardianName ?? 'su acudiente'})` : input.firstName;

  return {
    next: { ...state, students: { ...state.students, [studentId]: record } },
    result: {
      ok: true,
      studentId,
      message: `Inscripción recibida (simulación) para ${who}. Un asesor confirmará plan y horario.`,
    },
  };
}

export const api = {
  admin: {
    async getDashboard(): Promise<DirectorDashboard> {
      await delay();
      const state = getState();
      return {
        ...DIRECTOR_DASHBOARD,
        classesToday: computeClassesToday(state.schedule),
        roomOccupancyToday: computeRoomOccupancyToday(state.schedule),
      };
    },
  },

  frontDesk: {
    async searchStudents(query: string): Promise<SearchResult[]> {
      await delay(280);
      const q = query.trim().toLowerCase();
      const state = getState();
      const all = Object.values(state.students);
      const matches = q ? all.filter((s) => s.firstName.toLowerCase().includes(q)) : all;
      return matches.map((s) => ({
        studentId: s.studentId,
        name: s.firstName,
        level: s.level,
        availableClasses: s.package?.balance ?? 0,
        status: s.status,
      }));
    },

    async getStudentProfile(studentId: string): Promise<StudentSummary> {
      await delay();
      const state = getState();
      return toStudentSummary(state, requireStudent(state, studentId));
    },

    async sellPackage(input: SellPackageInput): Promise<SellPackageResult> {
      await delay(500);
      const state = getState();
      const record = requireStudent(state, input.studentId);

      const newExpiry = addDays(DEMO_TODAY, input.validityDays);
      const expiresOn =
        record.package && record.package.expiresOn > newExpiry
          ? record.package.expiresOn
          : newExpiry;

      const newPackage = {
        packageId: record.package?.packageId ?? `PQ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: input.packageTypeName,
        totalClasses: (record.package?.totalClasses ?? 0) + input.classes,
        balance: (record.package?.balance ?? 0) + input.classes,
        expiresOn,
        daysUntilExpiry: daysBetween(DEMO_TODAY, expiresOn),
      };

      const purchase = {
        packageId: newPackage.packageId,
        name: input.packageTypeName,
        purchaseDate: DEMO_TODAY,
        expiresOn,
        paymentMethod: input.paymentMethod,
        amount: input.amountPaid,
        classesIncluded: input.classes,
        classesRemaining: newPackage.balance,
      };

      const updatedRecord: DemoStudentRecord = {
        ...record,
        package: newPackage,
        packageHistory: [purchase, ...record.packageHistory],
      };

      setState((prev) => ({
        ...prev,
        students: { ...prev.students, [input.studentId]: updatedRecord },
      }));

      return {
        packageId: newPackage.packageId,
        addedClasses: input.classes,
        availableClasses: newPackage.balance,
        expiresOn: newPackage.expiresOn,
        message: `Venta simulada: se agregaron ${input.classes} clases. Ahora tiene ${newPackage.balance} disponibles.`,
      };
    },

    async manualCheckIn(studentId: string): Promise<ManualCheckInResult> {
      await delay(450);
      const { next, result } = performCheckIn(getState(), studentId);
      setState(() => next);
      return result;
    },

    /** Gestión confirming/cancelling a class on the student's behalf — same core as the student's own action, always audited. */
    async confirmClassFor(studentId: string, classId: string, actedByName: string, reason?: string): Promise<ConfirmAttendanceResult> {
      await delay(300);
      const { next, result } = performConfirm(getState(), studentId, classId, { actedBy: 'GESTION', actedByName, reason });
      setState(() => next);
      return result;
    },

    async cancelClassFor(studentId: string, classId: string, actedByName: string, reason?: string): Promise<ConfirmAttendanceResult> {
      await delay(300);
      const { next, result } = performCancel(getState(), studentId, classId, { actedBy: 'GESTION', actedByName, reason });
      setState(() => next);
      return result;
    },

    async restoreClass(input: RestoreClassInput): Promise<RestoreClassResult> {
      await delay(400);
      const { next, result } = performRestoreClass(getState(), input);
      setState(() => next);
      return result;
    },

    async getClassRoster(): Promise<ClassRoster> {
      await delay(250);
      const state = getState();
      const live = currentClass(state);
      return {
        danceClass: live,
        registrations: state.roster.filter((r) => r.classId === live.classId),
      };
    },

    /** Short, human-triaged list of students Gestión should look out for today. */
    async getAttentionItems(): Promise<AttentionItem[]> {
      await delay(220);
      return ATTENTION_ITEMS;
    },

    async getPaymentReports(): Promise<PaymentReport[]> {
      await delay(280);
      return getState().paymentReports;
    },

    /** New alumno, front-desk side. PIN returned once, same rule as the real backend (docs/03). */
    async createStudent(input: CreateStudentInput): Promise<CreateStudentResult> {
      await delay(500);
      const state = getState();
      const studentId = nextStudentId(state);
      const pin = generatePin();

      const record: DemoStudentRecord = {
        studentId,
        firstName: input.firstName,
        level: input.level,
        danceRole: input.danceRole,
        program: 'ALMA_OPEN',
        status: 'ACTIVO',
        package: null,
        packageHistory: [],
        points: {
          balance: 0,
          tier: 'BRONCE',
          tierLabel: 'Bronce',
          nextTier: 'Plata',
          pointsToNextTier: 100,
          progress: 0,
        },
        streak: { consecutiveWeeks: 0 },
        engagement: {
          status: 'ESTABLE',
          attendancesLast30Days: 0,
          daysSinceLastAttendance: null,
          noShowCount: 0,
        },
        upcomingClasses: [],
        attendanceHistory: [],
      };

      setState((prev) => ({ ...prev, students: { ...prev.students, [studentId]: record } }));

      const message = `¡Bienvenid@ a Alma de Tango, ${input.firstName}! ` +
        `Ya puedes ver tus clases y puntos en nuestro portal. ` +
        `Entra con tu teléfono y este PIN: ${pin}`;

      return {
        ok: true,
        studentId,
        pin,
        message,
      };
    },

    /** The week's class catalog, sorted chronologically — the single source of truth Gestión and Admin both read. */
    async getSchedule(): Promise<ScheduledClass[]> {
      await delay(300);
      return [...getState().schedule].sort((a, b) =>
        (a.date + a.startTime).localeCompare(b.date + b.startTime),
      );
    },

    async confirmClassWithTeacher(classId: string): Promise<ConfirmTeacherResult> {
      await delay(300);
      const state = getState();
      const cls = state.schedule.find((c) => c.classId === classId);
      if (!cls) throw new Error(`NOT_FOUND: no existe la clase "${classId}"`);

      if (cls.status === 'CANCELADA') {
        return { ok: true, message: 'Esta clase está cancelada — no se puede confirmar (simulación).' };
      }

      setState((prev) => ({
        ...prev,
        schedule: prev.schedule.map((c) =>
          c.classId === classId ? { ...c, status: 'CONFIRMADA' as const } : c,
        ),
      }));

      return {
        ok: true,
        message: `Clase confirmada con ${cls.teacher} (simulación).`,
      };
    },

    /** Cancelling by low turnout — cascades to cancel any active reservations for that class. */
    async cancelClass(classId: string, reason: string): Promise<CancelClassResult> {
      await delay(400);
      const state = getState();
      const cls = state.schedule.find((c) => c.classId === classId);
      if (!cls) throw new Error(`NOT_FOUND: no existe la clase "${classId}"`);

      if (cls.status === 'CANCELADA') {
        return { ok: true, message: 'Esta clase ya estaba cancelada (simulación).' };
      }

      setState((prev) => ({
        ...prev,
        schedule: prev.schedule.map((c) =>
          c.classId === classId ? { ...c, status: 'CANCELADA' as const, cancelReason: reason || null } : c,
        ),
        roster: prev.roster.map((r) =>
          r.classId === classId && (r.status === 'CONFIRMED' || r.status === 'NO_SHOW')
            ? { ...r, status: 'CANCELLED' as const, cancelledAt: nowTime() }
            : r,
        ),
      }));

      return {
        ok: true,
        message: `Clase cancelada (simulación). Las reservas activas quedaron canceladas también.`,
      };
    },

    /** Same-day operational snapshot — hours, students, occupancy, pending payments. */
    async getSummary(): Promise<ReceptionSummary> {
      await delay(300);
      const state = getState();
      const active = state.schedule.filter((c) => c.status !== 'CANCELADA');
      const today = active.filter((c) => c.date === DEMO_TODAY);
      const totalOccupancy = active.reduce((acc, c) => acc + c.confirmedCount / c.capacity, 0);
      const live = currentClass(state);

      return {
        classesToday: today.length,
        classesThisWeek: active.length,
        hoursThisWeek: active.reduce((acc, c) => acc + hoursBetween(c.startTime, c.endTime), 0),
        activeStudents: Object.values(state.students).filter((s) => s.status === 'ACTIVO').length,
        checkInsToday: state.roster.filter((r) => r.classId === live.classId && r.status === 'ATTENDED').length,
        pendingPayments: state.paymentReports.filter((r) => r.status === 'PENDING_REVIEW').length,
        averageOccupancy: active.length ? totalOccupancy / active.length : 0,
      };
    },

    async getRoomBookings(): Promise<RoomBooking[]> {
      await delay(250);
      return [...getState().roomBookings].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    },

    /** Books a room outside the group schedule — a private lesson, a rehearsal, free practice. */
    async createRoomBooking(input: CreateRoomBookingInput): Promise<CreateRoomBookingResult> {
      await delay(400);
      const state = getState();
      const roomName = ROOMS.find((r) => r.roomId === input.roomId)?.name ?? input.roomId;

      const booking: RoomBooking = {
        bookingId: nextBookingId(state),
        roomId: input.roomId,
        roomName,
        title: input.title,
        teacher: input.teacher,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        type: input.type,
        status: 'CONFIRMADA',
      };

      setState((prev) => ({ ...prev, roomBookings: [booking, ...prev.roomBookings] }));

      return {
        ok: true,
        booking,
        message: `Salón reservado (simulación): ${roomName}, ${input.date} ${input.startTime}–${input.endTime}.`,
      };
    },

    async cancelRoomBooking(bookingId: string): Promise<{ ok: true }> {
      await delay(300);
      setState((prev) => ({
        ...prev,
        roomBookings: prev.roomBookings.map((b) =>
          b.bookingId === bookingId ? { ...b, status: 'CANCELADA' as const } : b,
        ),
      }));
      return { ok: true };
    },
  },

  student: {
    async getSummary(studentId: string = JULIAN.studentId): Promise<StudentSummary> {
      await delay();
      const state = getState();
      return toStudentSummary(state, requireStudent(state, studentId));
    },

    /** Reserves a seat for any class on the student's own agenda — today's live class or a future one. */
    async confirmClass(classId: string, studentId: string = JULIAN.studentId): Promise<ConfirmAttendanceResult> {
      await delay(300);
      const { next, result } = performConfirm(getState(), studentId, classId, SELF);
      setState(() => next);
      return result;
    },

    /**
     * Allowed up to 30 minutes before class — stated in the confirmation
     * copy, not enforced against real wall-clock time here (see the
     * AttendanceIntentStatus doc comment in types.ts for why).
     */
    async cancelClass(classId: string, studentId: string = JULIAN.studentId): Promise<ConfirmAttendanceResult> {
      await delay(300);
      const { next, result } = performCancel(getState(), studentId, classId, SELF);
      setState(() => next);
      return result;
    },
  },

  /** Payment report → review → activation. Shared by Student (self) and Gestión (on behalf). */
  payments: {
    async report(input: ReportPaymentInput): Promise<ReportPaymentResult> {
      await delay(400);
      const { next, result } = performReportPayment(getState(), input);
      setState(() => next);
      return result;
    },

    async approve(input: ApprovePaymentInput): Promise<ReviewPaymentResult> {
      await delay(400);
      const { next, result } = performApprovePayment(getState(), input);
      setState(() => next);
      return result;
    },

    async reject(input: RejectPaymentInput): Promise<ReviewPaymentResult> {
      await delay(350);
      const { next, result } = performRejectPayment(getState(), input);
      setState(() => next);
      return result;
    },
  },

  /** Public self-service enrollment — no login required. */
  public: {
    async enroll(input: EnrollmentInput): Promise<EnrollmentResult> {
      await delay(500);
      const { next, result } = performEnroll(getState(), input);
      setState(() => next);
      return result;
    },
  },
};

export type { DemoStudentRecord, PaymentMethod, ActorKind, ClassRestorationReason };
