import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(null, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data.value, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
