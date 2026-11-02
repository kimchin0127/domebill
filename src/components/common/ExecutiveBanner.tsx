import React from 'react';
import { Sparkles, Shield } from 'lucide-react';
import { UserRole } from '../../types';

interface ExecutiveBannerProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenQuickDemoInfo: () => void;
}

export const ExecutiveBanner: React.FC<ExecutiveBannerProps> = ({
  userRole,
  onRoleChange,
  onOpenQuickDemoInfo,
}) => {
  return (
    <div className="bg-slate-950 text-slate-100 border-b border-red-950/60 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-sm select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/90 text-red-200 border border-red-800/80 font-bold tracking-wide text-xs">
          <Shield className="w-4 h-4 text-red-400" />
          遠雄巨蛋股份有限公司 · 臺灣棒球博物館
        </span>
        <span className="hidden md:inline text-slate-300 font-medium text-xs">
          票務與帳務核心中台系統
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* 角色身分切換 */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium text-xs">當前角色：</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-slate-900 text-slate-100 border border-slate-700 rounded-md px-3 py-1 text-xs font-semibold outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="SYSTEM_ADMIN">系統管理員 (全功能系統設定)</option>
            <option value="ACCOUNTING_LEAD">帳務主管 (帳務結算與退票查核)</option>
            <option value="ACCOUNTING_STAFF">帳務人員 (帳務總表與對帳操作)</option>
            <option value="TICKET_LEAD">票務主管 (交班結帳與票務監控)</option>
            <option value="TICKET_STAFF">票務人員 (現場票亭售票與退換)</option>
          </select>
        </div>

        {/* 規格手冊彈窗按鈕 */}
        <button
          onClick={onOpenQuickDemoInfo}
          className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-200" />
          工程規格與逆向測試防禦手冊
        </button>
      </div>
    </div>
  );
};
