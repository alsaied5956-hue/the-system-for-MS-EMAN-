import React, { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import { Student } from '../../types';
import { GRADE_ORDER } from '../../utils';

interface AddStudentTabProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
}

export const AddStudentTab: React.FC<AddStudentTabProps> = ({
  students,
  onAddStudent,
}) => {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [groupGrade, setGroupGrade] = useState(GRADE_ORDER[0]);
  const [groupDays, setGroupDays] = useState('سبت - إثنين - أربعاء');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanBarcode = barcode.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanParentPhone = parentPhone.trim();

    if (students.some((s) => s.barcode === cleanBarcode)) {
      setErrorMsg('⚠️ هذا الباركود مسجل لطالب آخر بالفعل!');
      return;
    }

    const newStudent: Student = {
      barcode: cleanBarcode,
      name: cleanName,
      phone: cleanPhone,
      parentPhone: cleanParentPhone,
      groupGrade,
      groupDays,
      points: 0,
      totalAttendanceDays: 0,
      totalAbsentDays: 0,
      totalExamScores: [],
    };

    onAddStudent(newStudent);

    // Reset inputs
    setBarcode('');
    setName('');
    setPhone('');
    setParentPhone('');
  };

  return (
    <div id="add-student-tab" className="animate-fadeIn max-w-[650px] mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="w-6 h-6 text-[var(--primary-gold)]" />
        <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
          تسجيل طالب جديد (دفع كارت الاشتراك تلقائياً 30 ج.م)
        </h2>
      </div>
      <p className="text-xs text-[var(--text-muted)] font-semibold mb-6">
        سيتم حفظ بيانات الطالب في السحابة فوراً، وإضافة 30 ج.م كارت اشتراك في سجل
        الماليات، وتجهيز رسالة الواتساب لولي الأمر تلقائياً.
      </p>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl border flex flex-col gap-4 shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
            الرقم التسلسلي لكارت الباركود
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
            placeholder="امسح أو اكتب الباركود..."
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
            اسم الطالب ثلاثي
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="اسم الطالب كاملاً..."
            className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              رقم تليفون الطالب
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01xxxxxxxxx"
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
              رقم تليفون ولي الأمر
            </label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              required
              placeholder="01xxxxxxxxx"
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              الصف الدراسي
            </label>
            <select
              value={groupGrade}
              onChange={(e) => setGroupGrade(e.target.value)}
              required
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none"
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
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              أيام المجموعة
            </label>
            <select
              value={groupDays}
              onChange={(e) => setGroupDays(e.target.value)}
              required
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none"
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
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-3 rounded-2xl font-black text-sm text-black cursor-pointer shadow-xl transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'var(--gold-gradient)' }}
        >
          <Sparkles className="w-5 h-5" />
          <span>حفظ وتأكيد تسجيل الطالب (تسجيل كارت 30 ج.م تلقائياً)</span>
        </button>
      </form>
    </div>
  );
};
