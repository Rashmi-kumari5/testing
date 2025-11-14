import { describe, expect, it } from "vitest";

import { CalculatorError, evaluateExpression, formatResult } from "./calculator";

describe("evaluateExpression", () => {
  it("evaluates arithmetic expressions", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
  });

  it("honors DEG angle mode for trigonometric functions", () => {
    const result = evaluateExpression("sin(30) + cos(60)", { angleMode: "DEG" });
    expect(result).toBeCloseTo(1);
  });

  it("supports scientific constants", () => {
    expect(evaluateExpression("π + τ")).toBeCloseTo(Math.PI + Math.PI * 2);
  });

  it("throws a CalculatorError for invalid input", () => {
    expect(() => evaluateExpression("")).toThrow(CalculatorError);
  });

  it("surfaces domain errors", () => {
    expect(() => evaluateExpression("sqrt(-1)")).toThrow(/domain/i);
  });
});

describe("formatResult", () => {
  it("formats finite numbers with precision", () => {
    expect(formatResult(1 / 3, 4)).toBe("0.3333");
  });

  it("labels invalid numbers", () => {
    expect(formatResult(Number.NaN)).toBe("Not a number");
  });
});
