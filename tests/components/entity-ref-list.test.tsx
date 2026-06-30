import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityRefList } from "@/components/etim/entity-ref-list";

// next/link → plain anchor for jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("EntityRefList", () => {
  const baseProps = {
    title: "Classes using this feature",
    hrefBase: "/EN/classes",
    fallbackLabel: "EN",
    fallbackHint: "fallback",
    emptyLabel: "No results",
  };

  it("renders items with links and the total count", () => {
    render(
      <EntityRefList
        {...baseProps}
        list={{
          items: [
            { code: "EC000001", name: "Busbar terminal", nameIsFallback: false },
            { code: "EC000002", name: "Downlight", nameIsFallback: true },
          ],
          total: 2,
          cap: 50,
        }}
        cappedLabel={null}
      />,
    );
    expect(screen.getByText("Busbar terminal")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Busbar terminal/ });
    expect(link).toHaveAttribute("href", "/EN/classes/EC000001");
    expect(screen.getByText("(2)")).toBeInTheDocument();
    // fallback indicator shown for the second item
    expect(screen.getAllByText("EN").length).toBeGreaterThan(0);
  });

  it("shows the empty label when there are no items", () => {
    render(
      <EntityRefList {...baseProps} list={{ items: [], total: 0, cap: 50 }} cappedLabel={null} />,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("shows the capped note when provided", () => {
    render(
      <EntityRefList
        {...baseProps}
        list={{ items: [{ code: "EC1", name: "x", nameIsFallback: false }], total: 97, cap: 50 }}
        cappedLabel="Showing first 50 of 97"
      />,
    );
    expect(screen.getByText("Showing first 50 of 97")).toBeInTheDocument();
  });
});
