import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

/**
 * 需求 5: 任何輸入密碼的欄位都要加上眼睛, 這按鈕按下去才會顯示明碼, 但移開就恢復顯示隱碼
 * 需求 8: 英文描述全部移除
 * 需求 10: font size 再次放大
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  helperText,
  containerClassName = '',
  id,
  className = '',
  disabled,
  ...props
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputId = id || `password-field-${Math.random().toString(36).slice(2, 9)}`;

  const handlePressStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsRevealed(true);
    }
  };

  const handlePressEnd = () => {
    setIsRevealed(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsRevealed(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-slate-800 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative rounded-md shadow-2xs">
        <input
          {...props}
          id={inputId}
          type={isRevealed ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full rounded-md border py-3 pl-4 pr-12 text-base transition-colors outline-none font-mono
            ${
              error
                ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20 text-red-900'
                : 'border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white text-slate-900'
            }
            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
            ${className}`}
        />

        <button
          ref={buttonRef}
          type="button"
          tabIndex={-1}
          aria-label={isRevealed ? '放開隱藏密碼' : '按住顯示密碼'}
          title="按住顯示明碼，放開或移開即遮蔽"
          disabled={disabled}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressEnd}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              handlePressStart(e);
            }
          }}
          onKeyUp={handlePressEnd}
          className={`absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-red-700 active:text-red-700 focus:outline-none select-none transition-colors
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}
        >
          {isRevealed ? (
            <Eye className="w-5 h-5 text-red-600 transition-transform scale-110" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        {error ? (
          <p className="text-red-600 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-slate-500 font-medium">{helperText}</p>
        ) : (
          <span className="text-slate-400 select-none">按住右側眼睛可預覽密碼</span>
        )}
      </div>
    </div>
  );
};
