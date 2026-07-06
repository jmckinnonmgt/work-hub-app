import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableView } from "@/components/TableView";
import type { Task } from "@/lib/types";

const mk = (build: string, title: string, column: Task["column"] = "next"): Task => ({
  itemId: title, issueNumber: 1, title, url: "", build, category: "Build",
  source: "Self", column, repo: "", branch: "",
});

describe("TableView", () => {
  it("shows a group header per non-empty build in build order", () => {
    render(<TableView tasks={[mk("Gamma", "g1"), mk("Alpha", "a1")]} buildOrder={["Alpha", "Beta", "Gamma"]} />);
    const headers = screen.getAllByTestId("build-group");
    expect(headers.map((h) => h.textContent)).toEqual([
      expect.stringContaining("Alpha"),
      expect.stringContaining("Gamma"),
    ]);
  });
  it("shows a status label for each task", () => {
    render(<TableView tasks={[mk("Gamma", "g1", "inprogress")]} buildOrder={["Gamma"]} />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
