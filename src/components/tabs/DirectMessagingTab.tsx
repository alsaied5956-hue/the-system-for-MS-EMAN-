import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  AlertTriangle,
  Search,
  MessageSquare,
  Users,
  Zap,
  Globe,
  Copy,
  Check,
  Link
} from 'lucide-react';
import { Student } from '../../types';
import {
  openWhatsApp,
  normalizeArabic,
  getGradeIndex,
  getWhatsAppMode,
  setWhatsAppMode,
  getStudentPortalUrl
} from '../../utils';

interface DirectMessagingTabProps {
  students: Student[];
}

export const DirectMessagingTab: React.FC<DirectMessagingTabProps> = ({
  students,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [parentPhone, setParentPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [waMode, setWaMode] = useState<'desktop' | 'web'>(getWhatsAppMode());
  const [copiedLink, setCopiedLink] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeChange = (mode: 'desktop' | 'web') => {
    setWaMode(mode);
    setWhatsAppMode(mode);
  };

  const sortedStudents = [...students].sort((a, b) => {
    const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
    if (gDiff !== 0) return gDiff;
    return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
  });

  const searchResults = searchVal.trim()
    ? sortedStudents.filter(
        (s) =>
          normalizeArabic(s.name).includes(normalizeArabic(searchVal)) ||
          s.barcode.includes(searchVal.trim())
      )
    : [];

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchVal(student.name);
    setParentPhone(student.parentPhone);
    setIsDropdownOpen(false);
  };

  const handleHomeworkAlert = (type: 'shortage' | 'no_hw') => {
    if (!selectedStudent) {
      alert('⚠️ الرجاء اختيار طالب أولاً!');
      return;
    }

    if (type === 'shortage') {
      setMessageText(
        `تنبيه من منظومة الأستاذة إيمان الدمشتي 📐\nنفيدكم بعلم أن الطالب/ة: (${selectedStudent.name})\nلديه تقصير في أداء واجب الرياضيات المطلوب منه اليوم.`
      );
    } else {
      setMessageText(
        `تنبيه هام من منظومة الأستاذة إيمان الدمشتي 📐\nنفيدكم بعلم أن الطالب/ة: (${selectedStudent.name})\nلم يقم بعمل واجب الرياضيات المطلوب منه نهائياً اليوم.`
      );
    }
  };

  const handleInsertPortalLink = () => {
    if (!selectedStudent) {
      alert('⚠️ الرجاء اختيار طالب أولاً!');
      return;
    }
    const link = getStudentPortalUrl(selectedStudent.barcode);
    const textToAdd = `\n\n🔗 رابط المتابعة المباشر لدرجات وحضور الطالب:\n${link}`;
    setMessageText((prev) => (prev ? prev + textToAdd : textToAdd.trim()));
  };

  const handleCopyStudentLink = () => {
    if (!selectedStudent) {
      alert('⚠️ الرجاء اختيار طالب أولاً!');
      return;
    }
    const link = getStudentPortalUrl(selectedStudent.barcode);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendMessage = () => {
    if (!parentPhone || !messageText.trim()) {
      alert('⚠️ الرجاء اختيار طالب وكتابة نص الرسالة!');
      return;
    }
    openWhatsApp(parentPhone, messageText.trim(), waMode);
  };

  const getExamAverage = (s: Student) => {
    if (!s.totalExamScores || s.totalExamScores.length === 0) return 0;
    const valid = s.totalExamScores.filter((n) => !isNaN(n));
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  };

  const getAbsenceRate = (s: Student) => {
    const total = (s.totalAttendanceDays || 0) + (s.totalAbsentDays || 0);
    if (total === 0) return 0;
    return Math.round(((s.totalAbsentDays || 0) / total) * 100);
  };

  return (
    <div id="whatsapp-engine-tab" className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Left Messaging Engine */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-6 h-6 text-[var(--primary-gold)]" />
                <h2 className="text-lg md:text-xl font-black text-[var(--primary-gold)]">
                  📱 نظام المراسلة الفردية المباشرة
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                إرسال رسالة مخصصة أو روابط المتابعة لأولياء الأمور.
              </p>
            </div>

            {/* WhatsApp Fast Mode Toggle */}
            <div
              className="p-1.5 rounded-2xl border flex items-center gap-1 text-xs font-bold"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <button
                type="button"
                onClick={() => handleModeChange('desktop')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  waMode === 'desktop'
                    ? 'bg-[#25D366] text-black font-black shadow-md'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
                title="يفتح تطبيق واتساب على الكمبيوتر مباشرة بدون تحميل صفحات الويب"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تطبيق الكمبيوتر (سريع جداً ⚡)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('web')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  waMode === 'web'
                    ? 'bg-amber-400 text-black font-black shadow-md'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
                title="يفتح صفحة واتساب ويب في المتصفح"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>واتساب ويب 🌐</span>
              </button>
            </div>
          </div>

          <div
            className="p-6 rounded-3xl border flex flex-col gap-4 shadow-xl"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            {/* Search Input with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                ابحث باسم الطالب أو الباركود الخاص به:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="اكتب اسم الطالب أو الباركود..."
                  className="w-full p-3 rounded-xl text-sm font-bold border outline-none pr-10 focus:border-amber-400"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-main)',
                  }}
                />
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute top-3.5 right-3" />
              </div>

              {isDropdownOpen && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border shadow-2xl z-50 divide-y divide-[var(--card-border)]"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--primary-gold)',
                  }}
                >
                  {searchResults.map((s, idx) => (
                    <div
                      key={`msg-search-${s.barcode}-${idx}`}
                      onClick={() => handleSelectStudent(s)}
                      className="p-3 text-xs md:text-sm font-bold cursor-pointer hover:bg-[var(--hover-bg)] hover:text-[var(--primary-gold)] transition-colors flex justify-between items-center"
                    >
                      <span>
                        {s.name} - {s.groupGrade}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {s.barcode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                رقم ولي الأمر:
              </label>
              <input
                type="text"
                value={parentPhone}
                readOnly
                placeholder="سيظهر تلقائياً عند اختيار الطالب..."
                className="w-full p-3 rounded-xl text-sm font-mono border opacity-80"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            {/* Quick Actions Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleHomeworkAlert('shortage')}
                className="p-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ إرسال تنبيه: تقصير في الواجب</span>
              </button>

              <button
                type="button"
                onClick={() => handleHomeworkAlert('no_hw')}
                className="p-3 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>🚨 إرسال تنبيه: لم يتم عمل الواجب</span>
              </button>
            </div>

            {/* Student Direct Link Tool */}
            {selectedStudent && (
              <div
                className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--primary-gold)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary-gold)]">
                  <Link className="w-4 h-4" />
                  <span>بوابة المتابعة لولي أمر ({selectedStudent.name}):</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertPortalLink}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-sm transition-colors"
                  >
                    + إدراج الرابط في الرسالة
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyStudentLink}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer hover:bg-white/5 transition-colors"
                    style={{
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-main)',
                    }}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                نص الرسالة المخصصة:
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                placeholder="اكتب نص الرسالة المخصصة هنا..."
                className="w-full p-3 rounded-xl text-sm font-semibold border outline-none focus:border-amber-400"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              className="w-full py-4 rounded-2xl font-black text-sm md:text-base text-white bg-[#25D366] hover:bg-[#20bd5a] cursor-pointer shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>إرسال الرسالة الآن عبر الواتساب 📲</span>
            </button>
          </div>
        </div>

        {/* Right Directory List */}
        <div className="w-full lg:w-[350px] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary-gold)]" />
            <h3 className="text-base font-black text-[var(--primary-gold)]">
              👥 دليل الطلاب ونسب الأداء ({students.length})
            </h3>
          </div>

          <div
            className="p-3 rounded-2xl border max-h-[580px] overflow-y-auto flex flex-col gap-2"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            {sortedStudents.length === 0 ? (
              <p className="p-4 text-center text-xs text-[var(--text-muted)] font-semibold italic">
                لا يوجد طلاب مسجلين.
              </p>
            ) : (
              sortedStudents.map((s, idx) => {
                const avgGrade = getExamAverage(s);
                const absRate = getAbsenceRate(s);
                return (
                  <div
                    key={`msg-dir-${s.barcode}-${idx}`}
                    onClick={() => handleSelectStudent(s)}
                    className="p-3 rounded-xl border cursor-pointer hover:border-amber-400 transition-all flex justify-between items-center"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div>
                      <strong className="text-xs md:text-sm text-[var(--text-main)]">
                        {s.name}
                      </strong>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {s.groupGrade} ({s.barcode})
                      </div>
                    </div>
                    <div className="text-left">
                      <span
                        className={`text-xs font-black ${
                          avgGrade >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        امتحان: {avgGrade}%
                      </span>
                      <br />
                      <span
                        className={`text-[10px] font-bold ${
                          absRate > 20 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        غياب: {absRate}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
