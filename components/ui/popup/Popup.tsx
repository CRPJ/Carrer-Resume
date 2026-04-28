'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import './Popup.scss';

/* ----------------------- 랜덤 풀 ----------------------- */

/**
 * 헤더 배경 일러스트 풀 (전용 이미지)
 * - /public/images/0/popup/1.png ~ 4.png 랜덤 사용
 * - overlay 값은 모든 이미지 동일 (0.65)
 */
const HEADER_IMAGES: Array<{ src: string; overlay: number }> = [
  { src: '/images/0/popup/1.png', overlay: 0.65 },
  { src: '/images/0/popup/2.png', overlay: 0.65 },
  { src: '/images/0/popup/3.png', overlay: 0.65 },
  { src: '/images/0/popup/4.png', overlay: 0.65 },
];

/**
 * 본문 좌측 아이콘 풀
 */
const BODY_ICONS = [
  '/images/0/popup-1.png',
  '/images/0/popup-2.png',
  '/images/0/popup-3.png',
];

const pickRandom = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/* ----------------------- Props ----------------------- */

interface PopupProps {
  message: string;
  variant: 'A' | 'B';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/* ----------------------- Component ----------------------- */

const Popup: React.FC<PopupProps> = ({
  message,
  variant,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}) => {
  const headerImg = useMemo(() => pickRandom(HEADER_IMAGES), []);
  const bodyIcon  = useMemo(() => pickRandom(BODY_ICONS), []);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (variant === 'A') onCancel();
        else onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    confirmBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, onCancel, variant]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (variant === 'A') onCancel();
      else onConfirm();
    }
  };

  return (
    <div
      className="custom-popup-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="custom-popup"
        style={
          {
            '--popup-header-bg': `url('${headerImg.src}')`,
            '--popup-header-overlay': String(headerImg.overlay),
          } as React.CSSProperties
        }
      >
        <div className="custom-popup__header" />

        <div className="custom-popup__body">
          <div className="custom-popup__icon">
            <img src={bodyIcon} alt="" />
          </div>
          <div className="custom-popup__message">{message}</div>
        </div>

        <div className="custom-popup__footer">
          {variant === 'A' && (
            <button
              type="button"
              className="custom-popup__btn custom-popup__btn--cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            className="custom-popup__btn custom-popup__btn--confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
