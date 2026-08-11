import type {
  AttendanceIntentStatus,
  AttentionItem,
  CancelClassResult,
  CheckInScenario,
  CheckInSimulateResult,
  ClassRegistration,
  ClassRoster,
  ConfirmAttendanceResult,
  ConfirmTeacherResult,
  CreateRoomBookingInput,
  CreateRoomBookingResult,
  CreateStudentInput,
  CreateStudentResult,
  DirectorDashboard,
  ManualCheckInResult,
  PaymentMethod,
  ReceptionSummary,
  RenewalMethod,
  RenewalRequest,
  RequestRenewalResult,
  RoomBooking,
  RotatingCode,
  ScheduledClass,
  SearchResult,
  SellPackageInput,
  SellPackageResult,
  StudentSummary,
  UpcomingClassStatus,
} from './types';
import { ATTENTION_ITEMS, DEMO_TODAY, DIRECTOR_DASHBOARD, JULIAN, ROOMS } from './mock-data';
import { getState, setState, type DemoState } from './store';
import type { DemoStudentRecord } from './mock-data';

/** Simulated network latency, matching the ~400-900ms the real backend quotes in docs/03. */
function delay(ms = 380): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

function toStudentSummary(state: DemoState, record: DemoStudentRecord): StudentSummary {
  const registrationFor = (classId: string) =>
    state.roster.find((r) => r.studentId === record.studentId && r.classId === classId);

  const upcomingClasses: UpcomingClassStatus[] = record.upcomingClasses.map((cls) => ({
    ...cls,
    registrationStatus: registrationFor(cls.classId)?.status ?? null,
  }));

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
      danceClass: state.currentClass,
      registrationStatus: registrationFor(state.currentClass.classId)?.status ?? null,
    },
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

/**
 * Bumps how many seats are shown reserved for one of the student's OWN
 * upcoming-class cards — a cheap stand-in for "aforo" without normalizing
 * classes into a shared, cross-student collection. Each student's copy of a
 * class only reflects their own reservation traffic, not everyone else's;
 * fine for a demo, called out as a simplification in the delivery notes.
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
 * Check-in — always today's live class (state.currentClass). If the student
 * already has a CONFIRMED (or NO_SHOW) registration for it, it is upgraded
 * in place to ATTENDED — confirming ahead of time and then checking in is
 * the same seat, not two events. With no prior registration, this creates a
 * walk-in ATTENDED entry directly, same as a student who never confirmed and
 * just showed up.
 */
function performCheckIn(
  state: DemoState,
  studentId: string,
): { next: DemoState; result: ManualCheckInResult } {
  const record = requireStudent(state, studentId);
  const classId = state.currentClass.classId;
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
        className: state.currentClass.name,
        teacher: state.currentClass.teacher,
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
    currentClass: {
      ...state.currentClass,
      confirmedCount: nextRoster.filter((r) => r.classId === classId && r.status === 'ATTENDED').length,
    },
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

/** Reserves a seat for ANY class — today's or a future one on the student's agenda. */
function performConfirm(
  state: DemoState,
  studentId: string,
  classId: string,
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

  const isTodaysClass = classId === state.currentClass.classId;
  const updatedRecord =
    !holdsSeat && !isTodaysClass ? bumpOwnUpcomingCount(record, classId, 1) : record;

  return {
    next: {
      ...state,
      roster: nextRoster,
      students: updatedRecord === record ? state.students : { ...state.students, [studentId]: updatedRecord },
    },
    result: {
      ok: true,
      status: 'CONFIRMED',
      message: 'Cupo reservado (simulación). Puedes cancelar hasta 30 minutos antes de la clase.',
    },
  };
}

function performCancel(
  state: DemoState,
  studentId: string,
  classId: string,
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

  const isTodaysClass = classId === state.currentClass.classId;
  const updatedRecord = heldSeat && !isTodaysClass ? bumpOwnUpcomingCount(record, classId, -1) : record;

  return {
    next: {
      ...state,
      roster: nextRoster,
      students: updatedRecord === record ? state.students : { ...state.students, [studentId]: updatedRecord },
    },
    result: {
      ok: true,
      status: 'CANCELLED',
      message: 'Reserva cancelada (simulación). Recuerda: se permite hasta 30 minutos antes de la clase.',
    },
  };
}

function performRequestRenewal(
  state: DemoState,
  studentId: string,
  method: RenewalMethod,
): { next: DemoState; result: RequestRenewalResult } {
  const record = requireStudent(state, studentId);
  const request: RenewalRequest = {
    requestId: `RN-${String(state.renewalRequests.length + 1).padStart(4, '0')}`,
    studentId,
    studentName: record.firstName,
    method,
    requestedAt: nowTime(),
    status: 'PENDIENTE',
  };

  return {
    next: { ...state, renewalRequests: [request, ...state.renewalRequests] },
    result: {
      ok: true,
      request,
      message:
        method === 'ALARMA_RECEPCION'
          ? 'Aviso enviado a recepción (simulación). Te van a contactar para renovar tu plan.'
          : 'Notificación de pago enviada (simulación). Recepción confirmará tu transferencia y activará tu paquete.',
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

export const api = {
  admin: {
    async getDashboard(): Promise<DirectorDashboard> {
      await delay();
      return DIRECTOR_DASHBOARD;
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
        // Selling a package resolves whatever pending renewal request brought the student in.
        renewalRequests: prev.renewalRequests.map((r) =>
          r.studentId === input.studentId && r.status === 'PENDIENTE' ? { ...r, status: 'CONTACTADO' } : r,
        ),
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

    async getClassRoster(): Promise<ClassRoster> {
      await delay(250);
      const state = getState();
      return {
        danceClass: state.currentClass,
        registrations: state.roster.filter((r) => r.classId === state.currentClass.classId),
      };
    },

    async getRenewalRequests(): Promise<RenewalRequest[]> {
      await delay(250);
      return getState().renewalRequests;
    },

    /** Short, human-triaged list of students reception should look out for today. */
    async getAttentionItems(): Promise<AttentionItem[]> {
      await delay(220);
      return ATTENTION_ITEMS;
    },

    async resolveRenewalRequest(requestId: string): Promise<{ ok: true }> {
      await delay(300);
      setState((prev) => ({
        ...prev,
        renewalRequests: prev.renewalRequests.map((r) =>
          r.requestId === requestId ? { ...r, status: 'CONTACTADO' } : r,
        ),
      }));
      return { ok: true };
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

      return {
        ok: true,
        studentId,
        pin,
        message: `Alumno creado (simulación). PIN ${pin} — muéstralo una sola vez, no se puede volver a consultar.`,
      };
    },

    /** The week's class catalog, sorted chronologically. */
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

    /** Same-day operational snapshot — hours, students, occupancy, pending renewals. */
    async getSummary(): Promise<ReceptionSummary> {
      await delay(300);
      const state = getState();
      const active = state.schedule.filter((c) => c.status !== 'CANCELADA');
      const today = active.filter((c) => c.date === DEMO_TODAY);
      const totalOccupancy = active.reduce((acc, c) => acc + c.confirmedCount / c.capacity, 0);

      return {
        classesToday: today.length,
        classesThisWeek: active.length,
        hoursThisWeek: active.reduce((acc, c) => acc + hoursBetween(c.startTime, c.endTime), 0),
        activeStudents: Object.values(state.students).filter((s) => s.status === 'ACTIVO').length,
        checkInsToday: state.roster.filter(
          (r) => r.classId === state.currentClass.classId && r.status === 'ATTENDED',
        ).length,
        pendingRenewals: state.renewalRequests.filter((r) => r.status === 'PENDIENTE').length,
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
      const { next, result } = performConfirm(getState(), studentId, classId);
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
      const { next, result } = performCancel(getState(), studentId, classId);
      setState(() => next);
      return result;
    },

    async requestRenewal(
      method: RenewalMethod,
      studentId: string = JULIAN.studentId,
    ): Promise<RequestRenewalResult> {
      await delay(350);
      const { next, result } = performRequestRenewal(getState(), studentId, method);
      setState(() => next);
      return result;
    },
  },

  checkIn: {
    async getRotatingCode(): Promise<RotatingCode> {
      await delay(150);
      const state = getState();
      const windowSeconds = 90;
      const secondsIntoWindow = Math.floor(Date.now() / 1000) % windowSeconds;
      const secondsRemaining = windowSeconds - secondsIntoWindow;
      const seed = Math.floor(Date.now() / 1000 / windowSeconds);
      const code = String((seed * 9301 + 49297) % 1_000_000).padStart(6, '0');

      return {
        code,
        secondsRemaining,
        classInProgress: {
          classId: state.currentClass.classId,
          name: state.currentClass.name,
          teacher: state.currentClass.teacher,
          startTime: state.currentClass.startTime,
          roomName: state.currentClass.roomName,
          floor: state.currentClass.floor,
        },
      };
    },

    /**
     * Presenter-controlled scenario selector for the check-in screen.
     *
     * Only SUCCESS mutates shared state (it is Julián's own QR moment, so the
     * balance updates for real and the Student screen reflects it). The other
     * two scenarios are illustrative snapshots of what those outcomes look
     * like — they exist so a presenter can show all three without needing
     * three separately staged students. See README "Limitaciones conocidas".
     */
    async simulate(scenario: CheckInScenario): Promise<CheckInSimulateResult> {
      await delay(600);

      if (scenario === 'ALREADY_CHECKED_IN') {
        return {
          scenario,
          ok: true,
          message: 'Ya registraste esta clase (simulación) — no se descuenta dos veces.',
        };
      }

      if (scenario === 'NO_PACKAGE') {
        return {
          scenario,
          ok: true,
          message:
            'Registrado sin paquete (simulación). No se bloquea la entrada: recepción lo resuelve en el mostrador.',
          remainingClasses: 0,
        };
      }

      const state = getState();
      const before = requireStudent(state, JULIAN.studentId);
      const { next, result } = performCheckIn(state, JULIAN.studentId);
      setState(() => next);

      const hitStreakMilestone = before.streak.consecutiveWeeks === 3;

      return {
        scenario,
        ok: true,
        message: `¡Listo, Julián! Check-in confirmado (simulación). Te quedan ${result.remainingClasses} clases.`,
        attendanceId: result.attendanceId,
        className: state.currentClass.name,
        remainingClasses: result.remainingClasses,
        bonus: hitStreakMilestone ? { label: '¡4 semanas seguidas! +25 puntos (simulación)' } : null,
      };
    },
  },
};

export type { DemoStudentRecord, PaymentMethod, AttendanceIntentStatus };
