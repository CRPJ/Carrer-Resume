import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: 연계 동료 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const weekCardId = searchParams.get("weekCardId");

    const supabase = createAdminClient();

    let query = supabase
      .from("weekly_colleagues")
      .select(`
        id,
        user_id,
        week_card_id,
        colleague_id,
        rank,
        message,
        created_at
      `)
      .order("rank", { ascending: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (weekCardId) {
      query = query.eq("week_card_id", weekCardId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("연계 동료 조회 오류:", error);
      return NextResponse.json(
        { error: "연계 동료 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    // colleague 정보를 별도로 조회해서 합치기
    if (data && data.length > 0) {
      const colleagueIds = Array.from(new Set(data.map(d => d.colleague_id)));

      // colleague 프로필 조회
      const { data: colleagues } = await supabase
        .from("user_profiles")
        .select("id, display_name, gender, birth_date, university, major_first, profile_photo_url, vision")
        .in("id", colleagueIds);

      // colleague의 팀/파트 정보 조회
      const { data: userTeamParts } = await supabase
        .from("user_team_parts")
        .select("user_id, team_id, part_id")
        .in("user_id", colleagueIds)
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

      // Object로 매핑
      const colleagueObj: { [key: string]: any } = {};
      colleagues?.forEach(c => {
        // 나이 계산
        let age = null;
        if (c.birth_date) {
          const birthYear = new Date(c.birth_date).getFullYear();
          const currentYear = new Date().getFullYear();
          age = currentYear - birthYear;
        }

        const teamPart = userTeamPartMap[c.id];
        colleagueObj[c.id] = {
          id: c.id,
          name: c.display_name || '-',
          gender: c.gender || '-',
          age: age || '-',
          profileImg: c.profile_photo_url || '',
          university: c.university || '-',
          major: c.major_first || '-',
          team: teamPart?.teamName || '-',
          part: teamPart?.partName || '-',
          nickname: c.vision || '-',
        };
      });

      const dataWithColleagues = data.map(d => ({
        ...d,
        colleague: colleagueObj[d.colleague_id] || null
      }));

      return NextResponse.json({
        success: true,
        data: dataWithColleagues,
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("연계 동료 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 연계 동료 저장 (전체 덮어쓰기)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const { weekCardId, colleagues } = body;
    // colleagues: [{ colleagueId, rank, message }]

    if (!weekCardId) {
      return NextResponse.json(
        { error: "주차 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // 작성자 프로필 조회
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", session.user.email)
      .maybeSingle();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 연계 동료 삭제
    await supabase
      .from("weekly_colleagues")
      .delete()
      .eq("user_id", userProfile.id)
      .eq("week_card_id", weekCardId);

    // 새 연계 동료 저장 (colleagues가 있을 때만)
    if (colleagues && colleagues.length > 0) {
      const insertData = colleagues.map((c: { colleagueId: string; rank: number; message: string }) => ({
        id: crypto.randomUUID(),
        user_id: userProfile.id,
        week_card_id: weekCardId,
        colleague_id: c.colleagueId,
        rank: c.rank,
        message: c.message || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("weekly_colleagues")
        .insert(insertData);

      if (insertError) {
        console.error("연계 동료 저장 오류:", insertError);
        return NextResponse.json(
          { error: "연계 동료 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "연계 동료가 저장되었습니다.",
    });
  } catch (error) {
    console.error("연계 동료 저장 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
