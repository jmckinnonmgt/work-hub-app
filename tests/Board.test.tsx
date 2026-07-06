import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Board } from "@/components/Board";
import type { Task } from "@/lib/types";

const mk = (id: string, column: Task["column"]): Task => ({
  itemId: id, issueNumber: 1, title: `T-${id}`, url: "", build: "General",
  category: "Task", source: "Self", column, repo: "", branch: "",
});

describe("Board", () => {
  it("renders five column headers", () => {
    render(<Board tasks={[mk("a", "backlog")]} onMove={vi.fn()} />);
    for (const label of ["Backlog", "Next", "In progress", "Blocked", "Done"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
  it("calls onMove when a card is dropped on a column", () => {
    const onMove = vi.fn();
    render(<Board tasks={[mk("a", "backlog")]} onMove={onMove} />);
    const card = screen.getByText("T-a");
    fireEvent.dragStart(card);
    const doneZone = screen.getByTestId("dropzone-done");
    fireEvent.dragOver(doneZone);
    fireEvent.drop(doneZone);
    expect(onMove).toHaveBeenCalledWith("a", "done");
  });
});
