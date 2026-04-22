'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
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
import { isDemoMode as checkDemoMode } from '@/utils/isDemoMode';

const ADMIN_KEY = 'crpj-admin-2024';

/**
 * 데이터 마스킹 훅
 * - 관리자 모드 (?admin=비밀키 또는 어드민 세션): 모든 원본 데이터 그대로 반환
 * - 일반 로그인 사용자: 개인정보 마스킹, 일부(year/age)는 원본
 * - 비로그인 사용자: 전체 마스킹
 *
 * SSR/client hydration 일관성: isDemoMode()가 localStorage를 읽으므로
 * render time에 직접 호출하면 SSR(false) ↔ client(true) 불일치 발생.
 * stateful로 변환하여 첫 렌더는 항상 false, 마운트 후 localStorage 값 반영.
 */
export function useDataMasking() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;
  const [isDemoModeState, setIsDemoModeState] = useState(false);
  useEffect(() => {
    setIsDemoModeState(checkDemoMode());
  }, []);
  const skipMask = isLoggedIn || isDemoModeState;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminParam = searchParams.get('admin');
    if (adminParam === ADMIN_KEY) {
      sessionStorage.setItem('adminMode', 'true');
    }
    const isAdminSession = !!session?.user?.isAdmin;
    const isAdminStorage = sessionStorage.getItem('adminMode') === 'true';
    setIsAdmin(isAdminSession || isAdminStorage);
  }, [searchParams, session]);

  // 관리자 모드: 모든 정보 원본 그대로
  const raw = {
    birthDate: (v: string | null | undefined) => v || '-',
    address: (v: string | null | undefined) => v || '-',
    email: (v: string | null | undefined) => v || '-',
    school: (v: string | null | undefined) => v || '-',
    major: (v: string | null | undefined) => v || '-',
    gpa: (v: string | number | null | undefined) => String(v ?? '-'),
    year: (v: string | number | null | undefined) => String(v ?? '-'),
    period: (v: string | null | undefined) => v || '-',
    age: (v: string | number | null | undefined) => String(v ?? '-'),
  };

  // 일반 사용자: 개인정보 항상 마스킹, year/age만 로그인/데모 시 원본
  const masked = {
    birthDate: (v: string | null | undefined) => maskBirthDate(v),
    address: (v: string | null | undefined) => maskAddress(v),
    email: (v: string | null | undefined) => maskEmail(v),
    school: (v: string | null | undefined) => maskSchool(v),
    major: (v: string | null | undefined) => maskMajor(v),
    gpa: (v: string | number | null | undefined) => maskGPA(v),
    year: (v: string | number | null | undefined) => skipMask ? String(v ?? '-') : maskYear(v),
    period: (v: string | null | undefined) => maskPeriod(v),
    age: (v: string | number | null | undefined) => skipMask ? String(v ?? '-') : maskAge(v),
  };

  return { isLoggedIn, isAdmin, mask: isAdmin ? raw : masked };
}
