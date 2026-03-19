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
  maskAge,
} from '@/lib/dataMasking';
import { isDemoMode } from '@/utils/isDemoMode';

/**
 * 비로그인 사용자용 데이터 마스킹 훅
 * - 로그인된 사용자: 원본 데이터 그대로 반환
 * - 비로그인 사용자: 마스킹된 데이터 반환
 * - 더미 모드: 마스킹 비활성화 (원본 그대로)
 */
export function useDataMasking() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const skipMask = isLoggedIn || isDemoMode();

  // 로그인 상태 또는 더미 모드면 원본 그대로, 아니면 마스킹
  const m = {
    birthDate: (v: string | null | undefined) => skipMask ? (v || '-') : maskBirthDate(v),
    address: (v: string | null | undefined) => skipMask ? (v || '-') : maskAddress(v),
    email: (v: string | null | undefined) => skipMask ? (v || '-') : maskEmail(v),
    school: (v: string | null | undefined) => skipMask ? (v || '-') : maskSchool(v),
    major: (v: string | null | undefined) => skipMask ? (v || '-') : maskMajor(v),
    gpa: (v: string | number | null | undefined) => skipMask ? String(v ?? '-') : maskGPA(v),
    year: (v: string | number | null | undefined) => skipMask ? String(v ?? '-') : maskYear(v),
    period: (v: string | null | undefined) => skipMask ? (v || '-') : maskPeriod(v),
    age: (v: string | number | null | undefined) => skipMask ? String(v ?? '-') : maskAge(v),
  };

  return { isLoggedIn, mask: m };
}
