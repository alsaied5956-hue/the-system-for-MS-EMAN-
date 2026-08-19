import React, { useState } from 'react';
import { Users, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { UserAccount } from '../../types';
import { ALL_PERMISSIONS } from '../../utils';

interface UsersManagementTabProps {
  usersList: UserAccount[];
  currentUser: UserAccount | null;
  onAddUser: (user: UserAccount) => void;
  onOpenEditUserModal: (user: UserAccount) => void;
  onDeleteUser: (username: string) => void;
}

export const UsersManagementTab: React.FC<UsersManagementTabProps> = ({
  usersList,
  currentUser,
  onAddUser,
  onOpenEditUserModal,
  onDeleteUser,
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'secretary'>('secretary');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    'add_student',
    'edit_student',
    'change_status',
    'pay_expenses',
    'add_grades',
    'send_messages',
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = newUsername.trim();
    const cleanPass = newPassword.trim();

    if (usersList.some((u) => u.username === cleanUser)) {
      setErrorMsg('⚠️ اسم المستخدم موجود بالفعل!');
      return;
    }

    onAddUser({
      username: cleanUser,
      pass: cleanPass,
      role: newRole,
      permissions: newRole === 'admin' ? [...ALL_PERMISSIONS] : selectedPerms,
    });

    setNewUsername('');
    setNewPassword('');
    setNewRole('secretary');
  };

  const permLabels: { [key: string]: string } = {
    add_student: 'إضافة طالب جديد',
    edit_student: 'تعديل بيانات الطالب',
    delete_student: 'حذف الطلاب',
    change_status: 'تغيير حالة الحضور',
    pay_expenses: 'إثبات دفع الاشتراك',
    view_revenues: 'رؤية الإيرادات والإحصائيات المالية',
    add_grades: 'رصد الدرجات',
    send_messages: 'إرسال الرسائل',
    manage_prices: 'تعديل الأسعار',
  };

  const adminCount = usersList.filter((u) => u.role === 'admin').length;

  return (
    <div id="users-tab" className="flex flex-col gap-6 animate-fadeIn max-w-[850px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-6 h-6 text-[var(--primary-gold)]" />
          <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
            👥 إدارة حسابات المستخدمين والتصريح بالصلاحيات
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-semibold">
          إضافة حسابات سكرتارية وتعيين الصلاحيات الدقيقة لكل موظف، أو تعيين
          مسؤولين كاملين.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Add User Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl border flex flex-col gap-4 shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <h3 className="text-sm font-black text-[var(--primary-gold)] flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              اسم المستخدم الجديد (User)
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              placeholder="مثال: secretary1"
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              كلمة المرور (Password)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور..."
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
            نوع الحساب والصلاحيات العامة
          </label>
          <select
            value={newRole}
            onChange={(e) =>
              setNewRole(e.target.value as 'admin' | 'secretary')
            }
            className="w-full p-3 rounded-xl text-sm font-bold border outline-none"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          >
            <option value="secretary">سكرتارية (صلاحيات مخصصة)</option>
            <option value="admin">مسؤول كامل (الأدمن)</option>
          </select>
        </div>

        {newRole === 'secretary' && (
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
              تحديد الصلاحيات المتاحة للمستخدم:
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(perm)}
                    onChange={() => togglePerm(perm)}
                    className="rounded text-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{permLabels[perm] || perm}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 mt-2 rounded-xl font-black text-sm text-black cursor-pointer shadow-lg transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'var(--gold-gradient)' }}
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة مستخدم جديد ➕</span>
        </button>
      </form>

      {/* Users Table */}
      <div>
        <h3 className="text-base font-black text-[var(--primary-gold)] mb-3">
          📋 قائمة المستخدمين الحالية
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-[var(--card-border)] shadow-xl">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--table-header-bg)',
                  color: 'var(--primary-gold)',
                }}
              >
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  اسم المستخدم
                </th>
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  الدور / النوع
                </th>
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  الصلاحيات الممنوحة
                </th>
                <th className="p-3.5 border-b border-[var(--card-border)] font-black text-center">
                  إجراءات والتعديل
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u, idx) => {
                const permsText =
                  u.role === 'admin'
                    ? 'كل الصلاحيات (أدمن)'
                    : u.permissions && u.permissions.length > 0
                    ? u.permissions.map((p) => permLabels[p] || p).join('، ')
                    : 'بدون صلاحيات';

                const isOnlyAdmin = u.role === 'admin' && adminCount <= 1;

                return (
                  <tr
                    key={`user-row-${u.username}-${idx}`}
                    className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                  >
                    <td className="p-3 font-bold">{u.username}</td>
                    <td className="p-3 font-semibold">
                      {u.role === 'admin' ? (
                        <span className="text-amber-400">👑 أدمن كامل</span>
                      ) : (
                        <span className="text-sky-400">👤 سكرتارية</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-[var(--text-muted)] max-w-[280px]">
                      {permsText}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenEditUserModal(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        {!isOnlyAdmin ? (
                          <button
                            onClick={() => onDeleteUser(u.username)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-bold">
                            🛡️ أدمن رئيسي
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
