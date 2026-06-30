import { describe, expect, it } from "vitest";
import { cappedLabel } from "@/lib/i18n/format";

const TEMPLATE = "Showing first {cap} of {total}";

describe("cappedLabel", () => {
  it("returns null when the list is not capped", () => {
    expect(cappedLabel({ items: [1, 2], total: 2, cap: 50 } as never, TEMPLATE)).toBeNull();
  });

  it("formats cap + total when capped", () => {
    const list = { items: new Array(50).fill(0), total: 97, cap: 50 } as never;
    expect(cappedLabel(list, TEMPLATE)).toBe("Showing first 50 of 97");
  });

  it("uses items.length as the cap shown", () => {
    const list = { items: new Array(20).fill(0), total: 1234, cap: 20 } as never;
    expect(cappedLabel(list, TEMPLATE)).toBe("Showing first 20 of 1,234");
  });
});
