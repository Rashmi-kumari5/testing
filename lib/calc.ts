export type Operator = "add" | "subtract" | "multiply" | "divide";

const PRECISION = 12;
const MAX_DECIMALS = 8;

const sanitizeNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return value;
  }

  const cleaned = Number.parseFloat(value.toPrecision(PRECISION));
  return Object.is(cleaned, -0) ? 0 : cleaned;
};

export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const sanitized = sanitizeNumber(value);
  const absolute = Math.abs(sanitized);

  if (absolute !== 0 && (absolute >= 1e9 || absolute < 1e-4)) {
    return sanitized
      .toExponential(6)
      .replace(/\.?0+e/, "e")
      .replace("e+", "e");
  }

  const stringified = sanitized.toString();
  if (!stringified.includes(".")) {
    return stringified;
  }

  const [integer, decimals = ""] = stringified.split(".");
  const trimmedDecimals = decimals.slice(0, MAX_DECIMALS).replace(/0+$/, "");

  return trimmedDecimals ? `${integer}.${trimmedDecimals}` : integer;
};

export const evaluateExpression = (
  previous: string,
  current: string,
  operator: Operator,
): string => {
  const prevNumber = Number(previous);
  const currentNumber = Number(current);

  if (Number.isNaN(prevNumber) || Number.isNaN(currentNumber)) {
    return "0";
  }

  if (operator === "divide" && currentNumber === 0) {
    return "Error";
  }

  let result: number;

  switch (operator) {
    case "add":
      result = prevNumber + currentNumber;
      break;
    case "subtract":
      result = prevNumber - currentNumber;
      break;
    case "multiply":
      result = prevNumber * currentNumber;
      break;
    case "divide":
      result = prevNumber / currentNumber;
      break;
    default:
      result = currentNumber;
  }

  return formatNumber(result);
};

export const toPercent = (value: string): string => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "0";
  }

  return formatNumber(numeric / 100);
};

export const toggleSign = (value: string): string => {
  if (value === "0" || value === "Error") {
    return value;
  }

  return value.startsWith("-") ? value.slice(1) : `-${value}`;
};
