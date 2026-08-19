import React, { useState } from 'react';
import { Award, Search, Edit3 } from 'lucide-react';
import { Student } from '../../types';
import { getGradeIndex, normalizeArabic } from '../../utils';

interface CumulativeGradesTabProps {
  students: Student[];
  onOpenEditGradeModal: (student: Student) => void;
}

export const CumulativeGradesTab: React.FC<CumulativeGradesTabProps> = ({
  students,
  onOpenEditGradeModal,
}) => {
  const [searchVal, setSearchVal] = useState('');

  const getExamAverage = (s: Student) => {
    if (!s.totalExamScores || s.totalExamScores.length === 0) return 0;
    const validScores = s.totalExamScores.filter((n) => !isNaN(n));
    if (validScores.length === 0) return 0;
    return Math.round(
      validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length
    );
  };

  const getAttendanceRate = (s: Student) => {
    const total = (s.totalAttendanceDays || 0) + (s.totalAbsentDays || 0);
    if (total === 0) return 100;
    return Math.round(((s.totalAttendanceDays || 0) / total) * 100);
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
    const cleanSearch = normalizeArabic(searchVal);
    return (
      normalizeArabic(s.name).includes(cleanSearch) ||
      s.barcode.includes(searchVal.trim())
    );
  });

  return (
    <div id="cumulative-report-tab" className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-6 h-6 text-[var(--primary-gold)]" />
          <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
            📊 النسب المئوية التراكمية وسجلات الدرجات للطلاب
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-semibold">
          يحتوي هذا الجدول على الأداء العام للطلاب ونسب حضورهم وغيابهم مع إمكانية
          تعديل درجات ونسب أي امتحان سابق.
        </p>
      </div>

      <div className="max-w-[400px] relative">
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="بحث سريع باسم الطالب أو الباركود..."
          className="w-full p-3 rounded-xl text-xs md:text-sm font-bold border outline-none pr-10 focus:border-amber-400"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-main)',
          }}
        />
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute top-3.5 right-3" />
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
                المجموعة
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                آخر امتحان ودرجته
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                نسبة الحضور
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                نسبة الغياب
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                متوسط درجات الامتحانات
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                إجمالي النقاط ⭐
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black text-center">
                تعديل
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-[var(--text-muted)] font-semibold italic"
                >
                  لا يوجد طلاب مطابقين للبحث.
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => {
                const attRate = getAttendanceRate(s);
                const absRate = getAbsenceRate(s);
                const avgScore = getExamAverage(s);
                const lastScoreText = s.lastExamScore
                  ? `${s.lastExamTitle || 'امتحان'}: ${s.lastExamScore}`
                  : 'لا يوجد';

                return (
                  <tr
                    key={`cum-student-${s.barcode}-${idx}`}
                    className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                  >
                    <td className="p-3 font-mono">{s.barcode}</td>
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3 text-[var(--text-muted)]">
                      {s.groupGrade}
                    </td>
                    <td className="p-3">
                      <span className="text-[var(--primary-gold)] font-semibold text-xs">
                        {lastScoreText}
                      </span>
                    </td>
                    <td className="p-3 font-black text-emerald-400">
                      {attRate}%
                    </td>
                    <td
                      className={`p-3 font-black ${
                        absRate > 20 ? 'text-rose-400' : 'text-gray-400'
                      }`}
                    >
                      {absRate}%
                    </td>
                    <td
                      className={`p-3 font-black ${
                        avgScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {avgScore}%
                    </td>
                    <td className="p-3 font-black text-amber-400">
                      {s.points || 0} ⭐
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenEditGradeModal(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل الدرجة</span>
                      </button>
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
