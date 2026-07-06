"use client";
import { useState } from "react";
import { TokenGate } from "@/components/TokenGate";
import { App } from "@/components/App";
import { DemoApp } from "@/components/DemoApp";

export default function Page() {
  const [demo, setDemo] = useState(false);
  if (demo) return <DemoApp onExit={() => setDemo(false)} />;
  return (
    <TokenGate onDemo={() => setDemo(true)}>
      <App />
    </TokenGate>
  );
}
