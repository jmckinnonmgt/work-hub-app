"use client";
import { useEffect, useState } from "react";
import type { ProjectData } from "@/lib/types";
import { loadBoard } from "@/lib/github/browser";
import { clearToken } from "@/lib/github/token-store";
import { AppClient } from "./AppClient";
import { tokens } from "@/lib/tokens";

export function App() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadBoard().then(setData).catch((e) => setError(e?.message ?? String(e)));
  }, []);
  if (error) {
    return (
      <main style={{ padding: 24, color: tokens.ink2 }}>
        <p>Failed to load your board: {error}</p>
        <button onClick={() => { clearToken(); window.location.reload(); }}
          style={{ background: tokens.panel, color: tokens.ink, border: `1px solid ${tokens.line}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>
          Reset token
        </button>
      </main>
    );
  }
  if (!data) return <main style={{ padding: 24, color: tokens.ink3 }}>Loading your board...</main>;
  return <AppClient initial={data} />;
}
