/**
 * Public surface of the API layer — the demo/pilot adapter boundary.
 *
 * UI components import only from here — never from `./mock-data`,
 * `./store`, `./mock-api` or `./pilot-api` directly. `VITE_APP_MODE`
 * selects which adapter `api` resolves to; every screen calls the same
 * `api.*` shape either way (enforced by a compile-time check in
 * `pilot-api.ts`), so switching modes is never a UI change.
 *
 *   VITE_APP_MODE=demo  (default) -> mock-api.ts, in-memory, no network
 *   VITE_APP_MODE=pilot           -> pilot-api.ts, Netlify Function proxy
 *                                     -> Apps Script -> Sheets/Drive
 *
 * `useDemoState`/`resetState` are demo-only debugging utilities (no page
 * currently imports them) — pilot mode has no equivalent local store to
 * reset, since the backend is the source of truth.
 */
import { api as mockApi } from './mock-api';
import { api as pilotApi } from './pilot-api';

export const APP_MODE: 'demo' | 'pilot' = import.meta.env.VITE_APP_MODE === 'pilot' ? 'pilot' : 'demo';

export const api = APP_MODE === 'pilot' ? pilotApi : mockApi;

export { useDemoState, resetState } from './store';
export { JULIAN, ROOMS, DEMO_TODAY, REGISTRATION_POLICY_VERSION } from './mock-data';
export {
  PAYMENT_METHOD_LABELS,
  ENGAGEMENT_LABELS,
  ATTENDANCE_INTENT_LABELS,
  CLASS_STATUS_LABELS,
  ROOM_BOOKING_TYPE_LABELS,
  PROGRAM_LABELS,
  CATEGORY_LABELS,
  PAYMENT_REPORT_STATUS_LABELS,
  CLASS_RESTORATION_LABELS,
  GUARDIAN_RELATIONSHIP_LABELS,
  DOCUMENT_TYPE_LABELS,
  EMERGENCY_RELATIONSHIP_LABELS,
  CONSENT_TYPE_LABELS,
} from './types';
export type * from './types';
