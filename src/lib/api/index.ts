/**
 * Public surface of the mock API layer.
 *
 * UI components import only from here — never from `./mock-data` or
 * `./store` directly. That boundary is what makes swapping in the real
 * Apps Script client later (see docs/03-api-contract.md in the backend repo,
 * commit 92f4815) a change to `mock-api.ts` alone, not to every screen.
 */
export { api } from './mock-api';
export { useDemoState, resetState } from './store';
export { JULIAN, ROOMS } from './mock-data';
export {
  PAYMENT_METHOD_LABELS,
  ENGAGEMENT_LABELS,
  REGISTRATION_STATUS_LABELS,
} from './types';
export type * from './types';
