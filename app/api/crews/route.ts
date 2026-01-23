import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 크루 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeUserId = searchParams.get("excludeUserId"); // 자신 제외용

    const supabase = createAdminClient();

    // 활성 크루만 조회 (status가 active, suspended 등)
    let query = supabase
      .from("user_profiles")
      .select("id, display_name, gender, birth_date, university, major_first, profile_photo_url, vision")
      .in("status", ["active", "suspended", "seasonal_rest"])
      .not("display_name", "is", null)
      .order("display_name", { ascending: true });

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("크루 목록 조회 오류:", error);
      return NextResponse.json(
        { error: "크루 목록 조회에 실패했습니다." },
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

    const { data: userTeamParts } = await supabase
      .from("user_team_parts")
      .select("user_id, team_id, part_id")
      .in("user_id", userIds)
      .is("left_at", null);

    // 팀/파트 이름 조회
    const { data: teams } = await supabase.from("teams").select("id, name");
    const { data: parts } = await supabase.from("parts").select("id, name");

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

      return {
        id: user.id,
        name: user.display_name || '-',
        gender: user.gender || '-',
        age: age || '-',
        profileImg: user.profile_photo_url || '',
        university: user.university || '-',
        major: user.major_first || '-',
        team: teamPart?.teamName || '-',
        part: teamPart?.partName || '-',
        nickname: user.vision || '-',
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
