import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DateTimePicker } from '../components/common/DateTimePicker';

interface DeviceNotification {
  id: string;
  timestamp: string;
  deviceName: string;
  station: string;
  message: string;
  status: '正常' | '異常';
}

// 根據需求指示：TVM 只會顯示以下 5 種通報內容說明：
// 1. 票卡印表機缺紙
// 2. 票卡印表機異常
// 3. 收據印表機缺紙
// 4. 收據印表機異常
// 5. 系統斷線
const TVM_MESSAGES = [
  '票卡印表機缺紙',
  '票卡印表機異常',
  '收據印表機缺紙',
  '收據印表機異常',
  '系統斷線',
] as const;

// 預先生成 150 筆具備真實時間序列的現場設備通報資料
const generate150Notifications = (): DeviceNotification[] => {
  const list: DeviceNotification[] = [];
  const baseDate = '2026-10-27';

  // 150 筆時間間隔由 21:58:30 往前推至 08:05:10
  let currentSeconds = 21 * 3600 + 58 * 60 + 30;

  for (let i = 1; i <= 150; i++) {
    // 設備輪轉：Taipei-dome tvm1, Taipei-dome tvm2 (專屬於棒球博物館之機台)
    const deviceChoice = i % 2 === 1 ? 'Taipei-dome tvm1' : 'Taipei-dome tvm2';
    
    // TVM 通報內容說明嚴格限制在指定的 5 種之中
    const msgChoice = TVM_MESSAGES[(i - 1) % TVM_MESSAGES.length];

    // 狀態僅有「正常」與「異常」
    // 當前最新或特例狀態為異常，其餘在自檢恢復後或排查完畢後為正常
    const isAbnormal = i % 7 === 1 || i % 13 === 0;
    const status: '正常' | '異常' = isAbnormal ? '異常' : '正常';

    const h = Math.floor(currentSeconds / 3600);
    const m = Math.floor((currentSeconds % 3600) / 60);
    const s = currentSeconds % 60;

    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const idStr = `NOTIF-20261027-${String(151 - i).padStart(3, '0')}`;

    list.push({
      id: idStr,
      timestamp: `${baseDate} ${timeStr}`,
      deviceName: deviceChoice,
      station: '棒球博物館',
      message: msgChoice,
      status,
    });

    // 間隔約 4 ~ 6 分鐘一筆
    currentSeconds -= (280 + ((i * 17) % 75));
    if (currentSeconds < 8 * 3600) {
      currentSeconds = 8 * 3600 + (i % 60);
    }
  }

  return list;
};

const ALL_NOTIFICATIONS = generate150Notifications();

export const DashboardView: React.FC = () => {
  const [refreshTime, setRefreshTime] = useState(
    new Date().toLocaleTimeString('zh-TW', { hour12: false })
  );
  const [filterDevice, setFilterDevice] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  // 需求指示：起始時間與結束時間補上 calendar 功能用選的
  const [startDateTime, setStartDateTime] = useState<string>('2026-10-27 00:00:00');
  const [endDateTime, setEndDateTime] = useState<string>('2026-10-27 23:59:59');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 需求指示：分頁功能
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // 篩選通報訊息 (支援設備、狀態、起訖日時分秒、關鍵字)
  const filteredNotifications = useMemo(() => {
    return ALL_NOTIFICATIONS.filter((item) => {
      const matchDevice = filterDevice === 'ALL' || item.deviceName === filterDevice;
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchTime =
        (!startDateTime || item.timestamp >= startDateTime) &&
        (!endDateTime || item.timestamp <= endDateTime);
      const matchSearch =
        searchKeyword === '' ||
        item.deviceName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.message.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchDevice && matchStatus && matchTime && matchSearch;
    });
  }, [filterDevice, filterStatus, startDateTime, endDateTime, searchKeyword]);

  // 當篩選條件變動時自動回到第 1 頁
  useMemo(() => {
    setCurrentPage(1);
  }, [filterDevice, filterStatus, startDateTime, endDateTime, searchKeyword, pageSize]);

  // 分頁計算
  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, safeCurrentPage, pageSize]);

  const handleRefresh = () => {
    setRefreshTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
  };

  // 頁碼陣列生成
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 頂部標題區塊：純文字、遠雄巨蛋紅黑企業風格 */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border-b-4 border-red-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-wide">儀錶板</h1>
            <span className="text-sm bg-red-900 text-red-100 border border-red-700 px-3 py-1 rounded-md font-bold">
              臺灣棒球博物館
            </span>
          </div>
          <p className="text-base text-slate-300 font-medium mt-1.5">
            遠雄巨蛋股份有限公司 · 當日營運統計指標與現場設備通報狀態
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-slate-300 font-mono">
            <div>營業日期：2026/10/27</div>
            <div className="text-slate-400">數據更新時間：{refreshTime}</div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 active:bg-white active:text-black border border-transparent active:border-slate-400 text-white text-base font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            即時更新
          </button>
        </div>
      </div>

      {/* 核心 KPI 狀態數據卡片 (全純文字與數字排版，無任何 icon 示意圖) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. 當天統計進場人數 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-base font-bold text-slate-700 tracking-wide">
            當天統計進場人數
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              4,820 <span className="text-base font-bold text-slate-500">人次</span>
            </div>
          </div>
        </div>

        {/* 2. 當日總營收 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-base font-bold text-slate-700 tracking-wide">
            當日總營收
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-red-600 tracking-tight font-mono">
              <span className="text-xl font-bold text-red-700">NT$ </span>1,642,850
            </div>
          </div>
        </div>

        {/* 3. KIOSK 佔當日交易比例 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-base font-bold text-slate-700 tracking-wide">
            KIOSK 佔當日交易比例
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              64.2%
            </div>
          </div>
        </div>

        {/* 4. 機台上線率 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-base font-bold text-slate-700 tracking-wide">
            機台上線率
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-600 tracking-tight font-mono">
              100%
            </div>
          </div>
        </div>

        {/* 5. 通報次數 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-base font-bold text-slate-700 tracking-wide">
            通報次數
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              0 <span className="text-base font-bold text-slate-500">次</span>
            </div>
          </div>
        </div>
      </div>

      {/* 設備通報訊息 統整 (150 筆資料，支援分頁與 Calendar 起訖時間選擇) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 表格頂部過濾與控制工具列 */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-wide">
                設備通報訊息 統整
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                即時彙整現場機台 (Taipei-dome tvm1, Taipei-dome tvm2) 通報紀錄（通報內容僅限：票卡印表機缺紙、票卡印表機異常、收據印表機缺紙、收據印表機異常、系統斷線）
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">每頁顯示：</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-red-600 cursor-pointer"
              >
                <option value={10}>10 筆</option>
                <option value={15}>15 筆</option>
                <option value={25}>25 筆</option>
                <option value={50}>50 筆</option>
              </select>
            </div>
          </div>

          {/* 查詢條件區：起訖日期 (Calendar 功能用選的)、設備、狀態、關鍵字 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
            {/* 起始時間 (Calendar 選取) */}
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

            {/* 結束時間 (Calendar 選取) */}
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

            {/* 設備篩選 (所屬站別僅棒球博物館，機台為 Taipei-dome tvm1, tvm2) */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap text-xs">設備：</span>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-red-600 cursor-pointer w-full"
              >
                <option value="ALL">全部設備</option>
                <option value="Taipei-dome tvm1">Taipei-dome tvm1</option>
                <option value="Taipei-dome tvm2">Taipei-dome tvm2</option>
              </select>
            </div>

            {/* 狀態篩選：只有正常與異常 */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap text-xs">狀態：</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-red-600 cursor-pointer w-full"
              >
                <option value="ALL">全部狀態</option>
                <option value="正常">正常</option>
                <option value="異常">異常</option>
              </select>
            </div>

            {/* 關鍵字搜尋 */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="搜尋通報內容說明..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-red-600 w-full"
              >
              </input>
            </div>
          </div>

          {(filterDevice !== 'ALL' || filterStatus !== 'ALL' || searchKeyword !== '' || startDateTime !== '2026-10-27 00:00:00' || endDateTime !== '2026-10-27 23:59:59') && (
            <div className="mt-2.5 text-right">
              <button
                onClick={() => {
                  setFilterDevice('ALL');
                  setFilterStatus('ALL');
                  setStartDateTime('2026-10-27 00:00:00');
                  setEndDateTime('2026-10-27 23:59:59');
                  setSearchKeyword('');
                }}
                className="text-xs text-red-700 hover:text-red-900 font-bold underline cursor-pointer"
              >
                清除篩選條件
              </button>
            </div>
          )}
        </div>

        {/* 設備通報數據表格 (已移除通報類別與通報編號，狀態僅有正常與異常) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold text-sm uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">通報時間</th>
                <th className="px-5 py-3.5 whitespace-nowrap">設備名稱</th>
                <th className="px-5 py-3.5 whitespace-nowrap">所屬站別</th>
                <th className="px-5 py-3.5">通報內容說明</th>
                <th className="px-5 py-3.5 text-center whitespace-nowrap">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-bold text-base">
                    無符合篩選條件的設備通報紀錄
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm text-slate-600 whitespace-nowrap font-bold">
                      {notif.timestamp}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {notif.deviceName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap font-semibold">
                      {notif.station}
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 text-base font-bold">
                      {notif.message}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`text-xs px-3 py-1 rounded font-bold ${
                          notif.status === '正常'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {notif.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 需求指示：分頁控制器與底部資訊列 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-700 font-semibold">
          <div>
            顯示通報紀錄：第 <span className="font-mono font-bold text-slate-900">{(safeCurrentPage - 1) * pageSize + 1}</span> 至{' '}
            <span className="font-mono font-bold text-slate-900">
              {Math.min(safeCurrentPage * pageSize, totalItems)}
            </span>{' '}
            筆，共 <span className="font-mono font-bold text-red-800">{totalItems}</span> 筆 (資料庫全日累計 {ALL_NOTIFICATIONS.length} 筆)
          </div>

          {/* 分頁按鈕 */}
          <div className="flex items-center gap-1.5 select-none">
            {/* 第一頁 */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
              title="第一頁"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* 上一頁 */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold text-slate-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> 上一頁
            </button>

            {/* 頁碼按鈕 */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pg, idx) => {
                if (pg === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                      ...
                    </span>
                  );
                }
                const isCurrent = pg === safeCurrentPage;
                return (
                  <button
                    key={`page-${pg}`}
                    type="button"
                    onClick={() => setCurrentPage(pg as number)}
                    className={`min-w-8 h-8 px-2 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>

            {/* 下一頁 */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold text-slate-700 flex items-center gap-1"
            >
              下一頁 <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* 最後一頁 */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
              title="最後一頁"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
