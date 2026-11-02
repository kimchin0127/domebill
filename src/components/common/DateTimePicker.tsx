import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check, Grid, CalendarDays } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // Format: YYYY-MM-DD HH:mm:ss
  onChange: (datetime: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  className = '',
  placeholder = 'YYYY-MM-DD HH:mm:ss',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // 需求 3: 所有的起訖日期calendar選項 都要單次顯示30天的版本
  const [viewMode, setViewMode] = useState<'THIRTY_DAYS' | 'MONTH_GRID'>('THIRTY_DAYS');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM-DD HH:mm:ss
  const parseDateTime = (str: string) => {
    const parts = str.split(' ');
    const datePart = parts[0] || '2026-10-27';
    const timePart = parts[1] || '00:00:00';

    const dPieces = datePart.split(/[-/]/);
    const y = parseInt(dPieces[0], 10) || 2026;
    const m = (parseInt(dPieces[1], 10) || 10) - 1;
    const d = parseInt(dPieces[2], 10) || 27;

    const tPieces = timePart.split(':');
    const hh = tPieces[0] || '00';
    const mm = tPieces[1] || '00';
    const ss = tPieces[2] || '00';

    return { y, m, d, hh, mm, ss };
  };

  const current = parseDateTime(value);
  const [viewYear, setViewYear] = useState(current.y);
  const [viewMonth, setViewMonth] = useState(current.m);
  const [selectedDay, setSelectedDay] = useState(current.d);
  const [hours, setHours] = useState(current.hh);
  const [minutes, setMinutes] = useState(current.mm);
  const [seconds, setSeconds] = useState(current.ss);

  // Sync internal state when external value changes
  useEffect(() => {
    const parsed = parseDateTime(value);
    setViewYear(parsed.y);
    setViewMonth(parsed.m);
    setSelectedDay(parsed.d);
    setHours(parsed.hh);
    setMinutes(parsed.mm);
    setSeconds(parsed.ss);
  }, [value]);

  // Click outside to close
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

  const emitDateTime = (y: number, m: number, d: number, hh: string, mm: string, ss: string) => {
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const hStr = String(hh).padStart(2, '0');
    const minStr = String(mm).padStart(2, '0');
    const sStr = String(ss).padStart(2, '0');
    onChange(`${y}-${mStr}-${dStr} ${hStr}:${minStr}:${sStr}`);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    emitDateTime(viewYear, viewMonth, day, hours, minutes, seconds);
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

  const handleQuickTime = (h: string, min: string, s: string) => {
    setHours(h);
    setMinutes(min);
    setSeconds(s);
    emitDateTime(viewYear, viewMonth, selectedDay, h, min, s);
  };

  // 生成單次顯示 30 天資料陣列 (1日 ~ 30日)
  const thirtyDaysList = useMemo(() => {
    const list: {
      dayNum: number;
      dateStr: string;
      weekdayStr: string;
      isWeekend: boolean;
    }[] = [];

    for (let day = 1; day <= 30; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const dayOfWeek = dateObj.getDay();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      list.push({
        dayNum: day,
        dateStr: `${viewYear}-${mStr}-${dStr}`,
        weekdayStr: weekdays[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return list;
  }, [viewYear, viewMonth]);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const calendarGridDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGridDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarGridDays.push(i);
  }

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Input / Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between border border-slate-300 rounded-md px-3 py-1.5 bg-white cursor-pointer hover:border-red-600 focus-within:border-red-600 shadow-2xs transition-colors"
      >
        <span className="font-mono text-xs font-medium text-slate-800 select-none truncate">
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1.5 text-red-600">
          <span className="text-[10px] font-bold px-1 py-0.2 bg-red-100 text-red-800 rounded">
            30天版
          </span>
          <CalendarIcon className="w-3.5 h-3.5" />
          <Clock className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* Popover Calendar + Time Selector: 單次顯示 30 天版本 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 w-[380px] sm:w-[410px] select-none animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-700 text-white">
                  單次顯示30天版本
                </span>
                <span className="font-bold text-sm text-slate-900">
                  民國 115 年 (2026) {monthNames[viewMonth]}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                單次呈現本期 1 ~ 30 天與精確時分秒
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 模式切換 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mb-2.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('THIRTY_DAYS')}
              className={`flex-1 py-1 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'THIRTY_DAYS'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3 h-3" />
              單次 30 天選盤
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MONTH_GRID')}
              className={`flex-1 py-1 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'MONTH_GRID'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              七曜月曆
            </button>
          </div>

          {/* 單次 30 天全量下拉選單 */}
          <div className="mb-2.5 p-2 bg-red-50/60 rounded-md border border-red-200">
            <select
              value={selectedDay}
              onChange={(e) => {
                const d = parseInt(e.target.value, 10);
                if (!isNaN(d)) handleSelectDay(d);
              }}
              className="w-full bg-white border border-red-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 outline-none focus:border-red-600 cursor-pointer"
            >
              {thirtyDaysList.map((item) => (
                <option key={item.dayNum} value={item.dayNum}>
                  第 {String(item.dayNum).padStart(2, '0')} 天 · {item.dateStr} (星期{item.weekdayStr})
                  {item.dayNum === 27 ? ' [今日]' : item.dayNum === 26 ? ' [昨日]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 主體日期區塊 */}
          {viewMode === 'THIRTY_DAYS' ? (
            <div className="mb-3">
              <div className="grid grid-cols-6 gap-1 text-center font-mono">
                {thirtyDaysList.map((item) => {
                  const sel = item.dayNum === selectedDay;
                  return (
                    <button
                      key={item.dayNum}
                      type="button"
                      onClick={() => handleSelectDay(item.dayNum)}
                      className={`py-1.5 px-0.5 rounded border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        sel
                          ? 'bg-red-700 text-white border-red-700 shadow-xs ring-2 ring-red-400'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-red-400 hover:bg-red-50/50'
                      }`}
                    >
                      <span className="text-xs font-extrabold leading-none">
                        {String(item.dayNum).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[9px] leading-none mt-0.5 ${
                          sel ? 'text-red-100' : item.isWeekend ? 'text-red-600 font-bold' : 'text-slate-400'
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
            <div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1">
                <span className="text-red-600">日</span>
                <span>一</span>
                <span>二</span>
                <span>三</span>
                <span>四</span>
                <span>五</span>
                <span className="text-red-600">六</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono mb-3">
                {calendarGridDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }
                  const isSel = day === selectedDay;
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-7 w-7 mx-auto rounded flex items-center justify-center transition-colors cursor-pointer text-xs font-bold ${
                        isSel
                          ? 'bg-red-700 text-white shadow-xs'
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

          {/* Time Picker Section (時 : 分 : 秒) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-600" /> 時間設定 (時:分:秒)
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickTime('00', '00', '00')}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  00:00:00
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTime('12', '00', '00')}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  12:00:00
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTime('23', '59', '59')}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  23:59:59
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-0.5">時</label>
                <select
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    emitDateTime(viewYear, viewMonth, selectedDay, e.target.value, minutes, seconds);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-mono font-bold text-slate-800 outline-none focus:border-red-600 cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                    <option key={h} value={h}>{h} 時</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-0.5">分</label>
                <select
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    emitDateTime(viewYear, viewMonth, selectedDay, hours, e.target.value, seconds);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-mono font-bold text-slate-800 outline-none focus:border-red-600 cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m} 分</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-0.5">秒</label>
                <select
                  value={seconds}
                  onChange={(e) => {
                    setSeconds(e.target.value);
                    emitDateTime(viewYear, viewMonth, selectedDay, hours, minutes, e.target.value);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-mono font-bold text-slate-800 outline-none focus:border-red-600 cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((s) => (
                    <option key={s} value={s}>{s} 秒</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-red-900 font-bold truncate max-w-[240px]">
              {value}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
