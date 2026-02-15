'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastPayload = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastRecord = {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
  closing: boolean;
};

type ToastContextValue = {
  pushToast: (payload: ToastPayload) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4200;
const EXIT_DURATION = 240;

function getToastStyles(type: ToastType) {
  if (type === 'success') {
    return {
      card: 'border-emerald-200 bg-[linear-gradient(160deg,#f6fffa_0%,#e7fff3_100%)]',
      title: 'text-emerald-800',
      message: 'text-emerald-700',
      iconWrap: 'bg-emerald-600 text-white',
    };
  }

  if (type === 'error') {
    return {
      card: 'border-rose-200 bg-[linear-gradient(160deg,#fff7f8_0%,#ffecee_100%)]',
      title: 'text-rose-800',
      message: 'text-rose-700',
      iconWrap: 'bg-rose-600 text-white',
    };
  }

  if (type === 'warning') {
    return {
      card: 'border-amber-200 bg-[linear-gradient(160deg,#fffdf5_0%,#fff4da_100%)]',
      title: 'text-amber-800',
      message: 'text-amber-700',
      iconWrap: 'bg-amber-500 text-white',
    };
  }

  return {
    card: 'border-blue-200 bg-[linear-gradient(160deg,#f6faff_0%,#ecf3ff_100%)]',
    title: 'text-blue-800',
    message: 'text-blue-700',
    iconWrap: 'bg-[#2b68ff] text-white',
  };
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (type === 'error') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
      </svg>
    );
  }

  if (type === 'warning') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3l-8.47-14.14a2 2 0 00-3.42 0z" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idCounter = useRef(0);
  const closeTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const removeTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimers = useCallback((id: number) => {
    const closeTimer = closeTimers.current.get(id);
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimers.current.delete(id);
    }

    const removeTimer = removeTimers.current.get(id);
    if (removeTimer) {
      clearTimeout(removeTimer);
      removeTimers.current.delete(id);
    }
  }, []);

  const removeToast = useCallback(
    (id: number) => {
      clearTimers(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimers]
  );

  const dismissToast = useCallback(
    (id: number) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id && !toast.closing ? { ...toast, closing: true } : toast
        )
      );

      clearTimers(id);
      const removeTimer = setTimeout(() => removeToast(id), EXIT_DURATION);
      removeTimers.current.set(id, removeTimer);
    },
    [clearTimers, removeToast]
  );

  const pushToast = useCallback(
    (payload: ToastPayload) => {
      const id = Date.now() + idCounter.current++;
      const duration = payload.duration ?? DEFAULT_DURATION;

      const nextToast: ToastRecord = {
        id,
        type: payload.type ?? 'info',
        title: payload.title,
        message: payload.message,
        duration,
        actionLabel: payload.actionLabel,
        onAction: payload.onAction,
        closing: false,
      };

      setToasts((prev) => [...prev, nextToast].slice(-4));

      if (duration > 0) {
        const closeTimer = setTimeout(() => dismissToast(id), duration);
        closeTimers.current.set(id, closeTimer);
      }
    },
    [dismissToast]
  );

  useEffect(() => {
    const closeTimersMap = closeTimers.current;
    const removeTimersMap = removeTimers.current;

    return () => {
      closeTimersMap.forEach((timer) => clearTimeout(timer));
      removeTimersMap.forEach((timer) => clearTimeout(timer));
      closeTimersMap.clear();
      removeTimersMap.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ pushToast, dismissToast }),
    [pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[95] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-6">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border p-4 shadow-[0_16px_35px_rgba(11,26,63,0.16)] backdrop-blur ${styles.card} ${toast.closing ? 'ui-toast-exit' : 'ui-toast-enter'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}>
                  <ToastIcon type={toast.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${styles.title}`}>{toast.title}</p>
                  {toast.message && <p className={`mt-1 text-sm leading-relaxed ${styles.message}`}>{toast.message}</p>}
                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      onClick={toast.onAction}
                      className="mt-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-[#2b68ff] transition hover:bg-white"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                  aria-label="Dismiss notification"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
