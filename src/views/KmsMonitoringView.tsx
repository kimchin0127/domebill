import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  Server,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { KmsDevice } from '../types';
import { INITIAL_KMS_DEVICES, KMS_STATION_OPTIONS } from '../data/mockData';

/**
 * 綠色連線信號圖示 (完全復刻 image_452b35b5.png 的連線狀態圖示)
 */
const SignalStrengthIcon: React.FC<{ status: 'ONLINE' | 'OFFLINE' | 'WEAK' }> = ({ status }) => {
  if (status === 'OFFLINE') {
    return (
      <div className="flex items-end gap-1 h-5 cursor-help" title="連線中斷 (離線)">
        <div className="w-1.5 h-1.5 rounded-xs bg-slate-300" />
        <div className="w-1.5 h-2.5 rounded-xs bg-slate-300" />
        <div className="w-1.5 h-3.5 rounded-xs bg-slate-300" />
        <div className="w-1.5 h-5 rounded-xs bg-slate-300" />
      </div>
    );
  }

  if (status === 'WEAK') {
    return (
      <div className="flex items-end gap-1 h-5 cursor-help" title="信號偏弱">
        <div className="w-1.5 h-1.5 rounded-xs bg-amber-500" />
        <div className="w-1.5 h-2.5 rounded-xs bg-amber-500" />
        <div className="w-1.5 h-3.5 rounded-xs bg-slate-300" />
        <div className="w-1.5 h-5 rounded-xs bg-slate-300" />
      </div>
    );
  }

  // 正常在線 (4格全滿綠色，如同 image_452b35b5.png)
  return (
    <div className="flex items-end gap-1 h-5 cursor-help" title="連線正常 (極佳訊號)">
      <div className="w-1.5 h-2 rounded-xs bg-emerald-500" />
      <div className="w-1.5 h-3 rounded-xs bg-emerald-500" />
      <div className="w-1.5 h-4 rounded-xs bg-emerald-500" />
      <div className="w-1.5 h-5 rounded-xs bg-emerald-500" />
    </div>
  );
};

export const KmsMonitoringView: React.FC = () => {
  const [devices, setDevices] = useState<KmsDevice[]>(INITIAL_KMS_DEVICES);
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [deviceNameQuery, setDeviceNameQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ station: 'ALL', query: '' });

  // 提示訊息
  const [toastMessage, setToastMessage] = useState('');

  // 模態視窗狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<KmsDevice | null>(null);

  // 表單資料
  const [formStation, setFormStation] = useState('棒球博物館');
  const [formDeviceName, setFormDeviceName] = useState('');
  const [formDeviceCode, setFormDeviceCode] = useState('');

  // 刪除確認
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 執行查詢
  const handleSearch = () => {
    setAppliedFilters({
      station: selectedStation,
      query: deviceNameQuery.trim(),
    });
    setToastMessage('已更新機台列表查詢結果');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 重設查詢
  const handleReset = () => {
    setSelectedStation('ALL');
    setDeviceNameQuery('');
    setAppliedFilters({ station: 'ALL', query: '' });
  };

  // 開啟新增機台彈窗
  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormStation('棒球博物館');
    setFormDeviceName('');
    setFormDeviceCode('');
    setIsModalOpen(true);
  };

  // 開啟編輯機台彈窗
  const handleOpenEditModal = (device: KmsDevice) => {
    setEditingDevice(device);
    setFormStation(device.station);
    setFormDeviceName(device.deviceName);
    setFormDeviceCode(device.deviceCode);
    setIsModalOpen(true);
  };

  // 儲存機台 (新增或更新)
  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeviceName.trim() || !formDeviceCode.trim()) {
      alert('請填寫機台名稱與機台編號');
      return;
    }

    if (editingDevice) {
      // 編輯
      setDevices((prev) =>
        prev.map((d) =>
          d.id === editingDevice.id
            ? {
                ...d,
                station: formStation,
                deviceName: formDeviceName.trim(),
                deviceCode: formDeviceCode.trim(),
              }
            : d
        )
      );
      setToastMessage(`機台「${formDeviceName}」資料已更新`);
    } else {
      // 新增 (隨機生成標準 UUID 作為 KioskID)
      const randomUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      const newDevice: KmsDevice = {
        id: `KMS-${Date.now()}`,
        station: formStation,
        kioskId: randomUuid,
        deviceName: formDeviceName.trim(),
        deviceCode: formDeviceCode.trim(),
        signalStatus: 'ONLINE',
        ipAddress: '192.168.20.' + (Math.floor(Math.random() * 80) + 100),
        lastHeartbeat: '剛剛連線',
      };

      setDevices((prev) => [newDevice, ...prev]);
      setToastMessage(`成功新增機台「${formDeviceName}」`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 刪除機台
  const handleDeleteDevice = (id: string, name: string) => {
    if (window.confirm(`確定要將機台「${name}」從監控清單中移除嗎？`)) {
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setToastMessage(`機台「${name}」已成功移除`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // 依據篩選條件過濾
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (appliedFilters.station !== 'ALL' && device.station !== appliedFilters.station) {
        return false;
      }
      if (appliedFilters.query) {
        const q = appliedFilters.query.toLowerCase();
        const matchName = device.deviceName.toLowerCase().includes(q);
        const matchCode = device.deviceCode.toLowerCase().includes(q);
        const matchId = device.kioskId.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [devices, appliedFilters]);

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toastMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3.5 rounded-lg text-base font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 頂部深色/紅色系幾何飾板 (復刻 image_452b35b5.png 頂部「機台基本資料管理」) */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white rounded-xl p-6 shadow-md border-b-4 border-red-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <Server className="w-7 h-7 text-red-400" />
            機台基本資料管理
          </h1>
          <p className="text-sm text-slate-300 font-medium mt-1">
            遠雄巨蛋與臺灣棒球博物館 · KIOSK自助售票機與POS終端機即時通訊心跳監控
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 border border-red-800/50 px-4 py-2 rounded-lg text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans font-bold text-slate-200">在線總機台：</span>
            <span className="text-emerald-400 font-extrabold text-base">{devices.length} 台</span>
          </div>
        </div>
      </div>

      {/* 區塊 1: 查詢條件 (完全對齊 image_452b35b5.png) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl leading-none">|</span>
            查詢條件
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 items-center">
            {/* 所屬站別 */}
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                所屬站別
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs cursor-pointer"
              >
                {KMS_STATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 機台名稱 */}
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                機台名稱
              </label>
              <input
                type="text"
                value={deviceNameQuery}
                onChange={(e) => setDeviceNameQuery(e.target.value)}
                placeholder="請輸入機台名稱或編號"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* 查詢按鈕 (完全對齊 image_452b35b5.png 左側位置) */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="px-8 py-2.5 rounded-md bg-red-700 hover:bg-red-800 text-white font-bold text-base transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              查詢
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-base transition-colors cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 區塊 2: 機台列表 (完全對齊 image_452b35b5.png) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* 標題與新增機台按鈕 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl leading-none">|</span>
            機台列表
          </h2>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2 rounded-md bg-red-700 hover:bg-red-800 text-white font-bold text-base flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + 新增機台
          </button>
        </div>

        {/* 機台表格 (對齊 image_452b35b5.png 的 6 個欄位) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200">
            <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700 select-none">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap text-center w-28">連線狀態</th>
                <th className="px-6 py-4 whitespace-nowrap w-48">所屬站別</th>
                <th className="px-6 py-4 whitespace-nowrap">KioskID</th>
                <th className="px-6 py-4 whitespace-nowrap">機台名稱</th>
                <th className="px-6 py-4 whitespace-nowrap">機台編號</th>
                <th className="px-6 py-4 text-center whitespace-nowrap w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-800 text-base">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    查無符合條件之機台設備資料
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-red-50/20 transition-colors">
                    {/* 連線狀態 (綠色連線圖示) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center">
                        <SignalStrengthIcon status={device.signalStatus} />
                      </div>
                    </td>

                    {/* 所屬站別 */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {device.station}
                    </td>

                    {/* KioskID (UUID 字串) */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 text-sm sm:text-base">
                      {device.kioskId}
                    </td>

                    {/* 機台名稱 */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {device.deviceName}
                    </td>

                    {/* 機台編號 */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-red-900">
                      {device.deviceCode}
                    </td>

                    {/* Action (鉛筆修改圖示、垃圾桶刪除圖示) */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(device)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="編輯機台資料"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(device.id, device.deviceName)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
                          title="刪除機台"
                        >
                          <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 底部說明 */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-xs sm:text-sm font-bold text-slate-600 flex justify-between items-center">
          <span>共顯示 {filteredDevices.length} 台機台設備</span>
          <span className="font-mono text-slate-500">KMS 通訊協定版本：v2.4.0 · 每 15 秒同步連線狀態</span>
        </div>
      </div>

      {/* 新增 / 編輯機台彈窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-red-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Server className="w-5 h-5 text-red-400" />
                {editingDevice ? '編輯機台設備資料' : '新增機台設備'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  所屬站別 <span className="text-red-600">*</span>
                </label>
                <select
                  value={formStation}
                  onChange={(e) => setFormStation(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3.5 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white cursor-pointer"
                >
                  <option value="棒球博物館">棒球博物館</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  機台名稱 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDeviceName}
                  onChange={(e) => setFormDeviceName(e.target.value)}
                  placeholder="例如：Taipei-dome tvm1 或 Taipei-dome tvm2"
                  className="w-full border border-slate-300 rounded-md px-3.5 py-2.5 text-base focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  機台編號 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDeviceCode}
                  onChange={(e) => setFormDeviceCode(e.target.value)}
                  placeholder="例如：15001 或 15002"
                  className="w-full border border-slate-300 rounded-md px-3.5 py-2.5 text-base focus:border-red-600 outline-none font-mono"
                />
              </div>

              {editingDevice && (
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    KioskID (唯一識別碼)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingDevice.kioskId}
                    className="w-full border border-slate-200 bg-slate-100 rounded-md px-3.5 py-2.5 text-sm font-mono text-slate-500"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm font-bold transition-colors cursor-pointer shadow-xs"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
