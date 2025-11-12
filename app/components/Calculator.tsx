'use client';

import { useState } from 'react';

/**
 * Calculator Component
 * A simple calculator with dark theme that supports basic arithmetic operations
 * Features: Addition, Subtraction, Multiplication, Division, Clear, and Delete
 */
export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  /**
   * Handles number button clicks
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
   * Handles decimal point
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
   * Handles operation buttons (+, -, ×, ÷)
   */
  const handleOperation = (op: string) => {
    if (previousValue !== null && operation !== null && !shouldResetDisplay) {
      calculate();
    }
    setPreviousValue(display);
    setOperation(op);
    setShouldResetDisplay(true);
  };

  /**
   * Performs the calculation based on the current operation
   */
  const calculate = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        result = current !== 0 ? prev / current : 0;
        break;
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
   * Deletes the last character from display
   */
  const handleDelete = () => {
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  /**
   * Button component with consistent styling
   */
  const Button = ({ 
    value, 
    onClick, 
    className = '' 
  }: { 
    value: string; 
    onClick: () => void; 
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={`h-16 rounded-lg text-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      {value}
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-800 p-6 shadow-2xl">
        {/* Calculator Display */}
        <div className="mb-6 rounded-lg bg-zinc-900 p-6 text-right">
          <div className="mb-1 text-sm text-zinc-500">
            {previousValue && operation ? `${previousValue} ${operation}` : '\u00A0'}
          </div>
          <div className="text-4xl font-bold text-white break-all">
            {display}
          </div>
        </div>

        {/* Calculator Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1: C, DEL, ÷ */}
          <Button
            value="C"
            onClick={handleClear}
            className="col-span-2 bg-red-600 text-white hover:bg-red-700"
          />
          <Button
            value="DEL"
            onClick={handleDelete}
            className="bg-orange-600 text-white hover:bg-orange-700"
          />
          <Button
            value="÷"
            onClick={() => handleOperation('÷')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />

          {/* Row 2: 7, 8, 9, × */}
          <Button
            value="7"
            onClick={() => handleNumber('7')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="8"
            onClick={() => handleNumber('8')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="9"
            onClick={() => handleNumber('9')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="×"
            onClick={() => handleOperation('×')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />

          {/* Row 3: 4, 5, 6, - */}
          <Button
            value="4"
            onClick={() => handleNumber('4')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="5"
            onClick={() => handleNumber('5')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="6"
            onClick={() => handleNumber('6')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="-"
            onClick={() => handleOperation('-')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />

          {/* Row 4: 1, 2, 3, + */}
          <Button
            value="1"
            onClick={() => handleNumber('1')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="2"
            onClick={() => handleNumber('2')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="3"
            onClick={() => handleNumber('3')}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="+"
            onClick={() => handleOperation('+')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />

          {/* Row 5: 0, ., = */}
          <Button
            value="0"
            onClick={() => handleNumber('0')}
            className="col-span-2 bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="."
            onClick={handleDecimal}
            className="bg-zinc-700 text-white hover:bg-zinc-600"
          />
          <Button
            value="="
            onClick={calculate}
            className="bg-green-600 text-white hover:bg-green-700"
          />
        </div>
      </div>
    </div>
  );
}
