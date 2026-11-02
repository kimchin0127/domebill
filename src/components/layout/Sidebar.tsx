import React from 'react';
import {
  ChevronRight,
  Building,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { UserAccount } from '../../types';

export type ViewTab =
  | 'DASHBOARD'
  | 'ACCOUNTING'
  | 'ORDERS'
  | 'ATTENDANCE'
  | 'ACCOUNTS'
  | 'RECONCILIATION'
  | 'KMS'
  | 'API_LOGS';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpen: boolean;
  currentUser: UserAccount;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  currentUser,
  onLogout,
  onOpenChangePassword,
}) => {
  // 需求指示：移除系統功能 ICON，純文字呈現
  const navItems: { id: ViewTab; label: string }[] = [
    {
      id: 'DASHBOARD',
      label: '儀錶板',
    },
    {
      id: 'ACCOUNTING',
      label: '帳務資料管理',
    },
    {
      id: 'ORDERS',
      label: '訂單資料管理',
    },
    {
      id: 'ATTENDANCE',
      label: '人數報表',
    },
    {
      id: 'ACCOUNTS',
      label: '帳號權限管理',
    },
    {
      id: 'RECONCILIATION',
      label: '日交班結帳',
    },
    {
      id: 'KMS',
      label: 'kms設備監控管理',
    },
    {
      id: 'API_LOGS',
      label: '外部API介接管理',
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between select-none shadow-sm">
      {/* 導航主選單：單純純文字呈現，無任何圖示 */}
      <div className="py-5 space-y-1">
        <div className="px-6 pb-3 text-sm font-black tracking-wider text-slate-500 uppercase">
          系統功能
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3.5 text-base font-bold transition-colors text-left cursor-pointer border-l-4 ${
                isActive
                  ? 'border-red-600 bg-red-50 text-red-950 font-black'
                  : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span className="text-base tracking-wide font-bold">{item.label}</span>

              <ChevronRight
                className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-300'}`}
              />
            </button>
          );
        })}
      </div>

      {/* 底部使用者資訊 */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building className="w-5 h-5 text-red-700 shrink-0" />
          <div className="leading-tight">
            <span className="font-extrabold text-slate-800 block text-xs">
              {currentUser.organization}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              帳號：{currentUser.username}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-600">
          <button
            onClick={onOpenChangePassword}
            className="hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            修改密碼
          </button>
          <button
            onClick={onLogout}
            className="hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            登出
          </button>
        </div>
      </div>
    </aside>
  );
};
