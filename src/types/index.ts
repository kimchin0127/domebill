// 角色權限：票務人員、帳務人員、帳務主管、票務主管、系統管理員
export type UserRole = 
  | 'TICKET_STAFF'      // 票務人員
  | 'ACCOUNTING_STAFF'  // 帳務人員
  | 'ACCOUNTING_LEAD'   // 帳務主管
  | 'TICKET_LEAD'       // 票務主管
  | 'SYSTEM_ADMIN';     // 系統管理員

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  organization: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'DISABLED';
  lastLogin: string;
  createdAt: string;
}

// 展覽類別：常設展、特展
export type ExhibitionType = '常設展' | '特展';

// 付款方式：KIOSK實體刷卡、POS實體刷卡、悠遊卡、TWQR、現金
export type PaymentMethod = 
  | 'KIOSK實體刷卡' 
  | 'POS實體刷卡' 
  | '悠遊卡' 
  | 'TWQR' 
  | '現金';

// 訂單狀態：未付款、已付款、已取消、已退票
export type OrderStatus = 
  | '未付款' 
  | '已付款' 
  | '已取消' 
  | '已退票';

// 訂單通路：POS、KIOSK (已移除 Web 線上)
export type OrderChannel = 'POS' | 'KIOSK';

// 發票狀態：已開立、已作廢
export type InvoiceStatus = '已開立' | '已作廢';

export type TicketChannel = '現場票亭' | '自動售票機KIOSK' | '合作旅行社';

// 非實名制訂單模型 (無人名、無身分證字號、無手機號碼、無客運名稱)
export interface OrderItem {
  id: string;
  orderNo: string;           // 訂單編號
  ticketNo: string;          // 票券流水序號 (非實名制)
  createdDate: string;       // 訂單建立日期
  createdTime: string;       // 訂單建立時間
  timeSlot: string;          // 預約入場時段
  orderChannel: OrderChannel;// 訂單通路 (POS, KIOSK)
  exhibition: ExhibitionType;// 展覽：常設展 / 特展
  amount: number;            // 交易金額
  ticketCount: number;       // 張數
  paymentMethod: PaymentMethod; // 付款方式
  cardNumber: string;        // 卡號 (例如 4000-22**-****-4582 或 -)
  cardLastFour?: string;     // 卡號末四碼
  bookingCode: string;       // 訂位代碼 / 取票代碼
  orderStatus: OrderStatus;  // 訂單狀態 (未付款、已付款、已取消、已退票)
  ticketChannel?: TicketChannel;// 售票端點
  cashierName: string;       // 機台 / 票務員
  invoiceNo: string;         // 發票號碼
  invoiceStatus: InvoiceStatus; // 發票狀態：已開立 / 已作廢
  remarks: string;           // 備註
  qrCodeToken: string;       // 票券 QR 條碼代碼
}

export interface AccountingSummaryRow {
  date: string;
  exhibition: string;        // 展覽 (常設展、特展、全展區加總)
  totalIncome: number;       // 營業收入
  totalRefund: number;       // 退款作廢金額
  agencyGross: number;       // 旅行社總額
  netAmount: number;         // 實收淨額
  kioskCardIncome: number;   // KIOSK實體刷卡金額
  kioskCardCount: number;    // KIOSK實體刷卡筆數
  posCardIncome: number;     // POS實體刷卡金額
  posCardCount: number;      // POS實體刷卡筆數
  easyCardIncome: number;    // 悠遊卡金額
  easyCardCount: number;     // 悠遊卡筆數
  twqrIncome: number;        // TWQR金額
  twqrCount: number;         // TWQR筆數
  cashIncome: number;        // 現金金額
  cashCount: number;         // 現金筆數
  totalTransactionCount: number;
  totalTicketCount: number;
  reconciliationStatus: '已平帳' | '待覆核';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  exhibition: ExhibitionType;
  timeSlot: string;
  adultCount: number;        // 全票
  concessionCount: number;   // 優待票
  groupCount: number;        // 團體票
  disabilityCount: number;   // 愛心票
  totalVisitors: number;
  maxCapacity: number;       // 容流上限
  utilizationRate: number;   // 容流率
  verifiedCount: number;     // 已驗票入場數
  verificationRate: number;  // 核銷率
}

export interface CashierReconciliationShift {
  shiftId: string;
  date: string;
  cashierName: string;
  posTerminal: string;
  openingCash: number;
  systemCashSales: number;
  actualCashTurnIn: number;
  variance: number;
  kioskCardTotal: number;
  posCardTotal: number;
  easyCardTotal: number;
  twqrTotal: number;
  status: '已覆核' | '待覆核';
}

// 需求 1: KMS 設備監控管理 (參考 image_452b35b5.png 機台基本資料管理)
export interface KmsDevice {
  id: string;
  station: string;          // 所屬站別 (棒球博物館)
  kioskId: string;          // KioskID (UUID)
  deviceName: string;       // 機台名稱 (Taipei-dome tvm1, Taipei-dome tvm2)
  deviceCode: string;       // 機台編號 (例如 15001, 15002)
  signalStatus: 'ONLINE' | 'OFFLINE' | 'WEAK'; // 連線狀態
  ipAddress?: string;
  lastHeartbeat?: string;
}

// 需求 2: 外部 API 介接與日誌監控 (責任歸屬存證)
export interface ApiLogEntry {
  id: string;
  traceId: string;
  timestamp: string;
  system: 'ORACLE_JDE' | 'FARGLORY_FINANCE';
  systemName: string;
  direction: 'PULL' | 'PUSH';
  directionLabel: string;
  endpoint: string;
  method: 'GET' | 'POST';
  recordCount: number;
  payloadSize: string;
  latency: number;
  status: number;
  statusText: string;
  responsibility: 'CENTRAL_OK' | 'FARGLORY_FAULT' | 'JDE_PARAM_ERROR' | 'PENDING_ACK';
  responsibilityLabel: string;
  responsibilityDesc: string;
  canRetry: boolean;
  requestData: {
    headers: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
  };
  responseData: {
    headers: Record<string, string>;
    body?: any;
  };
}
