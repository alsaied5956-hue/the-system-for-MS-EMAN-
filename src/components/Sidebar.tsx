import React from 'react';
import {
  QrCode,
  UserPlus,
  CalendarCheck,
  Award,
  CreditCard,
  CircleDollarSign,
  FileSpreadsheet,
  Send,
  FileDown,
  ShieldAlert,
  Users,
  Settings,
  Sun,
  Moon,
  LogOut,
  X,
  Globe
} from 'lucide-react';
import { UserAccount } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  currentUser: UserAccount | null;
  hasPermission: (permKey: string) => boolean;
  onExportAbsencePDF: () => void;
  onExportExamsPDF: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  hasPermission,
  onExportAbsencePDF,
  onExportExamsPDF,
  isDarkTheme,
  onToggleTheme,
  onLogout,
  isOpen,
  onClose,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    {
      id: 'attendance-scan-tab',
      label: '📡 سكانر الحضور والتأخير',
      icon: QrCode,
      perm: null,
      adminOnly: false,
    },
    {
      id: 'add-student-tab',
      label: '➕ إضافة طالب ومجموعة',
      icon: UserPlus,
      perm: 'add_student',
      adminOnly: false,
    },
    {
      id: 'stats-tab',
      label: '📋 تقرير الحضور اليومي والسابقي',
      icon: CalendarCheck,
      perm: null,
      adminOnly: false,
    },
    {
      id: 'cumulative-report-tab',
      label: '📊 سجل درجات ونسب الطلاب',
      icon: Award,
      perm: null,
      adminOnly: false,
    },
    {
      id: 'pay-expenses-tab',
      label: '💳 دفع مصاريف الطلاب',
      icon: CreditCard,
      perm: 'pay_expenses',
      adminOnly: false,
    },
    {
      id: 'expenses-tab',
      label: '💰 الإيرادات والإحصاء المالي',
      icon: CircleDollarSign,
      perm: 'view_revenues',
      adminOnly: false,
    },
    {
      id: 'grades-tab',
      label: '📝 رصد درجات الامتحان',
      icon: FileSpreadsheet,
      perm: 'add_grades',
      adminOnly: false,
    },
    {
      id: 'whatsapp-engine-tab',
      label: '🚀 المراسلة الفردية المباشرة',
      icon: Send,
      perm: 'send_messages',
      adminOnly: false,
    },
    {
      id: 'parent-portal-tab',
      label: '🌐 بوابة متابعة ولي الأمر',
      icon: Globe,
      perm: null,
      adminOnly: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop-mobile"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <div
        id="mainSidebar"
        className={`fixed md:static top-0 right-0 h-screen w-[290px] min-w-[290px] p-5 flex flex-col gap-2 z-50 transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderLeft: '1px solid var(--card-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Brand Header */}
        <div className="text-center pb-4 mb-3 border-b border-[var(--card-border)] relative">
          <button
            onClick={onClose}
            className="md:hidden absolute top-0 left-0 p-1 text-gray-400 hover:text-white"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-[var(--primary-gold)] tracking-wide">
            إيمان الدمشتي
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">
            أستاذة الرياضيات | 01070642904
          </p>
          {currentUser && (
            <p
              id="sidebar-logged-user"
              className="text-xs font-bold text-amber-400 mt-2 bg-amber-500/10 py-1 px-2 rounded-lg border border-amber-500/20"
            >
              👤 المستخدم: {currentUser.username} (
              {currentUser.role === 'admin' ? 'مسؤول' : 'سكرتارية'})
            </p>
          )}
        </div>

        {/* Regular Menu Navigation */}
        <div className="flex flex-col gap-1.5 flex-1">
          {menuItems.map((item) => {
            if (item.perm && !hasPermission(item.perm)) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full text-right p-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'text-black shadow-lg font-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--primary-gold)] hover:bg-amber-500/10'
                }`}
                style={{
                  background: isActive ? 'var(--gold-gradient)' : 'transparent',
                }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Action PDF Buttons */}
          <div className="my-2 border-t border-[var(--card-border)] pt-2 flex flex-col gap-1.5">
            <button
              id="btn-export-absence-pdf"
              onClick={onExportAbsencePDF}
              className="w-full text-right p-2.5 rounded-xl font-extrabold text-xs text-black transition-all flex items-center gap-2 cursor-pointer shadow-md hover:opacity-90"
              style={{ background: 'var(--gold-gradient)' }}
            >
              <FileDown className="w-4 h-4 flex-shrink-0" />
              <span>📄 تقرير غياب وتأخير اليوم (PDF)</span>
            </button>

            <button
              id="btn-export-exams-pdf"
              onClick={onExportExamsPDF}
              className="w-full text-right p-2.5 rounded-xl font-extrabold text-xs text-black transition-all flex items-center gap-2 cursor-pointer shadow-md hover:opacity-90 bg-gradient-to-r from-sky-400 to-cyan-300"
            >
              <FileDown className="w-4 h-4 flex-shrink-0" />
              <span>📄 تقرير درجات الاختبارات (PDF)</span>
            </button>
          </div>

          {/* Admin-Only Sections */}
          {isAdmin && (
            <div className="my-2 border-t border-[var(--card-border)] pt-2 flex flex-col gap-1.5">
              <button
                id="btn-nav-manage-students"
                onClick={() => {
                  onTabChange('manage-students-tab');
                  onClose();
                }}
                className={`w-full text-right p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer ${
                  activeTab === 'manage-students-tab'
                    ? 'bg-rose-600 text-white font-black'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>❌ لوحة التحكم والتعديل</span>
              </button>

              <button
                id="btn-nav-users-tab"
                onClick={() => {
                  onTabChange('users-tab');
                  onClose();
                }}
                className={`w-full text-right p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer ${
                  activeTab === 'users-tab'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>👥 حسابات المستخدمين والصلاحيات</span>
              </button>

              <button
                id="btn-nav-settings-tab"
                onClick={() => {
                  onTabChange('settings-tab');
                  onClose();
                }}
                className={`w-full text-right p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer ${
                  activeTab === 'settings-tab'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>🔑 إعدادات كلمة المرور والأسعار</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[var(--card-border)] flex flex-col gap-2 mt-auto">
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer hover:bg-white/5"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          >
            {isDarkTheme ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-sky-500" />
                <span>الوضع المظلم</span>
              </>
            )}
          </button>

          <button
            id="btn-system-logout"
            onClick={onLogout}
            className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج 🚪</span>
          </button>
        </div>
      </div>
    </>
  );
};
