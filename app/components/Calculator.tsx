'use client';

import { useState } from 'react';

/**
 * Calculator Component
 * A simple calculator with basic arithmetic operations in a dark theme
 */
export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  /**
   * Handle number button clicks
   */
  const handleNumber = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  /**
   * Handle decimal point
   */
  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  /**
   * Handle operation buttons (+, -, *, /)
   */
  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = performCalculation();
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setShouldResetDisplay(true);
  };

  /**
   * Perform the calculation based on the current operation
   */
  const performCalculation = (): number => {
    const current = parseFloat(display);
    const previous = previousValue || 0;

    switch (operation) {
      case '+':
        return previous + current;
      case '-':
        return previous - current;
      case '*':
        return previous * current;
      case '/':
        return current !== 0 ? previous / current : 0;
      default:
        return current;
    }
  };

  /**
   * Handle equals button
   */
  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const result = performCalculation();
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(true);
    }
  };

  /**
   * Clear all values
   */
  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  };

  /**
   * Delete last digit
   */
  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  /**
   * Toggle positive/negative
   */
  const handleToggleSign = () => {
    if (display !== '0') {
      setDisplay(String(parseFloat(display) * -1));
    }
  };

  // Button style classes
  const buttonBase = 'h-16 rounded-lg font-semibold text-lg transition-all duration-200 active:scale-95';
  const numberButton = `${buttonBase} bg-zinc-700 hover:bg-zinc-600 text-white`;
  const operationButton = `${buttonBase} bg-orange-600 hover:bg-orange-500 text-white`;
  const specialButton = `${buttonBase} bg-zinc-600 hover:bg-zinc-500 text-white`;

  return (
    <div className="w-full max-w-xs mx-auto p-6 bg-zinc-900 rounded-2xl shadow-2xl">
      {/* Display */}
      <div className="mb-4 p-6 bg-zinc-800 rounded-xl">
        <div className="text-right">
          <div className="text-sm text-zinc-500 h-6 mb-1">
            {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
          </div>
          <div className="text-4xl font-bold text-white break-all">
            {display}
          </div>
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <button onClick={handleClear} className={specialButton}>
          AC
        </button>
        <button onClick={handleDelete} className={specialButton}>
          DEL
        </button>
        <button onClick={handleToggleSign} className={specialButton}>
          +/-
        </button>
        <button onClick={() => handleOperation('/')} className={operationButton}>
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => handleNumber('7')} className={numberButton}>
          7
        </button>
        <button onClick={() => handleNumber('8')} className={numberButton}>
          8
        </button>
        <button onClick={() => handleNumber('9')} className={numberButton}>
          9
        </button>
        <button onClick={() => handleOperation('*')} className={operationButton}>
          ×
        </button>

        {/* Row 3 */}
        <button onClick={() => handleNumber('4')} className={numberButton}>
          4
        </button>
        <button onClick={() => handleNumber('5')} className={numberButton}>
          5
        </button>
        <button onClick={() => handleNumber('6')} className={numberButton}>
          6
        </button>
        <button onClick={() => handleOperation('-')} className={operationButton}>
          −
        </button>

        {/* Row 4 */}
        <button onClick={() => handleNumber('1')} className={numberButton}>
          1
        </button>
        <button onClick={() => handleNumber('2')} className={numberButton}>
          2
        </button>
        <button onClick={() => handleNumber('3')} className={numberButton}>
          3
        </button>
        <button onClick={() => handleOperation('+')} className={operationButton}>
          +
        </button>

        {/* Row 5 */}
        <button onClick={() => handleNumber('0')} className={`${numberButton} col-span-2`}>
          0
        </button>
        <button onClick={handleDecimal} className={numberButton}>
          .
        </button>
        <button onClick={handleEquals} className={operationButton}>
          =
        </button>
      </div>
    </div>
  );
}
