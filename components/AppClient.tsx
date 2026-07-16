"use client";
import { useState } from "react";
import type { Build, ColumnId, EditedTask, NewTask, ProjectData, Task } from "@/lib/types";
import { applyFilters, boardTasks, buildTasks, columnCounts, learnList, adminList, type Filters } from "@/lib/views/derive";
import { moveCard, addCard, editCard, deleteCard, createBuildOption } from "@/lib/github/browser";
import { tokens } from "@/lib/tokens";
import { Board } from "./Board";
import { NavRail } from "./NavRail";
import { FilterBar } from "./FilterBar";
import { AddTaskModal } from "./AddTaskModal";
import { TaskEditModal } from "./TaskEditModal";
import { TableView } from "./TableView";
import { LearnList } from "./LearnList";
import { AdministrativeView } from "./AdministrativeView";
import { FlowView } from "./FlowView";

export type View = "board" | "table" | "flow" | "learn" | "administrative";
const VIEW_TITLES: Record<View, string> = { board: "Board", table: "Table", flow: "Flow", learn: "Learn", administrative: "Administrative" };

export function AppClient({ initial, demo = false }: { initial: ProjectData; demo?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [view, setView] = useState<View>("board");
  const [fBuild, setFBuild] = useState<"All" | Build>("All");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const meta = initial.meta;
  const [builds, setBuilds] = useState<string[]>(() => meta.build.options.map((o) => o.name));
  const filters: Filters = { build: fBuild };

  async function onAddBuild(name: string) {
    const n = name.trim();
    if (!n || builds.includes(n)) return;
    setBuilds((b) => [...b, n]);           // optimistic
    if (demo) return;
    try { await createBuildOption(n); } catch { setBuilds((b) => b.filter((x) => x !== n)); }
  }

  async function onMove(itemId: string, column: ColumnId) {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.itemId === itemId ? { ...t, column } : t)));
    if (demo) return;
    try { await moveCard(meta, itemId, column); } catch { setTasks(prev); }
  }

  async function onAdd(opts: NewTask) {
    const prev = tasks;
    const tempId = `temp-${Date.now()}`;
    const temp: Task = {
      itemId: tempId, issueNumber: 0, title: opts.title, url: "",
      build: opts.build ?? "General", category: opts.category, source: "Self",
      column: opts.column ?? null, repo: "", branch: "",
    };
    setTasks((ts) => [...ts, temp]);
    if (demo) return;
    try {
      const { itemId, issueNumber } = await addCard(meta, opts);
      setTasks((ts) => ts.map((t) => (t.itemId === tempId ? { ...t, itemId, issueNumber } : t)));
    } catch {
      setTasks(prev);
    }
  }

  async function onSave(e: EditedTask) {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.itemId === e.itemId
      ? { ...t, title: e.title, category: e.category, build: e.build, source: e.source, column: e.column, repo: e.repo, branch: e.branch }
      : t)));
    setEditing(null);
    try { await editCard(meta, e); } catch { setTasks(prev); }
  }

  async function onDelete(task: Task) {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.itemId !== task.itemId));
    setEditing(null);
    if (demo) return;
    try { await deleteCard(meta, task.itemId, task.issueNumber); } catch { setTasks(prev); }
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
        {view === "flow" ? (
          <FlowView builds={builds} demo={demo} />
        ) : (
          <>
            <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 22px", borderBottom: `1px solid ${tokens.line}` }}>
              <span style={{ fontSize: 16, fontWeight: 650, color: tokens.ink }}>{VIEW_TITLES[view]}</span>
              <span style={{ fontSize: 12, color: tokens.ink3 }}>{viewCount} of {tasks.length} tasks</span>
              <button onClick={() => setAdding(true)} style={{ marginLeft: "auto", background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Task</button>
            </header>
            <FilterBar fBuild={fBuild} setFBuild={setFBuild} builds={builds} />
            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {view === "board" ? <Board tasks={board} onMove={onMove} onOpen={setEditing} />
                : view === "table" ? <TableView tasks={buildTasks(filtered)} buildOrder={builds} onOpen={setEditing} />
                : view === "learn" ? <LearnList tasks={learnList(filtered)} onOpen={setEditing} />
                : <AdministrativeView tasks={adminList(filtered)} onOpen={setEditing} />}
            </div>
          </>
        )}
      </div>
      {adding && <AddTaskModal builds={builds} onAdd={onAdd} onClose={() => setAdding(false)} onAddBuild={onAddBuild} />}
      {editing && <TaskEditModal task={editing} builds={builds} sources={meta.source.options.map((o) => o.name)} onSave={onSave} onDelete={onDelete} onClose={() => setEditing(null)} onAddBuild={onAddBuild} />}
    </div>
  );
}
