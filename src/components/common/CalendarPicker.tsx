import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Grid, CalendarDays } from 'lucide-react';

interface CalendarPickerProps {
  value: string; // Format: YYYY/MM/DD or YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  delimiter?: '/' | '-';
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  label,
  className = '',
  delimiter = '/',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // 需求 3: 所有的起訖日期calendar選項 都要單次顯示30天的版本 (預設直接啟用 30 天單次全覽版本)
  const [viewMode, setViewMode] = useState<'THIRTY_DAYS' | 'MONTH_GRID'>('THIRTY_DAYS');
  const containerRef = useRef<HTMLDivElement>(null);

  // 解析日期，預設 2026/10/27
  const parseDate = (str: string) => {
    const parts = str.split(/[/\\-]/);
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return new Date(2026, 9, 27);
  };

  const initialDate = parseDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() ?? 9);

  // 當外部 value 變動時同步
  useEffect(() => {
    const parsed = parseDate(value);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [value]);

  // 點選外部關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const formatDate = (y: number, m: number, d: number) => {
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${y}${delimiter}${mStr}${delimiter}${dStr}`;
  };

  const handleSelectDay = (y: number, m: number, d: number) => {
    onChange(formatDate(y, m, d));
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // 生成單次顯示完整的 30 天日期陣列 (1日 ~ 30日，包含完整星期與日期字串)
  const thirtyDaysList = useMemo(() => {
    const list: {
      dayNum: number;
      dateStr: string;
      weekdayStr: string;
      isWeekend: boolean;
      year: number;
      month: number;
    }[] = [];

    // 固定生成 1 ~ 30 天的單次完整顯示資料
    for (let day = 1; day <= 30; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const dayOfWeek = dateObj.getDay();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      list.push({
        dayNum: day,
        dateStr: formatDate(viewYear, viewMonth, day),
        weekdayStr: weekdays[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        year: viewYear,
        month: viewMonth,
      });
    }
    return list;
  }, [viewYear, viewMonth, delimiter]);

  // 判斷某一天是否為目前選中的日期
  const isSelected = (dateStr: string) => {
    return value.replace(/-/g, '/') === dateStr.replace(/-/g, '/');
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // 傳統月曆格子計算
  const calendarGridDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGridDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarGridDays.push(i);
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* 點擊觸發框 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between border border-slate-300 rounded-md px-3.5 py-2.5 bg-white cursor-pointer hover:border-red-600 focus-within:ring-1 focus-within:ring-red-600 focus-within:border-red-600 transition-colors shadow-2xs"
      >
        <span className="font-mono text-base font-bold text-slate-900 select-none">
          {value || '請選擇日期'}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span className="text-[11px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
            30天版
          </span>
          <CalendarIcon className="w-5 h-5 text-red-600" />
        </div>
      </div>

      {/* 彈出日曆面板：單次顯示 30 天的完整選取版本 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 w-[380px] sm:w-[420px] select-none animate-in fade-in zoom-in-95 duration-100">
          {/* 頂部功能橫幅與模式切換 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-black bg-red-700 text-white tracking-wide">
                  單次顯示30天版本
                </span>
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  民國 115 年 (2026) {monthNames[viewMonth]}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                單次完整呈現本期 1 ~ 30 天，可一眼對齊全月工況並一鍵選取
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="上一個月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="下一個月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 視圖切換 Tab (預設單次 30 天選取盤) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setViewMode('THIRTY_DAYS')}
              className={`flex-1 py-1 px-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'THIRTY_DAYS'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              單次 30 天矩陣選盤 (推薦)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MONTH_GRID')}
              className={`flex-1 py-1 px-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'MONTH_GRID'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              傳統七曜月曆
            </button>
          </div>

          {/* 單次 30 天完整下拉選單 (共 30 個完整日期) */}
          <div className="mb-3 p-2.5 bg-red-50/70 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-red-900">
                單次顯示 30 天全量下拉清單 (共 30 天)：
              </label>
              <span className="text-[11px] font-mono text-red-700 font-bold">1日 ~ 30日</span>
            </div>
            <select
              value={value}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  setIsOpen(false);
                }
              }}
              className="w-full bg-white border border-red-300 rounded-md px-3 py-1.5 text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none focus:border-red-600 cursor-pointer shadow-2xs"
            >
              <option value="">-- 請由 30 天清單中點選 --</option>
              {thirtyDaysList.map((item) => (
                <option key={item.dateStr} value={item.dateStr}>
                  第 {String(item.dayNum).padStart(2, '0')} 天 · {item.dateStr} (星期{item.weekdayStr})
                  {item.dayNum === 27 ? ' [今日]' : item.dayNum === 26 ? ' [昨日]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 常用快速鍵 */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => handleSelectDay(2026, 9, 27)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              今日 (10/27)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(2026, 9, 26)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              昨日 (10/26)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(2026, 9, 1)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              月初 (10/01)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(2026, 9, 15)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              月中 (10/15)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDay(2026, 9, 30)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              第 30 天 (10/30)
            </button>
          </div>

          {/* 主體區塊：依模式呈現 */}
          {viewMode === 'THIRTY_DAYS' ? (
            /* 單次顯示 30 天矩陣選盤：一覽無遺顯示 30 個日期方塊 (5 欄 x 6 列) */
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                <span>單次 30 天全景點選盤 (點擊任一天即生效)：</span>
                <span className="text-red-700 font-mono font-bold">1 ~ 30 日</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 text-center font-mono">
                {thirtyDaysList.map((item) => {
                  const sel = isSelected(item.dateStr);
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => handleSelectDay(item.year, item.month, item.dayNum)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        sel
                          ? 'bg-red-700 text-white border-red-700 shadow-md ring-2 ring-red-400'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-red-400 hover:bg-red-50/50'
                      }`}
                    >
                      <span className="text-sm font-extrabold leading-tight">
                        {String(item.dayNum).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[10px] leading-tight mt-0.5 ${
                          sel
                            ? 'text-red-100'
                            : item.isWeekend
                            ? 'text-red-600 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        週{item.weekdayStr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 傳統七曜月曆 */
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-1.5">
                <span className="text-red-600">日</span>
                <span>一</span>
                <span>二</span>
                <span>三</span>
                <span>四</span>
                <span>五</span>
                <span className="text-red-600">六</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-mono">
                {calendarGridDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }
                  const dStr = formatDate(viewYear, viewMonth, day);
                  const sel = isSelected(dStr);
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(viewYear, viewMonth, day)}
                      className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs font-bold ${
                        sel
                          ? 'bg-red-700 text-white shadow-md ring-2 ring-red-400'
                          : 'text-slate-800 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 底部目前選定日期與確認關閉 */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">已選取：</span>
              <span className="font-mono font-black text-red-900 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {value}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
