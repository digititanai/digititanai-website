import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await verifyAdmin(request)
    const supabase = createServerClient()

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request)
    const supabase = createServerClient()
    const body = await request.json()

    const { key, value } = body as { key: string; value: unknown }

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required.' },
        { status: 400 }
      )
    }

    // Upsert: update if exists, insert if not
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: setting, error } = await supabase
      .from('site_settings')
      .upsert({ key, value: value as any }, { onConflict: 'key' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ setting })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
