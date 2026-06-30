import type { CappedList } from "@/lib/types/etim";

/**
 * Label for a capped reverse-link list:
 *  - approximate (total is a lower bound) → `approxTemplate` ("first {cap} — more exist")
 *  - precise + capped → `template` ("first {cap} of {total}")
 *  - not capped → null
 */
export function cappedLabel(
  list: CappedList,
  template: string,
  approxTemplate?: string,
): string | null {
  if (list.approximate && approxTemplate) {
    return approxTemplate.replace("{cap}", String(list.items.length));
  }
  if (list.total <= list.items.length) return null;
  return template
    .replace("{cap}", String(list.items.length))
    .replace("{total}", list.total.toLocaleString());
}
