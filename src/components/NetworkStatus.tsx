import React from 'react';
import { Send, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { WhatsAppQueueItem } from '../types';

interface NetworkStatusProps {
  isOnline: boolean;
  queue: WhatsAppQueueItem[];
  onOpenNextWhatsApp: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  queue,
  onOpenNextWhatsApp,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Network Online/Offline pill */}
      <div
        id="network-status-indicator"
        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>🟢 متصل بالإنترنت - البيانات متزامنة سحابياً فوراً</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>🔴 غير متصل بالإنترنت - يتم الحفظ محلياً على جهازك تلقائياً</span>
          </>
        )}
      </div>

      {/* WhatsApp Queue Bar */}
      {queue.length > 0 && (
        <div
          id="whatsapp-queue-banner"
          className="p-4 rounded-xl flex flex-wrap justify-between items-center gap-3 shadow-lg animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: 'white',
          }}
        >
          <div>
            <strong id="queue-status-text" className="text-sm font-black flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>
                📲 جاري إرسال الرسائل... متبقي {queue.length} رسالة في القائمة
              </span>
            </strong>
            <p className="text-xs opacity-90 mt-0.5">
              اضغط الزر أو مفتاح Enter للانتقال التلقائي للرسالة التالية
            </p>
          </div>

          <button
            id="btn-next-queue"
            onClick={onOpenNextWhatsApp}
            autoFocus
            className="px-5 py-2 rounded-lg font-extrabold text-xs bg-white text-[#128C7E] hover:bg-emerald-50 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إرسال التالي (Enter) 📲</span>
          </button>
        </div>
      )}
    </div>
  );
};
