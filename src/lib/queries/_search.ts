/**
 * Shared text matching for all entity searches.
 *
 * Uses case-insensitive substring (`ILIKE '%term%'`) — the right fit for ETIM
 * data. Postgres full-text search was evaluated and rejected: the `english`
 * config (and the existing `idx_*_fts` GIN indexes) tokenize ETIM's
 * slash-joined names into a single lexeme — e.g.
 * `to_tsvector('english','Downlight/spot/floodlight') = 'downlight/spot/floodlight'`
 * — so a prefix query like `down:*` does NOT match. Substring matching is
 * correct and predictable here; at the current data scale (≤234k rows) the
 * sequential scan is acceptable. (A trigram/`pg_trgm` index would speed it up,
 * but that needs a DB change — out of scope.)
 */

/** Escape LIKE/ILIKE wildcards in user input so `%`/`_` are matched literally. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

/** Minimal structural type for the PostgREST builder method we use. */
interface IlikeFilterable<T> {
  ilike: (column: string, pattern: string) => T;
}

/** Apply the substring text filter to a query builder on `column`. */
export function applyTextSearch<T extends IlikeFilterable<T>>(
  query: T,
  column: string,
  term: string,
): T {
  const t = term.trim();
  if (!t) return query;
  return query.ilike(column, `%${escapeLike(t)}%`);
}
