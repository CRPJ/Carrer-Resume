import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type RecordStatus = '대전 중' | '대전 집계' | '공표 중' | '검수 완료'

const ALLOWED_TARGETS: RecordStatus[] = ['공표 중', '검수 완료']

// pms1.5 어드민이 cross-origin POST 가능하도록 CORS 헤더 노출.
// 운영 도메인(pms1-5.vercel.app) 외에 로컬 개발(:3001 등)도 허용해야 해서 와일드카드 사용 — 어차피 x-admin-key 로 권한 검증.
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  'Access-Control-Max-Age': '86400',
}

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, { ...init, headers: { ...CORS_HEADERS, ...(init?.headers || {}) } })

const kstTs = (dateIso: string, hours: number, minutes = 0): number =>
  new Date(`${dateIso}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`).getTime()

// "YYYY-MM-DD" + days → "YYYY-MM-DD" (UTC 산술이지만 days 단위만 다루므로 KST/UTC 무관).
const shiftDateIso = (iso: string, days: number): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

// 현재 시점 자동 도출 상태 — POST 가드용. GET API 의 deriveAutoStatus 와 동일 규칙.
const deriveAuto = (endDateIso: string, now: Date): '대전 중' | '대전 집계' =>
  now.getTime() < kstTs(endDateIso, 12, 0) ? '대전 중' : '대전 집계'

const currentStatus = (
  endDateIso: string,
  dbStatus: RecordStatus | null,
  now: Date,
): RecordStatus => {
  if (dbStatus === '공표 중' || dbStatus === '검수 완료') return dbStatus
  return deriveAuto(endDateIso, now)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminKey = process.env.ADMIN_API_KEY
    if (!adminKey) {
      return json({ success: false, error: 'ADMIN_API_KEY not configured' }, { status: 500 })
    }
    if (req.headers.get('x-admin-key') !== adminKey) {
      return json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params
    if (!id) return json({ success: false, error: 'missing week id' }, { status: 400 })

    const body = await req.json().catch(() => null) as { status?: RecordStatus } | null
    const target = body?.status
    if (!target || !ALLOWED_TARGETS.includes(target)) {
      return json({ success: false, error: `status must be one of ${ALLOWED_TARGETS.join(', ')}` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: week, error: weekErr } = await supabase
      .from('weeks')
      .select('id, end_date, league_record_status')
      .eq('id', id)
      .maybeSingle()

    if (weekErr) {
      console.error('[record-status] week fetch error:', weekErr)
      return json({ success: false, error: weekErr.message }, { status: 500 })
    }
    if (!week) return json({ success: false, error: 'week not found' }, { status: 404 })

    const now = new Date()
    const current = currentStatus(week.end_date, week.league_record_status as RecordStatus | null, now)

    // 전이 가드: '공표 중' 은 '대전 집계' 에서만, '검수 완료' 는 '공표 중' 에서만.
    // 단방향 — 한 번 검수 완료 되면 되돌릴 수 없음.
    if (target === '공표 중' && current !== '대전 집계') {
      return json({ success: false, error: `'공표 중' 전환은 '대전 집계' 상태에서만 가능 (현재: ${current})` }, { status: 409 })
    }
    if (target === '검수 완료' && current !== '공표 중') {
      return json({ success: false, error: `'검수 완료' 전환은 '공표 중' 상태에서만 가능 (현재: ${current})` }, { status: 409 })
    }

    // 시점 가드: 운영자 실수 방지. end_date(일요일) 기준 +4일 목 14:00, +5일 금 14:00 KST.
    const announceAt = kstTs(shiftDateIso(week.end_date, 4), 14, 0)
    const reviewAt   = kstTs(shiftDateIso(week.end_date, 5), 14, 0)
    if (target === '공표 중' && now.getTime() < announceAt) {
      return json({ success: false, error: '공표 중 전환은 종료 주 목요일 14:00 KST 이후에만 가능합니다' }, { status: 409 })
    }
    if (target === '검수 완료' && now.getTime() < reviewAt) {
      return json({ success: false, error: '검수 완료 전환은 종료 주 금요일 14:00 KST 이후에만 가능합니다' }, { status: 409 })
    }

    const update: Record<string, unknown> = { league_record_status: target }
    if (target === '공표 중')   update.announced_at = new Date().toISOString()
    if (target === '검수 완료') update.reviewed_at  = new Date().toISOString()

    const { error: updErr } = await supabase
      .from('weeks')
      .update(update)
      .eq('id', id)

    if (updErr) {
      console.error('[record-status] update error:', updErr)
      return json({ success: false, error: updErr.message }, { status: 500 })
    }

    return json({ success: true, data: { id, status: target } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[record-status] error:', e)
    return json({ success: false, error: msg }, { status: 500 })
  }
}
