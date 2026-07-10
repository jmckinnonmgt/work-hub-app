import type { ColumnId, Task } from "@/lib/types";

// Per-column manual card order, keyed by column id -> ordered list of itemIds.
// Persisted in the browser so a user's priority ordering survives reloads.
export type CardOrder = Partial<Record<ColumnId, string[]>>;

const KEY = "workhub.cardOrder.v1";

export function loadOrder(): CardOrder {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CardOrder) : {};
  } catch {
    return {};
  }
}

export function saveOrder(order: CardOrder): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* storage full or unavailable — ordering is best-effort */
  }
}

// Sort a column's tasks by the saved order. Tasks not present in the order
// (e.g. newly created) keep their incoming relative order and fall to the end.
export function sortColumn(tasks: Task[], order: string[] | undefined): Task[] {
  if (!order || order.length === 0) return tasks;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...tasks].sort((a, b) => {
    const ai = rank.has(a.itemId) ? rank.get(a.itemId)! : Number.POSITIVE_INFINITY;
    const bi = rank.has(b.itemId) ? rank.get(b.itemId)! : Number.POSITIVE_INFINITY;
    return ai - bi;
  });
}

// Compute the new id list for a column after dropping `dragId` at insertion
// slot `slot` (0..len, "before the card currently at that index"). Works for
// both same-column reorders and cross-column drops.
export function reorderIds(displayedIds: string[], dragId: string, slot: number): string[] {
  const without = displayedIds.filter((id) => id !== dragId);
  const origIdx = displayedIds.indexOf(dragId);
  let insertAt = slot;
  if (origIdx !== -1 && slot > origIdx) insertAt -= 1;
  insertAt = Math.max(0, Math.min(insertAt, without.length));
  without.splice(insertAt, 0, dragId);
  return without;
}
