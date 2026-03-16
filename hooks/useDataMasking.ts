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

/**
 * 비로그인 사용자용 데이터 마스킹 훅
 * - 로그인된 사용자: 원본 데이터 그대로 반환
 * - 비로그인 사용자: 마스킹된 데이터 반환
 */
export function useDataMasking() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  // 개인정보(생년월일/주소/이메일/학교/전공)는 항상 마스킹, 나머지는 로그인 시 원본
  const m = {
    birthDate: (v: string | null | undefined) => maskBirthDate(v),
    address: (v: string | null | undefined) => maskAddress(v),
    email: (v: string | null | undefined) => maskEmail(v),
    school: (v: string | null | undefined) => maskSchool(v),
    major: (v: string | null | undefined) => maskMajor(v),
    gpa: (v: string | number | null | undefined) => maskGPA(v),
    year: (v: string | number | null | undefined) => isLoggedIn ? String(v ?? '-') : maskYear(v),
    period: (v: string | null | undefined) => maskPeriod(v),
    age: (v: string | number | null | undefined) => isLoggedIn ? String(v ?? '-') : maskAge(v),
  };

  return { isLoggedIn, mask: m };
}
