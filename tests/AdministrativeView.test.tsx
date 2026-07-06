import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdministrativeView } from "@/components/AdministrativeView";
import type { Task } from "@/lib/types";

const mk = (title: string): Task => ({
  itemId: title, issueNumber: 1, title, url: "", build: "General",
  category: "Administrative", source: "Mentor", column: "next", repo: "", branch: "",
});

describe("AdministrativeView", () => {
  it("renders each administrative task title", () => {
    render(<AdministrativeView tasks={[mk("Set up recurring mentor 1:1")]} />);
    expect(screen.getByText("Set up recurring mentor 1:1")).toBeInTheDocument();
  });
});
