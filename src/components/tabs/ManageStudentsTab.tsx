import React, { useState } from 'react';
import { ShieldAlert, Trash2, Edit3, Search, Copy, Check, Link } from 'lucide-react';
import { Student } from '../../types';
import { normalizeArabic, getGradeIndex, getStudentPortalUrl } from '../../utils';

interface ManageStudentsTabProps {
  students: Student[];
  onOpenEditStudentModal: (student: Student) => void;
  onDeleteStudent: (barcode: string) => void;
  onClearAllData: () => void;
}

export const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({
  students,
  onOpenEditStudentModal,
  onDeleteStudent,
  onClearAllData,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const handleCopyLink = (barcode: string) => {
    const url = getStudentPortalUrl(barcode);
    navigator.clipboard.writeText(url);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  const getExamAverage = (s: Student) => {
    if (!s.totalExamScores || s.totalExamScores.length === 0) return 0;
    const valid = s.totalExamScores.filter((n) => !isNaN(n));
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  };

  const getAbsenceRate = (s: Student) => {
    const total = (s.totalAttendanceDays || 0) + (s.totalAbsentDays || 0);
    if (total === 0) return 0;
    return Math.round(((s.totalAbsentDays || 0) / total) * 100);
  };

  const sortedStudents = [...students].sort((a, b) => {
    const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
    if (gDiff !== 0) return gDiff;
    return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
  });

  const filtered = sortedStudents.filter((s) => {
    if (!searchVal.trim()) return true;
    const clean = normalizeArabic(searchVal);
    return (
      normalizeArabic(s.name).includes(clean) ||
      s.barcode.includes(searchVal.trim()) ||
      s.phone.includes(searchVal.trim()) ||
      s.parentPhone.includes(searchVal.trim())
    );
  });

  return (
    <div id="manage-students-tab" className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
              ❌ لوحة التحكم وإدارة بيانات الطلاب وتعديل الباركود
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold">
            تعديل بيانات الطلاب، تغيير الباركود، حذف طالب محدد، أو تصفير
            المنظومة بالكامل.
          </p>
        </div>

        <button
          onClick={onClearAllData}
          className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-md flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>🗑️ مسح كل البيانات</span>
        </button>
      </div>

      <div className="max-w-[450px] relative">
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
          ابحث هنا لتعديل أو حذف الطالب (اسم / تليفون / باركود):
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="اكتب للبحث الفوري..."
            className="w-full p-3 rounded-xl text-xs md:text-sm font-bold border outline-none pr-10 focus:border-amber-400"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          />
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute top-3.5 right-3" />
        </div>
      </div>

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
                الباركود
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                اسم الطالب
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                النقاط الحالية
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                نسبة الامتحانات
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                نسبة الغياب
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black text-center">
                إجراءات التحكم والتعديل
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--text-muted)] font-semibold italic"
                >
                  لا يوجد طلاب مطابقين.
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => {
                const avgScore = getExamAverage(s);
                const absRate = getAbsenceRate(s);

                return (
                  <tr
                    key={`manage-student-${s.barcode}-${idx}`}
                    className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                  >
                    <td className="p-3 font-mono">{s.barcode}</td>
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3 font-black text-amber-400">
                      {s.points || 0} ⭐
                    </td>
                    <td className="p-3 font-black text-emerald-400">
                      {avgScore}%
                    </td>
                    <td
                      className={`p-3 font-black ${
                        absRate > 20 ? 'text-rose-400' : 'text-gray-400'
                      }`}
                    >
                      {absRate}%
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleCopyLink(s.barcode)}
                          title="نسخ رابط بوابة ولي الأمر المباشر"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer inline-flex items-center gap-1"
                        >
                          {copiedBarcode === s.barcode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Link className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedBarcode === s.barcode ? 'تم النسخ' : 'رابط المتابعة'}</span>
                        </button>
                        <button
                          onClick={() => onOpenEditStudentModal(s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => onDeleteStudent(s.barcode)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
