import { describe, expect, it } from "vitest";
import {
  evaluateExpression,
  formatNumber,
  toggleSign,
  toPercent,
} from "@/lib/calc";

describe("evaluateExpression", () => {
  it("adds numbers", () => {
    expect(evaluateExpression("2", "3", "add")).toBe("5");
  });

  it("subtracts numbers", () => {
    expect(evaluateExpression("10", "7", "subtract")).toBe("3");
  });

  it("multiplies numbers", () => {
    expect(evaluateExpression("1.5", "2", "multiply")).toBe("3");
  });

  it("divides numbers", () => {
    expect(evaluateExpression("9", "3", "divide")).toBe("3");
  });

  it("guards against division by zero", () => {
    expect(evaluateExpression("9", "0", "divide")).toBe("Error");
  });

  it("trims long decimal results", () => {
    expect(evaluateExpression("1", "3", "divide")).toBe("0.33333333");
  });
});

describe("format helpers", () => {
  it("formats large numbers with precision", () => {
    expect(formatNumber(12345.678900)).toBe("12345.6789");
  });

  it("converts values to percent", () => {
    expect(toPercent("50")).toBe("0.5");
  });

  it("toggles sign without affecting zero", () => {
    expect(toggleSign("0")).toBe("0");
    expect(toggleSign("21")).toBe("-21");
    expect(toggleSign("-7")).toBe("7");
  });
});
