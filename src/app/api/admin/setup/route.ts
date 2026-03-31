import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createServerClient()

  // Create app_data table if it doesn't exist
  const { error } = await supabase.rpc('create_app_data_table' as never)

  if (error) {
    // If RPC doesn't exist, try raw approach - insert a test row to verify table exists
    const { error: testError } = await supabase
      .from('app_data')
      .upsert({ key: '_init', value: { initialized: true, at: new Date().toISOString() } }, { onConflict: 'key' })

    if (testError) {
      return NextResponse.json({ error: testError.message, hint: 'Please run the SQL migration manually in Supabase SQL Editor' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
