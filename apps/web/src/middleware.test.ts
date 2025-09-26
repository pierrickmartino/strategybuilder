import { describe, expect, it } from "vitest";

import { PROTECTED_PATHS } from "./middleware";

describe("middleware protected paths", () => {
  it("guards the base strategies route", () => {
    expect(PROTECTED_PATHS.some((pattern) => pattern.test("/en/strategies"))).toBe(true);
  });

  it("guards nested strategies routes", () => {
    expect(PROTECTED_PATHS.some((pattern) => pattern.test("/en/strategies/123/designer"))).toBe(true);
  });

  it("does not guard unrelated routes", () => {
    expect(PROTECTED_PATHS.some((pattern) => pattern.test("/en/login"))).toBe(false);
  });
});
