"use client";
import { useEffect, useState } from "react";
import type { ColumnId, Task } from "@/lib/types";
import { COLUMNS } from "@/lib/tokens";
import { tasksByColumn } from "@/lib/views/derive";
import { loadOrder, saveOrder, sortColumn, reorderIds, type CardOrder } from "@/lib/views/order";
import { Column } from "./Column";

export function Board({ tasks, onMove, onOpen }: { tasks: Task[]; onMove: (itemId: string, column: ColumnId) => void; onOpen?: (task: Task) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState<CardOrder>({});

  useEffect(() => { setOrder(loadOrder()); }, []);

  const by = tasksByColumn(tasks);
  const sorted = {} as Record<ColumnId, Task[]>;
  for (const c of COLUMNS) sorted[c.id] = sortColumn(by[c.id], order[c.id]);

  function handleDrop(colId: ColumnId, slot: number) {
    if (!dragId) return;
    const dragged = tasks.find((t) => t.itemId === dragId);
    if (!dragged) { setDragId(null); return; }
    const fromCol = dragged.column;

    const displayed = sorted[colId].map((t) => t.itemId);
    const next: CardOrder = { ...order, [colId]: reorderIds(displayed, dragId, slot) };

    if (fromCol && fromCol !== colId) {
      // Also moving between columns: drop it from the source order and update Status.
      next[fromCol] = sorted[fromCol].map((t) => t.itemId).filter((id) => id !== dragId);
      onMove(dragId, colId);
    }

    setOrder(next);
    saveOrder(next);
    setDragId(null);
  }

  return (
    <div style={{ display: "flex", gap: 13, padding: "20px 22px", overflowX: "auto" }}>
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          col={col}
          tasks={sorted[col.id]}
          dragId={dragId}
          onDragStart={setDragId}
          onDrop={handleDrop}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
