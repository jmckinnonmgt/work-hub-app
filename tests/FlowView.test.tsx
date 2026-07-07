import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const loadFlowState = vi.fn();
const saveFlowState = vi.fn();
vi.mock("@/lib/github/browser", () => ({
  loadFlowState: (...a: unknown[]) => loadFlowState(...a),
  saveFlowState: (...a: unknown[]) => saveFlowState(...a),
}));

import { FlowView } from "@/components/FlowView";

describe("FlowView demo mode", () => {
  it("renders FlowMap locally without calling the network", () => {
    render(<FlowView builds={["Alpha"]} demo />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
    expect(screen.getByText("Prod / Main")).toBeInTheDocument();
    expect(loadFlowState).not.toHaveBeenCalled();
    expect(saveFlowState).not.toHaveBeenCalled();
  });
});
