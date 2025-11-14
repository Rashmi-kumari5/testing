import { all, create } from "mathjs";

export type AngleMode = "DEG" | "RAD";

export interface EvaluateOptions {
  angleMode?: AngleMode;
}

export class CalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculatorError";
  }
}

const math = create(all, {
  predictable: true,
  number: "number",
});

const DEFAULT_ANGLE_MODE: AngleMode = "RAD";

const DEGREE_TRIG: Record<string, (...args: number[]) => number> = {
  sin: (x) => Math.sin(degToRad(x)),
  cos: (x) => Math.cos(degToRad(x)),
  tan: (x) => Math.tan(degToRad(x)),
  asin: (x) => radToDeg(Math.asin(x)),
  acos: (x) => radToDeg(Math.acos(x)),
  atan: (x) => radToDeg(Math.atan(x)),
};

const RADIAN_TRIG: Record<string, (...args: number[]) => number> = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
};

export function evaluateExpression(
  expression: string,
  options: EvaluateOptions = {},
): number {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new CalculatorError("Enter an expression");
  }

  const normalizedExpression = normalizeExpression(trimmed);
  const angleMode = options.angleMode ?? DEFAULT_ANGLE_MODE;
  const scope = buildScope(angleMode);

  try {
    const result = math.evaluate(normalizedExpression, scope);
    if (typeof result !== "number") {
      throw new CalculatorError("Expression did not resolve to a number");
    }
    return result;
  } catch (error) {
    throw new CalculatorError(
      error instanceof Error ? error.message : "Unable to evaluate expression",
    );
  }
}

export function formatResult(value: number, precision = 12): string {
  if (Number.isNaN(value)) {
    return "Not a number";
  }

  if (!Number.isFinite(value)) {
    return value > 0 ? "Infinity" : value < 0 ? "-Infinity" : "Not a number";
  }

  const normalized = Number.parseFloat(value.toPrecision(precision));
  return normalized.toString();
}

function buildScope(angleMode: AngleMode): Record<string, unknown> {
  const trig = angleMode === "DEG" ? DEGREE_TRIG : RADIAN_TRIG;

  return {
    ...trig,
    sqrt: (x: number) => {
      if (x < 0) throw new CalculatorError("Square root domain error");
      return Math.sqrt(x);
    },
    log: (x: number) => {
      if (x <= 0) throw new CalculatorError("Logarithm domain error");
      return Math.log10(x);
    },
    ln: (x: number) => {
      if (x <= 0) throw new CalculatorError("Natural log domain error");
      return Math.log(x);
    },
    abs: (x: number) => Math.abs(x),
    exp: (x: number) => Math.exp(x),
    τ: Math.PI * 2,
    tau: Math.PI * 2,
    π: Math.PI,
    pi: Math.PI,
    e: Math.E,
  };
}

function normalizeExpression(expression: string): string {
  return expression
    .replace(/π/g, "pi")
    .replace(/τ/g, "tau")
    .replace(/√/g, "sqrt");
}

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function radToDeg(value: number) {
  return (value * 180) / Math.PI;
}
