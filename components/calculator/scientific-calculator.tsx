"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AngleMode,
  CalculatorError,
  evaluateExpression,
  formatResult,
} from "@/lib/calculator";

type CalcButton =
  | {
      label: string;
      value: string;
      variant?: "default" | "accent" | "danger";
    }
  | {
      label: string;
      action:
        | "clear"
        | "delete"
        | "evaluate"
        | "ans"
        | "square"
        | "cube";
      variant?: "default" | "accent" | "danger";
    };

const SCIENCE_ROWS: CalcButton[][] = [
  [
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "log", value: "log(" },
    { label: "ln", value: "ln(" },
    { label: "exp", value: "exp(" },
  ],
  [
    { label: "asin", value: "asin(" },
    { label: "acos", value: "acos(" },
    { label: "atan", value: "atan(" },
    { label: "√", value: "sqrt(" },
    { label: "|x|", value: "abs(" },
    { label: "π", value: "π" },
  ],
  [
    { label: "τ", value: "τ" },
    { label: "e", value: "e" },
    { label: "x²", action: "square" },
    { label: "x³", action: "cube" },
    { label: "x^y", value: "^" },
    { label: "Ans", action: "ans" },
  ],
];

const KEYPAD_ROWS: CalcButton[][] = [
  [
    { label: "AC", action: "clear", variant: "danger" },
    { label: "DEL", action: "delete" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
  ],
  [
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "/", value: "/" },
  ],
  [
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "*", value: "*" },
  ],
  [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "-", value: "-" },
  ],
  [
    { label: "0", value: "0" },
    { label: ".", value: "." },
    { label: "+", value: "+" },
    { label: "=", action: "evaluate", variant: "accent" },
  ],
];

export function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [lastResult, setLastResult] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [shouldOverwrite, setShouldOverwrite] = useState(false);

  const livePreview = useMemo(() => {
    if (!expression.trim()) {
      return lastResult;
    }

    try {
      const value = evaluateExpression(expression, { angleMode });
      return formatResult(value);
    } catch {
      return "";
    }
  }, [expression, angleMode, lastResult]);

  const appendToken = useCallback(
    (token: string) => {
      setExpression((current) => {
        const base = shouldOverwrite ? "" : current;
        const next = `${base}${token}`;
        return next;
      });
      setShouldOverwrite(false);
      setError(null);
    },
    [shouldOverwrite],
  );

  const handleClear = useCallback(() => {
    setExpression("");
    setError(null);
    setShouldOverwrite(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (shouldOverwrite) {
      setExpression("");
      setShouldOverwrite(false);
      return;
    }

    setExpression((current) => current.slice(0, -1));
  }, [shouldOverwrite]);

  const runEvaluation = useCallback(
    (target: string) => {
      const candidate = target.trim() || lastResult;
      const value = evaluateExpression(candidate, { angleMode });
      const formatted = formatResult(value);
      setLastResult(formatted);
      setExpression(formatted);
      setShouldOverwrite(true);
      setError(null);
      return value;
    },
    [angleMode, lastResult],
  );

  const handleEvaluate = useCallback(() => {
    try {
      runEvaluation(expression);
    } catch (err) {
      handleError(err);
    }
  }, [expression, runEvaluation]);

  const applyInstantOperation = useCallback(
    (operation: (value: number) => number) => {
      try {
        const base = runEvaluation(expression);
        const updated = operation(base);
        const formatted = formatResult(updated);
        setLastResult(formatted);
        setExpression(formatted);
        setShouldOverwrite(true);
        setError(null);
      } catch (err) {
        handleError(err);
      }
    },
    [expression, runEvaluation],
  );

  const handleAngleToggle = useCallback(
    (nextMode: AngleMode) => {
      setAngleMode(nextMode);
    },
    [],
  );

  const handleButtonClick = useCallback(
    (button: CalcButton) => {
      if ("value" in button) {
        appendToken(button.value);
        return;
      }

      switch (button.action) {
        case "clear":
          handleClear();
          break;
        case "delete":
          handleDelete();
          break;
        case "evaluate":
          handleEvaluate();
          break;
        case "ans":
          appendToken(lastResult);
          break;
        case "square":
          applyInstantOperation((value) => Math.pow(value, 2));
          break;
        case "cube":
          applyInstantOperation((value) => Math.pow(value, 3));
          break;
        default:
          break;
      }
    },
    [
      appendToken,
      applyInstantOperation,
      handleClear,
      handleDelete,
      handleEvaluate,
      lastResult,
    ],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { key } = event;

      if (/\d/.test(key) || key === "." || key === "+" || key === "-" || key === "*" || key === "/" || key === "^" || key === "(" || key === ")") {
        event.preventDefault();
        appendToken(key);
        return;
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleEvaluate();
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        handleDelete();
        return;
      }

      if (key === "Escape") {
        event.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [appendToken, handleClear, handleDelete, handleEvaluate]);

  return (
    <section className="w-full space-y-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-zinc-100">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Scientific Calculator
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950">
            Precision math at your fingertips
          </h1>
          <p className="text-sm text-zinc-500">
            Evaluate expressions with trigonometry, logarithms, powers, and constants in a single workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 text-sm font-medium">
          {(["DEG", "RAD"] satisfies AngleMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleAngleToggle(mode)}
              className={`rounded-full px-4 py-1 transition ${
                angleMode === mode
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      <div className="rounded-3xl bg-zinc-900 p-6 text-right text-white">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          {angleMode === "DEG" ? "Degrees" : "Radians"}
        </p>
        <p className="mt-2 break-words text-lg font-mono text-zinc-200">{expression || "0"}</p>
        <p className="mt-4 text-4xl font-semibold">
          {error ? "Error" : livePreview || lastResult}
        </p>
        <p className="mt-1 text-xs text-zinc-400">Last result: {lastResult}</p>
        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SCIENCE_ROWS.map((row, rowIndex) => (
            <div key={`science-row-${rowIndex}`} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {row.map((button) => (
                <CalcPadButton
                  key={button.label}
                  button={button}
                  onPress={handleButtonClick}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {KEYPAD_ROWS.flat().map((button) => (
            <CalcPadButton key={button.label} button={button} onPress={handleButtonClick} />
          ))}
        </div>
      </div>
    </section>
  );

  function handleError(err: unknown) {
    if (err instanceof CalculatorError) {
      setError(err.message);
      return;
    }

    setError("Unable to evaluate expression");
  }
}

type CalcPadButtonProps = {
  button: CalcButton;
  onPress: (button: CalcButton) => void;
};

function CalcPadButton({ button, onPress }: CalcPadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onPress(button)}
      className={`rounded-2xl px-3 py-2 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        button.variant === "accent"
          ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-400"
          : button.variant === "danger"
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:outline-rose-300"
            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:outline-zinc-400"
      }`}
    >
      {button.label}
    </button>
  );
}
