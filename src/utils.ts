export const SCHOOL_WHATSAPP_PHONE = "201070642904";

export const GRADE_ORDER = [
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];

export const ALL_PERMISSIONS = [
  'add_student',
  'edit_student',
  'delete_student',
  'change_status',
  'pay_expenses',
  'view_revenues',
  'add_grades',
  'send_messages',
  'manage_prices',
];

export const DEFAULT_GROUP_PRICES: { [grade: string]: number } = {
  "الصف الرابع الابتدائي": 100,
  "الصف الخامس الابتدائي": 100,
  "الصف السادس الابتدائي": 120,
  "الصف الأول الإعدادي": 140,
  "الصف الثاني الإعدادي": 150,
  "الصف الثالث الإعدادي": 160,
  "الصف الأول الثانوي": 180,
  "الصف الثاني الثانوي": 200,
  "الصف الثالث الثانوي": 220,
};

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getGradeIndex(grade: string): number {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx === -1 ? 999 : idx;
}

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
    .trim()
    .toLowerCase();
}

let audioCtx: AudioContext | null = null;
export function playBeep(type: 'success' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch {
    // Ignore audio failures if browser restricts audio
  }
}

export function speakStudentName(name: string, isEnabled: boolean) {
  if (!isEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(`أهلاً ${name}`);
    msg.lang = 'ar-SA';
    msg.rate = 0.95;
    window.speechSynthesis.speak(msg);
  } catch {
    // speech synthesis fallback
  }
}

export function formatWhatsAppPhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '2' + clean;
  }
  return clean;
}

export function getWhatsAppMode(): 'desktop' | 'web' {
  return (localStorage.getItem('whatsapp_mode') as 'desktop' | 'web') || 'web';
}

export function setWhatsAppMode(mode: 'desktop' | 'web') {
  localStorage.setItem('whatsapp_mode', mode);
}

export function openWhatsApp(phone: string, text: string, forceMode?: 'desktop' | 'web') {
  const cleanPhone = formatWhatsAppPhone(phone);
  const mode = forceMode || getWhatsAppMode();
  
  if (mode === 'desktop') {
    // Native desktop protocol - super fast, no web page reload
    const desktopUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.location.href = desktopUrl;
  } else {
    // Web fallback
    const webUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(webUrl, '_blank');
  }
}

export function getStudentPortalUrl(barcode: string): string {
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?student=${encodeURIComponent(barcode)}`;
  } catch {
    return `?student=${barcode}`;
  }
}

export function getGeneralPortalUrl(): string {
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?portal=parent`;
  } catch {
    return `?portal=parent`;
  }
}

export function getAdminUrl(): string {
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?admin=1`;
  } catch {
    return `?admin=1`;
  }
}
