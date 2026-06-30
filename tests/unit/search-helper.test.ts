import { describe, expect, it, vi } from "vitest";
import { applyTextSearch, escapeLike } from "@/lib/queries/_search";

describe("escapeLike", () => {
  it("escapes LIKE wildcards so they match literally", () => {
    expect(escapeLike("50%")).toBe("50\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("plain")).toBe("plain");
  });
});

describe("applyTextSearch", () => {
  it("applies an escaped substring ILIKE on the column", () => {
    const ilike = vi.fn().mockReturnValue("RESULT");
    const out = applyTextSearch({ ilike }, "description", "  cab%le ");
    expect(ilike).toHaveBeenCalledWith("description", "%cab\\%le%");
    expect(out).toBe("RESULT");
  });

  it("is a no-op for an empty term", () => {
    const builder = { ilike: vi.fn() };
    expect(applyTextSearch(builder, "description", "   ")).toBe(builder);
    expect(builder.ilike).not.toHaveBeenCalled();
  });
});
