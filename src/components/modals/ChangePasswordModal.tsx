import React, { useState } from 'react';
import { X, KeyRound, Check } from 'lucide-react';
import { PasswordField } from '../common/PasswordField';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  username,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('請填寫所有密碼欄位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('新密碼與確認密碼不一致');
      return;
    }
    if (newPassword.length < 6) {
      setError('密碼長度至少需6碼');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-red-800 text-white px-7 py-5 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-red-200" />
            <h3 className="text-lg font-extrabold">個人帳號密碼修改</h3>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white p-1 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-9 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">密碼變更成功</h4>
            <p className="text-xs text-slate-500">已同步至遠雄巨蛋資安認證中心，即刻生效。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 space-y-5 text-sm">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs">
              目前登入帳號：<span className="font-mono font-bold text-slate-900 text-sm">{username}</span>
            </div>

            <PasswordField
              label="目前舊密碼 *"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="請輸入現有舊密碼"
            />

            <PasswordField
              label="設定新密碼 *"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="請輸入新密碼 (至少6碼)"
            />

            <PasswordField
              label="確認新密碼 *"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次輸入新密碼"
            />

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs text-xs cursor-pointer"
              >
                儲存新密碼
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
