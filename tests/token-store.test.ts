import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, clearToken } from "@/lib/github/token-store";

beforeEach(() => window.localStorage.clear());

describe("token-store", () => {
  it("stores, reads (trimmed), and clears the token", () => {
    expect(getToken()).toBeNull();
    setToken("  ghp_abc  ");
    expect(getToken()).toBe("ghp_abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});
