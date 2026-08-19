import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Globe } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthOverlayProps {
  usersList: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onOpenParentPortal?: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({
  usersList,
  onLogin,
  onOpenParentPortal,
}) => {
  const [selectedUsername, setSelectedUsername] = useState<string>(
    usersList[0]?.username || 'admin'
  );
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetUser = usersList.find((u) => u.username === selectedUsername);
    if (!targetUser) {
      setErrorMessage('❌ اسم المستخدم غير موجود!');
      return;
    }

    if (targetUser.pass === password.trim()) {
      onLogin(targetUser);
    } else {
      setErrorMessage('❌ كلمة المرور غير صحيحة!');
    }
  };

  return (
    <div
      id="auth-overlay"
      className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-4"
      style={{
        backgroundColor: 'var(--bg-dark)',
        backdropFilter: 'blur(15px)',
      }}
    >
      <div
        className="auth-card w-full max-w-[420px] p-8 md:p-10 rounded-3xl text-center flex flex-col items-center gap-4 transition-all"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--primary-gold)',
          boxShadow: 'var(--glass-shadow), 0 0 25px rgba(212, 175, 55, 0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-[var(--primary-gold)] tracking-wide">
          🔒 تسجيل دخول الإدارة
        </h2>

        <p className="text-xs font-semibold text-[var(--text-muted)] -mt-2">
          اختر اسم المستخدم وأدخل كلمة المرور لدخول لوحة التحكم:
        </p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3 mt-2">
          <div className="flex flex-col text-right gap-1">
            <label className="text-xs font-bold text-[var(--text-muted)]">
              اسم المستخدم:
            </label>
            <select
              id="site-username-select"
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="w-full p-3 rounded-xl text-center font-bold text-sm outline-none border focus:border-amber-400 cursor-pointer"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--primary-gold)',
                color: 'var(--text-main)',
              }}
            >
              {usersList.map((u, idx) => (
                <option key={`auth-opt-${u.username}-${idx}`} value={u.username}>
                  {u.username} ({u.role === 'admin' ? 'مسؤول' : 'سكرتارية'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-right gap-1">
            <label className="text-xs font-bold text-[var(--text-muted)]">
              كلمة المرور:
            </label>
            <div className="relative">
              <input
                id="site-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                className="w-full p-3 rounded-xl text-center text-sm font-bold outline-none border focus:border-amber-400 pr-10"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--primary-gold)',
                  color: 'var(--text-main)',
                }}
              />
              <KeyRound className="w-4 h-4 text-amber-400/60 absolute top-3.5 right-3" />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl text-sm font-black text-black transition-transform active:scale-95 hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'var(--gold-gradient)',
            }}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>دخول لوحة التحكم</span>
          </button>
        </form>

        {onOpenParentPortal && (
          <div className="w-full pt-3 border-t border-[var(--card-border)] mt-2">
            <button
              id="btn-open-parent-portal-from-login"
              type="button"
              onClick={onOpenParentPortal}
              className="w-full py-3 px-4 rounded-xl text-xs md:text-sm font-extrabold border flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/10 transition-colors"
              style={{
                borderColor: 'var(--primary-gold)',
                color: 'var(--primary-gold)',
                backgroundColor: 'var(--input-bg)',
              }}
            >
              <Globe className="w-4 h-4" />
              <span>🌐 بوابة أولياء الأمور (متابعة الطالب برقم الكود)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
