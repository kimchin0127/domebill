import React from 'react';
import { Menu, LogOut, KeyRound } from 'lucide-react';
import { UserAccount } from '../../types';

interface HeaderProps {
  currentUser: UserAccount;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

/**
 * 需求 1: 平台管理後台 改為 帳務管理後台
 * 需求 4: 棒球紅色縫線主色
 * 需求 8: 英文描述全部移除 (移除 Hi! 等英文字樣)
 * 需求 10: font size 放大
 * 需求 12: 右上角的螢幕放大鍵移除
 */
export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onToggleSidebar,
  onLogout,
  onOpenChangePassword,
}) => {
  return (
    <header className="bg-red-800 text-white shadow-md sticky top-0 z-40 select-none border-b border-red-900">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
        {/* 左側：Logo 與系統名稱 */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            aria-label="選單收合"
            className="p-2 rounded-md hover:bg-red-900/80 transition-colors text-white cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/DOME_LOGO_0e8df3c4.png"
              alt="臺灣棒球博物館"
              className="h-10 w-auto bg-white rounded-md px-2 py-0.5 object-contain shadow-xs"
            />
            <div className="leading-tight">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                帳務管理後台
                <span className="hidden sm:inline text-xs font-semibold bg-red-950/80 text-red-100 px-2.5 py-1 rounded-md border border-red-700/60">
                  遠雄巨蛋 臺灣棒球博物館
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* 右側：使用者資訊、密碼修改、登出 (移除右上角螢幕放大鍵) */}
        <div className="flex items-center gap-3 sm:gap-5 text-sm">
          {/* 使用者狀態識別（移除 Hi! 改為繁體中文「您好，」） */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-red-900/60 border border-red-700/50">
            <div className="w-6 h-6 rounded-full bg-red-200 text-red-950 flex items-center justify-center text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-white font-bold text-sm">您好，{currentUser.name.split(' ')[0]}</span>
              <span className="text-xs text-red-200 block">({currentUser.roleLabel})</span>
            </div>
          </div>

          {/* 密碼修改 */}
          <button
            onClick={onOpenChangePassword}
            aria-label="修改密碼"
            title="修改個人密碼"
            className="px-3 py-1.5 rounded-md hover:bg-red-900 text-red-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
          >
            <KeyRound className="w-4 h-4" />
            <span className="hidden md:inline">修改密碼</span>
          </button>

          {/* 登出 */}
          <button
            onClick={onLogout}
            aria-label="登出系統"
            title="登出帳務管理後台"
            className="px-3 py-1.5 rounded-md hover:bg-black/30 text-red-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">登出系統</span>
          </button>
        </div>
      </div>
    </header>
  );
};
