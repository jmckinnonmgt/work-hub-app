"use client";
import { useState } from "react";
import type { ColumnDef, Task } from "@/lib/types";
import { tokens } from "@/lib/tokens";
import { TaskCard } from "./TaskCard";

export function Column({
  col, tasks, onDropTask, onDragStart, onOpen,
}: {
  col: ColumnDef; tasks: Task[];
  onDropTask: (column: ColumnDef["id"]) => void;
  onDragStart: (id: string) => void;
  onOpen?: (task: Task) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div style={{ flex: "1 0 214px", minWidth: 214 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 8px" }}>
        <span style={{ width: 7, height: 7, borderRadius: 2, background: tokens.status[col.id] }} />
        <span style={{ textTransform: "uppercase", fontSize: 11.5, fontWeight: 600, color: tokens.ink2, letterSpacing: "0.05em" }}>{col.label}</span>
        <span style={{ fontSize: 11, color: tokens.ink3, fontVariantNumeric: "tabular-nums" }}>{tasks.length}</span>
      </div>
      <div
        data-testid={`dropzone-${col.id}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={() => { setOver(false); onDropTask(col.id); }}
        style={{
          minHeight: 130, borderRadius: 7, padding: 8, display: "flex",
          flexDirection: "column", gap: 9,
          background: over ? tokens.accentSoft : "transparent",
          boxShadow: over ? `inset 0 0 0 1px ${tokens.accent}66` : "none",
          transition: "background .12s",
        }}
      >
        {tasks.map((t) => <TaskCard key={t.itemId} task={t} onDragStart={onDragStart} onOpen={onOpen} />)}
      </div>
    </div>
  );
}
