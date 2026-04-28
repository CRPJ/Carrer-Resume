import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { getCachedTeams, getCachedParts } from "@/lib/cached-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { maskSchool, maskMajor, maskAge, maskDisplayName } from "@/lib/dataMasking";
import { SECTION1_PHOTO_DEFAULTS } from "@/constants/dummyData/cluster2-section1-default";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// 베타 테스터 화이트리스트 — 이 명단의 크루만 /crews 목록에 노출
// 서버측에서 raw display_name으로 필터링 (마스킹 적용 전).
// 베타 종료 시 이 상수와 .in("display_name", ...) 필터를 제거.
const BETA_TESTERS = [
  "박건희", "김시영", "김예령", "김현진", "정우현",
  "이용준", "김혜윤", "김나우", "김승민", "김수현",
  "정재웅", "고수림", "최희원", "윤재윤", "빵떡이",
];

// GET: 크루 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeUserId = searchParams.get("excludeUserId"); // 자신 제외용

    const supabase = createAdminClient();

    // 활성 크루만 조회 + 베타 화이트리스트 필터
    let query = supabase
      .from("user_profiles")
      .select("id, display_name, gender, birth_date, profile_photo_url, vision, status, growth_status, club, university, major_first, crew_unique_number")
      .in("growth_status", ["active", "suspended", "seasonal_rest", "graduated", "club_onboarding"])
      .in("display_name", BETA_TESTERS)
      .order("display_name", { ascending: true });

    if (excludeUserId && isValidUUID(excludeUserId)) {
      query = query.neq("id", excludeUserId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("크루 목록 조회 오류:", JSON.stringify(error));
      return NextResponse.json(
        { error: "크루 목록 조회에 실패했습니다.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 각 유저의 팀/파트 정보 조회
    const userIds = users.map(u => u.id);

    // ============ 독립 쿼리 7개를 병렬 실행 ============
    const [
      { data: educations },
      { data: userTeamParts },
      teams,
      parts,
      { data: cumulativePoints },
      { data: growthStats },
      { data: introductions },
    ] = await Promise.all([
      supabase
        .from("user_educations")
        .select("user_id, school_name, major_name_1, sort_order")
        .in("user_id", userIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("user_team_parts")
        .select("user_id, team_id, part_id")
        .in("user_id", userIds)
        .is("left_at", null),
      getCachedTeams(),
      getCachedParts(),
      supabase
        .from("user_cumulative_points")
        .select("user_id, total_stars")
        .in("user_id", userIds),
      supabase
        .from("user_growth_stats")
        .select("user_id, approved_weeks")
        .in("user_id", userIds),
      // profile_photo_url 비어있을 때 폴백용 — cluster-2 사진[2] sub_photo_5 → 사진[3~6] sub_photo_1~4 순
      supabase
        .from("user_introductions")
        .select("user_id, sub_photo_5, sub_photo_1, sub_photo_2, sub_photo_3, sub_photo_4")
        .in("user_id", userIds),
    ] as const);

    // user_id별 학력 정보 Map (첫 번째 학력만 사용)
    const educationMap: { [key: string]: { school_name: string | null; major_name_1: string | null } } = {};
    educations?.forEach(edu => {
      if (!educationMap[edu.user_id]) {
        educationMap[edu.user_id] = {
          school_name: edu.school_name,
          major_name_1: edu.major_name_1,
        };
      }
    });

    // 팀/파트 이름 매핑
    const teamMap: { [key: string]: string } = {};
    const partMap: { [key: string]: string } = {};
    teams?.forEach(t => { teamMap[t.id] = t.name; });
    parts?.forEach(p => { partMap[p.id] = p.name; });

    // 유저별 팀/파트 매핑
    const userTeamPartMap: { [key: string]: { teamName: string | null; partName: string | null } } = {};
    userTeamParts?.forEach(utp => {
      userTeamPartMap[utp.user_id] = {
        teamName: utp.team_id ? teamMap[utp.team_id] || null : null,
        partName: utp.part_id ? partMap[utp.part_id] || null : null,
      };
    });

    const starsMap: { [key: string]: number } = {};
    cumulativePoints?.forEach(cp => {
      starsMap[cp.user_id] = cp.total_stars || 0;
    });

    const weeksMap: { [key: string]: number } = {};
    growthStats?.forEach(gs => {
      weeksMap[gs.user_id] = gs.approved_weeks || 0;
    });

    // 폴백 우선순위: 사진[2] sub_photo_5 → 사진[3] sub_photo_1 → 사진[4] sub_photo_2 → 사진[5] sub_photo_3 → 사진[6] sub_photo_4
    const subPhotoMap: { [key: string]: string | null } = {};
    introductions?.forEach(intro => {
      subPhotoMap[intro.user_id] =
        intro.sub_photo_5 ||
        intro.sub_photo_1 ||
        intro.sub_photo_2 ||
        intro.sub_photo_3 ||
        intro.sub_photo_4 ||
        null;
    });

    // 마스킹 옵션 결정
    const session = await getServerSession(authOptions);
    const maskIsAdmin = !!session?.user?.isAdmin || isAdminEmail(session?.user?.email);
    const maskIsLoggedIn = !!session;

    // 데이터 변환
    const crewList = users.map(user => {
      // 나이 계산
      let age = null;
      if (user.birth_date) {
        const birthYear = new Date(user.birth_date).getFullYear();
        const currentYear = new Date().getFullYear();
        age = currentYear - birthYear;
      }

      const teamPart = userTeamPartMap[user.id];
      const education = educationMap[user.id];

      const schoolName = education?.school_name || user.university || '-';
      const majorName = education?.major_name_1 || user.major_first || '-';

      // 마스킹 적용
      const displayAge = maskIsAdmin ? (age || '-') : (maskIsLoggedIn ? (age || '-') : maskAge(age));
      const displaySchool = maskIsAdmin ? schoolName : (maskIsLoggedIn ? schoolName : maskSchool(schoolName));
      const displayMajor = maskIsAdmin ? majorName : (maskIsLoggedIn ? majorName : maskMajor(majorName));
      const rawName = user.display_name || '-';
      const displayName = maskIsAdmin ? rawName : (maskIsLoggedIn ? rawName : maskDisplayName(rawName));

      return {
        id: user.id,
        number: user.crew_unique_number || null,
        name: displayName,
        gender: user.gender || '-',
        age: displayAge,
        // 폴백 우선순위: 사진[1] profile_photo_url → 사진[2~6] user_introductions → cluster-2 디폴트 메인 사진(사진[2])
        profileImg: user.profile_photo_url || subPhotoMap[user.id] || SECTION1_PHOTO_DEFAULTS.photos[1] || '',
        university: displaySchool,
        major: displayMajor,
        team: teamPart?.teamName || '-',
        part: teamPart?.partName || '-',
        nickname: user.vision || '-',
        club: user.club || '-',
        universityMajor: [displaySchool, displayMajor].filter(v => v && v !== '-').join(' ') || '-',
        status: user.status || '-',
        growthStatus: user.growth_status || '-',
        totalStars: starsMap[user.id] || 0,
        approvedWeeks: weeksMap[user.id] || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: crewList,
    });
  } catch (error) {
    console.error("크루 목록 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
