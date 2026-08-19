import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, Globe, Link, Check, Lock } from 'lucide-react';
import { getGeneralPortalUrl, getAdminUrl } from '../utils';

interface HeaderProps {
  title: string;
  enableVoice: boolean;
  onToggleVoice: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  enableVoice,
  onToggleVoice,
  onToggleSidebar,
}) => {
  const [copiedType, setCopiedType] = useState<'parent' | 'admin' | null>(null);

  const handleCopy = (type: 'parent' | 'admin') => {
    const url = type === 'parent' ? getGeneralPortalUrl() : getAdminUrl();
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const arabicDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      id="main-app-header"
      className="p-4 md:p-5 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-4 transition-all"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar-mobile"
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-amber-300 hover:bg-amber-500/10 cursor-pointer"
          aria-label="القائمة"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-black text-[var(--text-main)]">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Quick Link Sharing Buttons for Admin */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy('parent')}
            title="نسخ رابط بوابة أولياء الأمور لإرساله لأولياء الأمور"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-[var(--primary-gold)] border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedType === 'parent' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{copiedType === 'parent' ? 'تم نسخ رابط الأهالي!' : 'رابط أولياء الأمور 🔗'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy('admin')}
            title="نسخ رابط لوحة الإدارة السري والمباشر"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedType === 'admin' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>{copiedType === 'admin' ? 'تم نسخ رابط الإدارة!' : 'رابط الإدارة 🔑'}</span>
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[var(--text-muted)] cursor-pointer select-none">
          <input
            id="toggle-voice-checkbox"
            type="checkbox"
            checked={enableVoice}
            onChange={onToggleVoice}
            className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
          />
          {enableVoice ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Volume2 className="w-4 h-4" /> النطق الصوتي
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              <VolumeX className="w-4 h-4" /> الصوت معطل
            </span>
          )}
        </label>

        <div
          id="header-current-date"
          className="font-bold text-[var(--primary-gold)] text-xs md:text-sm hidden sm:block"
        >
          {arabicDate}
        </div>
      </div>
    </div>
  );
};

