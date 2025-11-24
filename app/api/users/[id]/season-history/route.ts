import { createAdminClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const userId = (await params).id

    console.log('Fetching season history for userId:', userId)

    // user_season_histories와 seasons를 JOIN해서 조회 (휴식 시즌 제외)
    const { data: historyData, error: historyError } = await supabase
      .from('user_season_histories')
      .select(`
        *,
        seasons!inner (
          year,
          name,
          season_order,
          is_break
        )
      `)
      .eq('user_id', userId)
      .eq('seasons.is_break', false)

    console.log('Query result - data:', historyData)
    console.log('Query result - error:', historyError)

    if (historyError) {
      console.error('Error fetching season history:', historyError)
      return NextResponse.json(
        { error: '시즌 히스토리를 가져오는데 실패했습니다.', details: historyError.message },
        { status: 500 }
      )
    }

    if (!historyData || historyData.length === 0) {
      console.log('No season history found for userId:', userId)
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // 클라이언트 사이드에서 정렬 (년도 내림차순, 시즌 순서 내림차순)
    const sortedData = historyData.sort((a: any, b: any) => {
      const yearDiff = parseInt(b.seasons.year) - parseInt(a.seasons.year)
      if (yearDiff !== 0) return yearDiff
      return b.seasons.season_order - a.seasons.season_order
    })

    console.log('Season history data found:', sortedData.length, 'records')

    return NextResponse.json({
      success: true,
      data: sortedData
    })

  } catch (error) {
    console.error('Error in season history API:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}