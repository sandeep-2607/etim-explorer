/** Reusable translation picker with English fallback — shared by all queries. */

export type Translation = { language: string; description: string | null };

export function localize(
  rows: Translation[] | null | undefined,
  lang: string,
): { value: string | null; isFallback: boolean } {
  if (!rows || rows.length === 0) return { value: null, isFallback: false };
  // Treat empty / whitespace-only descriptions as missing so a blank DB row
  // falls back to English (or the code) instead of rendering an empty name.
  const clean = (v: string | null | undefined) => {
    const t = v?.trim();
    return t ? t : null;
  };
  const map = new Map(rows.map((r) => [r.language, clean(r.description)]));
  const exact = map.get(lang);
  if (exact != null) return { value: exact, isFallback: false };
  const en = map.get("EN") ?? null;
  return { value: en, isFallback: en != null };
}
