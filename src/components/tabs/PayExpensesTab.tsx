import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { Student, GroupPrices } from '../../types';
import { DEFAULT_GROUP_PRICES } from '../../utils';

interface PayExpensesTabProps {
  students: Student[];
  groupPrices: GroupPrices;
  onPayExpenses: (student: Student, amount: number) => void;
}

export const PayExpensesTab: React.FC<PayExpensesTabProps> = ({
  students,
  groupPrices,
  onPayExpenses,
}) => {
  const [barcode, setBarcode] = useState('');
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMsg(null);

    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    const student = students.find((s) => s.barcode === cleanCode);
    if (!student) {
      setStatusMsg({
        type: 'error',
        text: `❌ الطالب بالباركود (${cleanCode}) غير مسجل في المنظومة!`,
      });
      return;
    }

    const price =
      groupPrices[student.groupGrade] ||
      DEFAULT_GROUP_PRICES[student.groupGrade] ||
      150;

    onPayExpenses(student, price);
    setStatusMsg({
      type: 'success',
      text: `✅ تم إثبات سداد الاشتراك للطالب/ة (${student.name}) بمبلغ ${price} ج.م وفتح الواتساب بنجاح!`,
    });
    setBarcode('');
  };

  return (
    <div id="pay-expenses-tab" className="animate-fadeIn max-w-[650px] mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-6 h-6 text-[var(--primary-gold)]" />
        <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
          💳 نافذة إثبات وسداد المصروفات الشهرية
        </h2>
      </div>
      <p className="text-xs text-[var(--text-muted)] font-semibold mb-6">
        قم بمسح أو كتابة باركود الطالب لإثبات سداد الاشتراك الشهري وفتح شات ولي
        الأمر بالرسالة المجهزة بالتاريخ والساعة والمبلغ حسب المرحلة.
      </p>

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
        onSubmit={handlePay}
        className="p-6 md:p-8 rounded-3xl border flex flex-col gap-5 shadow-2xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--primary-gold)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm md:text-base font-black text-[var(--primary-gold)] text-center">
            ادخل الباركود أو مرر الكارت أمام الإسكانر:
          </label>
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="اضرب باركود الطالب لتأكيد السداد..."
            className="w-full p-4 rounded-2xl text-center text-lg md:text-xl font-black border-2 outline-none focus:border-amber-400"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--primary-gold)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl font-black text-sm md:text-base text-black cursor-pointer shadow-xl transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'var(--gold-gradient)' }}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>إثبات سداد الاشتراك وإرسال الرسالة الآن 💵</span>
        </button>
      </form>
    </div>
  );
};
