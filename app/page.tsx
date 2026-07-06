"use client";
import { TokenGate } from "@/components/TokenGate";
import { App } from "@/components/App";

export default function Page() {
  return (
    <TokenGate>
      <App />
    </TokenGate>
  );
}
