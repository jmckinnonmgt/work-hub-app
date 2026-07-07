import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlowMap } from "@/components/FlowMap";
import { initialState } from "@/lib/flow/model";

describe("FlowMap", () => {
  it("renders the active build's shapes and adds a node via the toolbar", () => {
    const onChange = vi.fn();
    render(<FlowMap state={initialState(["Alpha"])} onChange={onChange} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
    expect(screen.getByText("Prod / Main")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /pr \/ feature/i }));
    // onChange fires with an extra node
    expect(onChange).toHaveBeenCalled();
  });
  it("switches builds via the bottom tabs", () => {
    const onChange = vi.fn();
    const s = initialState(["Alpha", "Beta"]);
    render(<FlowMap state={s} onChange={onChange} />);
    fireEvent.click(screen.getByText("Beta"));
    // Beta becomes active (its title/tab reflects it) - assert a Beta pipeline title or active tab styling
    expect(screen.getByText(/Beta pipeline/i)).toBeInTheDocument();
  });
});
