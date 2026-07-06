import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/lib/github/browser", () => ({ loadBoard: vi.fn(), moveCard: vi.fn(), addCard: vi.fn() }));
import { DemoApp } from "@/components/DemoApp";

describe("DemoApp", () => {
  it("renders the demo banner and example tasks without a token", () => {
    render(<DemoApp onExit={() => {}} />);
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
    expect(screen.getByText("Fix login redirect bug")).toBeInTheDocument();
  });
});
