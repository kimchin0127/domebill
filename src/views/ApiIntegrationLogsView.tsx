import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  Download,
  Eye,
  X,
  Copy,
  CheckCircle2,
  AlertOctagon,
  Info,
} from 'lucide-react';
import { ApiLogEntry } from '../types';
import { INITIAL_API_LOGS } from '../data/mockData';
import { DateTimePicker } from '../components/common/DateTimePicker';

export const ApiIntegrationLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ApiLogEntry[]>(INITIAL_API_LOGS);
  const [systemFilter, setSystemFilter] = useState<'ALL' | 'ORACLE_JDE' | 'FARGLORY_FINANCE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [startDateTime, setStartDateTime] = useState<string>('2026-10-27 00:00:00');
  const [endDateTime, setEndDateTime] = useState<string>('2026-10-27 23:59:59');
  const [keyword, setKeyword] = useState('');

  // Selected Log for Modal
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // In-app Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 介接系統：全部、JDE、財務系統
      if (systemFilter !== 'ALL' && log.system !== systemFilter) {
        return false;
      }
      // 執行狀態：全部、正常 (200/202)、異常 (>=400)
      if (statusFilter === 'SUCCESS' && log.status >= 400) {
        return false;
      }
      if (statusFilter === 'ERROR' && log.status < 400) {
        return false;
      }
      // 起訖日期 日時分秒
      if (startDateTime && log.timestamp < startDateTime) {
        return false;
      }
      if (endDateTime && log.timestamp > endDateTime + '.999') {
        return false;
      }
      // 關鍵字
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        const matchEndpoint = log.endpoint.toLowerCase().includes(q);
        const matchTrace = log.traceId.toLowerCase().includes(q);
        const matchSystem = (log.system === 'ORACLE_JDE' ? 'jde' : '財務系統').includes(q);
        if (!matchEndpoint && !matchTrace && !matchSystem) {
          return false;
        }
      }
      return true;
    });
  }, [logs, systemFilter, statusFilter, startDateTime, endDateTime, keyword]);

  // Handle Manual Retry Simulation
  const handleRetryPush = (logId: string) => {
    const target = logs.find((l) => l.id === logId);
    if (!target) return;

    showToast('info', `正在重新下發 API 拋轉指令 (Trace: ${target.traceId})...`);

    setTimeout(() => {
      setLogs((prev) =>
        prev.map((item) => {
          if (item.id === logId) {
            return {
              ...item,
              status: 200,
              statusText: 'OK',
              latency: 280,
              canRetry: false,
              responseData: {
                headers: { 'Content-Type': 'application/json' },
                body: {
                  statusCode: 200,
                  message: 'RETRY_SUCCESS',
                  settledAt: new Date().toISOString(),
                  voucherNo: 'VOU-RETRY-' + Math.floor(1000 + Math.random() * 9000),
                },
              },
            };
          }
          return item;
        })
      );

      if (selectedLog && selectedLog.id === logId) {
        setSelectedLog((prev) =>
          prev
            ? {
                ...prev,
                status: 200,
                statusText: 'OK',
                latency: 280,
                canRetry: false,
              }
            : null
        );
      }

      showToast('success', '重新拋轉成功！遠雄財務系統已成功入帳。');
    }, 1000);
  };

  // Export Audit Log CSV
  const handleExportCsv = () => {
    const headers = [
      '記錄編號',
      'Trace ID',
      '調用時間',
      '介接系統',
      '介接端點',
      '請求方法',
      'HTTP狀態碼',
      '執行狀態',
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.traceId,
      l.timestamp,
      l.system === 'ORACLE_JDE' ? 'JDE' : '財務系統',
      l.endpoint,
      l.method,
      `${l.status} ${l.statusText}`,
      l.status < 400 ? '正常' : '異常',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `外部API介接管理_日誌_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', '已成功匯出外部 API 介接管理日誌 CSV');
  };

  // Copy JSON helper
  const handleCopyJson = (data: any, title: string) => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        showToast('success', `已成功複製 ${title} JSON 內容至剪貼簿！`);
      })
      .catch(() => {
        showToast('error', '複製失敗，請手動選取文字');
      });
  };

  const handleResetFilters = () => {
    setSystemFilter('ALL');
    setStatusFilter('ALL');
    setStartDateTime('2026-10-27 00:00:00');
    setEndDateTime('2026-10-27 23:59:59');
    setKeyword('');
    showToast('info', '篩選條件已重置');
  };

  return (
    <div className="space-y-6">
      {/* 浮動 Toast 提示 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold border transition-all animate-in fade-in slide-in-from-bottom-2 bg-slate-900 text-white border-slate-700">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === 'error' && <AlertOctagon className="w-5 h-5 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 頂部標題面板：外部API介接管理 */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border-b-4 border-red-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-wide">外部API介接管理</h1>
          <p className="text-base text-slate-300 font-medium mt-1.5">
            遠雄巨蛋臺灣棒球博物館 · 外部系統 (JDE ERP / 遠雄財務系統) API 介接與連線紀錄
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLogs([...INITIAL_API_LOGS]);
              showToast('success', 'API 介接紀錄已重新整理');
            }}
            className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCw className="w-4 h-4" />
            <span>重新整理日誌</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>匯出 CSV</span>
          </button>
        </div>
      </div>

      {/* 查詢條件區塊 (起訖日期 日時分秒、介接系統、執行狀態、關鍵字) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢條件
          </h2>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
          >
            清空條件
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
          {/* 起始日時分秒 (支援日曆選擇) */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap text-xs w-20">起始時間：</span>
            <div className="flex-1 min-w-0">
              <DateTimePicker
                value={startDateTime}
                onChange={(dt) => setStartDateTime(dt)}
                placeholder="YYYY-MM-DD HH:mm:ss"
              />
            </div>
          </div>

          {/* 結束日時分秒 (支援日曆選擇) */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap text-xs w-20">結束時間：</span>
            <div className="flex-1 min-w-0">
              <DateTimePicker
                value={endDateTime}
                onChange={(dt) => setEndDateTime(dt)}
                placeholder="YYYY-MM-DD HH:mm:ss"
              />
            </div>
          </div>

          {/* 介接系統 下拉選單：全部、JDE、財務系統 */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <span className="font-bold text-slate-700 whitespace-nowrap text-xs">介接系統：</span>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-red-600 cursor-pointer w-full"
            >
              <option value="ALL">全部</option>
              <option value="ORACLE_JDE">JDE</option>
              <option value="FARGLORY_FINANCE">財務系統</option>
            </select>
          </div>

          {/* 執行狀態 下拉選單：全部、正常、異常 */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <span className="font-bold text-slate-700 whitespace-nowrap text-xs">執行狀態：</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-red-600 cursor-pointer w-full"
            >
              <option value="ALL">全部</option>
              <option value="SUCCESS">正常</option>
              <option value="ERROR">異常</option>
            </select>
          </div>

          {/* 關鍵字搜尋 */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋端點或Trace ID..."
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-red-600 w-full"
            />
          </div>
        </div>
      </div>

      {/* API 介接管理日誌數據表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            API 介接傳輸紀錄
          </h2>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-200 text-slate-800 font-bold font-mono">
            共 {filteredLogs.length} 筆
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-800 font-bold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">調用時間戳記</th>
                <th className="py-3 px-4 whitespace-nowrap">介接系統</th>
                <th className="py-3 px-4">介接端點 (Endpoint & Method)</th>
                <th className="py-3 px-4 whitespace-nowrap">HTTP 狀態碼</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">執行狀態</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">檢視</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    無符合條件的 API 介接紀錄
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isNormal = log.status < 400;
                  const systemLabel = log.system === 'ORACLE_JDE' ? 'JDE' : '財務系統';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 調用時間戳記 */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div className="font-bold">{log.timestamp}</div>
                        <div className="text-xs text-slate-400">{log.traceId}</div>
                      </td>

                      {/* 介接系統 */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900">
                          {systemLabel}
                        </span>
                      </td>

                      {/* 介接端點 */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              log.method === 'GET'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-slate-800 font-bold truncate max-w-md block" title={log.endpoint}>
                            {log.endpoint}
                          </span>
                        </div>
                      </td>

                      {/* HTTP 狀態碼 */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border ${
                            isNormal
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {log.status} {log.statusText}
                        </span>
                      </td>

                      {/* 執行狀態: 正常 / 異常 */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-bold border ${
                            isNormal
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {isNormal ? '正常' : '異常'}
                        </span>
                      </td>

                      {/* 需求指示：檢視 payload 要改為 檢視 並且歸類在新的欄位名稱檢視 */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                          title="檢視 API Request / Response 完整 Payload"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>檢視</span>
                        </button>
                      </td>

                      {/* 需求指示：操作僅可以針對異常的部分顯示手動更新 */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {!isNormal ? (
                          <button
                            type="button"
                            onClick={() => handleRetryPush(log.id)}
                            className="px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            title="針對異常記錄執行手動重新更新拋轉"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-red-600" />
                            <span>手動更新</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs select-none">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細資訊抽屜/彈窗 (Payload Details Modal) */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedLog.system === 'ORACLE_JDE' ? 'JDE' : '財務系統'} API 呼叫明細</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                      selectedLog.status >= 400
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedLog.status} {selectedLog.statusText}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Trace ID: {selectedLog.traceId} | Log ID: {selectedLog.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
              {/* 概要表格 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">請求端點</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{selectedLog.endpoint}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">請求方法</span>
                  <span className="font-mono font-bold text-red-700">{selectedLog.method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">調用時間</span>
                  <span className="font-mono text-slate-700">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">狀態</span>
                  <span className="font-bold text-slate-800">{selectedLog.status < 400 ? '正常' : '異常'}</span>
                </div>
              </div>

              {/* Request Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    HTTP Request (Headers & Body)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyJson(selectedLog.requestData, 'Request')}
                    className="text-xs text-slate-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> 複製 Request JSON
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-200 overflow-x-auto max-h-48 rounded-b-xl">
                  <code>{JSON.stringify(selectedLog.requestData, null, 2)}</code>
                </pre>
              </div>

              {/* Response Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    HTTP Response (Headers & Body)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyJson(selectedLog.responseData, 'Response')}
                    className="text-xs text-slate-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> 複製 Response JSON
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-200 overflow-x-auto max-h-56 rounded-b-xl">
                  <code>{JSON.stringify(selectedLog.responseData, null, 2)}</code>
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">系統調用審計紀錄</span>
              <div className="flex items-center gap-2">
                {selectedLog.canRetry && (
                  <button
                    type="button"
                    onClick={() => handleRetryPush(selectedLog.id)}
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> 手動更新
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
