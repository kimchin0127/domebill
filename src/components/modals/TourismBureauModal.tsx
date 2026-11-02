import React from 'react';
import { X, Printer, Download, FileSpreadsheet, ShieldCheck, Building, FileText } from 'lucide-react';
import { exportToCsv, exportToExcel } from '../../utils/exportCsv';

interface TourismBureauModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  route: string;
}

export const TourismBureauModal: React.FC<TourismBureauModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  route,
}) => {
  if (!isOpen) return null;

  const getTourismData = () => {
    const headers = [
      '報表編號',
      '提報展區館舍名稱',
      '執照核准字號',
      '統計起日',
      '統計訖日',
      '參觀總人次',
      '全票(張)',
      '優待票(張)',
      '團體及學校票(張)',
      '愛心優待票(張)',
      '門票營業毛額(元)',
      '退款折讓總額(元)',
      '實收淨額(元)',
      '文化展演營業稅申報類別',
      '主管機關備查號碼'
    ];
    const rows = [
      [
        '觀光法規提報-202610-01',
        '臺北大巨蛋 臺灣棒球博物館',
        '北市教終字第1133098711號',
        startDate,
        endDate,
        4932,
        2890,
        960,
        910,
        172,
        1166850,
        13500,
        1153350,
        '文化展覽與社教推廣門票免徵娛樂稅',
        '台北觀光備查-2026-遠雄巨蛋09'
      ]
    ];
    return { headers, rows };
  };

  const handleExportCsv = () => {
    const { headers, rows } = getTourismData();
    exportToCsv('交通部觀光署_臺灣棒球博物館營運報表', headers, rows);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getTourismData();
    exportToExcel('交通部觀光署_臺灣棒球博物館營運報表', headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-red-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-red-800 text-white px-7 py-5 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 text-red-200 flex items-center justify-center font-bold text-sm border border-red-700/80">
              觀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">交通部觀光署 法規備查專用報表</h3>
                <span className="text-xs bg-red-950 text-red-200 border border-red-700/80 px-2 py-0.5 rounded font-bold">
                  官方備查格式
                </span>
              </div>
              <p className="text-xs text-red-200 mt-0.5">
                依發展觀光條例第37條及文化設施定型化契約應記載及不得記載事項提報
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-red-50/40 border border-red-100 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block font-medium">營運主體單位</span>
              <span className="font-bold text-slate-900 text-sm">遠雄巨蛋股份有限公司</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">文化場館名稱</span>
              <span className="font-bold text-slate-900 text-sm">臺灣棒球博物館 (大巨蛋)</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">統計查詢區間</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{startDate} ~ {endDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">選定展覽類別</span>
              <span className="font-bold text-slate-900 text-sm">{route}</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-sm">
            <div className="bg-slate-100 px-5 py-3 font-bold text-slate-800 border-b border-slate-300 flex items-center justify-between">
              <span>一、 門票銷售與參觀人次統計清冊 (法定提報項目)</span>
              <span className="text-slate-500 font-medium text-xs">幣別：新臺幣 (元)</span>
            </div>

            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-3">票種名稱</th>
                  <th className="px-4 py-3 text-right">公告定價</th>
                  <th className="px-4 py-3 text-right">發行張數</th>
                  <th className="px-4 py-3 text-right">核銷入場數</th>
                  <th className="px-4 py-3 text-right">核銷率</th>
                  <th className="px-4 py-3 text-right">銷售小計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-sm">
                <tr>
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">全票 (一般民眾)</td>
                  <td className="px-4 py-3 text-right">$350</td>
                  <td className="px-4 py-3 text-right">2,890</td>
                  <td className="px-4 py-3 text-right">2,852</td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-bold">98.7%</td>
                  <td className="px-4 py-3 text-right font-bold">$1,011,500</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">優待票 (學生/65歲敬老)</td>
                  <td className="px-4 py-3 text-right">$200</td>
                  <td className="px-4 py-3 text-right">960</td>
                  <td className="px-4 py-3 text-right">946</td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-bold">98.5%</td>
                  <td className="px-4 py-3 text-right font-bold">$192,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">團體參訪票券</td>
                  <td className="px-4 py-3 text-right">$150</td>
                  <td className="px-4 py-3 text-right">910</td>
                  <td className="px-4 py-3 text-right">910</td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-bold">100.0%</td>
                  <td className="px-4 py-3 text-right font-bold">$136,500</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">愛心優待票 (身心障礙優待)</td>
                  <td className="px-4 py-3 text-right">$0</td>
                  <td className="px-4 py-3 text-right">172</td>
                  <td className="px-4 py-3 text-right">172</td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-bold">100.0%</td>
                  <td className="px-4 py-3 text-right font-bold">$0</td>
                </tr>
                <tr className="bg-red-50/70 font-extrabold text-slate-900 text-base">
                  <td className="px-4 py-3.5 font-sans">總計 (全展區)</td>
                  <td className="px-4 py-3.5 text-right">-</td>
                  <td className="px-4 py-3.5 text-right text-red-900">4,932 張</td>
                  <td className="px-4 py-3.5 text-right text-red-900">4,880 人</td>
                  <td className="px-4 py-3.5 text-right text-emerald-800">98.9%</td>
                  <td className="px-4 py-3.5 text-right text-red-950">$1,340,000 元</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Refund Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-700" />
                二、 退票作廢與消費者權益折讓清單
              </h4>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>定型化契約作廢筆數</span>
                  <span className="font-mono font-bold text-slate-900">38 筆 (62 張)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>退款原路刷退/退現金額</span>
                  <span className="font-mono font-bold text-rose-700">-13,500 元</span>
                </div>
                <div className="flex justify-between py-1 pt-2 font-bold text-slate-900 text-sm">
                  <span>營業實收淨額</span>
                  <span className="font-mono text-red-800 text-base">1,326,500 元</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/60">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                三、 主管機關合規與保險背書
              </h4>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>公共意外責任險：富邦產物保險單一事故上限 66,000,000 元</li>
                <li>統一發票開立：100% 透過財政部電子發票大平台傳輸</li>
                <li>數位票券防偽核銷：採用動態加密條碼防偽機制</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer (需求 11: CSV 與 Excel 分成兩個按鈕) */}
        <div className="bg-slate-50 px-7 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono font-bold">
            提報檔案編號：TB-TAIPEI-DOME-20261026
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              列印報表
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-red-300" />
              下載 CSV 報表
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              匯出 Excel 報表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
