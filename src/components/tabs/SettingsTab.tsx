import React, { useState } from 'react';
import { KeyRound, DollarSign, CheckCircle2 } from 'lucide-react';
import { UserAccount, GroupPrices } from '../../types';
import { GRADE_ORDER, DEFAULT_GROUP_PRICES } from '../../utils';

interface SettingsTabProps {
  currentUser: UserAccount | null;
  groupPrices: GroupPrices;
  onChangePassword: (newPass: string) => void;
  onSaveGroupPrice: (grade: string, price: number) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentUser,
  groupPrices,
  onChangePassword,
  onSaveGroupPrice,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_ORDER[0]);
  const [gradePrice, setGradePrice] = useState<number>(
    groupPrices[GRADE_ORDER[0]] || DEFAULT_GROUP_PRICES[GRADE_ORDER[0]] || 150
  );
  const [priceAuthPass, setPriceAuthPass] = useState('');
  const [priceMsg, setPriceMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setGradePrice(
      groupPrices[grade] !== undefined
        ? groupPrices[grade]
        : DEFAULT_GROUP_PRICES[grade] || 150
    );
  };

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (currentPass !== currentUser?.pass) {
      setPassMsg({ type: 'error', text: '❌ كلمة المرور الحالية غير صحيحة!' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({
        type: 'error',
        text: '⚠️ كلمة المرور الجديدة وتأكيدها غير متطابقين!',
      });
      return;
    }

    if (newPass.trim() === '') {
      setPassMsg({
        type: 'error',
        text: '⚠️ لا يمكن ترك كلمة المرور فارغة!',
      });
      return;
    }

    onChangePassword(newPass.trim());
    setPassMsg({
      type: 'success',
      text: '✅ تم تغيير كلمة المرور وحفظها بنجاح متزامنة على كافة الأجهزة والسحابة!',
    });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPriceMsg(null);

    if (priceAuthPass !== currentUser?.pass) {
      setPriceMsg({
        type: 'error',
        text: '❌ كلمة المرور غير صحيحة! لا يمكن إجراء هذا التغيير.',
      });
      return;
    }

    if (isNaN(gradePrice) || gradePrice <= 0) {
      setPriceMsg({
        type: 'error',
        text: '⚠️ الرجاء كتابة سعر صحيح ومقبول!',
      });
      return;
    }

    onSaveGroupPrice(selectedGrade, gradePrice);
    setPriceMsg({
      type: 'success',
      text: `✅ تم حفظ وتأكيد سعر الاشتراك لـ (${selectedGrade}) بـ ${gradePrice} جنيه بنجاح ومتزامن على جميع الأجهزة سحابياً!`,
    });
    setPriceAuthPass('');
  };

  return (
    <div id="settings-tab" className="flex flex-col gap-8 animate-fadeIn max-w-[650px] mx-auto">
      {/* Password Change Form */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-6 h-6 text-[var(--primary-gold)]" />
          <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
            🔑 تغيير كلمة المرور الخاصة بحسابك
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-semibold mb-4">
          تحديث كلمة المرور لحساب الأدمن أو السكرتارية فورياً في السحابة.
        </p>

        {passMsg && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs font-bold text-center border ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {passMsg.text}
          </div>
        )}

        <form
          onSubmit={handlePassSubmit}
          className="p-6 md:p-8 rounded-3xl border flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              required
              placeholder="أدخل كلمة المرور الحالية..."
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
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                placeholder="أدخل كلمة المرور الجديدة..."
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
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                placeholder="إعادة كتابة كلمة المرور..."
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
            className="w-full py-3.5 mt-2 rounded-xl font-black text-sm text-black cursor-pointer shadow-lg transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'var(--gold-gradient)' }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>حفظ وتغيير كلمة المرور على السحابة ☁️</span>
          </button>
        </form>
      </div>

      <hr className="border-t border-dashed border-[var(--card-border)]" />

      {/* Group Prices Update */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
            🏷️ تحديث أسعار الاشتراكات الشهرية للمجموعات (الأدمن فقط)
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-semibold mb-4">
          تحديد سعر الاشتراك الشهري المعتمد لكل صف دراسي ويتم تطبيقه على كل
          الطلاب آلياً.
        </p>

        {priceMsg && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs font-bold text-center border ${
              priceMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {priceMsg.text}
          </div>
        )}

        <form
          onSubmit={handlePriceSubmit}
          className="p-6 md:p-8 rounded-3xl border flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
              اختر الصف الدراسي المراد تحديد سعره الكامل لكل مجموعاته:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
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
              سعر الاشتراك الشهري بالجنيه (لكل طلاب الصف):
            </label>
            <input
              type="number"
              value={gradePrice}
              onChange={(e) => setGradePrice(parseFloat(e.target.value) || 0)}
              required
              placeholder="مثال: 150"
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
              كلمة المرور لتأكيد تحديث السعر:
            </label>
            <input
              type="password"
              value={priceAuthPass}
              onChange={(e) => setPriceAuthPass(e.target.value)}
              required
              placeholder="أدخل كلمة مرور النظام..."
              className="w-full p-3 rounded-xl text-sm font-bold border outline-none focus:border-amber-400"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl font-black text-sm text-black bg-cyan-400 hover:bg-cyan-300 cursor-pointer shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            <span>تثبيت وتحديث سعر المجموعة 💵</span>
          </button>
        </form>
      </div>
    </div>
  );
};
