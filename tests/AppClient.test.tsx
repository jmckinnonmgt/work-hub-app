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
    { id: "o_next", name: "Next" }, { id: "o_inprog", name: "In progress" },
    { id: "o_blocked", name: "Blocked" }, { id: "o_done", name: "Done" } ] },
    category: { id: "c", name: "Category", options: [
      { id: "c_build", name: "Build" }, { id: "c_learn", name: "Learn" }, { id: "c_admin", name: "Administrative" } ] },
    build: { id: "b", name: "Build", options: [] },
    source: { id: "s", name: "Source", options: [] },
    repoNameFieldId: "r", branchFieldId: "br" },
  tasks: [{ itemId: "a", issueNumber: 1, title: "T-a", url: "", build: "General",
    category: "Build", source: "Self", column: "next", repo: "", branch: "" }],
};

beforeEach(() => {
  moveCard.mockReset();
  addCard.mockReset();
  addCard.mockResolvedValue("REAL_ID");
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
    // after rollback the card is still counted in Next
    await waitFor(() => expect(screen.getByTestId("dropzone-next")).toHaveTextContent("T-a"));
  });
  it("hides the board when a non-board view is selected", () => {
    render(<AppClient initial={initial} />);
    expect(screen.getByTestId("dropzone-next")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(screen.queryByTestId("dropzone-next")).toBeNull();
  });
  it("adds a task via the modal and makes it draggable with the real id", async () => {
    addCard.mockResolvedValue("REAL_ID");
    render(<AppClient initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: "New thing" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await waitFor(() => expect(addCard).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("New thing")).toBeInTheDocument());
  });
  it("makes a newly added task draggable with its real id", async () => {
    addCard.mockResolvedValue("REAL_ID");
    render(<AppClient initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: "Fresh task" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await screen.findByText("Fresh task");
    await waitFor(() => expect(addCard).toHaveBeenCalled());
    // now drag the new card; it must move with the REAL id, not a temp- id
    fireEvent.dragStart(screen.getByText("Fresh task"));
    const zone = screen.getByTestId("dropzone-done");
    fireEvent.dragOver(zone);
    fireEvent.drop(zone);
    await waitFor(() => expect(moveCard).toHaveBeenCalledWith(expect.anything(), "REAL_ID", "done"));
  });
  it("does not call the GitHub API when in demo mode", () => {
    render(<AppClient initial={initial} demo />);
    fireEvent.dragStart(screen.getByText("T-a"));
    fireEvent.dragOver(screen.getByTestId("dropzone-done"));
    fireEvent.drop(screen.getByTestId("dropzone-done"));
    expect(moveCard).not.toHaveBeenCalled();
  });
});
