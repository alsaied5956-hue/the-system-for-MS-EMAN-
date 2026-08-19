import React, { useState } from 'react';
import { FileSpreadsheet, Send, Sparkles } from 'lucide-react';
import { Student } from '../../types';
import { SCHOOL_WHATSAPP_PHONE, openWhatsApp } from '../../utils';

interface ExamGradesTabProps {
  students: Student[];
  onSaveGrade: (
    student: Student,
    examTitle: string,
    score: number,
    maxScore: number,
    percent: number
  ) => void;
}

export const ExamGradesTab: React.FC<ExamGradesTabProps> = ({
  students,
  onSaveGrade,
}) => {
  const [examTitle, setExamTitle] = useState('');
  const [barcode, setBarcode] = useState('');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanCode = barcode.trim();
    const student = students.find((s) => s.barcode === cleanCode);

    if (!student) {
      setStatusMsg({
        type: 'error',
        text: `❌ الطالب بالباركود (${cleanCode}) غير مسجل!`,
      });
      return;
    }

    if (maxScore <= 0) {
      setStatusMsg({
        type: 'error',
        text: '⚠️ الرجاء إدخال درجة عظمى صحيحة أكبر من صفر!',
      });
      return;
    }

    if (score < 0 || score > maxScore) {
      setStatusMsg({
        type: 'error',
        text: `⚠️ درجة الطالب يجب أن تكون بين 0 و ${maxScore}!`,
      });
      return;
    }

    const percent = Math.round((score / maxScore) * 100);
    onSaveGrade(student, examTitle.trim(), score, maxScore, percent);

    setStatusMsg({
      type: 'success',
      text: `✅ تم رصد درجة الطالب/ة (${student.name}) بنسبة ${percent}% وفتح الواتساب لإرسال التقرير لولي الأمر!`,
    });

    setBarcode('');
  };

  const handleExportAllToTeacher = () => {
    let msg = `📋 قائمة درجات آخر امتحان كلي للطلاب - منظومة الأستاذة إيمان الدمشتي:\n\n`;
    let count = 0;
    students.forEach((s) => {
      if (s.lastExamScore) {
        count++;
        msg += `- ${s.name} (${s.groupGrade}): ${s.lastExamScore}\n`;
      }
    });

    if (count === 0) {
      alert('⚠️ لا توجد درجات مرصودة حتى الآن!');
      return;
    }

    openWhatsApp(SCHOOL_WHATSAPP_PHONE, msg);
  };

  return (
    <div id="grades-tab" className="animate-fadeIn max-w-[650px] mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-6 h-6 text-[var(--primary-gold)]" />
            <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
              رصد وإضافة نتائج الاختبارات الفورية
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold">
            رصد الدرجات وحساب النسبة المئوية تلقائياً وإرسال التهنئة أو التنبيه
            لولي الأمر.
          </p>
        </div>

        <button
          onClick={handleExportAllToTeacher}
          className="px-4 py-2 rounded-xl text-xs font-black text-black bg-gradient-to-r from-sky-400 to-cyan-300 hover:opacity-90 cursor-pointer shadow-md flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>📲 تصدير جميع درجات آخر امتحان للميس</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 mb-4 rounded-2xl font-bold text-xs md:text-sm text-center border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMsg.text}
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
            عنوان أو اسم الامتحان
          </label>
          <input
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            required
            placeholder="مثال: امتحان رياضيات شهر يوليو"
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
            باركود الطالب
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
            placeholder="امسح أو اكتب باركود الطالب..."
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
              الدرجة العظمى (الدرجة من كام)
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value) || 0)}
              required
              placeholder="100"
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
              درجة الطالب الفعلية
            </label>
            <input
              type="number"
              value={score}
              step="0.5"
              onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
              required
              placeholder="مثال: 45"
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-2 rounded-2xl font-black text-sm text-black cursor-pointer shadow-xl transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'var(--gold-gradient)' }}
        >
          <Sparkles className="w-5 h-5" />
          <span>حفظ النتيجة وإرسالها المباشر لولي الأمر 📲</span>
        </button>
      </form>
    </div>
  );
};
