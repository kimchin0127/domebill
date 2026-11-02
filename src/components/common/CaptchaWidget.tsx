import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface CaptchaWidgetProps {
  onVerifyChange: (isValid: boolean) => void;
  className?: string;
}

/**
 * 需求 3: 驗證方式只選圖形驗證碼 / 智慧防護移除
 * 需求 8: 英文描述全部移除
 * 需求 10: font size 再次放大
 */
export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  onVerifyChange,
  className = '',
}) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isInputValid, setIsInputValid] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 隨機產生 4 位數驗證碼（排除易混淆字元）
  const generateRandomCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 於 Canvas 繪製隨機干擾與傾斜防偽字元（棒球紅色縫線色調）
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 背景漸層
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fff5f5');
    grad.addColorStop(1, '#fee2e2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 隨機干擾曲線（棒球紅色系）
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(185, 28, 28, ${0.2 + Math.random() * 0.4})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // 雜訊點
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(153, 27, 27, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 繪製字元
    const charSpacing = width / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = charSpacing * (i + 0.9);
      const y = height / 2 + 8;
      ctx.translate(x, y);
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.rotate(angle);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = ['#991b1b', '#b91c1c', '#7f1d1d', '#c2410c', '#881337'][i % 5];
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(char, -9, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = () => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput('');
    setIsInputValid(null);
    onVerifyChange(false);
    setTimeout(() => {
      drawCaptcha(newCode);
    }, 20);
  };

  useEffect(() => {
    const code = generateRandomCode();
    setCaptchaCode(code);
    setUserInput('');
    setIsInputValid(null);
    onVerifyChange(false);
    setTimeout(() => {
      drawCaptcha(code);
    }, 50);
  }, [drawCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    if (val.length === 4) {
      const valid = val === captchaCode;
      setIsInputValid(valid);
      onVerifyChange(valid);
    } else {
      setIsInputValid(null);
      onVerifyChange(false);
    }
  };

  const handleAutoFill = () => {
    setUserInput(captchaCode);
    setIsInputValid(true);
    onVerifyChange(true);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800">
          安全驗證碼
        </label>
        <span className="text-xs text-slate-500 font-medium">
          點擊圖片可更換新驗證碼
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={4}
            value={userInput}
            onChange={handleInputChange}
            placeholder="請輸入 4 碼驗證"
            className={`w-full uppercase tracking-widest text-center font-mono font-bold text-lg rounded-md border py-2.5 px-3 outline-none transition-colors ${
              isInputValid === true
                ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
                : isInputValid === false
                ? 'border-red-400 bg-red-50/40 text-red-900'
                : 'border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white text-slate-900'
            }`}
          />
          {isInputValid === true && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-3.5" />
          )}
          {isInputValid === false && (
            <ShieldAlert className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
          )}
        </div>

        {/* Canvas 驗證碼區塊 */}
        <div className="flex items-center rounded-md border border-red-200 overflow-hidden bg-red-50/50 shadow-inner">
          <canvas
            ref={canvasRef}
            width={130}
            height={46}
            className="cursor-pointer select-none"
            onClick={refreshCaptcha}
            title="點擊更換驗證碼"
          />
          <button
            type="button"
            onClick={refreshCaptcha}
            aria-label="重新整理驗證碼"
            title="更換新驗證碼"
            className="p-2.5 text-red-700 hover:text-red-900 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>不分大小寫</span>
        <button
          type="button"
          onClick={handleAutoFill}
          className="text-red-700 hover:text-red-900 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          示範一鍵帶入
        </button>
      </div>
    </div>
  );
};
