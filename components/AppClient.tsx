"use client";
import { useState } from "react";
import type { Build, ColumnId, ProjectData, Task } from "@/lib/types";
import { applyFilters, boardTasks, buildTasks, columnCounts, learnList, adminList, type Filters } from "@/lib/views/derive";
import { moveCard, addCard } from "@/lib/github/browser";
import { tokens } from "@/lib/tokens";
import { Board } from "./Board";
import { NavRail } from "./NavRail";
import { FilterBar } from "./FilterBar";
import { QuickAdd } from "./QuickAdd";
import { TableView } from "./TableView";
import { LearnList } from "./LearnList";
import { AdministrativeView } from "./AdministrativeView";

export type View = "board" | "table" | "learn" | "administrative";
const VIEW_TITLES: Record<View, string> = { board: "Board", table: "Table", learn: "Learn", administrative: "Administrative" };

export function AppClient({ initial, demo = false }: { initial: ProjectData; demo?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [view, setView] = useState<View>("board");
  const [fBuild, setFBuild] = useState<"All" | Build>("All");
  const meta = initial.meta;
  const builds = meta.build.options.map((o) => o.name);
  const filters: Filters = { build: fBuild };

  async function onMove(itemId: string, column: ColumnId) {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.itemId === itemId ? { ...t, column } : t)));
    if (demo) return;
    try { await moveCard(meta, itemId, column); } catch { setTasks(prev); }
  }

  async function onAdd(title: string) {
    const prev = tasks;
    const temp: Task = { itemId: `temp-${Date.now()}`, issueNumber: 0, title, url: "",
      build: "General", category: "Build", source: "Self", column: "next", repo: "", branch: "" };
    setTasks((ts) => [...ts, temp]);
    if (demo) return;
    try { await addCard(meta, title, "next"); } catch { setTasks(prev); }
  }

  const filtered = applyFilters(tasks, filters);
  const board = boardTasks(filtered);
  const counts = columnCounts(board);
  const viewCount = view === "learn" ? learnList(filtered).length
    : view === "administrative" ? adminList(filtered).length
    : view === "table" ? buildTasks(filtered).length
    : board.length;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <NavRail view={view} setView={setView} counts={counts} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "15px 22px", borderBottom: `1px solid ${tokens.line}` }}>
          <span style={{ fontSize: 16, fontWeight: 650, color: tokens.ink }}>{VIEW_TITLES[view]}</span>
          <span style={{ fontSize: 12, color: tokens.ink3 }}>{viewCount} of {tasks.length} tasks</span>
        </header>
        <FilterBar fBuild={fBuild} setFBuild={setFBuild} builds={builds}>
          <QuickAdd onAdd={onAdd} />
        </FilterBar>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {view === "board" ? <Board tasks={board} onMove={onMove} />
            : view === "table" ? <TableView tasks={buildTasks(filtered)} buildOrder={builds} />
            : view === "learn" ? <LearnList tasks={learnList(filtered)} />
            : <AdministrativeView tasks={adminList(filtered)} />}
        </div>
      </div>
    </div>
  );
}
