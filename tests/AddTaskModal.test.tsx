import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddTaskModal } from "@/components/AddTaskModal";

describe("AddTaskModal", () => {
  it("shows a build picker only for the Build type and adds with the chosen values", () => {
    const onAdd = vi.fn();
    render(<AddTaskModal builds={["Alpha", "Beta"]} onAdd={onAdd} onClose={() => {}} onAddBuild={vi.fn()} />);
    // Build is the default type -> build picker visible
    expect(screen.getByLabelText(/build/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: "Do it" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "Do it", category: "Build", column: "next" }));
  });
  it("adds a Learn task with no build/column", () => {
    const onAdd = vi.fn();
    render(<AddTaskModal builds={["Alpha"]} onAdd={onAdd} onClose={() => {}} onAddBuild={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^learn$/i }));
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: "Study X" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledWith({ title: "Study X", category: "Learn" });
  });
  it("adds a new build via the inline affordance and selects it", () => {
    const onAdd = vi.fn();
    const onAddBuild = vi.fn();
    render(<AddTaskModal builds={["Alpha", "Beta"]} onAdd={onAdd} onClose={() => {}} onAddBuild={onAddBuild} />);
    fireEvent.click(screen.getByRole("button", { name: /\+ new build/i }));
    fireEvent.change(screen.getByLabelText(/new build name/i), { target: { value: "Gamma" } });
    fireEvent.click(screen.getByRole("button", { name: /^add build$/i }));
    expect(onAddBuild).toHaveBeenCalledWith("Gamma");
  });
});
