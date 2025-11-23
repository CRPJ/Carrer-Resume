'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Supabase 사용 예시 컴포넌트
export default function SupabaseExample() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 예시: 테이블에서 데이터 가져오기
      const { data: result, error } = await supabase
        .from('your_table_name') // 실제 테이블 이름으로 변경
        .select('*')
        .limit(10)

      if (error) throw error

      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 데이터 추가 예시
  const insertData = async (newItem: any) => {
    const { data, error } = await supabase
      .from('your_table_name')
      .insert([newItem])
      .select()

    if (error) {
      console.error('Insert error:', error)
      return null
    }

    return data
  }

  // 데이터 업데이트 예시
  const updateData = async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('your_table_name')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Update error:', error)
      return null
    }

    return data
  }

  // 데이터 삭제 예시
  const deleteData = async (id: string) => {
    const { error } = await supabase
      .from('your_table_name')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  }

  // 실시간 구독 예시
  useEffect(() => {
    const channel = supabase
      .channel('your_table_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'your_table_name'
        },
        (payload) => {
          console.log('Change received!', payload)
          // 데이터 다시 가져오기
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Supabase Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}