import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MeetingsView } from "@/components/MeetingsView";
import type { Task } from "@/lib/types";

const mk = (title: string): Task => ({
  itemId: title, issueNumber: 1, title, url: "", build: "General",
  category: "Meeting", source: "Mentor", column: "next", repo: "", branch: "",
});

describe("MeetingsView", () => {
  it("renders each meeting title", () => {
    render(<MeetingsView meetings={[mk("Set up recurring mentor 1:1")]} />);
    expect(screen.getByText("Set up recurring mentor 1:1")).toBeInTheDocument();
  });
});
