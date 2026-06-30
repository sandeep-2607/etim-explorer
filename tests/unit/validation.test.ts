import { describe, expect, it } from "vitest";
import {
  parseCode,
  parseDir,
  parseEnum,
  parsePage,
  parseQuery,
  parseSort,
} from "@/lib/validation";

describe("parsePage", () => {
  it("defaults to 1 for missing/invalid input", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });
  it("parses a valid page and takes the first of an array", () => {
    expect(parsePage("4")).toBe(4);
    expect(parsePage(["7", "9"])).toBe(7);
  });
});

describe("parseQuery", () => {
  it("trims and caps length", () => {
    expect(parseQuery("  cable ")).toBe("cable");
    expect(parseQuery(undefined)).toBe("");
    expect(parseQuery("x".repeat(200))).toHaveLength(100);
  });
});

describe("parseSort", () => {
  const allowed = ["code", "version"] as const;
  it("returns the value when whitelisted, else the first allowed", () => {
    expect(parseSort("version", allowed)).toBe("version");
    expect(parseSort("evil", allowed)).toBe("code");
    expect(parseSort(undefined, allowed)).toBe("code");
  });
});

describe("parseDir", () => {
  it("only allows desc, else asc", () => {
    expect(parseDir("desc")).toBe("desc");
    expect(parseDir("asc")).toBe("asc");
    expect(parseDir("nonsense")).toBe("asc");
  });
});

describe("parseEnum", () => {
  const types = ["Numeric", "Logical"] as const;
  it("returns the value when allowed, else undefined", () => {
    expect(parseEnum("Logical", types)).toBe("Logical");
    expect(parseEnum("Boolean", types)).toBeUndefined();
    expect(parseEnum(undefined, types)).toBeUndefined();
  });
});

describe("parseCode", () => {
  it("trims and returns undefined for empty", () => {
    expect(parseCode(" EG000001 ")).toBe("EG000001");
    expect(parseCode("")).toBeUndefined();
    expect(parseCode(undefined)).toBeUndefined();
  });
});
