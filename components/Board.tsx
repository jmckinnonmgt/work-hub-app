"use client";
import { useState } from "react";
import type { ColumnId, Task } from "@/lib/types";
import { COLUMNS } from "@/lib/tokens";
import { tasksByColumn } from "@/lib/views/derive";
import { Column } from "./Column";

export function Board({ tasks, onMove, onOpen }: { tasks: Task[]; onMove: (itemId: string, column: ColumnId) => void; onOpen?: (task: Task) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const by = tasksByColumn(tasks);
  return (
    <div style={{ display: "flex", gap: 13, padding: "20px 22px", overflowX: "auto" }}>
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          col={col}
          tasks={by[col.id]}
          onDragStart={setDragId}
          onDropTask={(column) => { if (dragId) { onMove(dragId, column); setDragId(null); } }}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
