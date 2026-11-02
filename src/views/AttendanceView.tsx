import React, { useState } from 'react';
import {
  Search,
  Users,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
} from 'lucide-react';
import { ATTENDANCE_MOCK, EXHIBITION_OPTIONS } from '../data/mockData';
import { AttendanceRecord, ExhibitionType } from '../types';
import { exportToCsv, exportToExcel } from '../utils/exportCsv';
import { CalendarPicker } from '../components/common/CalendarPicker';

export const AttendanceView: React.FC = () => {
  // 查詢篩選（需求 9: 日曆選取，需求 15: 展覽）
  const [startDate, setStartDate] = useState('2026/10/01');
  const [endDate, setEndDate] = useState('2026/10/26');
  const [selectedExhibition, setSelectedExhibition] = useState('ALL');

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(ATTENDANCE_MOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleQuery = () => {
    setIsLoading(true);
    setTimeout(() => {
      let result = [...ATTENDANCE_MOCK];
      if (selectedExhibition !== 'ALL') {
        result = result.filter((item) => item.exhibition === selectedExhibition);
      }
      setAttendanceList(result);
      setIsLoading(false);
      setToastMsg('人數統計報表已與大巨蛋閘門感應核銷系統即時同步完成');
      setTimeout(() => setToastMsg(''), 3000);
    }, 300);
  };

  // 需求 11: 下載報表 CSV 與 Excel 分成兩個按鈕
  const getAttendanceExportData = () => {
    const headers = [
      '參觀日期',
      '展覽項目',
      '入場時段',
      '全票(人)',
      '優待票(人)',
      '團體票(人)',
      '愛心票(人)',
      '參觀總人次',
      '已驗票入場數',
      '核銷率(%)'
    ];

    const rows = attendanceList.map((item) => [
      item.date,
      item.exhibition,
      item.timeSlot,
      item.adultCount,
      item.concessionCount,
      item.groupCount,
      item.disabilityCount,
      item.totalVisitors,
      item.verifiedCount,
      `${item.verificationRate}%`
    ]);

    return { headers, rows };
  };

  const handleExportCsv = () => {
    const { headers, rows } = getAttendanceExportData();
    exportToCsv('大巨蛋棒球博物館_入場人數統計報表', headers, rows);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getAttendanceExportData();
    exportToExcel('大巨蛋棒球博物館_入場人數統計報表', headers, rows);
  };

  const totalVisitorsSum = attendanceList.reduce((acc, curr) => acc + curr.totalVisitors, 0);
  const totalVerifiedSum = attendanceList.reduce((acc, curr) => acc + curr.verifiedCount, 0);
  const avgVerificationRate = ((totalVerifiedSum / totalVisitorsSum) * 100).toFixed(1);

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toastMsg && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">累計參觀預約人次</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {totalVisitorsSum.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 font-bold">人次</span>
          </div>
          <span className="text-xs text-red-700 mt-1 font-semibold block">常設展與特展穩定參觀</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">閘門實名核銷入場人次</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold font-mono text-red-800 tracking-tight">
              {totalVerifiedSum.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 font-bold">人次</span>
          </div>
          <span className="text-xs text-red-700 mt-1 font-semibold block">平均核銷到場率 {avgVerificationRate}%</span>
        </div>
      </div>

      {/* 查詢條件區塊 (需求 9: 日曆選取，需求 15: 展覽) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢條件
          </h2>
          <span className="text-xs text-slate-500">
            整合大巨蛋 1~8 號數位驗票閘門即時感應資料
          </span>
        </div>

        <div className="p-6 space-y-5 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* 起始日期 */}
            <div className="md:col-span-3 flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-20">
                起始日期
              </label>
              <div className="flex-1">
                <CalendarPicker
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 結束日期 */}
            <div className="md:col-span-3 flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-20">
                結束日期
              </label>
              <div className="flex-1">
                <CalendarPicker
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 展覽 */}
            <div className="md:col-span-6 flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-16">
                展覽
              </label>
              <select
                value={selectedExhibition}
                onChange={(e) => setSelectedExhibition(e.target.value)}
                className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-sm font-semibold focus:border-red-600 outline-none bg-white truncate shadow-2xs"
              >
                {EXHIBITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 按鈕列 (查詢右邊無多餘匯出按鈕，統一於報表表格標題處下載) */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuery}
              disabled={isLoading}
              className="px-7 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer text-sm"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>查詢報表</span>
            </button>
          </div>
        </div>
      </div>

      {/* 查詢結果表格 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢結果
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              下載 CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              匯出 Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">參觀日期</th>
                <th className="px-4 py-3 whitespace-nowrap">展覽項目</th>
                <th className="px-4 py-3 whitespace-nowrap">入場時段</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">全票</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">優待票</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">團體票</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">愛心票</th>
                <th className="px-4 py-3 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">參觀總人次</th>
                <th className="px-4 py-3 text-right whitespace-nowrap text-emerald-700 font-bold">核銷入場數</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">核銷率</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-sm">
              {attendanceList.map((rec) => (
                <tr key={rec.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900 font-sans">
                    {rec.date}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-sans font-bold text-slate-800">
                    {rec.exhibition}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-sans">
                    {rec.timeSlot}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    {rec.adultCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    {rec.concessionCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-purple-700 font-semibold">
                    {rec.groupCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-500">
                    {rec.disabilityCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-red-950 bg-red-50/60 tabular-nums text-base">
                    {rec.totalVisitors.toLocaleString()} 人
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-emerald-800 tabular-nums">
                    {rec.verifiedCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center text-emerald-800 font-bold">
                    {rec.verificationRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部總計列 */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-sm font-bold text-slate-800">
          <span>統計清單跨展區加總人次</span>
          <div className="flex items-center gap-8 font-mono">
            <span>全票：{attendanceList.reduce((acc, curr) => acc + curr.adultCount, 0)} 人</span>
            <span>優待：{attendanceList.reduce((acc, curr) => acc + curr.concessionCount, 0)} 人</span>
            <span>團體：{attendanceList.reduce((acc, curr) => acc + curr.groupCount, 0)} 人</span>
            <span className="text-red-900 text-base font-extrabold">
              總人次：{totalVisitorsSum.toLocaleString()} 人
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
