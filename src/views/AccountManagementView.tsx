import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  CheckCircle,
  KeyRound,
  Building,
  Power,
} from 'lucide-react';
import { INITIAL_USERS } from '../data/mockData';
import { UserAccount, UserRole } from '../types';
import { NewUserModal } from '../components/modals/NewUserModal';
import { ChangePasswordModal } from '../components/modals/ChangePasswordModal';

export const AccountManagementView: React.FC = () => {
  // 查詢條件（需求 17: 客運欄位移除，改為 所屬機構單位）
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [usernameQuery, setUsernameQuery] = useState('');
  const [orgQuery, setOrgQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');

  // 人員列表狀態
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState('admin');
  const [toastMsg, setToastMsg] = useState('');

  const handleQuery = () => {
    let list = [...users];
    if (selectedRole !== 'ALL') {
      list = list.filter((u) => u.role === selectedRole);
    }
    if (usernameQuery.trim()) {
      list = list.filter((u) =>
        u.username.toLowerCase().includes(usernameQuery.trim().toLowerCase())
      );
    }
    if (orgQuery.trim()) {
      list = list.filter((u) =>
        u.organization.toLowerCase().includes(orgQuery.trim().toLowerCase())
      );
    }
    if (nameQuery.trim()) {
      list = list.filter((u) =>
        u.name.toLowerCase().includes(nameQuery.trim().toLowerCase())
      );
    }
    setFilteredUsers(list);
    setToastMsg(`人員檢索完成：共 ${list.length} 位人員`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: 'ACTIVE' | 'DISABLED' = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    setFilteredUsers(updated);
    setToastMsg('已更新該人員之帳號啟用狀態');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddNewUser = (newUser: UserAccount) => {
    const updated = [newUser, ...users];
    setUsers(updated);
    setFilteredUsers(updated);
    setToastMsg(`已成功建立人員「${newUser.name}」的後台權限`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenPasswordReset = (targetUsername: string) => {
    setSelectedUserForPassword(targetUsername);
    setIsChangePasswordModalOpen(true);
  };

  return (
    <div className="space-y-7">
      {/* 提示訊息 */}
      {toastMsg && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 查詢條件區塊 (需求 17: 客運移除，改為 所屬機構單位) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            查詢條件
          </h2>
          <span className="text-xs text-slate-500">
            遠雄巨蛋與棒球博物館 後台帳號權限管理模組
          </span>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 第一列：角色權限 / 帳號 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-24">
                角色權限
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-sm font-semibold focus:border-red-600 outline-none bg-white shadow-2xs"
              >
                <option value="ALL">請選擇... (全部權限)</option>
                <option value="SYSTEM_ADMIN">系統管理員</option>
                <option value="ACCOUNTING_LEAD">帳務主管</option>
                <option value="ACCOUNTING_STAFF">帳務人員</option>
                <option value="TICKET_LEAD">票務主管</option>
                <option value="TICKET_STAFF">票務人員</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-24">
                帳號
              </label>
              <input
                type="text"
                value={usernameQuery}
                onChange={(e) => setUsernameQuery(e.target.value)}
                placeholder="輸入後台登入帳號"
                className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 font-mono text-sm focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* 第二列：所屬機構單位 (原客運名稱) / 人員姓名 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-24">
                所屬機構單位
              </label>
              <input
                type="text"
                value={orgQuery}
                onChange={(e) => setOrgQuery(e.target.value)}
                placeholder="例如 遠雄巨蛋股份有限公司 / 營運部"
                className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-800 whitespace-nowrap w-24">
                人員姓名
              </label>
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="輸入姓名"
                className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:border-red-600 outline-none bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* 按鈕 */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleQuery}
              className="px-7 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer text-sm"
            >
              <Search className="w-4 h-4" />
              <span>查詢</span>
            </button>
          </div>
        </div>
      </div>

      {/* 人員列表區塊 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg leading-none">|</span>
            人員列表
          </h3>

          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>新增人員</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">人員編號</th>
                <th className="px-4 py-3 whitespace-nowrap">帳號</th>
                <th className="px-4 py-3 whitespace-nowrap">人員姓名</th>
                <th className="px-4 py-3 whitespace-nowrap">所屬機構單位</th>
                <th className="px-4 py-3 whitespace-nowrap">角色權限</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">最後登入時間</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作功能</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                    {user.id}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-bold text-red-800">
                    {user.username}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-sans font-bold text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-sans text-slate-700 font-medium">
                    {user.organization}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-sans">
                    <span className="inline-block text-xs font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                      {user.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-center font-sans">
                    {user.status === 'ACTIVE' ? (
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-xs">
                        啟用中
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-xs">
                        已停用
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-center font-sans">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenPasswordReset(user.username)}
                        className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline flex items-center gap-1 cursor-pointer"
                        title="重設密碼"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        重設密碼
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                          user.status === 'ACTIVE'
                            ? 'text-rose-600 hover:text-rose-800'
                            : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {user.status === 'ACTIVE' ? '停用' : '啟用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>共註冊 {users.length} 名後台維運與查帳帳號</span>
          <span>依遠雄巨蛋資安規範：閒置 30 分鐘自動強制登出</span>
        </div>
      </div>

      {/* 新增人員彈窗 */}
      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onAddUser={handleAddNewUser}
      />

      {/* 修改密碼彈窗 */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        username={selectedUserForPassword}
      />
    </div>
  );
};
