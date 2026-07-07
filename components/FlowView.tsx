"use client";
import { useEffect, useRef, useState } from "react";
import type { FlowState } from "@/lib/flow/types";
import { initialState } from "@/lib/flow/model";
import { loadFlowState, saveFlowState } from "@/lib/github/browser";
import { FlowMap } from "./FlowMap";
import { tokens } from "@/lib/tokens";

export function FlowView({ builds, demo = false }: { builds: string[]; demo?: boolean }) {
  const buildsRef = useRef(builds); // stable; avoid effect re-runs on new array identity
  const [state, setState] = useState<FlowState | null>(
    demo ? initialState(builds.length ? builds : ["Alpha", "Beta"]) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const shaRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    loadFlowState()
      .then(({ state: s, sha }) => { if (cancelled) return; shaRef.current = sha; setState(s ?? initialState(buildsRef.current)); })
      .catch((e) => setError(e?.message ?? String(e)));
    return () => { cancelled = true; };
  }, [demo]);

  function onChange(next: FlowState) {
    setState(next);
    if (demo) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveFlowState(next, shaRef.current).then((sha) => { shaRef.current = sha; }).catch(() => { /* keep local; retry on next change */ });
    }, 1200);
  }

  if (error) return <main style={{ padding: 24, color: tokens.ink2 }}>Failed to load flow: {error}</main>;
  if (!state) return <main style={{ padding: 24, color: tokens.ink3 }}>Loading flow...</main>;
  return <FlowMap state={state} onChange={onChange} />;
}
