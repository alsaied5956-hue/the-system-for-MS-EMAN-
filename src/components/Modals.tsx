import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserAccount, Student } from '../types';
import { ALL_PERMISSIONS, GRADE_ORDER } from '../utils';

// 1. Edit User Modal
interface EditUserModalProps {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserAccount, originalUsername: string) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'secretary'>('secretary');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPassword('');
      setRole(user.role);
      setPermissions(user.permissions || []);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        username: username.trim(),
        pass: password.trim() !== '' ? password.trim() : user.pass,
        role,
        permissions: role === 'admin' ? [...ALL_PERMISSIONS] : permissions,
      },
      user.username
    );
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-[500px] p-6 rounded-2xl border shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[var(--card-border)]">
          <h3 className="text-base font-black text-[var(--primary-gold)]">
            👤 تعديل بيانات المستخدم والصلاحيات
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              اسم المستخدم (User)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة مرور جديدة..."
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              نوع الحساب
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'secretary')}
              className="w-full p-2.5 rounded-xl text-sm border outline-none"
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

          {role === 'secretary' && (
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                تعديل الصلاحيات الممنوحة:
              </label>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl border"
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
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="rounded text-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>{permLabels[perm] || perm}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-black cursor-pointer shadow-md hover:opacity-90"
              style={{ background: 'var(--gold-gradient)' }}
            >
              تحديث وحفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Change Status Modal
interface ChangeStatusModalProps {
  student: Student | null;
  currentStatus: string;
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (barcode: string, newStatus: 'حضور' | 'تأخير' | 'غائب') => void;
}

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  student,
  currentStatus,
  selectedDate,
  isOpen,
  onClose,
  onSave,
}) => {
  const [newStatus, setNewStatus] = useState<'حضور' | 'تأخير' | 'غائب'>('حضور');

  useEffect(() => {
    if (
      currentStatus === 'حضور' ||
      currentStatus === 'تأخير' ||
      currentStatus === 'غائب'
    ) {
      setNewStatus(currentStatus);
    }
  }, [currentStatus]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.barcode, newStatus);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-[480px] p-6 rounded-2xl border shadow-2xl relative"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[var(--card-border)]">
          <h3 className="text-base font-black text-[var(--primary-gold)]">
            🔄 تغيير حالة الطالب (حضور / تأخير / غياب)
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              اسم الطالب
            </label>
            <input
              type="text"
              value={student.name}
              readOnly
              className="w-full p-2.5 rounded-xl text-sm border opacity-80"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              التاريخ والحالة الحالية
            </label>
            <input
              type="text"
              value={`${selectedDate} (${currentStatus})`}
              readOnly
              className="w-full p-2.5 rounded-xl text-sm border opacity-80"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--primary-gold)] mb-1">
              اختر الحالة الجديدة:
            </label>
            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as 'حضور' | 'تأخير' | 'غائب')
              }
              className="w-full p-3 rounded-xl text-sm font-black border outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--primary-gold)',
                color: 'var(--text-main)',
              }}
            >
              <option value="حضور">🟢 حضور (في الموعد)</option>
              <option value="تأخير">🟡 تأخير</option>
              <option value="غائب">🔴 غائب</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-black cursor-pointer shadow-md hover:opacity-90"
              style={{ background: 'var(--gold-gradient)' }}
            >
              تحديث الحالة وحفظ السجل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Edit Student Modal
interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Student, oldBarcode: string) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [groupGrade, setGroupGrade] = useState('');
  const [groupDays, setGroupDays] = useState('سبت - إثنين - أربعاء');

  useEffect(() => {
    if (student) {
      setBarcode(student.barcode);
      setName(student.name);
      setPhone(student.phone);
      setParentPhone(student.parentPhone);
      setGroupGrade(student.groupGrade || GRADE_ORDER[0]);
      setGroupDays(student.groupDays || 'سبت - إثنين - أربعاء');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        ...student,
        barcode: barcode.trim(),
        name: name.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        groupGrade,
        groupDays,
      },
      student.barcode
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-[500px] p-6 rounded-2xl border shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[var(--card-border)]">
          <h3 className="text-base font-black text-[var(--primary-gold)]">
            ✏️ تعديل بيانات الطالب والباركود
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              باركود الطالب
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              اسم الطالب ثلاثي
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              رقم تليفون الطالب
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              رقم تليفون ولي الأمر
            </label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              الصف الدراسي
            </label>
            <select
              value={groupGrade}
              onChange={(e) => setGroupGrade(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            >
              {GRADE_ORDER.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              أيام المجموعة
            </label>
            <select
              value={groupDays}
              onChange={(e) => setGroupDays(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="سبت - إثنين - أربعاء">سبت - إثنين - أربعاء</option>
              <option value="أحد - ثلاثاء - خميس">أحد - ثلاثاء - خميس</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-black cursor-pointer shadow-md hover:opacity-90"
              style={{ background: 'var(--gold-gradient)' }}
            >
              تحديث وحفظ البيانات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Edit Grade Modal
interface EditGradeModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    barcode: string,
    lastTitle: string,
    lastScore: string,
    points: number,
    numericScore?: number
  ) => void;
}

export const EditGradeModal: React.FC<EditGradeModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [score, setScore] = useState('');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (student) {
      setTitle(student.lastExamTitle || '');
      setScore(student.lastExamScore || '');
      setPoints(student.points || 0);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.barcode, title.trim(), score.trim(), points);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-[480px] p-6 rounded-2xl border shadow-2xl relative"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[var(--card-border)]">
          <h3 className="text-base font-black text-[var(--primary-gold)]">
            ✏️ تعديل درجات ونسب الطالب التراكمية
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              اسم الطالب
            </label>
            <input
              type="text"
              value={student.name}
              readOnly
              className="w-full p-2.5 rounded-xl text-sm border opacity-80"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              عنوان آخر امتحان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              النتيجة / الدرجة المسجلة
            </label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              placeholder="مثال: 45 من 50 (90%)"
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              إجمالي النقاط ⭐
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              required
              className="w-full p-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-black cursor-pointer shadow-md hover:opacity-90"
              style={{ background: 'var(--gold-gradient)' }}
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
