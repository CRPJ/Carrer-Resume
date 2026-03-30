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

const ADMIN_KEY = 'crpj-admin-2024';

/**
 * 데이터 마스킹 훅
 * - 관리자 모드 (?admin=비밀키): 모든 원본 데이터 그대로 반환 (세션 유지)
 * - 일반 로그인 사용자: 개인정보 마스킹, 나머지 원본
 * - 비로그인 사용자: 전체 마스킹
 */
export function useDataMasking() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // URL에 ?admin=키 가 있으면 sessionStorage에 저장
    const adminParam = searchParams.get('admin');
    if (adminParam === ADMIN_KEY) {
      sessionStorage.setItem('adminMode', 'true');
    }
    // 마더(어드민) 계정 세션이면 자동으로 관리자 모드 활성화
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

  // 일반 사용자: 개인정보 항상 마스킹, 나머지는 로그인 시 원본
  const masked = {
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

  return { isLoggedIn, isAdmin, mask: isAdmin ? raw : masked };
}
