import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "@/components/TaskCard";
import type { Task } from "@/lib/types";

const task: Task = {
  itemId: "I_1", issueNumber: 2, title: "Fix legacy model string", url: "",
  build: "Gamma", category: "Task", source: "Manager", column: "inprogress",
  repo: "gamma", branch: "fix/model-string",
};

describe("TaskCard", () => {
  it("shows the title, build tag, and repo:branch", () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText("Fix legacy model string")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.getByText(/gamma.*fix\/model-string/)).toBeInTheDocument();
  });
});
