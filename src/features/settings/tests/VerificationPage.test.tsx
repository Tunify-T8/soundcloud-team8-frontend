import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import VerificationPage from "../VerificationPage";

describe("VerificationPage", () => {
  it("renders the verification page", () => {
    render(<VerificationPage />);

    expect(screen.getByTestId("verification-page")).toBeInTheDocument();
  });

  it("renders the request verification heading", () => {
    render(<VerificationPage />);

    expect(screen.getByTestId("verification-heading")).toHaveTextContent("Request verification");
  });

  it("renders both verification copy paragraphs", () => {
    render(<VerificationPage />);

    expect(screen.getByTestId("verification-paragraph-1")).toHaveTextContent(
      "Thank you for your interest in profile verification.",
    );
    expect(screen.getByTestId("verification-paragraph-2")).toHaveTextContent(
      "While we know this may be disappointing",
    );
  });
});
