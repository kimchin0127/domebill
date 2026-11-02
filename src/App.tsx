import React, { useState } from 'react';
import { UserAccount, UserRole } from './types';
import { INITIAL_USERS } from './data/mockData';
import { Header } from './components/layout/Header';
import { Sidebar, ViewTab } from './components/layout/Sidebar';
import { ExecutiveBanner } from './components/common/ExecutiveBanner';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AccountingView } from './views/AccountingView';
import { OrdersView } from './views/OrdersView';
import { AttendanceView } from './views/AttendanceView';
import { AccountManagementView } from './views/AccountManagementView';
import { ReconciliationView } from './views/ReconciliationView';
import { KmsMonitoringView } from './views/KmsMonitoringView';
import { ApiIntegrationLogsView } from './views/ApiIntegrationLogsView';
import { ProjectSpecModal } from './components/modals/ProjectSpecModal';
import { ChangePasswordModal } from './components/modals/ChangePasswordModal';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);

  // Layout & Navigation State (Default to Dashboard for comprehensive operational overview)
  const [currentTab, setCurrentTab] = useState<ViewTab>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Login handler
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleRoleChangeFromBanner = (newRole: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === newRole);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        role: newRole,
        roleLabel:
          newRole === 'TICKET_STAFF'
            ? '票務人員'
            : newRole === 'ACCOUNTING_STAFF'
            ? '帳務人員'
            : newRole === 'ACCOUNTING_LEAD'
            ? '帳務主管'
            : newRole === 'TICKET_LEAD'
            ? '票務主管'
            : '系統管理員',
      }));
    }
  };

  // If not logged in, render the Page 1 Login View with anti-bot and hold-to-reveal eye
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-red-700 selection:text-white">
      {/* 1. Executive Presentation Demo Bar for Farglory Dome Presentation */}
      <ExecutiveBanner
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab as ViewTab)}
        userRole={currentUser.role}
        onRoleChange={handleRoleChangeFromBanner}
        onOpenQuickDemoInfo={() => setIsSpecModalOpen(true)}
      />

      {/* 2. Platform Header (Page 2 layout with Taiwan Baseball Museum logo) */}
      <Header
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* 3. Main Body: Sidebar + Dynamic Workspace Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar matching Page 2 */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />

        {/* Content Viewport - 1920x1080 規範 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
          {currentTab === 'DASHBOARD' && <DashboardView />}
          {currentTab === 'ACCOUNTING' && <AccountingView />}
          {currentTab === 'ORDERS' && <OrdersView />}
          {currentTab === 'ATTENDANCE' && <AttendanceView />}
          {currentTab === 'ACCOUNTS' && <AccountManagementView />}
          {currentTab === 'RECONCILIATION' && <ReconciliationView />}
          {currentTab === 'KMS' && <KmsMonitoringView />}
          {currentTab === 'API_LOGS' && <ApiIntegrationLogsView />}
        </main>
      </div>

      {/* Engineering Specs & Defensive Test Matrix Modal */}
      <ProjectSpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      {/* Personal Password Change Modal with hold-to-reveal eye */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        username={currentUser.username}
      />
    </div>
  );
}
