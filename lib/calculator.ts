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

type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: OperatorKey }
  | { type: "function"; value: FunctionKey }
  | { type: "paren"; value: "(" | ")" };

type OperatorKey = keyof typeof OPERATORS;
type FunctionKey = keyof typeof SCI_FUNCTIONS;

type Associativity = "left" | "right";

type OperatorDefinition = {
  precedence: number;
  associativity: Associativity;
  operands: 1 | 2;
  fn: (...values: number[]) => number;
};

type FunctionDefinition = {
  args: number;
  fn: (values: number[], angleMode: AngleMode) => number;
};

const DEFAULT_ANGLE_MODE: AngleMode = "RAD";

const OPERATORS: Record<string, OperatorDefinition> = {
  "+": {
    precedence: 2,
    associativity: "left",
    operands: 2,
    fn: (a, b) => a + b,
  },
  "-": {
    precedence: 2,
    associativity: "left",
    operands: 2,
    fn: (a, b) => a - b,
  },
  "*": {
    precedence: 3,
    associativity: "left",
    operands: 2,
    fn: (a, b) => a * b,
  },
  "/": {
    precedence: 3,
    associativity: "left",
    operands: 2,
    fn: (a, b) => {
      if (b === 0) {
        throw new CalculatorError("Division by zero");
      }
      return a / b;
    },
  },
  "^": {
    precedence: 4,
    associativity: "right",
    operands: 2,
    fn: (a, b) => Math.pow(a, b),
  },
  neg: {
    precedence: 5,
    associativity: "right",
    operands: 1,
    fn: (value) => -value,
  },
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  tau: Math.PI * 2,
  τ: Math.PI * 2,
  e: Math.E,
};

const SCI_FUNCTIONS: Record<string, FunctionDefinition> = {
  sin: {
    args: 1,
    fn: ([value], mode) => Math.sin(convertToRadians(value, mode)),
  },
  cos: {
    args: 1,
    fn: ([value], mode) => Math.cos(convertToRadians(value, mode)),
  },
  tan: {
    args: 1,
    fn: ([value], mode) => Math.tan(convertToRadians(value, mode)),
  },
  asin: {
    args: 1,
    fn: ([value], mode) => convertFromRadians(Math.asin(value), mode),
  },
  acos: {
    args: 1,
    fn: ([value], mode) => convertFromRadians(Math.acos(value), mode),
  },
  atan: {
    args: 1,
    fn: ([value], mode) => convertFromRadians(Math.atan(value), mode),
  },
  log: {
    args: 1,
    fn: ([value]) => {
      if (value <= 0) {
        throw new CalculatorError("Logarithm domain error");
      }
      return Math.log10(value);
    },
  },
  ln: {
    args: 1,
    fn: ([value]) => {
      if (value <= 0) {
        throw new CalculatorError("Natural log domain error");
      }
      return Math.log(value);
    },
  },
  sqrt: {
    args: 1,
    fn: ([value]) => {
      if (value < 0) {
        throw new CalculatorError("Square root domain error");
      }
      return Math.sqrt(value);
    },
  },
  abs: {
    args: 1,
    fn: ([value]) => Math.abs(value),
  },
  exp: {
    args: 1,
    fn: ([value]) => Math.exp(value),
  },
};

/**
 * Evaluates a mathematical expression and returns the numeric result.
 */
export function evaluateExpression(
  expression: string,
  options: EvaluateOptions = {},
): number {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new CalculatorError("Enter an expression");
  }

  const angleMode = options.angleMode ?? DEFAULT_ANGLE_MODE;
  const tokens = tokenize(trimmed);
  const rpn = toRpn(tokens);
  return evaluateRpn(rpn, angleMode);
}

/**
 * Formats a number for display on the calculator screen.
 */
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

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let previous: Token | undefined;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (isDigit(char) || (char === "." && isDigit(expression[index + 1]))) {
      const numberToken = readNumber(expression, index);
      tokens.push(numberToken.token);
      index = numberToken.nextIndex;
      previous = numberToken.token;
      continue;
    }

    if (char === "(" || char === ")") {
      const token: Token = { type: "paren", value: char };
      tokens.push(token);
      previous = token;
      index += 1;
      continue;
    }

    if (char === "+" || char === "*" || char === "/" || char === "^") {
      const token: Token = { type: "operator", value: char };
      tokens.push(token);
      previous = token;
      index += 1;
      continue;
    }

    if (char === "-") {
      const isUnary =
        !previous ||
        previous.type === "operator" ||
        (previous.type === "paren" && previous.value === "(");
      const token: Token = { type: "operator", value: isUnary ? "neg" : "-" };
      tokens.push(token);
      previous = token;
      index += 1;
      continue;
    }

    if (char === "√") {
      const token: Token = { type: "function", value: "sqrt" };
      tokens.push(token);
      previous = token;
      index += 1;
      continue;
    }

    if (isAlpha(char) || isGreekSymbol(char)) {
      const identifier = readIdentifier(expression, index);
      index = identifier.nextIndex;
      const normalized = identifier.value.toLowerCase();

      if (normalized in CONSTANTS) {
        const numberToken: Token = {
          type: "number",
          value: CONSTANTS[normalized],
        };
        tokens.push(numberToken);
        previous = numberToken;
        continue;
      }

      if (normalized in SCI_FUNCTIONS) {
        const fnToken: Token = { type: "function", value: normalized as FunctionKey };
        tokens.push(fnToken);
        previous = fnToken;
        continue;
      }

      throw new CalculatorError(`Unknown identifier "${identifier.value}"`);
    }

    throw new CalculatorError(`Unsupported character "${char}"`);
  }

  return tokens;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "number":
        output.push(token);
        break;
      case "function":
        stack.push(token);
        break;
      case "operator": {
        while (true) {
          const peek = stack[stack.length - 1];
          if (!peek) break;

          if (peek.type === "function") {
            output.push(stack.pop()!);
            continue;
          }

          if (peek.type === "operator") {
            const currentOp = OPERATORS[token.value];
            const peekOp = OPERATORS[peek.value];

            const higherPrecedence = peekOp.precedence > currentOp.precedence;
            const equalPrecedence =
              peekOp.precedence === currentOp.precedence && currentOp.associativity === "left";

            if (higherPrecedence || equalPrecedence) {
              output.push(stack.pop()!);
              continue;
            }
          }
          break;
        }

        stack.push(token);
        break;
      }
      case "paren":
        if (token.value === "(") {
          stack.push(token);
          break;
        }

        while (stack.length > 0 && stack[stack.length - 1].type !== "paren") {
          output.push(stack.pop()!);
        }

        if (stack.length === 0) {
          throw new CalculatorError("Mismatched parentheses");
        }

        stack.pop();

        if (stack[stack.length - 1]?.type === "function") {
          output.push(stack.pop()!);
        }
        break;
      default:
        break;
    }
  }

  while (stack.length) {
    const token = stack.pop()!;
    if (token.type === "paren") {
      throw new CalculatorError("Mismatched parentheses");
    }

    output.push(token);
  }

  return output;
}

function evaluateRpn(tokens: Token[], angleMode: AngleMode): number {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }

    if (token.type === "operator") {
      const operator = OPERATORS[token.value];
      if (!operator) {
        throw new CalculatorError(`Unsupported operator "${token.value}"`);
      }

      const values = stack.splice(-operator.operands);
      if (values.length !== operator.operands) {
        throw new CalculatorError("Malformed expression");
      }

      const result = operator.fn(...values);
      stack.push(result);
      continue;
    }

    if (token.type === "function") {
      const fn = SCI_FUNCTIONS[token.value];
      if (!fn) {
        throw new CalculatorError(`Unsupported function "${token.value}"`);
      }

      const values = stack.splice(-fn.args);
      if (values.length !== fn.args) {
        throw new CalculatorError("Malformed expression");
      }

      const result = fn.fn(values, angleMode);
      stack.push(result);
      continue;
    }
  }

  if (stack.length !== 1) {
    throw new CalculatorError("Malformed expression");
  }

  return stack[0];
}

function readNumber(expression: string, startIndex: number) {
  let endIndex = startIndex;
  let decimalCount = 0;

  while (endIndex < expression.length) {
    const char = expression[endIndex];
    if (char === ".") {
      decimalCount += 1;
      if (decimalCount > 1) {
        throw new CalculatorError("Invalid number");
      }
    } else if (!isDigit(char)) {
      break;
    }

    endIndex += 1;
  }

  const slice = expression.slice(startIndex, endIndex);
  const numericValue = Number.parseFloat(slice);

  if (Number.isNaN(numericValue)) {
    throw new CalculatorError(`Invalid number "${slice}"`);
  }

  return {
    token: { type: "number", value: numericValue } as Token,
    nextIndex: endIndex,
  };
}

function readIdentifier(expression: string, startIndex: number) {
  let endIndex = startIndex;

  while (endIndex < expression.length) {
    const char = expression[endIndex];
    if (!isAlpha(char) && !isDigit(char) && !isGreekSymbol(char)) {
      break;
    }
    endIndex += 1;
  }

  return {
    value: expression.slice(startIndex, endIndex),
    nextIndex: endIndex,
  };
}

function isDigit(character: string | undefined): boolean {
  return !!character && /[0-9]/.test(character);
}

function isAlpha(character: string | undefined): boolean {
  return !!character && /[a-zA-Z]/.test(character);
}

function isGreekSymbol(character: string | undefined): boolean {
  return character === "π" || character === "τ";
}

function convertToRadians(value: number, mode: AngleMode) {
  return mode === "DEG" ? (value * Math.PI) / 180 : value;
}

function convertFromRadians(value: number, mode: AngleMode) {
  return mode === "DEG" ? (value * 180) / Math.PI : value;
}
