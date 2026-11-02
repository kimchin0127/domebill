import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  Search,
  Eye,
} from 'lucide-react';
import { CalendarPicker } from '../components/common/CalendarPicker';
import { exportToCsv, exportToExcel } from '../utils/exportCsv';
import { OrderDetailModal } from '../components/modals/OrderDetailModal';
import { INITIAL_ORDERS, ACCOUNTING_SUMMARY_MOCK } from '../data/mockData';
import { OrderItem } from '../types';

// 6 種核心報表查詢類型 (已移除：系統使用費、沒入款總表、沒入款明細)
export type ReportType =
  | 'ACCOUNTING_DETAILS'      // 帳務明細
  | 'ACCOUNTING_SUMMARY'      // 帳務總表
  | 'DAILY_BY_CHANNEL'        // 每日結帳(通路)
  | 'DAILY_BY_PAYMENT'        // 每日結帳(支付方式)
  | 'REFUND_DETAILS'          // 退票明細
  | 'DAILY_BY_CASHIER';       // 每日結帳(票務員)

export const AccountingView: React.FC = () => {
  // 查詢條件 (起始與結束日期預設 2026/10/27)
  const [startDate, setStartDate] = useState('2026/10/27');
  const [endDate, setEndDate] = useState('2026/10/27');
  // 需求 5: 票務員改用下拉選單
  const [selectedCashier, setSelectedCashier] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'TIME' | 'AMOUNT' | 'ORDER_NO'>('TIME');

  // 目前選取的報表視圖 (預設為 帳務總表)
  const [activeReportTab, setActiveReportTab] = useState<ReportType>('ACCOUNTING_SUMMARY');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. 帳務明細資料計算與過濾
  const accountingDetailsData = useMemo(() => {
    let list = [...INITIAL_ORDERS];
    if (selectedCashier !== 'ALL') {
      list = list.filter((o) => o.cashierName.includes(selectedCashier));
    }
    if (selectedChannel !== 'ALL') {
      list = list.filter((o) => o.orderChannel === selectedChannel);
    }
    if (selectedPaymentMethod !== 'ALL') {
      list = list.filter((o) => o.paymentMethod === selectedPaymentMethod);
    }
    if (sortOrder === 'AMOUNT') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortOrder === 'ORDER_NO') {
      list.sort((a, b) => a.orderNo.localeCompare(b.orderNo));
    } else {
      list.sort((a, b) => b.createdTime.localeCompare(a.createdTime));
    }
    return list;
  }, [selectedCashier, selectedChannel, selectedPaymentMethod, sortOrder]);

  // 2. 帳務總表資料
  const accountingSummaryData = useMemo(() => {
    return ACCOUNTING_SUMMARY_MOCK;
  }, []);

  // 3. 每日結帳(通路) 資料
  const dailyChannelData = useMemo(() => {
    const raw = [
      {
        date: '2026/10/26',
        channel: 'POS',
        txCount: 168,
        ticketCount: 284,
        grossIncome: 68450,
        refundAmount: 700,
        netAmount: 67750,
        shareRate: '59.5%',
      },
      {
        date: '2026/10/26',
        channel: 'KIOSK (自動售票機)',
        txCount: 132,
        ticketCount: 198,
        grossIncome: 46200,
        refundAmount: 0,
        netAmount: 46200,
        shareRate: '40.5%',
      },
    ];
    if (selectedChannel === 'ALL') return raw;
    return raw.filter((r) => r.channel.startsWith(selectedChannel));
  }, [selectedChannel]);

  // 4. 每日結帳(支付方式) 資料
  const dailyPaymentData = useMemo(() => {
    const raw = [
      {
        date: '2026/10/26',
        paymentMethod: 'KIOSK實體刷卡',
        txCount: 94,
        ticketCount: 145,
        grossAmount: 46200,
        refundAmount: 0,
        netAmount: 46200,
        shareRate: '32.6%',
      },
      {
        date: '2026/10/26',
        paymentMethod: 'POS實體刷卡',
        txCount: 74,
        ticketCount: 120,
        grossAmount: 40200,
        refundAmount: 700,
        netAmount: 39500,
        shareRate: '27.9%',
      },
      {
        date: '2026/10/26',
        paymentMethod: '悠遊卡',
        txCount: 78,
        ticketCount: 135,
        grossAmount: 21500,
        refundAmount: 350,
        netAmount: 21150,
        shareRate: '14.9%',
      },
      {
        date: '2026/10/26',
        paymentMethod: 'TWQR',
        txCount: 60,
        ticketCount: 92,
        grossAmount: 16700,
        refundAmount: 0,
        netAmount: 16700,
        shareRate: '11.8%',
      },
      {
        date: '2026/10/26',
        paymentMethod: '現金',
        txCount: 52,
        ticketCount: 90,
        grossAmount: 18250,
        refundAmount: 0,
        netAmount: 18250,
        shareRate: '12.8%',
      },
    ];
    if (selectedPaymentMethod === 'ALL') return raw;
    return raw.filter((r) => r.paymentMethod === selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  // 5. 退票明細資料
  const refundDetailsData = useMemo(() => {
    const raw = [
      {
        refundNo: 'RF-20261026-001',
        orderNo: 'MZ2512020165303',
        ticketNo: 'TKT-20261026-0009',
        refundTime: '2026/10/26 14:30:15',
        channel: 'POS',
        cashier: '2號票亭售票員',
        paymentMethod: 'POS實體刷卡',
        cardLastFour: '8830',
        ticketCount: 2,
        refundAmount: 700,
        voidInvoiceNo: 'QZ-88129408',
        reason: '訪客因個人行程異動申請現場原卡刷退',
      },
      {
        refundNo: 'RF-20261026-002',
        orderNo: 'MZ2512020165304',
        ticketNo: 'TKT-20261026-0010',
        refundTime: '2026/10/26 15:10:00',
        channel: 'POS',
        cashier: '1號票亭售票員',
        paymentMethod: '悠遊卡',
        cardLastFour: '9901',
        ticketCount: 1,
        refundAmount: 350,
        voidInvoiceNo: 'QZ-88129409',
        reason: '悠遊卡多扣款，由票務員即時執行悠遊卡退款沖銷',
      },
    ];
    if (selectedCashier !== 'ALL') {
      return raw.filter((r) => r.cashier.includes(selectedCashier));
    }
    return raw;
  }, [selectedCashier]);

  // 6. 每日結帳(票務員) 資料
  const dailyCashierData = useMemo(() => {
    const raw = [
      {
        date: '2026/10/26',
        cashierName: '1號票亭售票員',
        posTerminal: '1號票亭機台',
        cashAmount: 12400,
        cardAmount: 25400,
        easyCardAmount: 15800,
        twqrAmount: 9600,
        totalAmount: 63200,
        txCount: 142,
        status: '已覆核',
      },
      {
        date: '2026/10/26',
        cashierName: '2號票亭售票員',
        posTerminal: '2號票亭機台',
        cashAmount: 5850,
        cardAmount: 14800,
        easyCardAmount: 5700,
        twqrAmount: 7100,
        totalAmount: 33450,
        txCount: 84,
        status: '待覆核',
      },
      {
        date: '2026/10/26',
        cashierName: '大廳1號售票機',
        posTerminal: '大廳1號售票機',
        cashAmount: 0,
        cardAmount: 26200,
        easyCardAmount: 0,
        twqrAmount: 0,
        totalAmount: 26200,
        txCount: 65,
        status: '已覆核',
      },
      {
        date: '2026/10/26',
        cashierName: '大廳2號售票機',
        posTerminal: '大廳2號售票機',
        cashAmount: 0,
        cardAmount: 20000,
        easyCardAmount: 0,
        twqrAmount: 0,
        totalAmount: 20000,
        txCount: 48,
        status: '已覆核',
      },
      {
        date: '2026/10/25',
        cashierName: '張家華 (票務員)',
        posTerminal: '1號票亭機台',
        cashAmount: 14200,
        cardAmount: 31000,
        easyCardAmount: 18200,
        twqrAmount: 11400,
        totalAmount: 74800,
        txCount: 168,
        status: '已覆核',
      },
    ];
    if (selectedCashier !== 'ALL') {
      return raw.filter((r) => r.cashierName.includes(selectedCashier));
    }
    return raw;
  }, [selectedCashier]);

  // 切換 6 個報表按鈕
  const handleSelectReport = (type: ReportType, label: string) => {
    setActiveReportTab(type);
    setToastMessage(`已切換至「${label}」報表，資料已同步刷新。`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 需求 6: 下載CSV報表 與 匯出EXCEL報表 完整根據下方的欄位匯出所有資料
  const handleExportCurrentView = (format: 'CSV' | 'EXCEL') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let title = '';

    switch (activeReportTab) {
      case 'ACCOUNTING_DETAILS':
        title = '大巨蛋棒球博物館_帳務明細清冊';
        headers = [
          '交易時間',
          '訂單編號',
          '票券序號',
          '通路',
          '票務員/機台',
          '展覽項目',
          '預約時段',
          '張數',
          '付款方式',
          '卡號',
          '交易金額',
          '訂單狀態',
          '發票號碼',
        ];
        rows = accountingDetailsData.map((o) => [
          `${o.createdDate} ${o.createdTime}`,
          o.orderNo,
          o.ticketNo,
          o.orderChannel,
          o.cashierName,
          o.exhibition,
          o.timeSlot,
          o.ticketCount,
          o.paymentMethod,
          o.cardNumber,
          o.amount,
          o.orderStatus,
          o.invoiceNo,
        ]);
        break;

      case 'ACCOUNTING_SUMMARY':
        title = '大巨蛋棒球博物館_帳務總表';
        headers = [
          '結算日期',
          '展覽項目',
          '營業收入',
          '退款作廢',
          '旅行社總額',
          '實收淨額',
          'KIOSK刷卡金額',
          'KIOSK刷卡筆數',
          'POS刷卡金額',
          'POS刷卡筆數',
          '悠遊卡金額',
          '悠遊卡筆數',
          'TWQR金額',
          'TWQR筆數',
          '現金金額',
          '現金筆數',
          '對帳狀態',
        ];
        rows = accountingSummaryData.map((s) => [
          s.date,
          s.exhibition,
          s.totalIncome,
          s.totalRefund,
          s.agencyGross,
          s.netAmount,
          s.kioskCardIncome,
          s.kioskCardCount,
          s.posCardIncome,
          s.posCardCount,
          s.easyCardIncome,
          s.easyCardCount,
          s.twqrIncome,
          s.twqrCount,
          s.cashIncome,
          s.cashCount,
          s.reconciliationStatus,
        ]);
        break;

      case 'DAILY_BY_CHANNEL':
        title = '大巨蛋棒球博物館_每日結帳(通路)';
        headers = [
          '結算日期',
          '訂單通路',
          '交易筆數',
          '發行張數',
          '營業總額',
          '退票金額',
          '實收淨額',
          '營業佔比',
        ];
        rows = dailyChannelData.map((c) => [
          c.date,
          c.channel,
          c.txCount,
          c.ticketCount,
          c.grossIncome,
          c.refundAmount,
          c.netAmount,
          c.shareRate,
        ]);
        break;

      case 'DAILY_BY_PAYMENT':
        title = '大巨蛋棒球博物館_每日結帳(支付方式)';
        headers = [
          '結算日期',
          '付款方式',
          '交易筆數',
          '票券張數',
          '交易總額',
          '退款折讓',
          '實收淨額',
          '支付佔比',
        ];
        rows = dailyPaymentData.map((p) => [
          p.date,
          p.paymentMethod,
          p.txCount,
          p.ticketCount,
          p.grossAmount,
          p.refundAmount,
          p.netAmount,
          p.shareRate,
        ]);
        break;

      case 'REFUND_DETAILS':
        title = '大巨蛋棒球博物館_退票明細清冊';
        headers = [
          '退票單號',
          '原訂單編號',
          '票券序號',
          '退票時間',
          '通路',
          '經辦票務員',
          '付款方式',
          '卡號末碼',
          '退票張數',
          '退款金額',
          '作廢發票號碼',
          '退票事由說明',
        ];
        rows = refundDetailsData.map((r) => [
          r.refundNo,
          r.orderNo,
          r.ticketNo,
          r.refundTime,
          r.channel,
          r.cashier,
          r.paymentMethod,
          r.cardLastFour,
          r.ticketCount,
          r.refundAmount,
          r.voidInvoiceNo,
          r.reason,
        ]);
        break;

      case 'DAILY_BY_CASHIER':
        title = '大巨蛋棒球博物館_每日結帳(票務員)';
        headers = [
          '營業日期',
          '票務人員',
          '機台終端',
          '現金結算',
          '刷卡結算',
          '悠遊卡結算',
          'TWQR結算',
          '實收總額',
          '經辦筆數',
          '覆核狀態',
        ];
        rows = dailyCashierData.map((k) => [
          k.date,
          k.cashierName,
          k.posTerminal,
          k.cashAmount,
          k.cardAmount,
          k.easyCardAmount,
          k.twqrAmount,
          k.totalAmount,
          k.txCount,
          k.status,
        ]);
        break;
    }

    if (format === 'CSV') {
      exportToCsv(title, headers, rows);
    } else {
      exportToExcel(title, headers, rows);
    }

    setToastMessage(`已匯出 ${title} (${format})`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toastMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3.5 rounded-lg text-base font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 查詢條件卡片 (字體加大、票務員下拉選單、已移除匯出勾選框) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl leading-none">|</span>
            查詢條件
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            臺北大巨蛋棒球博物館 · 帳務清算核心
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* 第一列：起始日期、結束日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                起始日期
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  className="w-full text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                結束日期
              </label>
              <div className="flex-1 min-w-0">
                <CalendarPicker
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                  className="w-full text-base"
                />
              </div>
            </div>
          </div>

          {/* 第二列：票務員 (需求 5: 下拉選單) 與 排序方式 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                票務員
              </label>
              <select
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs cursor-pointer"
              >
                <option value="ALL">請選擇... (全部票務員/機台)</option>
                <option value="1號票亭售票員">1號票亭售票員</option>
                <option value="2號票亭售票員">2號票亭售票員</option>
                <option value="大廳1號售票機">大廳1號售票機 (KIOSK)</option>
                <option value="大廳2號售票機">大廳2號售票機 (KIOSK)</option>
                <option value="張家華 (票務員)">張家華 (票務員)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                排序方式
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'TIME' | 'AMOUNT' | 'ORDER_NO')}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs cursor-pointer"
              >
                <option value="TIME">交易時間 (由新至舊)</option>
                <option value="AMOUNT">訂單金額 (由大至小)</option>
                <option value="ORDER_NO">訂單編號</option>
              </select>
            </div>
          </div>

          {/* 第三列：通路、付款方式 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                通路
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs cursor-pointer"
              >
                <option value="ALL">請選擇... (全部通路)</option>
                <option value="POS">POS</option>
                <option value="KIOSK">KIOSK (自動售票機)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm sm:text-base font-bold text-slate-800 text-left">
                付款方式
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-md px-4 py-2.5 text-base font-semibold focus:border-red-600 outline-none bg-white shadow-2xs cursor-pointer"
              >
                <option value="ALL">請選擇... (全部付款方式)</option>
                <option value="KIOSK實體刷卡">KIOSK實體刷卡</option>
                <option value="POS實體刷卡">POS實體刷卡</option>
                <option value="悠遊卡">悠遊卡</option>
                <option value="TWQR">TWQR</option>
                <option value="現金">現金</option>
              </select>
            </div>
          </div>

          {/* 需求指示：查詢右邊的下載csv報表跟匯出excel報表已移除，統一於下方各報表清冊處完整匯出 */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setToastMessage(`查詢完成：已重新載入 ${startDate} 至 ${endDate} 帳務資料`);
                setTimeout(() => setToastMessage(''), 3000);
              }}
              className="px-8 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 border border-transparent active:bg-white active:text-black active:border-slate-400 active:shadow-inner transition-colors cursor-pointer text-base"
            >
              <Search className="w-4 h-4" />
              <span>查詢</span>
            </button>
          </div>

          {/* 需求 4: 下方一整列呈現 6 個報表按鈕 (單一橫排呈現，已移除系統使用費、沒入款總表、沒入款明細) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 select-none">
              <button
                type="button"
                onClick={() => handleSelectReport('ACCOUNTING_DETAILS', '帳務明細')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'ACCOUNTING_DETAILS'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                帳務明細
              </button>

              <button
                type="button"
                onClick={() => handleSelectReport('ACCOUNTING_SUMMARY', '帳務總表')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'ACCOUNTING_SUMMARY'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                帳務總表
              </button>

              <button
                type="button"
                onClick={() => handleSelectReport('DAILY_BY_CHANNEL', '每日結帳(通路)')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'DAILY_BY_CHANNEL'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                每日結帳(通路)
              </button>

              <button
                type="button"
                onClick={() => handleSelectReport('DAILY_BY_PAYMENT', '每日結帳(支付方式)')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'DAILY_BY_PAYMENT'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                每日結帳(支付方式)
              </button>

              <button
                type="button"
                onClick={() => handleSelectReport('REFUND_DETAILS', '退票明細')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'REFUND_DETAILS'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                退票明細
              </button>

              <button
                type="button"
                onClick={() => handleSelectReport('DAILY_BY_CASHIER', '每日結帳(票務員)')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
                  activeReportTab === 'DAILY_BY_CASHIER'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                每日結帳(票務員)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 動態報表呈現區塊 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* 報表標題與快速匯出列 */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-red-600 font-bold text-xl leading-none">|</span>
              查詢結果 · {activeReportTab === 'ACCOUNTING_DETAILS' && '帳務明細清冊'}
              {activeReportTab === 'ACCOUNTING_SUMMARY' && '帳務總表 (依日結核算)'}
              {activeReportTab === 'DAILY_BY_CHANNEL' && '每日結帳報表 (依購票通路分組)'}
              {activeReportTab === 'DAILY_BY_PAYMENT' && '每日結帳報表 (依支付方式分組)'}
              {activeReportTab === 'REFUND_DETAILS' && '退票與作廢明細清冊'}
              {activeReportTab === 'DAILY_BY_CASHIER' && '每日結帳報表 (依票務員分組)'}
            </h3>
            <span className="text-sm text-slate-500 font-medium">
              查詢區間：{startDate} 至 {endDate} · 幣別：新臺幣 (元)
            </span>
          </div>

          {/* 需求指示：查詢結果右側新增附圖按鈕 (下載 CSV / 匯出 Excel) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleExportCurrentView('CSV')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-sm font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500 shrink-0" />
              <span>下載 CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportCurrentView('EXCEL')}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50/90 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>匯出 Excel</span>
            </button>
          </div>
        </div>

        {/* 1. 帳務明細表格 */}
        {activeReportTab === 'ACCOUNTING_DETAILS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">交易時間</th>
                  <th className="px-5 py-4 whitespace-nowrap">訂單編號</th>
                  <th className="px-5 py-4 whitespace-nowrap">票券序號</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">通路</th>
                  <th className="px-5 py-4 whitespace-nowrap">票務員/機台</th>
                  <th className="px-5 py-4 whitespace-nowrap">展覽</th>
                  <th className="px-5 py-4 whitespace-nowrap">預約時段</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">張數</th>
                  <th className="px-5 py-4 whitespace-nowrap">付款方式</th>
                  <th className="px-5 py-4 whitespace-nowrap">卡號</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">交易金額</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">訂單狀態</th>
                  <th className="px-5 py-4 whitespace-nowrap">發票號碼</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {accountingDetailsData.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderForModal(o);
                      setIsDetailOpen(true);
                    }}
                    className="hover:bg-red-50/20 cursor-pointer transition-colors"
                    title="點擊檢視訂單與發票憑證明細 (此處不執行退票退款)"
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-700">
                      {o.createdDate} {o.createdTime}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-red-800">
                      {o.orderNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-semibold">
                      {o.ticketNo}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap font-sans">
                      <span className="text-sm font-bold px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                        {o.orderChannel}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {o.cashierName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-900">
                      {o.exhibition}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-600">
                      {o.timeSlot}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap tabular-nums font-bold">
                      {o.ticketCount}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-700 font-semibold">
                      {o.paymentMethod}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                      {o.cardNumber}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60 tabular-nums text-lg">
                      ${o.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap font-sans">
                      <span className="text-sm font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-900 font-bold">
                      {o.invoiceNo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. 帳務總表表格 */}
        {activeReportTab === 'ACCOUNTING_SUMMARY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">結算日期</th>
                  <th className="px-5 py-4 whitespace-nowrap">展覽項目</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">營業收入</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap text-red-600">退款作廢</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">旅行社總額</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">實收淨額</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">KIOSK刷卡 (額/筆)</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">POS刷卡 (額/筆)</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">悠遊卡 (額/筆)</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">TWQR (額/筆)</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">現金 (額/筆)</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">對帳狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {accountingSummaryData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 font-sans">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {row.exhibition}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold">
                      ${row.totalIncome.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-red-600 tabular-nums font-semibold">
                      -${row.totalRefund.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600 tabular-nums">
                      ${row.agencyGross.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-red-950 bg-red-50/60 tabular-nums text-lg">
                      ${row.netAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-sm">
                      ${row.kioskCardIncome.toLocaleString()} <span className="text-slate-400">({row.kioskCardCount}筆)</span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-sm">
                      ${row.posCardIncome.toLocaleString()} <span className="text-slate-400">({row.posCardCount}筆)</span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-sm">
                      ${row.easyCardIncome.toLocaleString()} <span className="text-slate-400">({row.easyCardCount}筆)</span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-sm">
                      ${row.twqrIncome.toLocaleString()} <span className="text-slate-400">({row.twqrCount}筆)</span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-sm">
                      ${row.cashIncome.toLocaleString()} <span className="text-slate-400">({row.cashCount}筆)</span>
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap font-sans">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                        已平帳
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. 每日結帳(通路) 表格 */}
        {activeReportTab === 'DAILY_BY_CHANNEL' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">結算日期</th>
                  <th className="px-5 py-4 whitespace-nowrap">訂單通路</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">交易筆數</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">發行張數</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">營業總額</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap text-red-600">退票金額</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">實收淨額</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">營業佔比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {dailyChannelData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 font-sans">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {row.channel}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {row.txCount} 筆
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {row.ticketCount} 張
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold">
                      ${row.grossIncome.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-red-600 tabular-nums">
                      -${row.refundAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-red-950 bg-red-50/60 tabular-nums text-lg">
                      ${row.netAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center font-sans font-bold text-slate-800">
                      {row.shareRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. 每日結帳(支付方式) 表格 */}
        {activeReportTab === 'DAILY_BY_PAYMENT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">結算日期</th>
                  <th className="px-5 py-4 whitespace-nowrap">付款方式</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">交易筆數</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">票券張數</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">交易總額</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap text-red-600">退款折讓</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">實收淨額</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">支付佔比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {dailyPaymentData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 font-sans">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {row.paymentMethod}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {row.txCount} 筆
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {row.ticketCount} 張
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold">
                      ${row.grossAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-red-600 tabular-nums">
                      -${row.refundAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-red-950 bg-red-50/60 tabular-nums text-lg">
                      ${row.netAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center font-sans font-bold text-slate-800">
                      {row.shareRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. 退票明細 表格 */}
        {activeReportTab === 'REFUND_DETAILS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">退票單號</th>
                  <th className="px-5 py-4 whitespace-nowrap">原訂單編號</th>
                  <th className="px-5 py-4 whitespace-nowrap">票券序號</th>
                  <th className="px-5 py-4 whitespace-nowrap">退票時間</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">通路</th>
                  <th className="px-5 py-4 whitespace-nowrap">經辦票務員</th>
                  <th className="px-5 py-4 whitespace-nowrap">付款方式</th>
                  <th className="px-5 py-4 whitespace-nowrap">卡號末碼</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">退票張數</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap text-red-600 font-extrabold bg-red-50/60">退款金額</th>
                  <th className="px-5 py-4 whitespace-nowrap">作廢發票號碼</th>
                  <th className="px-5 py-4 whitespace-nowrap">退票事由說明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {refundDetailsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-red-800 font-sans">
                      {row.refundNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                      {row.orderNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {row.ticketNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-600">
                      {row.refundTime}
                    </td>
                    <td className="px-5 py-4 text-center font-sans font-bold">
                      {row.channel}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {row.cashier}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-700">
                      {row.paymentMethod}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {row.cardLastFour}
                    </td>
                    <td className="px-5 py-4 text-center tabular-nums font-bold">
                      {row.ticketCount}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-red-700 bg-red-50/60 tabular-nums text-lg">
                      -${row.refundAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-red-900">
                      {row.voidInvoiceNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-600 text-sm">
                      {row.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. 每日結帳(票務員) 表格 */}
        {activeReportTab === 'DAILY_BY_CASHIER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 text-sm sm:text-base font-extrabold text-slate-700">
                <tr>
                  <th className="px-5 py-4 whitespace-nowrap">營業日期</th>
                  <th className="px-5 py-4 whitespace-nowrap">票務人員</th>
                  <th className="px-5 py-4 whitespace-nowrap">機台終端</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">現金結算</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">刷卡結算</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">悠遊卡結算</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">TWQR結算</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap font-extrabold text-red-900 bg-red-50/60">實收總額</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">經辦筆數</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">覆核狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-base">
                {dailyCashierData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-900">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans font-bold text-slate-800">
                      {row.cashierName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-slate-600">
                      {row.posTerminal}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      ${row.cashAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      ${row.cardAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      ${row.easyCardAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      ${row.twqrAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-red-950 bg-red-50/60 tabular-nums text-lg">
                      ${row.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center tabular-nums font-bold">
                      {row.txCount} 筆
                    </td>
                    <td className="px-5 py-4 text-center font-sans">
                      <span className="text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 需求 6 & 7: 底部總計列 (已移除「統計資料來源」與「統計狀態：日結平帳核准」，僅純淨顯示總金額與統計) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-base font-bold text-slate-800">
          <div className="flex items-center gap-6">
            <span className="text-slate-600">
              查詢報表項目：{activeReportTab === 'ACCOUNTING_DETAILS' ? '帳務明細' : activeReportTab === 'ACCOUNTING_SUMMARY' ? '帳務總表' : activeReportTab === 'DAILY_BY_CHANNEL' ? '每日結帳(通路)' : activeReportTab === 'DAILY_BY_PAYMENT' ? '每日結帳(支付方式)' : activeReportTab === 'REFUND_DETAILS' ? '退票明細' : '每日結帳(票務員)'}
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono">
            <span className="text-slate-700 font-sans">
              累計筆數：358 筆
            </span>
            <span className="text-red-900 font-extrabold text-lg sm:text-xl">
              查詢區間日結實收總淨額：$141,800 元
            </span>
          </div>
        </div>
      </div>

      {/* 訂單與票券憑證檢視彈窗 (此處不執行直接退票退款) */}
      <OrderDetailModal
        order={selectedOrderForModal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
