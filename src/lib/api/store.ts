import { useSyncExternalStore } from 'react';
import type { DanceClassInfo, LiveRoomEntry } from './types';
import {
  CURRENT_CLASS,
  INITIAL_LIVE_ROOM,
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
 */
export interface DemoState {
  students: Record<string, DemoStudentRecord>;
  liveRoom: LiveRoomEntry[];
  currentClass: DanceClassInfo;
}

function initialState(): DemoState {
  return structuredClone({
    students: INITIAL_STUDENTS,
    liveRoom: INITIAL_LIVE_ROOM,
    currentClass: CURRENT_CLASS,
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
