import React, { useState } from 'react';
import { CircleDollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Student, MonthlyPayments } from '../../types';
import { getMonthKey, getTodayKey, getGradeIndex, normalizeArabic } from '../../utils';

interface FinancialStatsTabProps {
  students: Student[];
  payments: MonthlyPayments;
}

export const FinancialStatsTab: React.FC<FinancialStatsTabProps> = ({
  students,
  payments,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey());
  const todayKey = getTodayKey();

  const monthPayments = payments[selectedMonth] || {};

  let paidCount = 0;
  let unpaidCount = 0;
  let dailyAmount = 0;
  let totalAmount = 0;

  // Calculate card fees in this month too
  Object.keys(monthPayments).forEach((k) => {
    const rec = monthPayments[k];
    if (rec) {
      totalAmount += rec.amount || 0;
      if (rec.date === todayKey) {
        dailyAmount += rec.amount || 0;
      }
    }
  });

  const sortedStudents = [...students].sort((a, b) => {
    const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
    if (gDiff !== 0) return gDiff;
    return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
  });

  sortedStudents.forEach((s) => {
    const payInfo = monthPayments[s.barcode];
    if (payInfo) {
      paidCount++;
    } else {
      unpaidCount++;
    }
  });

  return (
    <div id="expenses-tab" className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CircleDollarSign className="w-6 h-6 text-[var(--primary-gold)]" />
            <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
              💰 لوحة الإيرادات والإحصاء المالي المجمعة
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold">
            عرض تفصيلي لإجمالي المبالغ المحصلة اليوم والشهر، مع كشف الطلاب المدفوع
            لهم وغير المدفوع ورسوم الكروت.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[var(--text-muted)]">
            تحديد شهر الإحصاء:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl text-xs font-bold border outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid #10b981',
          }}
        >
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>اشتراكات مدفوعة</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{paidCount}</p>
        </div>

        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid #f43f5e',
          }}
        >
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>اشتراكات غير مدفوعة / مستحقة</span>
          </div>
          <p className="text-3xl font-black text-rose-400">{unpaidCount}</p>
        </div>

        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid var(--accent-cyan)',
          }}
        >
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>إيرادات اليوم فقط 📅</span>
          </div>
          <p className="text-3xl font-black text-cyan-400">{dailyAmount} ج.م</p>
        </div>

        <div
          className="p-5 rounded-2xl border text-center shadow-lg flex flex-col items-center justify-center gap-1"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderTop: '4px solid var(--primary-gold)',
          }}
        >
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>إجمالي الإيرادات الشهرية 💵</span>
          </div>
          <p className="text-3xl font-black text-[var(--primary-gold)]">
            {totalAmount} ج.م
          </p>
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
                تاريخ السداد واليوم
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                المبلغ المدفوع
              </th>
              <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                حالة السداد
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--text-muted)] font-semibold italic"
                >
                  لا يوجد طلاب مسجلين.
                </td>
              </tr>
            ) : (
              sortedStudents.map((student, idx) => {
                const payInfo = monthPayments[student.barcode];

                return (
                  <tr
                    key={`fin-student-${student.barcode}-${idx}`}
                    className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                  >
                    <td className="p-3 font-mono">{student.barcode}</td>
                    <td className="p-3 font-bold">{student.name}</td>
                    <td className="p-3 text-[var(--text-muted)]">
                      {student.groupGrade}
                    </td>
                    <td className="p-3 font-mono">
                      {payInfo ? `${payInfo.date} ${payInfo.time}` : '-'}
                    </td>
                    <td className="p-3 font-bold">
                      {payInfo ? (
                        <span className="text-emerald-400">
                          {payInfo.amount} ج.م
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      {payInfo ? (
                        <span className="font-black text-emerald-400">
                          ✅ مدفوع
                        </span>
                      ) : (
                        <span className="font-black text-rose-400">
                          ❌ غير مدفوع
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr
              style={{
                backgroundColor: 'var(--table-header-bg)',
                color: 'var(--primary-gold)',
                fontWeight: 'bold',
              }}
            >
              <td colSpan={4} className="p-4 text-center text-sm md:text-base">
                مجموع الإيرادات الكلي للشهر كاملاً (شاملاً رسوم الكروت) 💵
              </td>
              <td
                colSpan={2}
                className="p-4 text-emerald-400 text-lg md:text-xl font-black text-left"
              >
                {totalAmount} ج.م
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
