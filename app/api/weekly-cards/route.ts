import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SEASON_KO: Record<string, string> = {
  spring: '봄',
  summer: '여름',
  fall: '가을',
  winter: '겨울',
}

// 시간 순서: 같은 year 안에서 겨울(1) → 봄(2) → 여름(3) → 가을(4).
// (`year * 10 + order` 로 정렬 키 변환 → 시즌 간 비교 가능)
const SEASON_ORDER: Record<string, number> = {
  winter: 1,
  spring: 2,
  summer: 3,
  fall: 4,
}
const seasonKey = (year: number, name: string): number => year * 10 + (SEASON_ORDER[name] ?? 0)

// 베타 테스트 기간 — 2026 봄 시즌 이후(포함) 주차만 노출. 2026 겨울 등 이전 시즌은 카드에서 제외.
const MIN_SEASON_KEY = seasonKey(2026, 'spring')

type SeasonRow = { id: string; year: number; name: string } | null
type RecordStatus = '대전 중' | '대전 집계' | '공표 중' | '검수 완료'
type WeekRow = {
  id: string
  week_number: number
  start_date: string
  end_date: string
  is_club_break: boolean | null
  league_record_status: RecordStatus | null
  announced_at: string | null
  reviewed_at: string | null
  seasons: SeasonRow | SeasonRow[]
}

const pickOne = <T,>(v: T | T[] | null | undefined): T | null => {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

// "YYYY-MM-DD" + KST offset 으로 timestamp 생성. DST 없는 KST 가정.
const kstTs = (dateIso: string, hours: number, minutes = 0): number =>
  new Date(`${dateIso}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`).getTime()

// 시각 기반 자동 도출 (대전 중 ↔ 대전 집계).
// end_date(= 해당 주 일요일) 12:00 KST 이전 = '대전 중', 그 이후 = '대전 집계'.
// '공표 중' / '검수 완료' 는 운영자 수동 토글 결과로 DB 에서만 값이 채워지므로 자동 도출 대상이 아니다.
const deriveAutoStatus = (endDateIso: string, now: Date): '대전 중' | '대전 집계' => {
  const aggregateAt = kstTs(endDateIso, 12, 0)
  return now.getTime() < aggregateAt ? '대전 중' : '대전 집계'
}

// DB 의 league_record_status 가 명시되어 있으면 우선 사용, 없으면 시각 기준 자동 도출.
// 운영자가 일단 '공표 중' 으로 토글하면 24h 뒤 자동으로 '검수 완료' 가 되지는 않는다 — 모두 수동.
const resolveRecordStatus = (
  endDateIso: string,
  dbStatus: RecordStatus | null,
  now: Date,
): RecordStatus => {
  if (dbStatus === '공표 중' || dbStatus === '검수 완료') return dbStatus
  return deriveAutoStatus(endDateIso, now)
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: weeksData, error: weeksErr } = await supabase
      .from('weeks')
      .select('id, week_number, start_date, end_date, is_club_break, league_record_status, announced_at, reviewed_at, seasons(id, year, name)')
      .lte('start_date', today)
      .order('start_date', { ascending: false })

    if (weeksErr) {
      console.error('[weekly-cards] weeks error:', weeksErr)
      return NextResponse.json({ success: false, error: weeksErr.message }, { status: 500 })
    }

    const validWeeks = ((weeksData || []) as WeekRow[]).filter((w) => {
      const s = pickOne(w.seasons)
      if (!s?.name) return false
      if (s.name.includes('break')) return false
      if (!SEASON_ORDER[s.name]) return false
      if (seasonKey(s.year, s.name) < MIN_SEASON_KEY) return false
      return true
    })

    if (validWeeks.length === 0) {
      return NextResponse.json({ success: true, data: { cards: [] } })
    }

    const weekIds = validWeeks.map((w) => w.id)

    // weekIds 만 의존하는 두 쿼리는 병렬 실행 — round-trip latency 절감.
    const [growthRes, pointsRes] = await Promise.all([
      supabase
        .from('user_weekly_growth')
        .select('week_id, user_id, is_success, is_resting, is_club_break')
        .in('week_id', weekIds),
      supabase
        .from('points')
        .select('week_id, user_id, points')
        .in('week_id', weekIds)
        .eq('point_type', 'star'),
    ])
    const { data: growthData, error: growthErr } = growthRes
    const { data: pointsData, error: pointsErr } = pointsRes

    if (growthErr) {
      console.error('[weekly-cards] growth error:', growthErr)
      return NextResponse.json({ success: false, error: growthErr.message }, { status: 500 })
    }
    if (pointsErr) {
      console.error('[weekly-cards] points error:', pointsErr)
      return NextResponse.json({ success: false, error: pointsErr.message }, { status: 500 })
    }

    type Stat = {
      total: number
      challenge: number
      success: number
      fail: number
      personalRest: number
      clubBreak: number
    }
    const statByWeek: Record<string, Stat> = {}
    for (const wId of weekIds) {
      statByWeek[wId] = { total: 0, challenge: 0, success: 0, fail: 0, personalRest: 0, clubBreak: 0 }
    }
    for (const g of (growthData || [])) {
      const s = statByWeek[g.week_id]
      if (!s) continue
      s.total += 1
      if (g.is_club_break) {
        s.clubBreak += 1
      } else if (g.is_resting) {
        s.personalRest += 1
      } else {
        s.challenge += 1
        if (g.is_success) s.success += 1
        else s.fail += 1
      }
    }

    const starByWeekUser: Record<string, Record<string, number>> = {}
    for (const p of (pointsData || [])) {
      if (!starByWeekUser[p.week_id]) starByWeekUser[p.week_id] = {}
      starByWeekUser[p.week_id][p.user_id] =
        (starByWeekUser[p.week_id][p.user_id] || 0) + (p.points || 0)
    }
    const top3IdsByWeek: Record<string, string[]> = {}
    for (const wId of weekIds) {
      const m = starByWeekUser[wId] || {}
      top3IdsByWeek[wId] = Object.entries(m)
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([uid]) => uid)
    }

    const allTop3UserIds = Array.from(new Set(Object.values(top3IdsByWeek).flat()))

    const profilesMap: Record<string, { display_name: string }> = {}
    const teamPartMap: Record<string, { team_name: string; part_name: string }> = {}

    if (allTop3UserIds.length > 0) {
      // profiles + team_parts 도 병렬 — 동일 user_ids 만 의존, 서로 독립.
      const [profilesRes, tpRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, display_name, status')
          .in('id', allTop3UserIds),
        supabase
          .from('user_team_parts')
          .select('user_id, teams!user_team_parts_team_id_fkey(name), parts(name)')
          .in('user_id', allTop3UserIds)
          .is('left_at', null),
      ])
      const { data: profiles, error: profErr } = profilesRes
      const { data: tpRows, error: tpErr } = tpRes
      if (profErr) {
        console.error('[weekly-cards] profiles error:', profErr)
      }
      for (const p of (profiles || [])) {
        if (p.status === 'suspended') continue
        profilesMap[p.id] = { display_name: p.display_name || '이름 없음' }
      }
      if (tpErr) {
        console.error('[weekly-cards] team_parts error:', tpErr)
      }
      for (const r of (tpRows || []) as any[]) {
        const team = pickOne(r.teams) as { name?: string } | null
        const part = pickOne(r.parts) as { name?: string } | null
        teamPartMap[r.user_id] = {
          team_name: team?.name || '-',
          part_name: part?.name || '-',
        }
      }
    }

    const now = new Date()
    const cards = validWeeks.map((w) => {
      const season = pickOne(w.seasons)
      const stat = statByWeek[w.id] || { total: 0, challenge: 0, success: 0, fail: 0, personalRest: 0, clubBreak: 0 }
      const successRate = stat.challenge > 0 ? Math.round((stat.success / stat.challenge) * 100) : 0
      const challengeRate = stat.total > 0 ? Math.round((stat.challenge / stat.total) * 100) : 0
      const top3 = (top3IdsByWeek[w.id] || []).map((uid, idx) => {
        const tp = teamPartMap[uid] || { team_name: '-', part_name: '-' }
        return {
          rank: (idx + 1) as 1 | 2 | 3,
          name: profilesMap[uid]?.display_name || '이름 없음',
          team: tp.team_name,
          part: tp.part_name,
        }
      })
      const isClubBreak = !!w.is_club_break
      const leagueResultStatus = isClubBreak ? '공식 휴식' : '정상 진행'
      const leagueRecordStatus = resolveRecordStatus(w.end_date, w.league_record_status, now)
      const status =
        isClubBreak ? '휴식' : leagueRecordStatus === '대전 집계' ? '대전 집계' : '정상 진행'
      return {
        id: w.id,
        weekNumber: w.week_number,
        startDate: w.start_date,
        endDate: w.end_date,
        isClubBreak,
        seasonYear: season?.year || 0,
        seasonNameEn: season?.name || '',
        seasonNameKo: SEASON_KO[season?.name || ''] || season?.name || '',
        status,
        leagueResultStatus,
        leagueRecordStatus,
        totalCrews: stat.total,
        growthChallenge: stat.challenge,
        growthSuccess: stat.success,
        growthFail: stat.fail,
        personalRest: stat.personalRest,
        growthSuccessRate: successRate,
        growthChallengeRate: challengeRate,
        top3,
      }
    })

    return NextResponse.json({ success: true, data: { cards } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[weekly-cards] error:', e)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
