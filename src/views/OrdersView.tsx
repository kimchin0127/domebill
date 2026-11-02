import React, { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  CheckCircle,
  Download,
} from 'lucide-react';
import { INITIAL_ORDERS, EXHIBITION_OPTIONS, ORDER_CHANNEL_OPTIONS, ORDER_STATUS_OPTIONS } from '../data/mockData';
import { OrderItem, OrderStatus, OrderChannel, PaymentMethod, ExhibitionType, InvoiceStatus } from '../types';
import { OrderDetailModal } from '../components/modals/OrderDetailModal';
import { exportToCsv, exportToExcel } from '../utils/exportCsv';
import { CalendarPicker } from '../components/common/CalendarPicker';

export const OrdersView: React.FC = () => {
  // 查詢篩選條件
  const [orderNo, setOrderNo] = useState('');
  const [ticketNo, setTicketNo] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [cardNumberQuery, setCardNumberQuery] = useState('');
  // 訂單建立日期起訖
  const [createdStartDate, setCreatedStartDate] = useState('2026/10/26');
  const [createdEndDate, setCreatedEndDate] = useState('2026/10/26');
  // 訂單通路 (POS, KIOSK)
  const [selectedOrderChannel, setSelectedOrderChannel] = useState<string>('ALL');
  // 展覽（常設展、特展）
  const [selectedExhibition, setSelectedExhibition] = useState('ALL');
  // 訂單狀態（未付款、已付款、已取消、已退票）
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('ALL');
  // 付款方式（KIOSK實體刷卡、POS實體刷卡、悠遊卡、TWQR、現金）
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  // 發票號碼與發票狀態（已開立、已作廢）
  const [invoiceNoQuery, setInvoiceNoQuery] = useState('');
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<string>('ALL');

  // 訂單狀態與列表
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 查詢執行
  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      let result = [...orders];

      if (orderNo.trim()) {
        result = result.filter((o) =>
          o.orderNo.toLowerCase().includes(orderNo.trim().toLowerCase())
        );
      }
      if (ticketNo.trim()) {
        result = result.filter((o) =>
          o.ticketNo.toLowerCase().includes(ticketNo.trim().toLowerCase())
        );
      }
      if (bookingCode.trim()) {
        result = result.filter((o) =>
          o.bookingCode.toLowerCase().includes(bookingCode.trim().toLowerCase())
        );
      }
      if (cardNumberQuery.trim()) {
        result = result.filter((o) =>
          o.cardNumber.toLowerCase().includes(cardNumberQuery.trim().toLowerCase())
        );
      }
      if (selectedOrderChannel !== 'ALL') {
        result = result.filter((o) => o.orderChannel === selectedOrderChannel);
      }
      if (selectedExhibition !== 'ALL') {
        result = result.filter((o) => o.exhibition === selectedExhibition);
      }
      if (selectedOrderStatus !== 'ALL') {
        result = result.filter((o) => o.orderStatus === selectedOrderStatus);
      }
      if (selectedPaymentMethod !== 'ALL') {
        result = result.filter((o) => o.paymentMethod === selectedPaymentMethod);
      }
      if (invoiceNoQuery.trim()) {
        result = result.filter((o) =>
          o.invoiceNo.toLowerCase().includes(invoiceNoQuery.trim().toLowerCase())
        );
      }
      if (selectedInvoiceStatus !== 'ALL') {
        result = result.filter((o) => o.invoiceStatus === selectedInvoiceStatus);
      }

      setFilteredOrders(result);
      setIsLoading(false);
      setToastMessage(`查詢完成：共檢索出 ${result.length} 筆訂單紀錄`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 280);
  };

  const handleResetFilters = () => {
    setOrderNo('');
    setTicketNo('');
    setBookingCode('');
    setCardNumberQuery('');
    setCreatedStartDate('2026/10/26');
    setCreatedEndDate('2026/10/26');
    setSelectedOrderChannel('ALL');
    setSelectedExhibition('ALL');
    setSelectedOrderStatus('ALL');
    setSelectedPaymentMethod('ALL');
    setInvoiceNoQuery('');
    setSelectedInvoiceStatus('ALL');
    setFilteredOrders(orders);
  };

  // 下載報表 CSV 與 Excel
  const getOrdersExportData = () => {
    const headers = [
      '訂單編號',
      '票券序號',
      '訂單建立日期',
      '訂單建立時間',
      '訂單通路',
      '入場時段',
      '展覽項目',
      '交易金額(元)',
      '張數',
      '付款方式',
      '卡號',
      '取票代碼',
      '訂單狀態',
      '統一發票號碼',
      '發票狀態',
      '售票機台經辦',
      '備註說明'
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNo,
      o.ticketNo,
      o.createdDate,
      o.createdTime,
      o.orderChannel,
      o.timeSlot,
      o.exhibition,
      o.amount,
      o.ticketCount,
      o.paymentMethod,
      o.cardNumber || '-',
      o.bookingCode,
      o.orderStatus,
      o.invoiceNo,
      o.invoiceStatus,
      o.cashierName,
      o.remarks
    ]);

    return { headers, rows };
  };

  const handleExportCsv = () => {
    const { headers, rows } = getOrdersExportData();
    exportToCsv('大巨蛋棒球博物館_訂單明細表', headers, rows);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getOrdersExportData();
    exportToExcel('大巨蛋棒球博物館_訂單明細表', headers, rows);
  };

  // 訂單狀態樣式標籤 (未付款、已付款、已取消、已退票)
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case '未付款':
        return (
          <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded text-xs font-bold border border-amber-300">
            未付款
          </span>
        );
      case '已付款':
        return (
          <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded text-xs font-bold border border-emerald-300">
            已付款
          </span>
        );
      case '已取消':
        return (
          <span className="text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded text-xs font-bold border border-slate-300">
            已取消
          </span>
        );
      case '已退票':
        return (
          <span className="text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded text-xs font-bold border border-rose-300">
            已退票
          </span>
        );
    }
  };

  // 訂單通路樣式標籤 (POS, KIOSK，已移除 Web)
  const getOrderChannelBadge = (channel: OrderChannel) => {
    switch (channel) {
      case 'POS':
        return (
          <span className="text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded text-xs font-bold border border-blue-200">
            POS
          </span>
        );
      case 'KIOSK':
        return (
          <span className="text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded text-xs font-bold border border-purple-200">
            KIOSK
          </span>
        );
    }
  };

  // 發票狀態樣式 (已開立、已作廢)
  const getInvoiceStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case '已開立':
        return <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-200">已開立</span>;
      case '已作廢':
        return <span className="text-red-800 bg-red-50 px-2 py-0.5 rounded text-xs font-semibold border border-red-200">已作廢</span>;
    }
  };

  const handleOpenDetail = (order: OrderItem) => {
    setSelectedOrderForModal(order);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newOrderStatus: OrderStatus, newInvoiceStatus: InvoiceStatus, remarks: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus: newOrderStatus, invoiceStatus: newInvoiceStatus, remarks } : o
    );
    setOrders(updated);
    setFilteredOrders(updated);
    setToastMessage(`訂單狀態已更新為：${newOrderStatus}，發票狀態：${newInvoiceStatus}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toastMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 需求 4: 查詢條件標題已移除 (非實名制票務管理) 字樣 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢條件
          </h2>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
          >
            清空條件
          </button>
        </div>

        {/* 需求 4: 下方的欄位框框左邊都要絕對對齊 */}
        {/* 採用統一 4 欄等寬網格，每個標籤統一設定 w-24 shrink-0 text-left，保證每一欄所有輸入框左邊界絕對垂直對齊 */}
        <div className="p-6 space-y-5 text-base">
          {/* 第一列：4 欄對齊 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                訂單編號
              </label>
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="例如 MZ251202"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                票券序號
              </label>
              <input
                type="text"
                value={ticketNo}
                onChange={(e) => setTicketNo(e.target.value)}
                placeholder="例如 TKT-20261026"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                取票代碼
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="例如 N1NX7IGL"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                卡號
              </label>
              <input
                type="text"
                value={cardNumberQuery}
                onChange={(e) => setCardNumberQuery(e.target.value)}
                placeholder="輸入卡號或末碼"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* 第二列：4 欄對齊 (訂單建立起日、訂單建立訖日、訂單通路、展覽) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                訂單建立(起)
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={createdStartDate}
                  onChange={(d) => setCreatedStartDate(d)}
                  className="w-full text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                訂單建立(訖)
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={createdEndDate}
                  onChange={(d) => setCreatedEndDate(d)}
                  className="w-full text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                訂單通路
              </label>
              <select
                value={selectedOrderChannel}
                onChange={(e) => setSelectedOrderChannel(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                {ORDER_CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                展覽
              </label>
              <select
                value={selectedExhibition}
                onChange={(e) => setSelectedExhibition(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                {EXHIBITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 第三列：4 欄對齊 (訂單狀態、付款方式、發票號碼、發票狀態) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                訂單狀態
              </label>
              <select
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                付款方式
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                <option value="ALL">請選擇... (全部付款方式)</option>
                <option value="KIOSK實體刷卡">KIOSK實體刷卡</option>
                <option value="POS實體刷卡">POS實體刷卡</option>
                <option value="悠遊卡">悠遊卡</option>
                <option value="TWQR">TWQR</option>
                <option value="現金">現金</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                發票號碼
              </label>
              <input
                type="text"
                value={invoiceNoQuery}
                onChange={(e) => setInvoiceNoQuery(e.target.value)}
                placeholder="例如 QZ-88129401"
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-base focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                發票狀態
              </label>
              <select
                value={selectedInvoiceStatus}
                onChange={(e) => setSelectedInvoiceStatus(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-3.5 py-2 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                <option value="ALL">請選擇... (全部發票狀態)</option>
                <option value="已開立">已開立</option>
                <option value="已作廢">已作廢</option>
              </select>
            </div>
          </div>

          {/* 按鈕列 (已移除查詢右邊的下載csv報表與匯出excel報表，保留純淨查詢功能) */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 border border-transparent active:bg-white active:text-black active:border-slate-400 active:shadow-inner transition-colors cursor-pointer text-base"
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

      {/* 查詢結果清冊 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-red-600 font-bold text-xl leading-none">|</span>
              查詢結果
            </h3>
            <span className="text-base text-slate-600 font-bold font-mono">
              共 {filteredOrders.length} 筆訂單記錄
            </span>
          </div>

          {/* 需求指示：查詢結果右側新增附圖按鈕 (下載 CSV / 匯出 Excel) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-sm font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500 shrink-0" />
              <span>下載 CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50/90 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>匯出 Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200">
            <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
              <tr>
                <th className="px-3.5 py-3.5 whitespace-nowrap">訂單編號</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">票券序號</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">訂單建立日期與時間</th>
                <th className="px-3.5 py-3.5 text-center whitespace-nowrap">訂單通路</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">入場時段</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">展覽</th>
                <th className="px-3.5 py-3.5 text-right whitespace-nowrap">交易金額</th>
                <th className="px-3.5 py-3.5 text-center whitespace-nowrap">張數</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">付款方式</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">卡號</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">取票代碼</th>
                <th className="px-3.5 py-3.5 text-center whitespace-nowrap">訂單狀態</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">發票號碼</th>
                <th className="px-3.5 py-3.5 text-center whitespace-nowrap">發票狀態</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">售票機台/經辦</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">備註說明</th>
                <th className="px-3.5 py-3.5 text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400 font-sans text-base">
                    查無符合條件之票務紀錄，請重新設定篩選條件
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => handleOpenDetail(o)}
                    className="hover:bg-red-50/20 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-red-800 font-bold">
                      {o.orderNo}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-600 font-semibold">
                      {o.ticketNo}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-600 font-sans">
                      {o.createdDate} {o.createdTime}
                    </td>
                    <td className="px-3 py-3.5 text-center whitespace-nowrap font-sans">
                      {getOrderChannelBadge(o.orderChannel)}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-700 font-sans font-medium">
                      {o.timeSlot}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-sans font-bold text-slate-900">
                      {o.exhibition}
                    </td>
                    <td className="px-3.5 py-3.5 text-right whitespace-nowrap font-extrabold text-red-700 tabular-nums">
                      ${o.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-center whitespace-nowrap tabular-nums font-bold">
                      {o.ticketCount}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-sans font-semibold text-slate-800">
                      {o.paymentMethod}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-mono text-slate-700 text-xs font-semibold">
                      {o.cardNumber || '-'}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-900 font-bold">
                      {o.bookingCode}
                    </td>
                    <td className="px-3 py-3.5 text-center whitespace-nowrap font-sans">
                      {getOrderStatusBadge(o.orderStatus)}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-red-900 font-bold">
                      {o.invoiceNo}
                    </td>
                    <td className="px-3 py-3.5 text-center whitespace-nowrap font-sans">
                      {getInvoiceStatusBadge(o.invoiceStatus)}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-sans text-slate-700 font-medium">
                      {o.cashierName}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-sans text-slate-500 max-w-[180px] truncate" title={o.remarks}>
                      {o.remarks || '-'}
                    </td>
                    <td
                      className="px-3 py-3.5 text-center whitespace-nowrap font-sans"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="text-red-700 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="查看訂單與發票明細"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 底部總計列 */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-sm font-bold text-slate-800">
          <span>
            共顯示 {filteredOrders.length} 筆資料 · 點選任一行可開啟完整票券明細、卡號核對與電子發票狀態
          </span>
          <div className="flex items-center gap-8 font-mono">
            <span>
              總張數：{filteredOrders.reduce((acc, curr) => acc + curr.ticketCount, 0)} 張
            </span>
            <span className="text-red-800 text-base font-extrabold">
              交易金額小計：${filteredOrders.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} 元
            </span>
          </div>
        </div>
      </div>

      {/* 訂單明細與發票作業彈窗 */}
      <OrderDetailModal
        order={selectedOrderForModal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};
