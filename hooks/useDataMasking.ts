'use client';

import { useSession } from 'next-auth/react';
import {
  maskBirthDate,
  maskAddress,
  maskEmail,
  maskSchool,
  maskMajor,
  maskGPA,
  maskYear,
  maskPeriod,
} from '@/lib/dataMasking';

/**
 * 비로그인 사용자용 데이터 마스킹 훅
 * - 로그인된 사용자: 원본 데이터 그대로 반환
 * - 비로그인 사용자: 마스킹된 데이터 반환
 */
export function useDataMasking() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // 로그인 상태면 원본 그대로, 아니면 마스킹
  const m = {
    birthDate: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskBirthDate(v),
    address: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskAddress(v),
    email: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskEmail(v),
    school: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskSchool(v),
    major: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskMajor(v),
    gpa: (v: string | number | null | undefined) => isLoggedIn ? String(v ?? '-') : maskGPA(v),
    year: (v: string | number | null | undefined) => isLoggedIn ? String(v ?? '-') : maskYear(v),
    period: (v: string | null | undefined) => isLoggedIn ? (v || '-') : maskPeriod(v),
  };

  return { isLoggedIn, mask: m };
}
