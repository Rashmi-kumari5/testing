'use client';

import { useState } from 'react';

/**
 * A simple calculator component with dark theme
 * Supports basic arithmetic operations: addition, subtraction, multiplication, division
 */
export default function Calculator() {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState<boolean>(false);

  /**
   * Handles number button clicks
   */
  const handleNumberClick = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  /**
   * Handles decimal point button click
   */
  const handleDecimalClick = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  /**
   * Handles operation button clicks (+, -, *, /)
   */
  const handleOperationClick = (op: string) => {
    if (previousValue !== null && operation !== null && !shouldResetDisplay) {
      handleEquals();
    }
    setPreviousValue(display);
    setOperation(op);
    setShouldResetDisplay(true);
  };

  /**
   * Handles equals button click and performs calculation
   */
  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = current !== 0 ? prev / current : 0;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  };

  /**
   * Clears all calculator state
   */
  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  };

  /**
   * Toggles the sign of the current display value
   */
  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  /**
   * Converts the current display value to percentage
   */
  const handlePercentage = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const buttons = [
    { label: 'AC', onClick: handleClear, className: 'bg-zinc-600 hover:bg-zinc-500' },
    { label: '+/-', onClick: handleToggleSign, className: 'bg-zinc-600 hover:bg-zinc-500' },
    { label: '%', onClick: handlePercentage, className: 'bg-zinc-600 hover:bg-zinc-500' },
    { label: '÷', onClick: () => handleOperationClick('/'), className: 'bg-orange-600 hover:bg-orange-500' },
    { label: '7', onClick: () => handleNumberClick('7'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '8', onClick: () => handleNumberClick('8'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '9', onClick: () => handleNumberClick('9'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '×', onClick: () => handleOperationClick('*'), className: 'bg-orange-600 hover:bg-orange-500' },
    { label: '4', onClick: () => handleNumberClick('4'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '5', onClick: () => handleNumberClick('5'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '6', onClick: () => handleNumberClick('6'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '-', onClick: () => handleOperationClick('-'), className: 'bg-orange-600 hover:bg-orange-500' },
    { label: '1', onClick: () => handleNumberClick('1'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '2', onClick: () => handleNumberClick('2'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '3', onClick: () => handleNumberClick('3'), className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '+', onClick: () => handleOperationClick('+'), className: 'bg-orange-600 hover:bg-orange-500' },
    { label: '0', onClick: () => handleNumberClick('0'), className: 'bg-zinc-700 hover:bg-zinc-600 col-span-2' },
    { label: '.', onClick: handleDecimalClick, className: 'bg-zinc-700 hover:bg-zinc-600' },
    { label: '=', onClick: handleEquals, className: 'bg-orange-600 hover:bg-orange-500' },
  ];

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-zinc-900 rounded-2xl shadow-2xl">
      {/* Display */}
      <div className="mb-4 p-6 bg-zinc-800 rounded-xl">
        <div className="text-right text-5xl font-light text-white overflow-hidden text-ellipsis">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`
              ${button.className}
              text-white text-2xl font-medium rounded-xl h-16
              transition-all duration-200 active:scale-95
              ${button.label === '0' ? 'col-span-2' : ''}
            `}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
