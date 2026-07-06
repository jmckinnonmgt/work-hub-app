import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LearnList } from "@/components/LearnList";
import type { Task } from "@/lib/types";

const mk = (title: string): Task => ({
  itemId: title, issueNumber: 1, title, url: "", build: "General",
  category: "Learn", source: "Self", column: "backlog", repo: "", branch: "",
});

describe("LearnList", () => {
  it("renders each learn topic title", () => {
    render(<LearnList tasks={[mk("RAG evaluation metrics")]} />);
    expect(screen.getByText("RAG evaluation metrics")).toBeInTheDocument();
  });
});
