import { useSyncExternalStore } from 'react';
import type { AuditEntry, ClassRegistration, PaymentReport, RoomBooking, ScheduledClass } from './types';
import {
  ACADEMY_SCHEDULE,
  INITIAL_AUDIT_TRAIL,
  INITIAL_PAYMENT_REPORTS,
  INITIAL_ROOM_BOOKINGS,
  INITIAL_ROSTER,
  INITIAL_STUDENTS,
  type DemoStudentRecord,
} from './mock-data';

/**
 * The demo's entire "backend" — an in-memory, session-scoped store.
 *
 * There is no persistence by design: a full page reload re-executes this
 * module and the state above resets to the deterministic fixtures. That is
 * the intended reset behavior, not a gap — see README "Estado" section.
 *
 * UI components never touch this module directly. They call `api.*` (in
 * `mock-api.ts`) and read state through `useDemoState()` below, which is the
 * same shape a real API client + a query cache would present later.
 *
 * `schedule` is the single source of truth for every class occurrence,
 * including "today's" — there is deliberately no separate `currentClass`
 * field. A second, independently-cloned copy of the same class previously
 * let a confirm/cancel go unseen by Gestión/Admin; `mock-api.ts` now always
 * looks today's class up fresh from `schedule` (see `CURRENT_CLASS_ID` in
 * `mock-data.ts`).
 *
 * The public registration domain (Person/StudentProfile/Consent,
 * /registro-estudiante) is NOT part of this in-memory store — unlike
 * everything else here, pilot registrations must survive a page reload, so
 * they're persisted server-side via Netlify Blobs instead. See
 * `netlify/functions/registration.ts` and `mock-api.ts`'s `registration`
 * namespace, which calls that function directly regardless of demo/pilot
 * mode.
 */
export interface DemoState {
  students: Record<string, DemoStudentRecord>;
  roster: ClassRegistration[];
  schedule: ScheduledClass[];
  roomBookings: RoomBooking[];
  paymentReports: PaymentReport[];
  auditTrail: AuditEntry[];
}

function initialState(): DemoState {
  return structuredClone({
    students: INITIAL_STUDENTS,
    roster: INITIAL_ROSTER,
    schedule: ACADEMY_SCHEDULE,
    roomBookings: INITIAL_ROOM_BOOKINGS,
    paymentReports: INITIAL_PAYMENT_REPORTS,
    auditTrail: INITIAL_AUDIT_TRAIL,
  });
}

let state: DemoState = initialState();
const listeners = new Set<() => void>();

export function getState(): DemoState {
  return state;
}

export function setState(updater: (prev: DemoState) => DemoState): void {
  state = updater(state);
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Exposed for a possible "Reiniciar demo" control; not wired to any UI yet. */
export function resetState(): void {
  state = initialState();
  for (const listener of listeners) listener();
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getState);
}
