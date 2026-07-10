"use client";
import { useState } from "react";
import type { ColumnDef, ColumnId, Task } from "@/lib/types";
import { tokens } from "@/lib/tokens";
import { TaskCard } from "./TaskCard";

export function Column({
  col, tasks, dragId, onDrop, onDragStart, onOpen,
}: {
  col: ColumnDef; tasks: Task[];
  dragId: string | null;
  onDrop: (column: ColumnId, slot: number) => void;
  onDragStart: (id: string) => void;
  onOpen?: (task: Task) => void;
}) {
  // Insertion slot the dragged card would land in (0..tasks.length), or null.
  const [slot, setSlot] = useState<number | null>(null);
  const dragging = dragId !== null;

  function overCard(e: React.DragEvent, i: number) {
    e.preventDefault();
    e.stopPropagation(); // don't let the dropzone reset the slot to the end
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    setSlot(before ? i : i + 1);
  }

  const line = <div style={{ height: 2, borderRadius: 2, background: tokens.accent, margin: "1px 0" }} />;

  return (
    <div style={{ flex: "1 0 214px", minWidth: 214 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 8px" }}>
        <span style={{ width: 7, height: 7, borderRadius: 2, background: tokens.status[col.id] }} />
        <span style={{ textTransform: "uppercase", fontSize: 11.5, fontWeight: 600, color: tokens.ink2, letterSpacing: "0.05em" }}>{col.label}</span>
        <span style={{ fontSize: 11, color: tokens.ink3, fontVariantNumeric: "tabular-nums" }}>{tasks.length}</span>
      </div>
      <div
        data-testid={`dropzone-${col.id}`}
        onDragOver={(e) => { e.preventDefault(); setSlot(tasks.length); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSlot(null); }}
        onDrop={() => { onDrop(col.id, slot ?? tasks.length); setSlot(null); }}
        style={{
          minHeight: 130, borderRadius: 7, padding: 8, display: "flex",
          flexDirection: "column", gap: 9,
          background: dragging && slot !== null ? tokens.accentSoft : "transparent",
          boxShadow: dragging && slot !== null ? `inset 0 0 0 1px ${tokens.accent}66` : "none",
          transition: "background .12s",
        }}
      >
        {tasks.map((t, i) => (
          <div key={t.itemId} onDragOver={(e) => overCard(e, i)}>
            {dragging && slot === i && line}
            <TaskCard task={t} onDragStart={onDragStart} onOpen={onOpen} />
          </div>
        ))}
        {dragging && slot === tasks.length && line}
      </div>
    </div>
  );
}
