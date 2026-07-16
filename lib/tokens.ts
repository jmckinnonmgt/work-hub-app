import type { ColumnDef, ColumnId } from "./types";

export const tokens = {
  bg: "#131417", panel: "#191b1f", panel2: "#1d1f24",
  ink: "#e8e9eb", ink2: "#9ea3aa", ink3: "#6c717a",
  line: "#282b31",
  accent: "#7aa7c7", accentSoft: "#1c2831", onAccent: "#121317",
  chip: "#23262b", chipInk: "#b0b4bb",
  groupBg: "#262a30", groupInk: "#e8e9eb",
  status: {
    next: "#77a2c6", inprogress: "#c49a58", blocked: "#c47f72", done: "#84a984",
  } as Record<ColumnId, string>,
};

export const COLUMNS: ColumnDef[] = [
  { id: "next", label: "Next", statusName: "Next" },
  { id: "blocked", label: "Blocked", statusName: "Blocked" },
  { id: "inprogress", label: "In progress", statusName: "In progress" },
  { id: "done", label: "Done", statusName: "Done" },
];
