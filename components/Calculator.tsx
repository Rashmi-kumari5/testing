"use client";

import { useCallback, useMemo, useState } from "react";
import {
  evaluateExpression,
  formatNumber,
  Operator,
  toggleSign as toggleSignValue,
  toPercent,
} from "@/lib/calc";

type OperatorSymbol = "÷" | "×" | "-" | "+";

type ButtonAction =
  | { type: "digit"; value: string }
  | { type: "decimal" }
  | { type: "operator"; value: OperatorSymbol }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "percent" }
  | { type: "sign" };

type ButtonVariant = "digit" | "command" | "operator" | "equal";

interface ButtonConfig {
  label: string;
  action: ButtonAction;
  variant: ButtonVariant;
  isWide?: boolean;
  ariaLabel?: string;
}

const operatorMap: Record<OperatorSymbol, Operator> = {
  "÷": "divide",
  "×": "multiply",
  "-": "subtract",
  "+": "add",
};

const keypad: ButtonConfig[] = [
  {
    label: "AC",
    action: { type: "clear" },
    variant: "command",
    ariaLabel: "All clear",
  },
  {
    label: "±",
    action: { type: "sign" },
    variant: "command",
    ariaLabel: "Toggle sign",
  },
  {
    label: "%",
    action: { type: "percent" },
    variant: "command",
    ariaLabel: "Convert to percent",
  },
  { label: "÷", action: { type: "operator", value: "÷" }, variant: "operator" },
  { label: "7", action: { type: "digit", value: "7" }, variant: "digit" },
  { label: "8", action: { type: "digit", value: "8" }, variant: "digit" },
  { label: "9", action: { type: "digit", value: "9" }, variant: "digit" },
  { label: "×", action: { type: "operator", value: "×" }, variant: "operator" },
  { label: "4", action: { type: "digit", value: "4" }, variant: "digit" },
  { label: "5", action: { type: "digit", value: "5" }, variant: "digit" },
  { label: "6", action: { type: "digit", value: "6" }, variant: "digit" },
  { label: "-", action: { type: "operator", value: "-" }, variant: "operator" },
  { label: "1", action: { type: "digit", value: "1" }, variant: "digit" },
  { label: "2", action: { type: "digit", value: "2" }, variant: "digit" },
  { label: "3", action: { type: "digit", value: "3" }, variant: "digit" },
  { label: "+", action: { type: "operator", value: "+" }, variant: "operator" },
  {
    label: "0",
    action: { type: "digit", value: "0" },
    variant: "digit",
    isWide: true,
  },
  { label: ".", action: { type: "decimal" }, variant: "digit", ariaLabel: "Dot" },
  { label: "=", action: { type: "equals" }, variant: "equal" },
];

const getButtonStyles = (variant: ButtonVariant) => {
  const base =
    "rounded-2xl px-4 py-5 text-2xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white tabular-nums";

  switch (variant) {
    case "command":
      return `${base} bg-white/10 text-purple-200 hover:bg-white/20`;
    case "operator":
      return `${base} bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-[0_15px_30px_rgba(109,74,255,0.35)] hover:brightness-110`;
    case "equal":
      return `${base} col-span-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_15px_30px_rgba(56,189,248,0.35)] hover:brightness-110`;
    default:
      return `${base} bg-white/5 text-white hover:bg-white/10`;
  }
};

const formatTrack = (value: string | null, operatorSymbol: OperatorSymbol | null) =>
  value && operatorSymbol ? `${value} ${operatorSymbol}` : "\u00A0";

export const Calculator = () => {
  const [currentValue, setCurrentValue] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [pendingOperator, setPendingOperator] = useState<OperatorSymbol | null>(
    null,
  );
  const [overwrite, setOverwrite] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      setCurrentValue((prev) => {
        if (overwrite || prev === "Error") {
          setOverwrite(false);
          return digit;
        }
        if (prev === "0") {
          return digit;
        }
        return `${prev}${digit}`;
      });
    },
    [overwrite],
  );

  const handleDecimal = useCallback(() => {
    setCurrentValue((prev) => {
      if (overwrite || prev === "Error") {
        setOverwrite(false);
        return "0.";
      }
      if (prev.includes(".")) {
        return prev;
      }
      return `${prev}.`;
    });
  }, [overwrite]);

  const handleClear = useCallback(() => {
    setCurrentValue("0");
    setPreviousValue(null);
    setPendingOperator(null);
    setOverwrite(false);
  }, []);

  const handleOperator = useCallback(
    (symbol: OperatorSymbol) => {
      if (pendingOperator && previousValue !== null && !overwrite) {
        const result = evaluateExpression(
          previousValue,
          currentValue,
          operatorMap[pendingOperator],
        );
        setCurrentValue(result);
        setPreviousValue(result === "Error" ? null : result);
        setPendingOperator(result === "Error" ? null : symbol);
        setOverwrite(true);
        return;
      }

      setPreviousValue(currentValue);
      setPendingOperator(symbol);
      setOverwrite(true);
    },
    [currentValue, overwrite, pendingOperator, previousValue],
  );

  const handleEquals = useCallback(() => {
    if (!pendingOperator || previousValue === null) {
      return;
    }

    const result = evaluateExpression(
      previousValue,
      currentValue,
      operatorMap[pendingOperator],
    );
    setCurrentValue(result);
    setPreviousValue(result === "Error" ? null : result);
    setPendingOperator(null);
    setOverwrite(true);
  }, [currentValue, pendingOperator, previousValue]);

  const handlePercent = useCallback(() => {
    setCurrentValue((prev) => toPercent(prev));
    setOverwrite(true);
  }, []);

  const handleToggleSign = useCallback(() => {
    setCurrentValue((prev) => toggleSignValue(prev));
  }, []);

  const displayValue = useMemo(() => {
    if (currentValue === "Error") {
      return "Error";
    }

    if (!currentValue.includes(".")) {
      return currentValue;
    }

    const numeric = Number(currentValue);
    if (Number.isNaN(numeric)) {
      return currentValue;
    }

    return formatNumber(numeric);
  }, [currentValue]);

  const handleButtonPress = useCallback(
    (action: ButtonAction) => {
      switch (action.type) {
        case "digit":
          handleDigit(action.value);
          break;
        case "decimal":
          handleDecimal();
          break;
        case "operator":
          handleOperator(action.value);
          break;
        case "equals":
          handleEquals();
          break;
        case "percent":
          handlePercent();
          break;
        case "sign":
          handleToggleSign();
          break;
        case "clear":
          handleClear();
          break;
        default:
          break;
      }
    },
    [
      handleClear,
      handleDecimal,
      handleDigit,
      handleEquals,
      handleOperator,
      handlePercent,
      handleToggleSign,
    ],
  );

  return (
    <section
      aria-label="Dark calculator"
      className="w-full rounded-[32px] border border-white/5 bg-black/60 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-2 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 p-6 text-right text-white">
        <p className="h-6 text-sm text-white/50">
          {formatTrack(previousValue, pendingOperator)}
        </p>
        <p
          aria-live="polite"
          className="text-5xl font-light tracking-tight tabular-nums sm:text-6xl"
        >
          {displayValue}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {keypad.map((button) => (
          <button
            key={button.label}
            type="button"
            aria-label={button.ariaLabel ?? button.label}
            aria-pressed={
              button.action.type === "operator" && pendingOperator === button.label
            }
            className={`${getButtonStyles(button.variant)} ${
              button.isWide ? "col-span-2" : ""
            }`}
            onClick={() => handleButtonPress(button.action)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Calculator;
