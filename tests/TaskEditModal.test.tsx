import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskEditModal } from "@/components/TaskEditModal";
import type { Task } from "@/lib/types";

const task: Task = { itemId: "I1", issueNumber: 5, title: "Old title", url: "", build: "Alpha", category: "Build", source: "Self", column: "next", repo: "r", branch: "b" };

describe("TaskEditModal", () => {
  it("saves edited title and fields", () => {
    const onSave = vi.fn();
    render(<TaskEditModal task={task} builds={["Alpha", "Beta"]} sources={["Self", "Manager"]} onSave={onSave} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: "New title" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ itemId: "I1", issueNumber: 5, title: "New title", category: "Build" }));
  });

  it("hides the build field and nulls the column for Learn type", () => {
    const onSave = vi.fn();
    render(<TaskEditModal task={task} builds={["Alpha"]} sources={["Self"]} onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /^learn$/i }));
    expect(screen.queryByLabelText(/^build$/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ category: "Learn", column: null }));
  });
});
