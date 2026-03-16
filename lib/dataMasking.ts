/**
 * 비로그인 사용자용 데이터 마스킹 유틸리티
 * - 이름/성별: 마스킹 없음 (full 공개)
 * - 생년월일: 앞 7자리 마스킹, 마지막 1자리만 공개
 * - 주소: 첫 글자만 공개, 나머지 마스킹
 * - 이메일: 첫 글자만 공개, 나머지 마스킹
 * - 학교: 첫 글자 + 조직단위(대학교/대학/고등학교 등) 공개
 * - 전공: 첫 글자 + 조직단위(학과/전공/학부 등) 공개
 * - 학점: 만점 단위만 공개, 실제 성적 마스킹
 * - 입학년도: 첫 자리(2)만 공개, 나머지 마스킹
 */

/** 생년월일 마스킹: "1999.03.15" → "****.**.** " (구분자 유지, 숫자만 마스킹) */
export function maskBirthDate(value: string | null | undefined): string {
  if (!value) return '-';
  return value.replace(/[0-9]/g, '*');
}

/** 주소 마스킹: "서울시 송파구" → "*** ***" (공백 유지, 글자만 마스킹) */
export function maskAddress(value: string | null | undefined): string {
  if (!value || value === '-') return '-';
  const trimmed = value.trim();
  if (trimmed.length <= 1) return '*';
  return trimmed.replace(/[^\s]/g, '*');
}

/** 이메일 마스킹: "encre.jjang@gmail.com" → "*****.****@gmail.com" (로컬파트 마스킹, @도메인 유지) */
export function maskEmail(value: string | null | undefined): string {
  if (!value || value === '-') return '-';
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 0) {
    return trimmed.replace(/[^\s]/g, '*');
  }
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex); // @gmail.com
  const maskedLocal = local.replace(/[^.]/g, '*');
  return maskedLocal + domain;
}

/** 학교 마스킹: "서울대학교" → "서*대학교", "한국외국어대학교" → "한****대학교" */
export function maskSchool(value: string | null | undefined): string {
  if (!value || value === '-') return '-';
  const trimmed = value.trim();

  // 조직 단위 suffix 매칭 (긴 것부터)
  const suffixes = ['대학교', '대학원', '고등학교', '중학교', '초등학교', '대학', '학교'];
  let suffix = '';
  let body = trimmed;

  for (const s of suffixes) {
    if (trimmed.endsWith(s) && trimmed.length > s.length) {
      suffix = s;
      body = trimmed.slice(0, -s.length);
      break;
    }
  }

  if (!suffix) {
    // suffix 없으면 첫 글자만 공개
    if (trimmed.length <= 1) return trimmed;
    return trimmed[0] + '*'.repeat(trimmed.length - 1);
  }

  // 첫 글자 + 마스킹 + suffix
  if (body.length <= 1) return body + suffix;
  return body[0] + '*'.repeat(body.length - 1) + suffix;
}

/** 전공 마스킹: "스페인어과" → "****과", "컴퓨터공학전공" → "*****전공" (전체 마스킹, suffix만 표시) */
export function maskMajor(value: string | null | undefined): string {
  if (!value || value === '-') return '-';
  const trimmed = value.trim();

  const suffixes = ['학과', '전공', '학부', '계열', '과'];
  let suffix = '';
  let body = trimmed;

  for (const s of suffixes) {
    if (trimmed.endsWith(s) && trimmed.length > s.length) {
      suffix = s;
      body = trimmed.slice(0, -s.length);
      break;
    }
  }

  if (!suffix) {
    return '*'.repeat(trimmed.length);
  }

  return '*'.repeat(body.length) + suffix;
}

/** 학점 마스킹: "4.3" → "*.*" (구분자 유지, 숫자만 마스킹) */
export function maskGPA(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '' || value === '-') return '-';
  return String(value).replace(/[0-9]/g, '*');
}

/** 입학년도 마스킹: "2019" → "2***" */
export function maskYear(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '' || value === '-') return '-';
  const str = String(value).trim();
  if (str.length <= 1) return str;
  return str[0] + '*'.repeat(str.length - 1);
}

/** 나이 마스킹: "27" → "**", 27 → "**" */
export function maskAge(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '' || value === '-') return '-';
  return '**';
}

/** 기간 마스킹: "2016.02 - ~ing" → "****.** - ~ing" (구분자 유지, 숫자만 마스킹) */
export function maskPeriod(value: string | null | undefined): string {
  if (!value || value === '-') return '-';
  return value.replace(/[0-9]/g, '*');
}
