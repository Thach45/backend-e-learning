import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps {
  toastId: string | number;
  message: string;
  type: ToastType;
  duration: number;
}

const typeStyles = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-white',
    iconBg: 'bg-emerald-500',
    icon: CheckCircle,
    iconColor: 'text-white',
    progress: 'bg-emerald-500',
  },
  error: {
    border: 'border-rose-500/30',
    bg: 'bg-white',
    iconBg: 'bg-rose-500',
    icon: XCircle,
    iconColor: 'text-white',
    progress: 'bg-rose-500',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-white',
    iconBg: 'bg-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-white',
    progress: 'bg-amber-500',
  },
  info: {
    border: 'border-indigo-500/30',
    bg: 'bg-white',
    iconBg: 'bg-indigo-500',
    icon: Info,
    iconColor: 'text-white',
    progress: 'bg-indigo-500',
  },
};

const ToastContent = ({ toastId, message, type, duration }: CustomToastProps) => {
  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`overflow-hidden rounded-xl border ${style.border} ${style.bg}
        min-w-[320px] max-w-md shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]
        transition-[transform,opacity] duration-300 ease-out translate-x-0 opacity-100`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg ${style.iconBg} flex items-center justify-center shadow-sm`}
        >
          <Icon className={style.iconColor} size={20} strokeWidth={2.5} />
        </div>
        <p className="text-slate-800 font-medium text-sm leading-snug flex-1">
          {message}
        </p>
        <button
          onClick={() => sonnerToast.dismiss(toastId)}
          className="flex-shrink-0 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Đóng"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
      {/* Thanh progress đếm ngược — biết sắp ẩn */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full ${style.progress} origin-left rounded-b-xl`}
          style={{
            animation: 'toast-progress-shrink linear forwards',
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
};

export const toast = {
  success: (message: string, duration = 4000) => {
    sonnerToast.custom(
      (toastId) => (
        <ToastContent
          toastId={toastId}
          message={message}
          type="success"
          duration={duration}
        />
      ),
      { duration }
    );
  },

  error: (message: string, duration = 5000) => {
    sonnerToast.custom(
      (toastId) => (
        <ToastContent
          toastId={toastId}
          message={message}
          type="error"
          duration={duration}
        />
      ),
      { duration }
    );
  },

  warning: (message: string, duration = 4000) => {
    sonnerToast.custom(
      (toastId) => (
        <ToastContent
          toastId={toastId}
          message={message}
          type="warning"
          duration={duration}
        />
      ),
      { duration }
    );
  },

  info: (message: string, duration = 4000) => {
    sonnerToast.custom(
      (toastId) => (
        <ToastContent
          toastId={toastId}
          message={message}
          type="info"
          duration={duration}
        />
      ),
      { duration }
    );
  },
};
