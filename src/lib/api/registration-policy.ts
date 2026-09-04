/**
 * Single source of truth for the registration consent policy version.
 *
 * Read by both the browser (StudentRegistration.tsx, to show which version
 * a user is consenting to) and the Netlify Function that actually persists
 * consent records (netlify/functions/registration.ts) — kept as its own
 * tiny module, not part of mock-data.ts, so the serverless function can
 * import this one constant without bundling the rest of the demo fixtures.
 *
 * Bump this string whenever the published Aviso de Privacidad / Política de
 * Tratamiento at /privacidad changes in a way that affects what people are
 * consenting to.
 */
export const REGISTRATION_POLICY_VERSION = 'v0-piloto-2026-09';
