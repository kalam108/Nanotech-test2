import React, { useRef, useEffect } from 'react';

interface SixDigitOtpInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function SixDigitOtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
}: SixDigitOtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split the value string into 6 characters
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '');

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericChars = rawVal.replace(/\D/g, '');

    if (numericChars.length === 0) {
      // Empty / cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      const newCode = newDigits.join('').substring(0, 6);
      onChange(newCode);
      return;
    }

    if (numericChars.length === 1) {
      // Single digit typed
      const newDigits = [...digits];
      newDigits[index] = numericChars;
      const newCode = newDigits.join('').substring(0, 6);
      onChange(newCode);

      // Advance focus to next input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newCode.length === 6 && onComplete) {
        onComplete(newCode);
      }
    } else {
      // Pasted or multiple characters into single box
      handlePastedContent(numericChars);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, focus previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        const newCode = newDigits.join('');
        onChange(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numeric = pastedData.replace(/\D/g, '').substring(0, 6);
    if (numeric.length > 0) {
      handlePastedContent(numeric);
    }
  };

  const handlePastedContent = (numericChars: string) => {
    const clean = numericChars.substring(0, 6);
    onChange(clean);

    // Focus last filled index or 6th box
    const focusIndex = Math.min(clean.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
    }

    if (clean.length === 6 && onComplete) {
      onComplete(clean);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, index) => {
        const char = digits[index] || '';
        const isFilled = Boolean(char);

        return (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={e => handleChange(index, e)}
            onKeyDown={e => handleKeyDown(index, e)}
            onClick={e => (e.target as HTMLInputElement).select()}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-black rounded-xl sm:rounded-2xl transition-all outline-none select-all ${
              hasError
                ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                : isFilled
                ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
}
