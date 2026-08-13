/**
 * Netlify Function proxy — `/.netlify/functions/api`.
 *
 * The ONLY thing that knows the Apps Script Web App URL and the backend API
 * key. The browser (pilot-api.ts) only ever calls this same-origin path
 * with `{ action, data }`; this function attaches the key server-side and
 * forwards to Apps Script, so neither secret is ever sent to the client —
 * see PROJECT_CONTEXT.md (backend repo) decision #22.
 *
 * Required Netlify environment variables (server-side only — set in the
 * Netlify UI/CLI, never committed, never VITE_-prefixed):
 *   APPS_SCRIPT_URL   the deployed Apps Script Web App /exec URL
 *   BACKEND_API_KEY   must match the backend's Config.API_KEY (pilot target:
 *                     a Script Property, per decision #14)
 *
 * No dependency on `@netlify/functions` — the handler shape below is the
 * subset of the classic Netlify Functions contract this file actually
 * uses, kept local so this stays a zero-dependency file like the rest of
 * this repo's infra code.
 */

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

interface ApiEnvelope {
  ok: boolean;
  data?: unknown;
  error?: { code: string; message: string };
}

function jsonResponse(statusCode: number, payload: ApiEnvelope): NetlifyResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const backendApiKey = process.env.BACKEND_API_KEY;

  if (!appsScriptUrl || !backendApiKey) {
    // Never in the response body - a misconfiguration is not the caller's
    // concern, and echoing which var is missing would leak infra shape.
    console.error('api proxy misconfigured: APPS_SCRIPT_URL/BACKEND_API_KEY not set');
    return jsonResponse(500, {
      ok: false,
      error: { code: 'PROXY_MISCONFIGURED', message: 'El servidor no está configurado. Contacta a soporte.' },
    });
  }

  let payload: { action?: unknown; token?: unknown; data?: unknown };
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { ok: false, error: { code: 'INVALID_JSON', message: 'Cuerpo de la petición inválido.' } });
  }

  const { action, token, data } = payload;
  if (typeof action !== 'string' || !action) {
    return jsonResponse(400, { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Falta la acción.' } });
  }

  // Log the action name only, never the payload - it may carry personal
  // data, payment amounts, EPS, or (once auth lands) a session token.
  console.log('api proxy ->', action);

  let upstream: Response;
  try {
    upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      // text/plain avoids the CORS preflight Apps Script mishandles, even
      // though the body is JSON - matches docs/03-api-contract.md exactly.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, apiKey: backendApiKey, token, data: data ?? {} }),
    });
  } catch {
    console.error('api proxy: upstream unreachable for action', action);
    return jsonResponse(502, {
      ok: false,
      error: { code: 'UPSTREAM_UNREACHABLE', message: 'No se pudo contactar el backend. Intenta de nuevo.' },
    });
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    console.error('api proxy: non-JSON upstream response, action', action, 'status', upstream.status);
    return jsonResponse(502, {
      ok: false,
      error: { code: 'UPSTREAM_INVALID_RESPONSE', message: 'Respuesta inválida del backend.' },
    });
  }

  // Normalize to exactly { ok, data } | { ok:false, error:{code,message}} -
  // pilot-api.ts assumes this shape and nothing else ever reaches the browser.
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { ok?: unknown }).ok !== 'boolean'
  ) {
    console.error('api proxy: malformed envelope from backend, action', action);
    return jsonResponse(502, {
      ok: false,
      error: { code: 'UPSTREAM_INVALID_RESPONSE', message: 'Formato de respuesta inesperado del backend.' },
    });
  }

  return jsonResponse(200, body as ApiEnvelope);
}
