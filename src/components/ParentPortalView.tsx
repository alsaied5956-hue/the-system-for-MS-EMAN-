import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  CreditCard,
  Calendar,
  Share2,
  Printer,
  ChevronRight,
  Sparkles,
  Lock,
  Sun,
  Moon,
  Copy,
  Check,
  GraduationCap
} from 'lucide-react';
import { Student, SystemData } from '../types';
import { getTodayKey, getMonthKey, normalizeArabic } from '../utils';

interface ParentPortalViewProps {
  data: SystemData;
  initialBarcode?: string;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onGoToLogin?: () => void;
  showAdminButton?: boolean;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  data,
  initialBarcode = '',
  isDarkTheme,
  onToggleTheme,
  onGoToLogin,
  showAdminButton = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialBarcode);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [notFoundMessage, setNotFoundMessage] = useState<string>('');

  const todayKey = getTodayKey();
  const currentMonthKey = getMonthKey();

  // Auto-search if initialBarcode is provided
  useEffect(() => {
    if (initialBarcode && data.students.length > 0) {
      const match = data.students.find(
        (s) => s.barcode.trim() === initialBarcode.trim()
      );
      if (match) {
        setSelectedStudent(match);
        setSearchQuery(match.barcode);
      }
    }
  }, [initialBarcode, data.students]);

  // Keep selectedStudent synchronized with real-time Firebase updates
  useEffect(() => {
    if (selectedStudent && data.students.length > 0) {
      const updated = data.students.find((s) => s.barcode === selectedStudent.barcode);
      if (updated) {
        setSelectedStudent(updated);
      }
    }
  }, [data.students]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setNotFoundMessage('');
    const query = searchQuery.trim();
    if (!query) {
      setSelectedStudent(null);
      return;
    }

    // Search by exact barcode first, then by name
    const byBarcode = data.students.find((s) => s.barcode.trim() === query);
    if (byBarcode) {
      setSelectedStudent(byBarcode);
      return;
    }

    const byName = data.students.find(
      (s) => normalizeArabic(s.name) === normalizeArabic(query)
    );
    if (byName) {
      setSelectedStudent(byName);
      return;
    }

    // Partial search
    const partialMatch = data.students.filter(
      (s) =>
        s.barcode.includes(query) ||
        normalizeArabic(s.name).includes(normalizeArabic(query))
    );

    if (partialMatch.length === 1) {
      setSelectedStudent(partialMatch[0]);
    } else if (partialMatch.length > 1) {
      setSelectedStudent(partialMatch[0]);
    } else {
      setSelectedStudent(null);
      setNotFoundMessage(`لم نتمكن من العثور على طالب برقم الكود أو الاسم "${query}". يرجى التأكد من الرقم المكتوب على الكارت.`);
    }
  };

  const handleCopyDirectLink = () => {
    if (!selectedStudent) return;
    try {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const directUrl = `${origin}${pathname}?student=${encodeURIComponent(selectedStudent.barcode)}`;
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations for selected student
  const todayStatus = selectedStudent
    ? (data.attendanceHistory?.[todayKey]?.[selectedStudent.barcode] ||
       data.attendanceToday?.[selectedStudent.barcode] ||
       'لم يسجل بعد')
    : 'لم يسجل بعد';

  const checkInTime = selectedStudent ? data.scanLogTimes?.[selectedStudent.barcode] : null;

  const isPaidThisMonth = selectedStudent
    ? !!(data.payments?.[currentMonthKey]?.[selectedStudent.barcode])
    : false;

  const paymentDetails = (selectedStudent && isPaidThisMonth)
    ? data.payments[currentMonthKey][selectedStudent.barcode]
    : null;

  const totalSessions = selectedStudent
    ? (selectedStudent.totalAttendanceDays || 0) + (selectedStudent.totalAbsentDays || 0)
    : 0;

  const attendancePercentage = totalSessions > 0 && selectedStudent
    ? Math.round(((selectedStudent.totalAttendanceDays || 0) / totalSessions) * 100)
    : 100;

  const examAverage = selectedStudent?.totalExamScores && selectedStudent.totalExamScores.length > 0
    ? Math.round(
        selectedStudent.totalExamScores.reduce((a, b) => a + b, 0) /
        selectedStudent.totalExamScores.length
      )
    : null;

  // Extract recent attendance dates for this student
  const studentAttendanceLog = selectedStudent
    ? Object.entries(data.attendanceHistory || {})
        .filter(([_, record]) => record[selectedStudent.barcode] !== undefined)
        .map(([dateKey, record]) => ({
          date: dateKey,
          status: record[selectedStudent.barcode],
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8)
    : [];

  return (
    <div
      id="parent-portal-container"
      className="min-h-screen w-full flex flex-col font-sans transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-main)',
      }}
      dir="rtl"
    >
      {/* Top Navbar */}
      <header
        className="w-full border-b px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black shadow-md"
               style={{ background: 'var(--gold-gradient)' }}>
            📐
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-[var(--primary-gold)] leading-tight">
              منظومة الأستاذة إيمان الدمشتي
            </h1>
            <p className="text-[11px] md:text-xs text-[var(--text-muted)] font-semibold">
              بوابة متابعة ولي الأمر الإلكترونية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            id="btn-portal-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-xl border cursor-pointer hover:bg-white/5 transition-colors"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-main)',
            }}
            title={isDarkTheme ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
          >
            {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
          </button>

          {showAdminButton && onGoToLogin && (
            <button
              id="btn-portal-go-to-admin"
              onClick={onGoToLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-amber-500/10 transition-colors"
              style={{
                borderColor: 'var(--primary-gold)',
                color: 'var(--primary-gold)',
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دخول الإدارة</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Search Banner */}
        <div
          id="parent-search-card"
          className="p-5 md:p-7 rounded-3xl border flex flex-col gap-4 text-center transition-all print:hidden"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ⚡ متابعة فورية ولحظية لأداء الطالب
            </span>
            <h2 className="text-xl md:text-2xl font-black text-[var(--text-main)]">
              استعلام عن حضور ودرجات واشتراك الطالب
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-lg">
              أدخل رقم الكود المطبوع على كارنيه الطالب للاطلاع المباشر على حضور اليوم، سجل الغياب، ونتائج الامتحانات.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-xl w-full mx-auto flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <input
                id="input-parent-search-barcode"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اكتب رقم كود الطالب المطبوع على الكارت (مثال: 1001)..."
                className="w-full py-3.5 pr-11 pl-4 rounded-2xl text-center sm:text-right font-bold text-sm md:text-base outline-none border focus:border-amber-400 transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)',
                }}
              />
              <Search className="w-5 h-5 text-amber-400 absolute top-3.5 right-3.5" />
            </div>

            <button
              id="btn-parent-search-submit"
              type="submit"
              className="py-3.5 px-6 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
              style={{ background: 'var(--gold-gradient)' }}
            >
              <span>عرض التقرير</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {notFoundMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs md:text-sm font-bold animate-fadeIn">
              {notFoundMessage}
            </div>
          )}
        </div>

        {/* Display Student Report */}
        {selectedStudent ? (
          <div id="student-report-view" className="flex flex-col gap-6 animate-fadeIn">
            {/* Student Header Card */}
            <div
              className="p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--primary-gold)',
                boxShadow: 'var(--glass-shadow), 0 0 20px rgba(212, 175, 55, 0.15)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                  <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-black text-[var(--primary-gold)]">
                      {selectedStudent.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-400 text-black">
                      كود: {selectedStudent.barcode}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] font-semibold">
                    {selectedStudent.groupGrade} | {selectedStudent.groupDays}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-400 font-black">
                      <Sparkles className="w-3.5 h-3.5" /> {selectedStudent.points || 0} نقطة تفوق
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end print:hidden">
                <button
                  id="btn-copy-direct-student-link"
                  onClick={handleCopyDirectLink}
                  className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/10 transition-colors"
                  style={{
                    borderColor: 'var(--primary-gold)',
                    color: 'var(--primary-gold)',
                    backgroundColor: 'var(--input-bg)',
                  }}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>حفظ رابط الطالب 🔗</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-print-student-card"
                  onClick={handlePrint}
                  className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة 🖨️</span>
                </button>
              </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Today's Attendance Card */}
              <div
                className="p-5 rounded-2xl border flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--text-muted)]">
                    حضور اليوم ({todayKey})
                  </span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex items-center gap-3 my-1">
                  {todayStatus === 'حضور' && (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  )}
                  {todayStatus === 'تأخير' && (
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="w-7 h-7" />
                    </div>
                  )}
                  {todayStatus === 'غائب' && (
                    <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-7 h-7" />
                    </div>
                  )}
                  {todayStatus !== 'حضور' && todayStatus !== 'تأخير' && todayStatus !== 'غائب' && (
                    <div className="p-3 rounded-2xl bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      <Calendar className="w-7 h-7" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-black text-[var(--text-main)]">
                      {todayStatus === 'حضور' && 'حاضر في الموعد 🟢'}
                      {todayStatus === 'تأخير' && 'حضور مع تأخير 🟡'}
                      {todayStatus === 'غائب' && 'غائب عن الحصة 🔴'}
                      {todayStatus !== 'حضور' && todayStatus !== 'تأخير' && todayStatus !== 'غائب' && 'لم تبدأ الحصة بعد ⚪'}
                    </h4>
                    {checkInTime && (
                      <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
                        وقت الدخول: {checkInTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400/80 font-bold border-t border-[var(--card-border)] pt-2 flex items-center gap-1">
                  <span>⚡ تحديث فوري ولحظي من قاعة الدرس</span>
                </div>
              </div>

              {/* 2. Monthly Subscription Status */}
              <div
                className="p-5 rounded-2xl border flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--text-muted)]">
                    اشتراك شهر {currentMonthKey}
                  </span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div className={`p-3 rounded-2xl ${isPaidThisMonth ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {isPaidThisMonth ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangleIcon className="w-7 h-7" />}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-[var(--text-main)]">
                      {isPaidThisMonth ? 'تم سداد الاشتراك ✅' : 'متبقي سداد الاشتراك ⚠️'}
                    </h4>
                    {paymentDetails && (
                      <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
                        المبلغ: {paymentDetails.amount} ج.م | بتاريخ {paymentDetails.date}
                      </p>
                    )}
                    {!isPaidThisMonth && (
                      <p className="text-xs text-rose-400 font-bold mt-0.5">
                        يرجى تسوية اشتراك الشهر مع السكرتارية
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[var(--text-muted)] font-bold border-t border-[var(--card-border)] pt-2">
                  مركز الرياضيات - أ/ إيمان الدمشتي
                </div>
              </div>

              {/* 3. Academic & Exam Average */}
              <div
                className="p-5 rounded-2xl border flex flex-col gap-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--text-muted)]">
                    المستوى والتقييم الأكاديمي
                  </span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-[var(--primary-gold)]">
                      {examAverage !== null ? `${examAverage}% متوسط الدرجات` : 'لا توجد درجات مسجلة'}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
                      نسبة الالتزام بالحضور: {attendancePercentage}%
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-amber-400 font-bold border-t border-[var(--card-border)] pt-2">
                  {attendancePercentage >= 85 ? '🌟 طالب متميز وملتزم بالحضور' : '⚠️ يرجى الاهتمام بالحضور المنتظم'}
                </div>
              </div>
            </div>

            {/* Attendance & Grades Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Attendance History */}
              <div
                className="p-5 md:p-6 rounded-3xl border flex flex-col gap-4"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-black text-[var(--text-main)]">
                      سجل الحضور والغياب التفصيلي
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-emerald-400">حضور: {selectedStudent.totalAttendanceDays || 0}</span>
                    <span className="text-rose-400">غياب: {selectedStudent.totalAbsentDays || 0}</span>
                  </div>
                </div>

                {studentAttendanceLog.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--text-muted)] font-bold">
                    لا توجد حصص سابقة مسجلة بعد.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)]">
                          <th className="py-2.5 px-3">تاريخ الحصة</th>
                          <th className="py-2.5 px-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttendanceLog.map((item, idx) => (
                          <tr
                            key={`parent-att-log-${item.date}-${idx}`}
                            className="border-b border-[var(--card-border)] hover:bg-white/5"
                          >
                            <td className="py-3 px-3 font-mono font-bold">{item.date}</td>
                            <td className="py-3 px-3 text-center font-black">
                              {item.status === 'حضور' && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  حضور 🟢
                                </span>
                              )}
                              {item.status === 'تأخير' && (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  تأخير 🟡
                                </span>
                              )}
                              {item.status === 'غائب' && (
                                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  غياب 🔴
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Exam Scores & Tests */}
              <div
                className="p-5 md:p-6 rounded-3xl border flex flex-col gap-4"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-black text-[var(--text-main)]">
                      سجل درجات الاختبارات الدورية
                    </h4>
                  </div>
                  {selectedStudent.lastExamTitle && (
                    <span className="text-xs font-bold text-amber-400">
                      آخر اختبار: {selectedStudent.lastExamTitle} ({selectedStudent.lastExamScore})
                    </span>
                  )}
                </div>

                {(!selectedStudent.totalExamScores || selectedStudent.totalExamScores.length === 0) ? (
                  <p className="text-center py-6 text-xs text-[var(--text-muted)] font-bold">
                    لم يتم رصد درجات امتحانات لهذا الطالب بعد.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)]">
                          <th className="py-2.5 px-3">رقم الاختبار</th>
                          <th className="py-2.5 px-3 text-center">الدرجة</th>
                          <th className="py-2.5 px-3 text-center">التقييم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.totalExamScores.map((score, idx) => {
                          let evalText = 'ممتاز 🌟';
                          let evalColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
                          if (score < 50) {
                            evalText = 'يحتاج متابعة ⚠️';
                            evalColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
                          } else if (score < 75) {
                            evalText = 'جيد 👍';
                            evalColor = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
                          }

                          return (
                            <tr
                              key={`parent-exam-row-${selectedStudent.barcode}-${idx}`}
                              className="border-b border-[var(--card-border)] hover:bg-white/5"
                            >
                              <td className="py-3 px-3 font-bold">الاختبار الدوري #{idx + 1}</td>
                              <td className="py-3 px-3 text-center font-black font-mono text-base text-[var(--primary-gold)]">
                                {score} / 100
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${evalColor}`}>
                                  {evalText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Guide */
          <div
            className="p-8 md:p-12 rounded-3xl border text-center flex flex-col items-center gap-4 my-auto"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)]">
              أهلاً بكم في بوابة أولياء الأمور
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-md">
              يرجى كتابة رقم كود الطالب المطبوع على الكارت بالأعلى لعرض تقرير الحضور والدرجات فورياً.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t p-4 text-center text-xs text-[var(--text-muted)] font-semibold mt-auto"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <p>منظومة الأستاذة إيمان الدمشتي | أستاذة الرياضيات | للتواصل: 01070642904</p>
      </footer>
    </div>
  );
};

// Fallback icon
function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
