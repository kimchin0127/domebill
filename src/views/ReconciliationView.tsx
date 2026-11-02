import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  Printer,
  Search,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { CASHIER_SHIFTS_MOCK } from '../data/mockData';
import { CashierReconciliationShift } from '../types';
import { exportToCsv, exportToExcel } from '../utils/exportCsv';
import { CalendarPicker } from '../components/common/CalendarPicker';

export const ReconciliationView: React.FC = () => {
  // 需求 3: 新增搜尋條件 票務人員 搜尋欄位 營業日期起迄
  const [startDate, setStartDate] = useState('2026/10/25');
  const [endDate, setEndDate] = useState('2026/10/26');
  const [cashierQuery, setCashierQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [shifts, setShifts] = useState<CashierReconciliationShift[]>(CASHIER_SHIFTS_MOCK);
  const [filteredShifts, setFilteredShifts] = useState<CashierReconciliationShift[]>(CASHIER_SHIFTS_MOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      let result = [...shifts];
      if (startDate) {
        result = result.filter((s) => s.date >= startDate);
      }
      if (endDate) {
        result = result.filter((s) => s.date <= endDate);
      }
      if (cashierQuery.trim()) {
        const q = cashierQuery.trim().toLowerCase();
        result = result.filter(
          (s) =>
            s.cashierName.toLowerCase().includes(q) ||
            s.posTerminal.toLowerCase().includes(q) ||
            s.shiftId.toLowerCase().includes(q)
        );
      }
      if (selectedStatus !== 'ALL') {
        result = result.filter((s) => s.status === selectedStatus);
      }
      setFilteredShifts(result);
      setIsLoading(false);
      setToast(`檢索完成：共找到 ${result.length} 筆日交班結帳清單`);
      setTimeout(() => setToast(''), 3000);
    }, 250);
  };

  const handleReset = () => {
    setStartDate('2026/10/25');
    setEndDate('2026/10/26');
    setCashierQuery('');
    setSelectedStatus('ALL');
    setFilteredShifts(shifts);
  };

  const getReconciliationExportData = () => {
    const headers = [
      '結帳班次編號',
      '營業日期',
      '售票機台終端',
      '經辦票務人員',
      '開櫃週轉零錢(元)',
      '系統結算現金營業額(元)',
      '實清繳現金總額(元)',
      '現金差額(元)',
      'KIOSK刷卡總額(元)',
      'POS刷卡總額(元)',
      '悠遊卡總額(元)',
      'TWQR總額(元)',
      '覆核狀態'
    ];

    const rows = filteredShifts.map((s) => [
      s.shiftId,
      s.date,
      s.posTerminal,
      s.cashierName,
      s.openingCash,
      s.systemCashSales,
      s.actualCashTurnIn,
      s.variance,
      s.kioskCardTotal,
      s.posCardTotal,
      s.easyCardTotal,
      s.twqrTotal,
      s.status
    ]);

    return { headers, rows };
  };

  const handleExportCsv = () => {
    const { headers, rows } = getReconciliationExportData();
    exportToCsv('大巨蛋棒球博物館_日交班結帳總表', headers, rows);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getReconciliationExportData();
    exportToExcel('大巨蛋棒球博物館_日交班結帳總表', headers, rows);
  };

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toast && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 需求 3: 標題改為 日交班結帳 */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-red-700" />
            日交班結帳
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            提供每日各售票機台與現場票亭交班結帳、週轉金盤點與各支付清算勾稽
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            列印日交班表
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-red-300" />
            下載 CSV 報表
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            匯出 Excel 報表
          </button>
        </div>
      </div>

      {/* 需求 3: 新增搜尋條件 票務人員 搜尋欄位 營業日期起迄 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢條件
          </h3>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
          >
            清空條件
          </button>
        </div>

        {/* 欄位左側絕對對齊佈局 */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* 營業日期起 */}
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-xs font-bold text-slate-800 text-left">
                營業日期(起)
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 營業日期訖 */}
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-xs font-bold text-slate-800 text-left">
                營業日期(訖)
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 票務人員搜尋欄位 */}
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-xs font-bold text-slate-800 text-left">
                票務人員
              </label>
              <input
                type="text"
                value={cashierQuery}
                onChange={(e) => setCashierQuery(e.target.value)}
                placeholder="輸入票務人員姓名或機台代號"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            {/* 覆核狀態 */}
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-xs font-bold text-slate-800 text-left">
                覆核狀態
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3 py-2 text-sm font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                <option value="ALL">全部狀態</option>
                <option value="已覆核">已覆核</option>
                <option value="待覆核">待覆核</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="px-7 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer text-sm"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>查詢</span>
            </button>
          </div>
        </div>
      </div>

      {/* 班次清算表格 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            交班資料明細
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              下載 CSV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              匯出 Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">班次編號</th>
                <th className="px-4 py-3 whitespace-nowrap">營業日期</th>
                <th className="px-4 py-3 whitespace-nowrap">機台終端</th>
                <th className="px-4 py-3 whitespace-nowrap">經辦人員</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">開櫃週轉金</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">系統現金銷額</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">實清繳現金</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">現金差額</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">KIOSK刷卡</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">POS刷卡</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">悠遊卡小計</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">TWQR小計</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-sm">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400 font-sans">
                    查無符合條件之交班結帳記錄
                  </td>
                </tr>
              ) : (
                filteredShifts.map((s) => (
                  <tr key={s.shiftId} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-red-800 whitespace-nowrap">
                      {s.shiftId}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-slate-700 whitespace-nowrap">
                      {s.date}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-slate-900 font-bold whitespace-nowrap">
                      {s.posTerminal}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-slate-700 whitespace-nowrap">
                      {s.cashierName}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-500 whitespace-nowrap">
                      ${s.openingCash.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      ${s.systemCashSales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-extrabold text-red-950 bg-red-50/40 whitespace-nowrap">
                      ${s.actualCashTurnIn.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-bold text-emerald-800 whitespace-nowrap">
                      ${s.variance}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                      ${s.kioskCardTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                      ${s.posCardTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                      ${s.easyCardTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                      ${s.twqrTotal.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 需求 3: 金流防弊與實體機台查驗機制與遠雄巨蛋會計系統介接規格已全部依指示移除 */}
    </div>
  );
};
