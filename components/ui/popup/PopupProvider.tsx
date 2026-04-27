'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import Popup from './Popup';

/* ----------------------- Types ----------------------- */

export type PopupVariant = 'A' | 'B'; // A: [취소][확인], B: [확인]만

export interface PopupOptions {
  /** 본문 메시지 */
  message: string;
  /** 'A' = confirm 스타일, 'B' = alert 스타일 */
  variant: PopupVariant;
  /** 확인 버튼 텍스트 (기본 "확인") */
  confirmText?: string;
  /** 취소 버튼 텍스트 (기본 "취소", variant A에서만) */
  cancelText?: string;
}

interface PopupQueueItem extends PopupOptions {
  id: number;
  resolve: (value: boolean) => void;
}

interface PopupContextValue {
  /** confirm 스타일: [취소][확인] → Promise<boolean> */
  confirm: (message: string, options?: Partial<PopupOptions>) => Promise<boolean>;
  /** alert 스타일: [확인]만 → Promise<void> */
  alert: (message: string, options?: Partial<PopupOptions>) => Promise<void>;
}

const PopupContext = createContext<PopupContextValue | null>(null);

/* ----------------------- Provider ----------------------- */

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<PopupQueueItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  // Portal은 클라이언트에서만 마운트 (Next.js SSR 호환)
  useEffect(() => {
    setMounted(true);
  }, []);

  const current = queue[0] ?? null;

  /** 큐에 새 팝업 추가 */
  const enqueue = useCallback(
    (opts: PopupOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        idRef.current += 1;
        const item: PopupQueueItem = { ...opts, id: idRef.current, resolve };
        setQueue((prev) => [...prev, item]);
      });
    },
    []
  );

  /** 현재 팝업 닫고 큐에서 제거 */
  const handleClose = useCallback((result: boolean) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [head, ...rest] = prev;
      head.resolve(result);
      return rest;
    });
  }, []);

  const api = useMemo<PopupContextValue>(
    () => ({
      confirm: (message, options) =>
        enqueue({ message, variant: 'A', ...options }),
      alert: async (message, options) => {
        await enqueue({ message, variant: 'B', ...options });
      },
    }),
    [enqueue]
  );

  return (
    <PopupContext.Provider value={api}>
      {children}
      {mounted &&
        current &&
        createPortal(
          <Popup
            key={current.id}
            message={current.message}
            variant={current.variant}
            confirmText={current.confirmText}
            cancelText={current.cancelText}
            onConfirm={() => handleClose(true)}
            onCancel={() => handleClose(false)}
          />,
          document.body
        )}
    </PopupContext.Provider>
  );
};

/* ----------------------- Hook ----------------------- */

export const usePopup = (): PopupContextValue => {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error('usePopup must be used within <PopupProvider>');
  }
  return ctx;
};
