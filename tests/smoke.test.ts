import { describe, it, expect } from "vitest";
import { OWNER, REPO, PROJECT_NUMBER, ALLOWED_LOGIN } from "@/lib/constants";

describe("constants", () => {
  it("point at the personal work-hub project only", () => {
    expect(OWNER).toBe("jmckinnonmgt");
    expect(REPO).toBe("work-hub");
    expect(PROJECT_NUMBER).toBe(1);
    expect(ALLOWED_LOGIN).toBe("jmckinnonmgt");
  });
});
