/* eslint-disable playwright/missing-playwright-await */
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Credits from "./Credits";

vi.mock("@calcom/lib/constants", async () => {
  const actual = (await vi.importActual("@calcom/lib/constants")) as typeof import("@calcom/lib/constants");
  return {
    ...actual,
    COMPANY_NAME: "BookYourSlot",
  };
});

describe("Tests for Credits component", () => {
  test("Should render the company name as plain text with no version or link", () => {
    render(<Credits />);

    // Deliberately not links, and no version stamp: this build just credits
    // BookYourSlot. The upstream go.cal.com destinations are not ours.
    expect(screen.getByText(/BookYourSlot/)).toBeInTheDocument();
    expect(screen.queryByText(/v\./)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("Should render the current year in the copyright", () => {
    render(<Credits />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});
