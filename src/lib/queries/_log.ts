import "server-only";

/**
 * Log a data-layer error (server-only) so a misconfiguration (schema not
 * exposed, missing grant, wrong column) is visible in logs instead of silently
 * degrading to an empty result.
 */
export function logQueryError(scope: string, error: unknown): void {
  console.error(`[etim:query] ${scope} failed:`, error);
}
