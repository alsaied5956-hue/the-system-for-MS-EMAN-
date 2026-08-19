import React, { useState, useRef, useEffect } from 'react';
import { QrCode, UserCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Student, MonthlyPayments } from '../../types';
import { GRADE_ORDER, getMonthKey } from '../../utils';

interface AttendanceScannerTabProps {
  students: Student[];
  scanLogOrder: string[];
  scanLogTimes: { [barcode: string]: string };
  attendanceToday: { [barcode: string]: 'حضور' | 'تأخير' | 'غائب' };
  payments: MonthlyPayments;
  onBarcodeScanned: (
    barcode: string,
    selectedGrade: string,
    selectedDays: string
  ) => void;
  onManualAttendance: () => void;
  onFinishGroupAttendance: (selectedGrade: string, selectedDays: string) => void;
}

export const AttendanceScannerTab: React.FC<AttendanceScannerTabProps> = ({
  students,
  scanLogOrder,
  scanLogTimes,
  attendanceToday,
  payments,
  onBarcodeScanned,
  onManualAttendance,
  onFinishGroupAttendance,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_ORDER[0]);
  const [selectedDays, setSelectedDays] = useState<string>('سبت - إثنين - أربعاء');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [lastScanResult, setLastScanResult] = useState<{
    type: 'success' | 'error' | 'warning';
    student?: Student;
    message?: string;
    time?: string;
    status?: string;
    isPaid?: boolean;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      setBarcodeInput('');
      const student = students.find((s) => s.barcode === code);

      if (!student) {
        setLastScanResult({
          type: 'error',
          message: `❌ الباركود (${code}) غير مسجل في منظومة الطلاب!`,
        });
        onBarcodeScanned(code, selectedGrade, selectedDays);
        return;
      }

      if (
        student.groupGrade !== selectedGrade ||
        student.groupDays !== selectedDays
      ) {
        setLastScanResult({
          type: 'warning',
          student,
          message: `⚠️ تنبيه: الطالب مقيد في (${student.groupGrade} - ${student.groupDays}) والمجموعة الحالية بالقاعة هي (${selectedGrade} - ${selectedDays})`,
        });
        onBarcodeScanned(code, selectedGrade, selectedDays);
        return;
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const currentMonthKey = getMonthKey();
      const isPaid = !!(
        payments &&
        payments[currentMonthKey] &&
        payments[currentMonthKey][code]
      );
      const statusToday = now.getMinutes() > 15 ? 'تأخير' : 'حضور';

      setLastScanResult({
        type: 'success',
        student,
        time: timeStr,
        status: statusToday,
        isPaid,
      });

      onBarcodeScanned(code, selectedGrade, selectedDays);
    }
  };

  const currentMonthKey = getMonthKey();
  const validScannedItems = scanLogOrder
    .map((code) => students.find((s) => s.barcode === code))
    .filter((s): s is Student => !!s);

  return (
    <div id="attendance-scan-tab" className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Group Selection Banner */}
      <div
        className="p-4 md:p-5 rounded-2xl border flex flex-wrap justify-between items-center gap-4"
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-black text-[var(--primary-gold)]">
            المجموعة الحالية بالقاعة:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-2.5 rounded-xl text-xs md:text-sm font-bold border outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--card-bg)',
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

          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="p-2.5 rounded-xl text-xs md:text-sm font-bold border outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
          >
            <option value="سبت - إثنين - أربعاء">سبت - إثنين - أربعاء</option>
            <option value="أحد - ثلاثاء - خميس">أحد - ثلاثاء - خميس</option>
          </select>
        </div>

        <button
          onClick={() => onFinishGroupAttendance(selectedGrade, selectedDays)}
          className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-lg transition-transform active:scale-95"
        >
          🔒 حفظ وإرسال الغياب والتأخير للكل بضغطة واحدة
        </button>
      </div>

      {/* Barcode Scanner Input Center */}
      <div className="w-full max-w-[550px] mx-auto text-center flex flex-col gap-3">
        <label className="text-base md:text-lg font-black text-[var(--primary-gold)]">
          ضع المؤشر هنا ومرر كارت الطالب أمام الإسكانر
        </label>
        <div className="flex gap-2.5 items-center">
          <input
            ref={inputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="انتظار قراءة الباركود الآلية..."
            className="flex-1 p-3.5 rounded-xl text-center text-lg md:text-xl font-black border-2 outline-none focus:ring-4 focus:ring-amber-500/20"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--primary-gold)',
              color: 'var(--text-main)',
            }}
          />
          <button
            onClick={onManualAttendance}
            className="px-4 py-3.5 rounded-xl font-bold text-xs md:text-sm bg-cyan-400 hover:bg-cyan-300 text-black cursor-pointer shadow-md whitespace-nowrap"
          >
            ➕ تعويض يدوي
          </button>
        </div>
      </div>

      {/* Real-time Scan Result Banner */}
      {lastScanResult && (
        <div className="transition-all">
          {lastScanResult.type === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 font-bold text-sm text-center">
              {lastScanResult.message}
            </div>
          )}

          {lastScanResult.type === 'warning' && (
            <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-center flex flex-col gap-1 shadow-lg">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-lg">
                <AlertTriangle className="w-6 h-6" />
                <span>تحذير: طالب من مجموعة أخرى!</span>
              </div>
              <p className="text-sm text-[var(--text-main)] mt-1">
                الطالب <strong>{lastScanResult.student?.name}</strong> مقيد في (
                <strong>
                  {lastScanResult.student?.groupGrade} -{' '}
                  {lastScanResult.student?.groupDays}
                </strong>
                )
              </p>
              <p className="text-xs text-amber-400 font-semibold">
                المجموعة المحددة حالياً بالقاعة هي: ({selectedGrade} -{' '}
                {selectedDays})
              </p>
            </div>
          )}

          {lastScanResult.type === 'success' && lastScanResult.student && (
            <div
              className="p-5 rounded-2xl border flex flex-wrap justify-between items-center gap-4 shadow-xl"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--primary-gold)',
                borderRightWidth: '6px',
              }}
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg md:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>أهلاً بك يا {lastScanResult.student.name}</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold">
                  المجموعة: {lastScanResult.student.groupGrade} |{' '}
                  {lastScanResult.student.groupDays}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      lastScanResult.isPaid
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {lastScanResult.isPaid
                      ? '✅ اشتراك الشهر مدفوع'
                      : '⚠️ اشتراك الشهر غير مدفوع'}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      lastScanResult.status === 'تأخير'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {lastScanResult.status === 'تأخير'
                      ? '🟡 تأخير'
                      : '🟢 حضور'}
                  </span>
                </div>
              </div>

              <div className="text-left flex items-center gap-1.5 text-2xl font-black text-[var(--primary-gold)]">
                <Clock className="w-6 h-6" />
                <span>{lastScanResult.time}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Log Table */}
      <div className="mt-2">
        <h3 className="text-base font-black text-[var(--primary-gold)] pb-2 mb-3 border-b border-[var(--card-border)] flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          <span>
            📋 قائمة الحضور الحالية (إجمالي الحاضرين حالياً:{' '}
            {validScannedItems.length})
          </span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-[var(--card-border)] shadow-lg">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--table-header-bg)',
                  color: 'var(--primary-gold)',
                }}
              >
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  الترتيب
                </th>
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
                  حالة الاشتراك
                </th>
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  حالة اليوم
                </th>
                <th className="p-3.5 border-b border-[var(--card-border)] font-black">
                  وقت الدخول
                </th>
              </tr>
            </thead>
            <tbody>
              {validScannedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center italic text-[var(--text-muted)] font-semibold"
                  >
                    في انتظار أول قراءة حضور...
                  </td>
                </tr>
              ) : (
                validScannedItems.map((student, idx) => {
                  const isPaid = !!(
                    payments &&
                    payments[currentMonthKey] &&
                    payments[currentMonthKey][student.barcode]
                  );
                  const statusToday =
                    attendanceToday[student.barcode] || 'حضور';
                  const orderNumber = validScannedItems.length - idx;
                  const timeRecorded = scanLogTimes[student.barcode];
                  const formattedTime = timeRecorded
                    ? new Date(timeRecorded).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date().toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <tr
                      key={`scan-item-${student.barcode}-${idx}`}
                      className="hover:bg-[var(--hover-bg)] border-b border-[var(--card-border)] transition-colors"
                    >
                      <td className="p-3 font-black text-[var(--primary-gold)]">
                        {orderNumber}
                      </td>
                      <td className="p-3 font-mono">{student.barcode}</td>
                      <td className="p-3 font-bold">{student.name}</td>
                      <td className="p-3 text-[var(--text-muted)]">
                        {student.groupGrade}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-black ${
                            isPaid ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPaid ? '✅ مدفوع' : '❌ مستحق'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-black ${
                            statusToday === 'تأخير'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {statusToday}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--text-muted)] font-mono">
                        {formattedTime}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
