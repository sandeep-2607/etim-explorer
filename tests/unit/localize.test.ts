import { describe, expect, it } from "vitest";
import { localize } from "@/lib/i18n/localize";

const rows = [
  { language: "EN", description: "Black" },
  { language: "de-DE", description: "Schwarz" },
];

describe("localize", () => {
  it("returns the exact language match without fallback", () => {
    expect(localize(rows, "de-DE")).toEqual({ value: "Schwarz", isFallback: false });
  });

  it("falls back to EN and flags it", () => {
    expect(localize(rows, "fr-BE")).toEqual({ value: "Black", isFallback: true });
  });

  it("EN itself is not a fallback", () => {
    expect(localize(rows, "EN")).toEqual({ value: "Black", isFallback: false });
  });

  it("handles empty/missing input", () => {
    expect(localize([], "EN")).toEqual({ value: null, isFallback: false });
    expect(localize(undefined, "EN")).toEqual({ value: null, isFallback: false });
  });

  it("returns null when neither lang nor EN exists", () => {
    const only = [{ language: "de-DE", description: "Schwarz" }];
    expect(localize(only, "fr-BE")).toEqual({ value: null, isFallback: false });
  });

  it("treats an empty/whitespace translation as missing and falls back to EN", () => {
    const rows2 = [
      { language: "EN", description: "Black" },
      { language: "de-DE", description: "   " },
    ];
    expect(localize(rows2, "de-DE")).toEqual({ value: "Black", isFallback: true });
  });

  it("returns null when the only translation is blank", () => {
    expect(localize([{ language: "EN", description: "" }], "EN")).toEqual({
      value: null,
      isFallback: false,
    });
  });
});
