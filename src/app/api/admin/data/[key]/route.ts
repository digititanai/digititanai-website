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
      return NextResponse.json(null)
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data.value)
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const supabase = createServerClient()
    const body = await request.json()

    console.log(`[PUT /api/admin/data/${key}] Saving ${typeof body.value === 'object' ? (Array.isArray(body.value) ? body.value.length + ' items' : 'object') : typeof body.value}`)

    const { error } = await supabase
      .from('app_data')
      .upsert(
        { key, value: body.value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      console.log(`[PUT /api/admin/data/${key}] ERROR:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[PUT /api/admin/data/${key}] OK`)
    return NextResponse.json({ success: true, key })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const supabase = createServerClient()

    const { error } = await supabase
      .from('app_data')
      .delete()
      .eq('key', key)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, key })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
