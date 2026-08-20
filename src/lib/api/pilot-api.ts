/**
 * Pilot API adapter — real persistence via the Netlify Function proxy
 * (`/.netlify/functions/api`) → Apps Script Web App → Sheets/Drive.
 *
 * This file exists to satisfy the SAME shape as `mock-api.ts`'s `api`
 * export (enforced by the `PilotApi = typeof import('./mock-api').api`
 * type check below) — that identity is what lets `index.ts` switch
 * adapters by `VITE_APP_MODE` alone, with zero UI changes. See
 * PROJECT_CONTEXT.md (backend repo) "Pilot Prototype" sections.
 *
 * Action names below are the CONTRACT this file expects the backend to
 * implement. As of this commit only a few already exist on the real
 * backend (`frontDesk.manualCheckin`, `frontDesk.createStudent`,
 * `classes.roster`, `student.summary`); the rest (`classes.confirm`,
 * `payments.*`, `enrollment.create`, etc.) are the target for the
 * persistence commits that follow (see PROJECT_CONTEXT.md "Implementation
 * order"). Calling them today will fail with `NOT_FOUND` until those
 * land — that is expected, not a bug in this file.
 */
import type {
  ApprovePaymentInput,
  AttentionItem,
  CancelClassResult,
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
  PaymentReport,
  ReceptionSummary,
  RecentRegistration,
  RegistrationDetail,
  RegistrationLookupResult,
  RegistrationSubmitInput,
  RegistrationSubmitResult,
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
} from './types';

const PROXY_PATH = '/.netlify/functions/api';

interface ProxyEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

/**
 * Every pilot call goes through here — one fetch shape, one error
 * normalization point. `token` is a placeholder for the session token a
 * future real-auth commit will attach; omitted for now since no pilot
 * commit in this iteration implements login (see PROJECT_CONTEXT.md).
 */
async function callAction<T>(action: string, data: unknown = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(PROXY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });
  } catch {
    throw new Error('NETWORK_ERROR: no se pudo contactar el servidor. Revisa tu conexión.');
  }

  let body: ProxyEnvelope<T>;
  try {
    body = await res.json();
  } catch {
    throw new Error(`NETWORK_ERROR: respuesta inválida del servidor (HTTP ${res.status}).`);
  }

  if (!body.ok) {
    const code = body.error?.code ?? 'INTERNAL_ERROR';
    const message = body.error?.message ?? 'Ocurrió un error inesperado.';
    throw new Error(`${code}: ${message}`);
  }

  return body.data as T;
}

export const api = {
  admin: {
    getDashboard: () => callAction<DirectorDashboard>('admin.dashboard'),
  },

  frontDesk: {
    searchStudents: (query: string) => callAction<SearchResult[]>('frontDesk.searchStudent', { query }),
    getStudentProfile: (studentId: string) => callAction<StudentSummary>('frontDesk.studentProfile', { studentId }),
    sellPackage: (input: SellPackageInput) => callAction<SellPackageResult>('frontDesk.sellPackage', input),
    manualCheckIn: (studentId: string) => callAction<ManualCheckInResult>('frontDesk.manualCheckin', { studentId }),
    confirmClassFor: (studentId: string, classId: string, actedByName: string, reason?: string) =>
      callAction<ConfirmAttendanceResult>('classes.confirmFor', { studentId, classId, actedByName, reason }),
    cancelClassFor: (studentId: string, classId: string, actedByName: string, reason?: string) =>
      callAction<ConfirmAttendanceResult>('classes.cancelFor', { studentId, classId, actedByName, reason }),
    restoreClass: (input: RestoreClassInput) => callAction<RestoreClassResult>('classes.restore', input),
    getClassRoster: () => callAction<ClassRoster>('classes.roster'),
    getAttentionItems: () => callAction<AttentionItem[]>('frontDesk.attentionItems'),
    getPaymentReports: () => callAction<PaymentReport[]>('payments.list'),
    createStudent: (input: CreateStudentInput) => callAction<CreateStudentResult>('frontDesk.createStudent', input),
    getSchedule: () => callAction<ScheduledClass[]>('classes.schedule'),
    confirmClassWithTeacher: (classId: string) =>
      callAction<ConfirmTeacherResult>('classes.confirmWithTeacher', { classId }),
    cancelClass: (classId: string, reason: string) =>
      callAction<CancelClassResult>('classes.cancelClass', { classId, reason }),
    getSummary: () => callAction<ReceptionSummary>('frontDesk.summary'),
    getRoomBookings: () => callAction<RoomBooking[]>('rooms.bookings'),
    createRoomBooking: (input: CreateRoomBookingInput) =>
      callAction<CreateRoomBookingResult>('rooms.createBooking', input),
    cancelRoomBooking: (bookingId: string) => callAction<{ ok: true }>('rooms.cancelBooking', { bookingId }),
  },

  student: {
    getSummary: (studentId: string) => callAction<StudentSummary>('student.summary', { studentId }),
    confirmClass: (classId: string, studentId: string) =>
      callAction<ConfirmAttendanceResult>('classes.confirm', { classId, studentId }),
    cancelClass: (classId: string, studentId: string) =>
      callAction<ConfirmAttendanceResult>('classes.cancelConfirmation', { classId, studentId }),
  },

  payments: {
    report: (input: ReportPaymentInput) => callAction<ReportPaymentResult>('payments.report', input),
    approve: (input: ApprovePaymentInput) => callAction<ReviewPaymentResult>('payments.approve', input),
    reject: (input: RejectPaymentInput) => callAction<ReviewPaymentResult>('payments.reject', input),
  },

  public: {
    enroll: (input: EnrollmentInput) => callAction<EnrollmentResult>('enrollment.create', input),
  },

  registration: {
    submit: (input: RegistrationSubmitInput) =>
      callAction<RegistrationSubmitResult>('registration.submit', input),
    lookup: (documentNumber: string) =>
      callAction<RegistrationLookupResult>('registration.lookup', { documentNumber }),
    recent: () => callAction<RecentRegistration[]>('registration.recent'),
    getDetail: (studentId: string) =>
      callAction<RegistrationDetail>('registration.detail', { studentId }),
  },
};

// Compile-time guarantee: this adapter must expose exactly the shape
// `mock-api.ts` exports, so `index.ts` can switch between them with zero
// UI changes. A shape drift fails the build here, not silently in a screen.
import type { api as mockApiShape } from './mock-api';
const _shapeCheck: typeof mockApiShape = api;
void _shapeCheck;
