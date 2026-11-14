/**
 * HMTC CMS — module that emits logs.
 *
 * Uses the Node stream primitives `process.stdout.write` /
 * `process.stderr.write` instead of `console.*`, so:
 *   - the `no-console` rule stays enabled in *every* file, including this one;
 *   - there is no `eslint-disable` in the codebase for logging;
 *   - a future switch to a real transport (pino, OTel, Cloudflare Logpush) is a
 *     one-file change;
 *   - output goes straight to the platform stream (Docker → systemd / CF logs).
 *
 * Server-only. Requires the Node runtime — Route Handlers default to it; a
 * deliberate `export const runtime = 'edge'` would make this file throw at
 * build time, which is the correct failure.
 *
 * Never pass tokens, cookies, request bodies or page content as `detail`.
 */
import 'server-only';

type Level = 'ERROR' | 'WARN' | 'INFO';

function serialize(detail: unknown): string {
  if (detail === undefined) return '';
  if (detail instanceof Error) {
    // Stack traces are appropriate for server logs and are never returned to
    // the client — the `internal` response body is a fixed string.
    return JSON.stringify({
      name: detail.name,
      message: detail.message,
      stack: detail.stack,
    });
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return '[unserializable]';
  }
}

function emit(level: Level, scope: string, message: string, detail?: unknown): void {
  const suffix = detail === undefined ? '' : ` ${serialize(detail)}`;
  const line = `[cms:${scope}] ${level} ${message}${suffix}\n`;
  if (level === 'INFO') {
    process.stdout.write(line);
  } else {
    process.stderr.write(line);
  }
}

export function logError(scope: string, message: string, detail?: unknown): void {
  emit('ERROR', scope, message, detail);
}

export function logWarn(scope: string, message: string): void {
  emit('WARN', scope, message);
}

export function logInfo(scope: string, message: string): void {
  emit('INFO', scope, message);
}
