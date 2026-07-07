import { describe, it, expect, vi } from "vitest";
import { loadFlow, saveFlow, __setFlowRestForTest } from "@/lib/github/flow";
import type { FlowState } from "@/lib/flow/types";

function encode(s: string): string { return btoa(unescape(encodeURIComponent(s))); }

const sampleState: FlowState = {
  builds: ["Alpha"],
  active: "Alpha",
  diagrams: { Alpha: { nodes: [], edges: [] } },
};

describe("loadFlow", () => {
  it("returns the parsed state and sha on success", async () => {
    const b64 = encode(JSON.stringify(sampleState));
    global.fetch = vi.fn().mockResolvedValue({
      status: 200, ok: true, json: async () => ({ content: b64, sha: "abc" }),
    } as unknown as Response);
    const { state, sha } = await loadFlow("tok");
    expect(state).toEqual(sampleState);
    expect(sha).toBe("abc");
  });

  it("returns null state and sha when the file does not exist (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 404, ok: false } as unknown as Response);
    const { state, sha } = await loadFlow("tok");
    expect(state).toBeNull();
    expect(sha).toBeNull();
  });
});

describe("saveFlow", () => {
  it("writes base64 content with the provided sha and returns the new sha", async () => {
    const createOrUpdateFileContents = vi.fn().mockResolvedValue({ data: { content: { sha: "newsha" } } });
    const rest = () => ({ rest: { repos: { getContent: vi.fn(), createOrUpdateFileContents } } }) as any;
    __setFlowRestForTest(rest);
    const result = await saveFlow("tok", sampleState, "abc");
    expect(result).toBe("newsha");
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "flow/flowmap.json",
        content: encode(JSON.stringify(sampleState, null, 2)),
        sha: "abc",
      }),
    );
  });

  it("retries with the latest sha on a 409 conflict", async () => {
    const createOrUpdateFileContents = vi.fn()
      .mockRejectedValueOnce({ status: 409 })
      .mockResolvedValueOnce({ data: { content: { sha: "resolvedsha" } } });
    const rest = () => ({ rest: { repos: { getContent: vi.fn(), createOrUpdateFileContents } } }) as any;
    __setFlowRestForTest(rest);
    const b64 = encode(JSON.stringify(sampleState));
    global.fetch = vi.fn().mockResolvedValue({
      status: 200, ok: true, json: async () => ({ content: b64, sha: "latestsha" }),
    } as unknown as Response);
    const result = await saveFlow("tok", sampleState, "stalesha");
    expect(result).toBe("resolvedsha");
    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(2);
    expect(createOrUpdateFileContents).toHaveBeenLastCalledWith(
      expect.objectContaining({ sha: "latestsha" }),
    );
  });
});
