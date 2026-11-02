import React, { useState } from 'react';
import { X, ShieldAlert, Cpu, CheckCircle2, FileCode, Layers, ExternalLink } from 'lucide-react';

interface ProjectSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSpecModal: React.FC<ProjectSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'API' | 'NEGATIVE_TESTS'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-red-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-red-800 text-white px-6 py-4 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-950 text-white flex items-center justify-center font-bold text-xs border border-red-700/80">
              邦捷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">遠雄巨蛋 臺灣棒球博物館 帳務系統交付規格</h3>
                <span className="text-[10px] bg-red-950 text-red-200 border border-red-700/80 px-2 py-0.5 rounded">
                  架構工程規範手冊
                </span>
              </div>
              <p className="text-xs text-red-200">
                邦捷股份有限公司 · 供資深專案經理向遠雄巨蛋股份有限公司提案審閱使用
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            一、 介面與業務架構對齊
          </button>
          <button
            onClick={() => setActiveTab('API')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'API'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            二、 介接與資料規格模型
          </button>
          <button
            onClick={() => setActiveTab('NEGATIVE_TESTS')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'NEGATIVE_TESTS'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            三、 逆向與負向測試防禦矩陣
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs space-y-4">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg">
                <h4 className="font-bold text-red-900 mb-1 text-sm">
                  核心設計理念：棒球視覺語彙與高容錯非實名票務
                </h4>
                <p>
                  針對遠雄巨蛋場館日入萬人的高載量需求，帳務系統全面採用「三秒判讀指標、一鍵批次對帳、即時警示異常」之設計。
                  全站主視覺以棒球紅色縫線色彩為核心，支援十九項業務規格與非實名制售票稽核，整合實體刷卡、電子票證與行動支付之全自動勾稽沖銷。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-red-600" />
                    系統模組架構
                  </h5>
                  <ul className="space-y-1 list-disc list-inside text-slate-600">
                    <li><strong>帳務管理後台登入</strong>：純圖形防偽驗證碼，密碼按住才顯示明碼</li>
                    <li><strong>帳務資料管理</strong>：日曆挑選、展覽類別與五大多元支付勾稽</li>
                    <li><strong>訂單資料管理</strong>：訂單建立日期、卡號、訂單通路(POS/KIOSK)與四大狀態(未付款/已付款/已取消/已退票)</li>
                    <li><strong>人數報表</strong>：全票、優待票、團體票、愛心票與巨蛋容流上限連動</li>
                    <li><strong>遠雄巨蛋日結對帳</strong>：機台班次現金清點、各支付收單平帳覆核</li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    安全與合規亮點
                  </h5>
                  <ul className="space-y-1 list-disc list-inside text-slate-600">
                    <li><strong>密碼安全防護</strong>：嚴格落實「按住才顯示明碼，移開即自動遮蔽」防偷窺防護。</li>
                    <li><strong>非實名制隱私</strong>：訂單不記錄亦不顯示人名、身分證字號與手機，完全保障消費者隱私。</li>
                    <li><strong>報表獨立匯出</strong>：下載報表 CSV 與匯出 Excel 分為兩個獨立按鈕，內建相容編碼。</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'API' && (
            <div className="space-y-4 font-mono text-[11px]">
              <div className="p-3 bg-slate-900 text-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-red-400 font-sans font-bold">
                  <span>端點：查詢帳務結算總表清冊 (/api/v1/accounting/query-settlement)</span>
                  <span className="text-slate-400 font-normal">授權機制：金鑰權杖驗證</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  用途：查詢帳務總結清冊，依據起訖日曆日期、付款管道與展覽類別聚合數據
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                  <pre>{`// 請求資料範例 (JSON 格式)
{
  "startDate": "2026/10/01",
  "endDate": "2026/10/26",
  "exhibitionType": "全展區",
  "selectedFields": ["收入", "退款", "旅行社總額"],
  "paymentMethods": ["KIOSK實體刷卡", "POS實體刷卡", "悠遊卡", "TWQR", "現金"],
  "displayTypes": ["筆數", "金額"]
}`}</pre>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-sans font-bold">
                  <span>端點：巨蛋感應閘門防重放核銷 (/api/v1/pos/gate-verify)</span>
                  <span className="text-slate-400 font-normal">通訊機制：即時閘門推播協定</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  用途：大巨蛋各感應驗票閘門掃描動態條碼，進行防重放核銷驗證
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                  <pre>{`// 閘門核銷資料模型
{
  "gateId": "遠雄巨蛋01號驗票閘門",
  "ticketToken": "TKT-20261026-0001",
  "exhibition": "常設展",
  "scanTimestamp": 1793012400000,
  "signature": "邊緣硬體數位簽章驗證"
}`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'NEGATIVE_TESTS' && (
            <div className="space-y-3">
              <p className="text-slate-600 font-sans">
                針對遠雄巨蛋軟硬體現場工況與極端邊界，預設嚴苛負向測試防禦矩陣：
              </p>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700">
                    <tr>
                      <th className="px-3 py-2">測試編號</th>
                      <th className="px-3 py-2">測試情境分類</th>
                      <th className="px-3 py-2">逆向操作 / 觸發條件</th>
                      <th className="px-3 py-2">預期系統行為 (後端)</th>
                      <th className="px-3 py-2">預期畫面表現 (使用者端)</th>
                      <th className="px-3 py-2">嚴重等級</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900">TC-NEG-01</td>
                      <td className="px-3 py-2 font-medium">連擊防抖 (防重複下發)</td>
                      <td className="px-3 py-2">使用者連續快速點擊「作廢訂單」或「查詢」按鈕 5 次</td>
                      <td className="px-3 py-2">僅處理第 1 筆請求，其餘請求於前端攔截，後端配置冪等性鍵值</td>
                      <td className="px-3 py-2">按鈕點擊後立即進入停用狀態與轉圈提示，防止重複刷退</td>
                      <td className="px-3 py-2 text-rose-600 font-bold">P1</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900">TC-NEG-02</td>
                      <td className="px-3 py-2 font-medium">硬體設備離線</td>
                      <td className="px-3 py-2">在機台通訊模組斷線狀態下發送結帳或發票開立指令</td>
                      <td className="px-3 py-2">於 3 秒內捕捉通訊逾時，記錄日誌並進入本機離線安全快取佇列</td>
                      <td className="px-3 py-2">畫面跳出系統警告提示：「設備目前離線中，已切換至離線暫存模式」</td>
                      <td className="px-3 py-2 text-rose-600 font-bold">P0</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900">TC-NEG-03</td>
                      <td className="px-3 py-2 font-medium">併發重複入場 (競態衝突)</td>
                      <td className="px-3 py-2">同一張票券條碼於 1 秒內在 1 號閘門與 2 號閘門同時感應</td>
                      <td className="px-3 py-2">資料庫分散式鎖定票號，第 1 筆核銷通過，第 2 筆回傳狀態衝突</td>
                      <td className="px-3 py-2">第 2 個閘門亮紅燈並語音提示「票券已核銷」，後台標記異常</td>
                      <td className="px-3 py-2 text-rose-600 font-bold">P0</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900">TC-NEG-04</td>
                      <td className="px-3 py-2 font-medium">非實名防洩與卡號遮蔽</td>
                      <td className="px-3 py-2">嘗試透過未授權方式攔截交易封包或卡號資訊</td>
                      <td className="px-3 py-2">後端一律不儲存個人真實姓名與身分證，刷卡卡號僅保留末四碼</td>
                      <td className="px-3 py-2">表格固定僅顯示非實名訂單代號與末四碼，確保金管會規範</td>
                      <td className="px-3 py-2 text-amber-600 font-bold">P1</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900">TC-NEG-05</td>
                      <td className="px-3 py-2 font-medium">驗證碼防暴力破解</td>
                      <td className="px-3 py-2">連續 5 次輸入錯誤圖形驗證碼</td>
                      <td className="px-3 py-2">後端針對來源位置鎖定 15 分鐘，回傳狀態碼 429 請求超限保護</td>
                      <td className="px-3 py-2">登入按鈕凍結並出現倒數計時提示與安全警告</td>
                      <td className="px-3 py-2 text-amber-600 font-bold">P2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md text-xs cursor-pointer"
          >
            返回系統操作
          </button>
        </div>
      </div>
    </div>
  );
};
