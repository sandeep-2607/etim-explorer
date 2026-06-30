/** Server-side validation/normalization for URL search params. Inputs are
 * untrusted: clamp and whitelist, never throw. */

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parseQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 100);
}

/** Whitelist a sort key; fall back to the first allowed key. */
export function parseSort<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T {
  const raw = Array.isArray(value) ? value[0] : value;
  return (allowed as readonly string[]).includes(raw ?? "")
    ? (raw as T)
    : allowed[0];
}

export function parseDir(value: string | string[] | undefined): "asc" | "desc" {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "desc" ? "desc" : "asc";
}

/** Optional whitelist: returns the value if allowed, else undefined. */
export function parseEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return (allowed as readonly string[]).includes(raw ?? "") ? (raw as T) : undefined;
}

/** A trimmed code-ish param (e.g. group code); empty → undefined. */
export function parseCode(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const v = (raw ?? "").trim().slice(0, 32);
  return v || undefined;
}

export const DEFAULT_PAGE_SIZE = 50;
