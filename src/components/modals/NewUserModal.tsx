import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { PasswordField } from '../common/PasswordField';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserAccount) => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('遠雄巨蛋股份有限公司 / 營運處');
  const [role, setRole] = useState<UserRole>('TICKET_STAFF');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !password) {
      setError('請填寫所有必填欄位 (帳號、姓名、密碼)');
      return;
    }
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不相符，請再次確認');
      return;
    }

    const roleMap: Record<UserRole, string> = {
      SYSTEM_ADMIN: '系統管理員',
      ACCOUNTING_LEAD: '帳務主管',
      ACCOUNTING_STAFF: '帳務人員',
      TICKET_LEAD: '票務主管',
      TICKET_STAFF: '票務人員',
    };

    const newUser: UserAccount = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      username: username.trim(),
      name: name.trim(),
      organization: organization.trim(),
      role,
      roleLabel: roleMap[role],
      email: email.trim() || `${username}@farglorydome.com.tw`,
      phone: phone.trim() || '02-8780-1234',
      status: 'ACTIVE',
      lastLogin: '尚未登入',
      createdAt: '2026/10/26',
    };

    onAddUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-red-800 text-white px-7 py-5 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 text-red-200 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">新增後台權限人員</h3>
              <p className="text-xs text-red-200 mt-0.5">建立遠雄巨蛋與博物館管理帳號</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white p-1 rounded-md cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                登入帳號 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如 fg_auditor_02"
                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono shadow-2xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                人員姓名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如 簡志宏"
                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-xs">
              所屬機構單位
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="例如 遠雄巨蛋股份有限公司 / 稽核室"
              className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-2xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-xs">
              角色權限等級 <span className="text-red-600">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 bg-white font-semibold shadow-2xs"
            >
              <option value="TICKET_STAFF">票務人員 (現場售票、驗票與收銀)</option>
              <option value="ACCOUNTING_STAFF">帳務人員 (帳務對帳、總表產製與核算)</option>
              <option value="ACCOUNTING_LEAD">帳務主管 (日結結算、退票核准與發票作廢)</option>
              <option value="TICKET_LEAD">票務主管 (交班結帳與機台管理)</option>
              <option value="SYSTEM_ADMIN">系統管理員 (全功能與系統權限配置)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-xs">公務信箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@farglory.com.tw"
                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 shadow-2xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-xs">聯絡電話 / 分機</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-8780-1234 #520"
                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm outline-none focus:border-red-600 shadow-2xs"
              />
            </div>
          </div>

          {/* 密碼欄位 (按住眼睛顯示明碼) */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <PasswordField
              label="設定初始密碼 *"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
            />
            <PasswordField
              label="確認初始密碼 *"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次輸入密碼"
            />
          </div>

          <div className="bg-red-50/50 p-3 rounded-lg text-xs text-slate-600 space-y-1 border border-red-100">
            <p className="font-bold text-red-900">安全規範提醒：</p>
            <p>· 眼睛按鈕長按方可檢視明碼，滑鼠移開或放開即刻回復隱碼。</p>
            <p>· 依遠雄巨蛋資安政策，首次登入系統將強制變更密碼。</p>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs cursor-pointer transition-colors text-xs"
            >
              確認建立人員帳號
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
