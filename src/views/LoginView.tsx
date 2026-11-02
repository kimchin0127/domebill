import React, { useState } from 'react';
import { PasswordField } from '../components/common/PasswordField';
import { CaptchaWidget } from '../components/common/CaptchaWidget';
import { UserAccount, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

/**
 * 需求 1: 平台管理後台 改為 帳務管理後台
 * 需求 2: 最下排字樣僅顯示 遠雄巨蛋股份有限公司 版權所有
 * 需求 3: 驗證方式只選圖形驗證碼 / 智慧防護移除
 * 需求 4: 主視覺改用棒球紅色縫線的紅色來設計
 * 需求 5: 1920 x 1080 與 RWD
 * 需求 8: 英文描述全部移除
 * 需求 10: font size 再次放大
 */
export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('DomeBaseball2026!');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('請輸入您的帳號');
      return;
    }
    if (!password) {
      setErrorMessage('請輸入您的密碼');
      return;
    }
    if (!isCaptchaVerified) {
      setErrorMessage('請先輸入正確的圖形驗證碼');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const matchedUser = INITIAL_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (matchedUser) {
        onLoginSuccess(matchedUser);
      } else {
        onLoginSuccess({
          id: 'USR-TEMP',
          username: username.trim(),
          name: username === 'admin' ? '系統管理員' : username,
          organization: '遠雄巨蛋股份有限公司 / 營運部',
          role: 'SYSTEM_ADMIN',
          roleLabel: '系統管理員',
          email: `${username}@farglorydome.com.tw`,
          phone: '02-8780-1234',
          status: 'ACTIVE',
          lastLogin: '剛剛登入',
          createdAt: '2026/10/26',
        });
      }
    }, 500);
  };

  const handleQuickFill = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setUsername(user.username);
    setPassword('DomeBaseball2026!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-900 to-rose-950 flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* 棒球紅色縫線裝飾弧線 */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1400px] h-[550px] border-b-4 border-dashed border-red-500/30 rounded-[100%] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1600px] h-[600px] border-t-4 border-dashed border-red-500/25 rounded-[100%] pointer-events-none" />

      {/* 頂部標頭 */}
      <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between text-white/95 py-2 z-10 px-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base tracking-wide">遠雄巨蛋股份有限公司</span>
          <span className="text-red-300">|</span>
          <span className="text-red-100 text-sm font-medium">臺灣棒球博物館 票務與帳務核心系統</span>
        </div>
        <div className="text-sm text-red-200">
          連線狀態：安全加密連線
        </div>
      </div>

      {/* 登入主卡片：居中 1920x1080 友善 */}
      <div className="w-full max-w-lg mx-auto my-auto z-10 py-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
          {/* Logo 與卡片標題 (需求 1: 帳務管理後台) */}
          <div className="pt-9 pb-5 px-8 text-center border-b border-slate-100 bg-gradient-to-b from-red-50/50 to-white">
            <img
              src="/assets/aistudio/DOME_LOGO_0e8df3c4.png"
              alt="臺灣棒球博物館"
              className="h-20 w-auto mx-auto object-contain mb-4"
            />
            {/* 需求 1: 帳務管理後台 */}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              帳務管理後台
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 font-medium">
              臺北大巨蛋 臺灣棒球博物館
            </p>
          </div>

          {/* 表單內容 */}
          <form onSubmit={handleLogin} className="p-8 sm:p-10 space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* 您的帳號 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">
                您的帳號
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入後台管理帳號"
                className="w-full rounded-md border border-slate-300 py-3 px-4 text-base outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white font-mono text-slate-900 shadow-2xs"
              />
            </div>

            {/* 您的密碼 (按住眼睛顯示明碼，移開即隱藏) */}
            <PasswordField
              label="您的密碼"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              helperText="安全防偷窺：按住眼睛顯示明碼，移開或放開即自動隱藏"
            />

            {/* 需求 3: 僅保留圖形驗證碼 */}
            <div className="pt-2 border-t border-slate-100">
              <CaptchaWidget onVerifyChange={(valid) => setIsCaptchaVerified(valid)} />
            </div>

            {/* 登入按鈕 (棒球紅主色) */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading
                  ? 'bg-red-400 cursor-wait'
                  : 'bg-red-700 hover:bg-red-800 active:bg-red-900 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>身分與權限驗證中...</span>
                </>
              ) : (
                <>
                  <span>登入系統</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* 回到本系統 */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('DomeBaseball2026!');
                  setIsCaptchaVerified(true);
                }}
                className="text-sm text-red-700 hover:text-red-900 hover:underline font-semibold cursor-pointer"
              >
                謝謝您. 回到本系統 (重置預設管理者)
              </button>
            </div>
          </form>

          {/* 審閱快速身分切換 */}
          <div className="bg-slate-50 p-5 border-t border-slate-100 text-xs">
            <span className="text-xs font-bold text-slate-600 block mb-2.5">
              遠雄巨蛋長官審閱專用快速登入身分：
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ACCOUNTING_LEAD')}
                className="px-3 py-2 rounded bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 text-slate-800 font-semibold text-center text-xs hover:border-red-300 transition-colors cursor-pointer"
              >
                帳務主管
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('TICKET_LEAD')}
                className="px-3 py-2 rounded bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 text-slate-800 font-semibold text-center text-xs hover:border-red-300 transition-colors cursor-pointer"
              >
                票務主管
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('SYSTEM_ADMIN')}
                className="px-3 py-2 rounded bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 text-slate-800 font-semibold text-center text-xs hover:border-red-300 transition-colors cursor-pointer"
              >
                系統管理員
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 需求 2: 最下排字樣僅顯示 遠雄巨蛋股份有限公司 版權所有 */}
      <footer className="text-center text-white/90 text-sm font-medium py-3 z-10">
        遠雄巨蛋股份有限公司 版權所有
      </footer>
    </div>
  );
};
