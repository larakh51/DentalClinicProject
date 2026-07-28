import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

it("provides jsdom and jest-dom matchers", () => {
  render(<p>Test environment ready</p>);

  expect(screen.getByText("Test environment ready")).toBeInTheDocument();
});
