/* eslint-disable playwright/missing-playwright-await */
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Credits from "./Credits";

vi.mock("@calcom/lib/constants", async () => {
  const actual = (await vi.importActual("@calcom/lib/constants")) as typeof import("@calcom/lib/constants");
  return {
    ...actual,
    CALCOM_VERSION: "mockedVersion",
    COMPANY_NAME: "BookYourSlot",
  };
});

describe("Tests for Credits component", () => {
  test("Should render the company name and version as plain text", () => {
    render(<Credits />);

    // Deliberately not links: this build credits BookYourSlot and points
    // nowhere, since the upstream go.cal.com destinations are not ours.
    expect(screen.getByText(/BookYourSlot/)).toBeInTheDocument();
    expect(screen.getByText(/mockedVersion/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("Should render the current year in the copyright", () => {
    render(<Credits />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});
