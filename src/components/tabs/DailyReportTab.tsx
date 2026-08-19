import React, { useState } from 'react';
import { Calendar, Filter, Users, UserCheck, UserX, Edit3 } from 'lucide-react';
import { Student, AttendanceHistory } from '../../types';
import { GRADE_ORDER, getTodayKey, getGradeIndex, normalizeArabic } from '../../utils';

interface DailyReportTabProps {
  students: Student[];
  attendanceHistory: AttendanceHistory;
  attendanceToday: { [barcode: string]: 'حضور' | 'تأخير' | 'غائب' };
  onOpenStatusModal: (student: Student, dateKey: string, currentStatus: string) => void;
}

export const DailyReportTab: React.FC<DailyReportTabProps> = ({
  students,
  attendanceHistory,
  attendanceToday,
  onOpenStatusModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterDays, setFilterDays] = useState<string>('ALL');

  const dateMap =
    selectedDate === getTodayKey()
      ? attendanceToday
      : attendanceHistory[selectedDate] || {};

  // Sort students by Grade then by Arabic name
  const sortedStudents = [...students].sort((a, b) => {
    const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
    if (gDiff !== 0) return gDiff;
    return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
  });

  const filteredStudents = sortedStudents.filter((s) => {
    if (filterGrade !== 'ALL' && s.groupGrade !== filterGrade) return false;
    if (filterDays !== 'ALL' && s.groupDays !== filterDays) return false;
    return true;
  });

  let presentCount = 0;
  let absentCount = 0;

  filteredStudents.forEach((s) => {
    const st = dateMap[s.barcode];
    if (st === 'حضور' || st === 'تأخير') presentCount++;
    if (st === 'غائب') absentCount++;
  });

  return (
    <div id="stats-tab" className="flex flex-col gap-6 animate-fadeIn">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid var(--primary-gold)',
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
            <Users className="w-4 h-4 text-amber-400" />
            <span>إجمالي الطلاب المسجلين</span>
          </div>
          <p className="text-3xl font-black text-[var(--primary-gold)]">
            {filteredStudents.length}
          </p>
        </div>

        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid #10b981',
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>حضور وتأخير التاريخ المختار</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{presentCount}</p>
        </div>

        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid #f43f5e',
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
            <UserX className="w-4 h-4 text-rose-400" />
            <span>إجمالي غياب التاريخ المختار</span>
          </div>
          <p className="text-3xl font-black text-rose-400">{absentCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="p-4 rounded-2xl border flex flex-wrap justify-between items-center gap-3"
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--primary-gold)]" />
            <label className="text-xs font-bold text-[var(--text-muted)]">
              تحديد تاريخ السجل:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--primary-gold)]" />
            <label className="text-xs font-bold text-[var(--text-muted)]">
              تصفية:
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="p-2 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="ALL">كل الصفوف الدراسية</option>
              {GRADE_ORDER.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="p-2 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            >
              <option value="ALL">كل الأيام</option>
              <option value="سبت - إثنين - أربعاء">سبت - إثنين - أربعاء</option>
              <option value="أحد - ثلاثاء - خميس">أحد - ثلاثاء - خميس</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                حالة التاريخ المختار
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                رقم ولي الأمر
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black text-center">
                إجراء والتعديل
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--text-muted)] font-semibold italic"
                >
                  لا توجد سجلات مطابقة للفلتر والتاريخ المحدد.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => {
                const status = dateMap[s.barcode] || 'لم يسجل';
                let statusColor = 'text-gray-400';
                if (status === 'حضور') statusColor = 'text-emerald-400';
                if (status === 'تأخير') statusColor = 'text-amber-400';
                if (status === 'غائب') statusColor = 'text-rose-400';

                return (
                  <tr
                    key={`daily-student-${s.barcode}-${idx}`}
                    className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                  >
                    <td className="p-3 font-mono">{s.barcode}</td>
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3 text-[var(--text-muted)]">
                      {s.groupGrade} ({s.groupDays})
                    </td>
                    <td className="p-3">
                      <span className={`font-black ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[var(--text-muted)]">
                      {s.parentPhone}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenStatusModal(s, selectedDate, status)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تغيير الحالة</span>
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
