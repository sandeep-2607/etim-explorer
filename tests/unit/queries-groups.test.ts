import { describe, expect, it, vi, beforeEach } from "vitest";

// Holder so the hoisted mock can read per-test rows.
const h = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client/server", () => ({
  getSupabase: () => {
    const result = { data: h.rows, count: h.rows.length };
    // chainable, awaitable builder
    const b: Record<string, unknown> = {};
    for (const m of ["from", "select", "order", "range", "eq", "ilike", "in"]) {
      b[m] = () => b;
    }
    (b as { then: unknown }).then = (res: (v: unknown) => unknown) =>
      Promise.resolve(result).then(res);
    return b;
  },
}));

import { getGroupList } from "@/lib/queries/groups";

const ROWS = [
  {
    code: "EG000001",
    etim_group_translation: [{ language: "EN", description: "Cables" }],
    etim_class: [{ count: 5 }],
  },
  {
    code: "EG000002",
    etim_group_translation: [{ language: "EN", description: "Tubes" }],
    etim_class: [{ count: 50 }],
  },
  {
    code: "EG000003",
    etim_group_translation: [{ language: "de-DE", description: "Nur DE" }],
    etim_class: [{ count: 1 }],
  },
];

beforeEach(() => {
  h.rows = structuredClone(ROWS);
});

describe("getGroupList", () => {
  it("maps localized name + class count, total = all rows", async () => {
    const res = await getGroupList({ lang: "EN", page: 1, pageSize: 10 });
    expect(res.total).toBe(3);
    const cables = res.items.find((g) => g.code === "EG000001")!;
    expect(cables.name).toBe("Cables");
    expect(cables.classCount).toBe(5);
  });

  it("sorts by class count desc", async () => {
    const res = await getGroupList({
      lang: "EN",
      page: 1,
      pageSize: 10,
      sort: "classes",
      dir: "desc",
    });
    expect(res.items.map((g) => g.code)).toEqual([
      "EG000002",
      "EG000001",
      "EG000003",
    ]);
  });

  it("falls back to code when no EN translation exists", async () => {
    const res = await getGroupList({ lang: "EN", page: 1, pageSize: 10 });
    const g3 = res.items.find((g) => g.code === "EG000003")!;
    expect(g3.name).toBe("EG000003");
    expect(g3.nameIsFallback).toBe(false);
  });

  it("flags EN fallback for a non-EN locale", async () => {
    const res = await getGroupList({ lang: "fr-BE", page: 1, pageSize: 10 });
    const cables = res.items.find((g) => g.code === "EG000001")!;
    expect(cables).toMatchObject({ name: "Cables", nameIsFallback: true });
  });

  it("filters by query and paginates", async () => {
    const res = await getGroupList({ lang: "EN", page: 1, pageSize: 10, q: "tub" });
    expect(res.items).toHaveLength(1);
    expect(res.items[0].code).toBe("EG000002");
  });
});
