import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangeCodeBadge } from "@/components/etim/change-code-badge";
import { FeatureTypeBadge } from "@/components/etim/feature-type-badge";

describe("ChangeCodeBadge", () => {
  it("renders the change code", () => {
    render(<ChangeCodeBadge code="Changed" />);
    expect(screen.getByText("Changed")).toBeInTheDocument();
  });

  it("renders nothing for null", () => {
    const { container } = render(<ChangeCodeBadge code={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FeatureTypeBadge", () => {
  it("renders each feature type label", () => {
    render(<FeatureTypeBadge type="Numeric" />);
    expect(screen.getByText("Numeric")).toBeInTheDocument();
  });
});
