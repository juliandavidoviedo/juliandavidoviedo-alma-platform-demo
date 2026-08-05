import type {
  CheckInScenario,
  CheckInSimulateResult,
  DirectorDashboard,
  LiveRoom,
  ManualCheckInResult,
  RotatingCode,
  SearchResult,
  SellPackageInput,
  SellPackageResult,
  StudentSummary,
} from './types';
import { DEMO_TODAY, DIRECTOR_DASHBOARD, JULIAN } from './mock-data';
import { getState, setState, type DemoState } from './store';
import type { DemoStudentRecord } from './mock-data';

/** Simulated network latency, matching the ~400-900ms the real backend quotes in docs/03. */
function delay(ms = 380): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toStudentSummary(record: DemoStudentRecord): StudentSummary {
  return {
    studentId: record.studentId,
    firstName: record.firstName,
    level: record.level,
    danceRole: record.danceRole,
    availableClasses: record.package?.balance ?? 0,
    package: record.package,
    points: record.points,
    streak: record.streak,
    upcomingClasses: record.upcomingClasses,
    attendanceHistory: record.attendanceHistory,
  };
}

function requireStudent(state: DemoState, studentId: string): DemoStudentRecord {
  const record = state.students[studentId];
  if (!record) {
    throw new Error(`NOT_FOUND: no existe un alumno de demo con id "${studentId}"`);
  }
  return record;
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

function performCheckIn(
  state: DemoState,
  studentId: string,
): { next: DemoState; result: ManualCheckInResult } {
  const record = requireStudent(state, studentId);
  const alreadyToday = state.liveRoom.find((e) => e.studentId === studentId);

  if (alreadyToday) {
    return {
      next: state,
      result: {
        attendanceId: alreadyToday.attendanceId,
        studentId,
        consumptionType: alreadyToday.consumptionType,
        remainingClasses: alreadyToday.remainingClasses,
        message: `${record.firstName} ya había marcado esta clase — simulación sin cambios.`,
      },
    };
  }

  const hasBalance = (record.package?.balance ?? 0) > 0;
  const attendanceId = nextAttendanceId(state);
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);
  const points = hasBalance ? 10 : 0;

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
        consumptionType: hasBalance ? 'PAQUETE' : 'SIN_PAQUETE',
        points,
      },
      ...record.attendanceHistory,
    ],
  };

  const remainingClasses = updatedRecord.package?.balance ?? 0;

  const next: DemoState = {
    ...state,
    students: { ...state.students, [studentId]: updatedRecord },
    liveRoom: [
      ...state.liveRoom,
      {
        attendanceId,
        studentId,
        name: record.firstName,
        time,
        consumptionType: hasBalance ? 'PAQUETE' : 'SIN_PAQUETE',
        remainingClasses,
      },
    ],
    currentClass: {
      ...state.currentClass,
      attendeeCount: state.liveRoom.length + 1,
    },
  };

  return {
    next,
    result: {
      attendanceId,
      studentId,
      consumptionType: hasBalance ? 'PAQUETE' : 'SIN_PAQUETE',
      remainingClasses,
      message: hasBalance
        ? `Check-in registrado (simulación). Le quedan ${remainingClasses} clase${remainingClasses === 1 ? '' : 's'}.`
        : `Check-in registrado sin paquete (simulación). Recepción debe resolverlo en el mostrador.`,
    },
  };
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
      return toStudentSummary(requireStudent(getState(), studentId));
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

      const updatedRecord: DemoStudentRecord = { ...record, package: newPackage };

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

    async getLiveRoom(): Promise<LiveRoom> {
      await delay(250);
      const state = getState();
      return { danceClass: state.currentClass, attendees: state.liveRoom };
    },
  },

  student: {
    async getSummary(studentId: string = JULIAN.studentId): Promise<StudentSummary> {
      await delay();
      return toStudentSummary(requireStudent(getState(), studentId));
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

export type { DemoStudentRecord };
