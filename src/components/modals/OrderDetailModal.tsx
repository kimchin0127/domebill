import React from 'react';
import { X, FileText, QrCode, ShieldCheck } from 'lucide-react';
import { OrderItem, OrderStatus, InvoiceStatus, OrderChannel } from '../../types';

interface OrderDetailModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (
    orderId: string,
    newOrderStatus: OrderStatus,
    newInvoiceStatus: InvoiceStatus,
    remarks: string
  ) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  // 訂單狀態標籤 (未付款、已付款、已取消、已退票)
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case '未付款':
        return <span className="text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded text-xs font-bold">未付款</span>;
      case '已付款':
        return <span className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded text-xs font-bold">已付款</span>;
      case '已取消':
        return <span className="text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-bold">已取消</span>;
      case '已退票':
        return <span className="text-rose-800 bg-rose-50 border border-rose-300 px-3 py-1 rounded text-xs font-bold">已退票</span>;
    }
  };

  // 訂單通路標籤 (POS, KIOSK，已移除 Web 線上)
  const getOrderChannelBadge = (channel: OrderChannel) => {
    switch (channel) {
      case 'POS':
        return <span className="text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-bold">POS</span>;
      case 'KIOSK':
        return <span className="text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded text-xs font-bold">KIOSK (自動售票機)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-red-800 text-white px-7 py-5 flex items-center justify-between border-b border-red-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-red-950 text-red-200 border border-red-700/80 px-2 py-0.5 rounded font-mono font-bold">
                訂單明細
              </span>
              <span className="text-xs text-red-200 font-mono">{order.orderNo}</span>
            </div>
            <h3 className="text-lg font-extrabold">非實名制票券核算與統一發票開立紀錄</h3>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white p-1 rounded-md cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 space-y-6 text-sm">
          {/* 頂部狀態列 */}
          <div className="p-5 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                {getOrderStatusBadge(order.orderStatus)}
                <span className="text-xs text-slate-500 font-mono font-bold">
                  取票代碼：{order.bookingCode}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                展覽類別：{order.exhibition}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">實收金額 ({order.ticketCount} 張)</span>
              <span className="text-2xl font-extrabold font-mono text-red-800">
                ${order.amount.toLocaleString()} <span className="text-sm font-sans">元</span>
              </span>
            </div>
          </div>

          {/* 欄位網格 (卡號, 訂單通路, 訂單建立日期) */}
          <div className="grid grid-cols-2 gap-5 border-y border-slate-200 py-5 text-sm">
            <div>
              <span className="text-slate-500 block text-xs font-semibold">票券流水序號</span>
              <span className="text-slate-900 font-mono font-bold text-base">{order.ticketNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">訂單建立日期與時間</span>
              <span className="text-slate-900 font-mono font-bold">{order.createdDate} {order.createdTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold mb-1">訂單通路</span>
              {getOrderChannelBadge(order.orderChannel)}
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">預約入場時段</span>
              <span className="text-slate-900 font-bold">{order.timeSlot}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">付款方式</span>
              <span className="text-slate-900 font-semibold">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">交易卡號</span>
              <span className="text-slate-900 font-mono font-bold text-sm">
                {order.cardNumber || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">經辦機台 / 售票員</span>
              <span className="text-slate-900 font-medium">{order.cashierName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs font-semibold">發票開立狀態</span>
              <span className={`inline-block font-bold text-xs px-2.5 py-0.5 rounded ${
                order.invoiceStatus === '已開立'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {order.invoiceStatus}
              </span>
            </div>
          </div>

          {/* 電子發票與 QR Code 驗票區塊 */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FileText className="w-5 h-5 text-red-700" />
                財政部電子發票開立憑證
              </div>
              <p className="text-slate-700 font-mono text-sm">
                發票字軌號碼：<strong className="text-red-900 font-bold text-base">{order.invoiceNo}</strong>
              </p>
              <p className="text-slate-500 text-xs font-medium">
                發票狀態：{order.invoiceStatus}（符合文化展演免徵娛樂稅標準）
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <QrCode className="w-14 h-14 text-slate-800 mx-auto" />
              <span className="text-[11px] text-slate-500 font-mono font-semibold block mt-1">入場驗票條碼</span>
            </div>
          </div>

          {/* 備註說明 */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block text-xs">後台帳務備註：</label>
            <div className="p-3 bg-slate-100 rounded-lg text-slate-800 text-xs leading-relaxed">
              {order.remarks || '正常售票，無特殊註記'}
            </div>
          </div>

          {/* 需求指定：取消直接退票退款的按鈕，這邊不執行 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">帳務審查檢視說明</span>
              <span>
                此視窗僅供檢視票券憑證與發票開立歷程，退票退款與作廢沖銷作業請洽現場票務櫃檯或授權專責主管辦理（此處不執行直接退票/退款）。
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-7 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
