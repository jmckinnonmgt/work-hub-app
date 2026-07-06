import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TokenGate } from "@/components/TokenGate";

beforeEach(() => window.localStorage.clear());

describe("TokenGate", () => {
  it("shows the token form when no token is stored", () => {
    render(<TokenGate><div>SECRET CONTENT</div></TokenGate>);
    expect(screen.getByLabelText(/github token/i)).toBeInTheDocument();
    expect(screen.queryByText("SECRET CONTENT")).toBeNull();
  });
  it("renders children after a token is saved", () => {
    render(<TokenGate><div>SECRET CONTENT</div></TokenGate>);
    fireEvent.change(screen.getByLabelText(/github token/i), { target: { value: "ghp_x" } });
    fireEvent.click(screen.getByRole("button", { name: /save token/i }));
    expect(screen.getByText("SECRET CONTENT")).toBeInTheDocument();
  });
  it("renders children immediately if a token already exists", () => {
    window.localStorage.setItem("work-hub-gh-token", "ghp_x");
    render(<TokenGate><div>SECRET CONTENT</div></TokenGate>);
    expect(screen.getByText("SECRET CONTENT")).toBeInTheDocument();
  });
  it("shows a View demo button and calls onDemo when clicked", () => {
    const onDemo = vi.fn();
    render(<TokenGate onDemo={onDemo}><div>SECRET</div></TokenGate>);
    fireEvent.click(screen.getByRole("button", { name: /view demo/i }));
    expect(onDemo).toHaveBeenCalled();
  });
});
