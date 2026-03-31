import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await verifyAdmin(request)
    const supabase = createServerClient()

    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await verifyAdmin(request)
    const supabase = createServerClient()
    const body = await request.json()

    const { data: page, error } = await supabase
      .from('pages')
      .update(body)
      .eq('slug', params.slug)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
