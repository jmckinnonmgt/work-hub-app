"use client";
import { useState } from "react";
import type { Build, Category, ColumnId, ProjectData, Task } from "@/lib/types";
import { applyFilters, boardTasks, columnCounts, learnList, type Filters } from "@/lib/views/derive";
import { moveCard, addCard } from "@/lib/github/browser";
import { tokens } from "@/lib/tokens";
import { Board } from "./Board";
import { NavRail } from "./NavRail";
import { FilterBar } from "./FilterBar";
import { QuickAdd } from "./QuickAdd";
import { TableView } from "./TableView";
import { LearnList } from "./LearnList";
import { MeetingsView } from "./MeetingsView";

export type View = "board" | "table" | "learn" | "meetings";
const VIEW_TITLES: Record<View, string> = { board: "Board", table: "Table", learn: "Learn", meetings: "Meetings" };

export function AppClient({ initial }: { initial: ProjectData }) {
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [view, setView] = useState<View>("board");
  const [fBuild, setFBuild] = useState<"All" | Build>("All");
  const [fCat, setFCat] = useState<"All" | Category>("All");
  const [adminOnly, setAdminOnly] = useState(false);
  const meta = initial.meta;
  const builds = meta.build.options.map((o) => o.name);
  const filters: Filters = { build: fBuild, category: fCat, adminOnly };

  async function onMove(itemId: string, column: ColumnId) {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.itemId === itemId ? { ...t, column } : t)));
    try { await moveCard(meta, itemId, column); } catch { setTasks(prev); }
  }

  async function onAdd(title: string) {
    const prev = tasks;
    const temp: Task = { itemId: `temp-${Date.now()}`, issueNumber: 0, title, url: "",
      build: "General", category: "Task", source: "Self", column: "backlog", repo: "", branch: "" };
    setTasks((ts) => [...ts, temp]);
    try { await addCard(meta, title, "backlog"); } catch { setTasks(prev); }
  }

  const visible = applyFilters(tasks, filters);
  const board = boardTasks(visible);
  const counts = columnCounts(board);
  const buildOnly = tasks.filter((t) => fBuild === "All" || t.build === fBuild);
  const learn = learnList(buildOnly);
  const meetings = buildOnly.filter((t) => t.category === "Meeting");
  const viewCount = view === "learn" ? learn.length : view === "meetings" ? meetings.length : board.length;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <NavRail view={view} setView={setView} counts={counts} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "15px 22px", borderBottom: `1px solid ${tokens.line}` }}>
          <span style={{ fontSize: 16, fontWeight: 650, color: tokens.ink }}>{VIEW_TITLES[view]}</span>
          <span style={{ fontSize: 12, color: tokens.ink3 }}>{viewCount} of {tasks.length} tasks</span>
        </header>
        <FilterBar
          fBuild={fBuild} setFBuild={setFBuild}
          fCat={fCat} setFCat={setFCat}
          adminOnly={adminOnly} setAdminOnly={setAdminOnly}
          builds={builds}
        >
          <QuickAdd onAdd={onAdd} />
        </FilterBar>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {view === "board" ? <Board tasks={board} onMove={onMove} />
            : view === "table" ? <TableView tasks={board} buildOrder={builds} />
            : view === "learn" ? <LearnList tasks={learn} />
            : <MeetingsView meetings={meetings} />}
        </div>
      </div>
    </div>
  );
}
