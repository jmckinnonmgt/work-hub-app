import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const moveCard = vi.fn();
const addCard = vi.fn();
// `behaviour` lets a test make the action reject WITHOUT routing that rejection through a
// vi mock's result tracking. AppClient.onMove awaits and catches it either way, but a
// plain rejecting function avoids a Vitest 4 quirk where a caught rejection produced by a
// spy is still surfaced as an unhandled error at teardown.
let behaviour: (() => Promise<void>) | null = null;
vi.mock("@/lib/github/browser", () => ({
  moveCard: (...a: unknown[]) => {
    moveCard(...a); // record the call so tests can assert on it
    return behaviour ? behaviour() : Promise.resolve();
  },
  addCard: (...a: unknown[]) => addCard(...a),
  loadBoard: vi.fn(),
}));

import { AppClient } from "@/components/AppClient";
import type { ProjectData } from "@/lib/types";

const initial: ProjectData = {
  meta: { projectId: "P", status: { id: "F_status", name: "Status", options: [
    { id: "o_backlog", name: "Backlog" }, { id: "o_done", name: "Done" } ] },
    category: { id: "c", name: "Category", options: [] },
    build: { id: "b", name: "Build", options: [] },
    source: { id: "s", name: "Source", options: [] },
    repoNameFieldId: "r", branchFieldId: "br" },
  tasks: [{ itemId: "a", issueNumber: 1, title: "T-a", url: "", build: "General",
    category: "Task", source: "Self", column: "backlog", repo: "", branch: "" }],
};

beforeEach(() => {
  moveCard.mockReset();
  addCard.mockReset();
  addCard.mockResolvedValue(undefined);
  behaviour = null;
});

describe("AppClient optimistic move", () => {
  it("moves the card immediately and calls the action", async () => {
    render(<AppClient initial={initial} />);
    fireEvent.dragStart(screen.getByText("T-a"));
    fireEvent.dragOver(screen.getByTestId("dropzone-done"));
    fireEvent.drop(screen.getByTestId("dropzone-done"));
    await waitFor(() => expect(moveCard).toHaveBeenCalled());
  });
  it("rolls back when the action rejects", async () => {
    behaviour = () => Promise.reject(new Error("boom"));
    render(<AppClient initial={initial} />);
    fireEvent.dragStart(screen.getByText("T-a"));
    fireEvent.dragOver(screen.getByTestId("dropzone-done"));
    fireEvent.drop(screen.getByTestId("dropzone-done"));
    // flush pending microtasks so the caught rejection settles inside the test
    await act(async () => { await Promise.resolve(); });
    // after rollback the card is still counted in Backlog
    await waitFor(() => expect(screen.getByTestId("dropzone-backlog")).toHaveTextContent("T-a"));
  });
  it("hides the board when a non-board view is selected", () => {
    render(<AppClient initial={initial} />);
    expect(screen.getByTestId("dropzone-backlog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(screen.queryByTestId("dropzone-backlog")).toBeNull();
  });
  it("quick-add optimistically shows the task and calls addCard", async () => {
    addCard.mockResolvedValue(undefined);
    render(<AppClient initial={initial} />);
    fireEvent.change(screen.getByPlaceholderText(/add a task/i), { target: { value: "New thing" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("New thing")).toBeInTheDocument();
    await waitFor(() => expect(addCard).toHaveBeenCalled());
  });
});
