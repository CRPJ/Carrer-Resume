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

    // 화이트리스트 1: BETA_TESTERS (display_name)
    // 화이트리스트 2: '뉴트리션' 팀 멤버 (user_team_parts.left_at IS NULL)
    // 두 화이트리스트 합집합을 노출. 베타 종료 시 BETA_TESTERS 분기와 함께 제거.
    const teamsForWhitelist = await getCachedTeams();
    const nutritionTeamId = teamsForWhitelist?.find((t) => t.name === "뉴트리션")?.id ?? null;
    let nutritionUserIds: string[] = [];
    if (nutritionTeamId) {
      const { data: nutritionMembers, error: nutritionError } = await supabase
        .from("user_team_parts")
        .select("user_id")
        .eq("team_id", nutritionTeamId)
        .is("left_at", null);
      if (nutritionError) {
        console.error("뉴트리션 팀 멤버 조회 오류:", JSON.stringify(nutritionError));
      } else {
        nutritionUserIds = (nutritionMembers ?? []).map((m) => m.user_id).filter(Boolean);
      }
    }

    const baseSelect = "id, display_name, gender, birth_date, profile_photo_url, vision, status, growth_status, club, university, major_first, crew_unique_number, onboarding_week_id";
    const allowedGrowthStatus = ["active", "suspended", "seasonal_rest", "graduated", "club_onboarding"];
    const buildBaseQuery = () => {
      let q = supabase
        .from("user_profiles")
        .select(baseSelect)
        .in("growth_status", allowedGrowthStatus);
      if (excludeUserId && isValidUUID(excludeUserId)) {
        q = q.neq("id", excludeUserId);
      }
      return q;
    };

    const [betaResult, nutritionResult] = await Promise.all([
      buildBaseQuery().in("display_name", BETA_TESTERS),
      nutritionUserIds.length > 0
        ? buildBaseQuery().in("id", nutritionUserIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
    ]);

    if (betaResult.error) {
      console.error("크루 목록 조회 오류(beta):", JSON.stringify(betaResult.error));
      return NextResponse.json(
        { error: "크루 목록 조회에 실패했습니다.", detail: betaResult.error.message, code: betaResult.error.code },
        { status: 500 }
      );
    }
    if (nutritionResult.error) {
      console.error("크루 목록 조회 오류(nutrition):", JSON.stringify(nutritionResult.error));
      return NextResponse.json(
        { error: "크루 목록 조회에 실패했습니다.", detail: nutritionResult.error.message, code: nutritionResult.error.code },
        { status: 500 }
      );
    }

    // id 기준 dedupe + display_name 한글 정렬
    const merged = new Map<string, any>();
    (betaResult.data ?? []).forEach((u: any) => merged.set(u.id, u));
    (nutritionResult.data ?? []).forEach((u: any) => merged.set(u.id, u));
    const users = Array.from(merged.values()).sort((a: any, b: any) =>
      (a.display_name || "").localeCompare(b.display_name || "", "ko")
    );

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 각 유저의 팀/파트 정보 조회
    const userIds = users.map(u => u.id);

    // ============ 독립 쿼리 병렬 실행 ============
    // approved_weeks 는 user_growth_stats 캐시 대신 user_weekly_growth + 보조 테이블로 실시간 산출.
    // 이유: 캐시(last_calculated_at)는 외부 시스템에서 며칠 단위로만 갱신되어 stale.
    // 사이드바(/api/profile)와 동일 산식을 사용해 두 화면 값이 항상 일치하게 함.
    const [
      { data: educations },
      { data: userTeamParts },
      teams,
      parts,
      { data: cumulativePoints },
      { data: introductions },
      { data: allWeeks },
      { data: allSeasons },
      { data: restRequests },
      { data: weeklySuccess },
      { data: seasonHistories },
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
      // profile_photo_url 비어있을 때 폴백용 — cluster-2 사진[2] sub_photo_5 → 사진[3~6] sub_photo_1~4 순
      supabase
        .from("user_introductions")
        .select("user_id, sub_photo_5, sub_photo_1, sub_photo_2, sub_photo_3, sub_photo_4")
        .in("user_id", userIds),
      // approved_weeks 실시간 계산용 (사이드바 /api/profile 와 동일 산식)
      supabase
        .from("weeks")
        .select("id, start_date, end_date, is_club_break, season_id"),
      supabase
        .from("seasons")
        .select("id, name"),
      supabase
        .from("rest_requests")
        .select("user_id, week_id")
        .in("user_id", userIds)
        .eq("status", "approved"),
      // hasActivity 판정 기준: user_weekly_growth.is_success (사이드바와 동일)
      // PostgREST max-rows 1000 강제로 limit/range 무시 → range 페이지네이션으로 전체 수집.
      // 안 그러면 일부 유저 success 행 누락되며 approved_weeks 가 잘림.
      (async () => {
        const PAGE = 1000;
        const all: { user_id: string; week_id: string }[] = [];
        for (let from = 0; ; from += PAGE) {
          const { data, error } = await supabase
            .from("user_weekly_growth")
            .select("user_id, week_id")
            .in("user_id", userIds)
            .eq("is_success", true)
            .range(from, from + PAGE - 1);
          if (error) return { data: all, error };
          if (!data || data.length === 0) break;
          all.push(...data);
          if (data.length < PAGE) break;
        }
        return { data: all, error: null };
      })(),
      supabase
        .from("user_season_histories")
        .select("user_id, progress_status, season_id")
        .in("user_id", userIds)
        .eq("progress_status", "full_rest"),
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

    // ============ approved_weeks 실시간 계산 ============
    // 사이드바(/api/profile)와 동일 산식. (목)12:01 KST 강화 결정 시점에
    // user_weekly_growth.is_success 가 갱신되면 다음 요청부터 자동 반영.
    const today = new Date().toISOString().split('T')[0];
    const weeksList = allWeeks ?? [];
    const seasonsList = allSeasons ?? [];

    // break 시즌 ID (전환 주차) - 클럽 공식 휴식으로 처리
    const breakSeasonIds = new Set(
      seasonsList
        .filter((s: any) => s.name?.toLowerCase().includes('break'))
        .map((s: any) => s.id)
    );

    // user_id별 그룹핑
    const successByUser = new Map<string, Set<string>>();
    (weeklySuccess ?? []).forEach((r: any) => {
      if (!successByUser.has(r.user_id)) successByUser.set(r.user_id, new Set());
      successByUser.get(r.user_id)!.add(r.week_id);
    });
    const restByUser = new Map<string, Set<string>>();
    (restRequests ?? []).forEach((r: any) => {
      if (!restByUser.has(r.user_id)) restByUser.set(r.user_id, new Set());
      restByUser.get(r.user_id)!.add(r.week_id);
    });
    const restSeasonByUser = new Map<string, Set<string>>();
    (seasonHistories ?? []).forEach((sh: any) => {
      if (!sh.season_id) return;
      if (!restSeasonByUser.has(sh.user_id)) restSeasonByUser.set(sh.user_id, new Set());
      restSeasonByUser.get(sh.user_id)!.add(sh.season_id);
    });

    // onboarding_week_id → start_date 룩업
    const weekById = new Map<string, any>();
    weeksList.forEach((w: any) => weekById.set(w.id, w));

    const weeksMap: { [key: string]: number } = {};
    users.forEach((u: any) => {
      const onboardingWeekId: string | null = u.onboarding_week_id || null;
      const onboardingWeek = onboardingWeekId ? weekById.get(onboardingWeekId) : null;
      const growthStartDate: string | null = onboardingWeek?.start_date || null;
      if (!growthStartDate) {
        weeksMap[u.id] = 0;
        return;
      }

      const successSet = successByUser.get(u.id) ?? new Set<string>();
      const personalRestSet = restByUser.get(u.id) ?? new Set<string>();
      const userRestingSeasonIds = restSeasonByUser.get(u.id) ?? new Set<string>();

      let approved = 0;
      for (const week of weeksList) {
        // 가입 이후 + 이미 종료된 주차만
        if (week.start_date < growthStartDate) continue;
        if (week.end_date >= today) continue;

        // 시즌 휴식 주차는 통계 제외
        if (week.season_id && userRestingSeasonIds.has(week.season_id)) continue;

        const hasActivity = successSet.has(week.id);
        const hasPersonalRest = personalRestSet.has(week.id);
        const isClubBreak = !!week.is_club_break || (week.season_id && breakSeasonIds.has(week.season_id));
        const isOnboardingWeek = week.id === onboardingWeekId;

        if (isOnboardingWeek) { approved++; continue; }
        if (isClubBreak && hasActivity) { approved++; continue; }
        if (isClubBreak) continue;
        if (hasPersonalRest) continue;
        if (hasActivity) approved++;
      }
      weeksMap[u.id] = approved;
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
