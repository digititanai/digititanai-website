import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function getFileType(name: string): 'image' | 'document' | 'video' {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
  return 'document'
}

export async function GET() {
  try {
    const supabase = createServerClient()

    // List ALL files from Supabase Storage 'media' bucket
    const { data: files, error } = await supabase.storage.from('media').list('uploads', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.error('Storage list error:', error)
      return NextResponse.json([], { status: 500 })
    }

    // Build media items with public URLs
    const items = (files || [])
      .filter(f => f.name && !f.name.startsWith('.'))
      .map(f => {
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(`uploads/${f.name}`)
        return {
          id: f.id || f.name,
          name: f.name,
          type: getFileType(f.name),
          size: f.metadata?.size || 0,
          url: urlData.publicUrl,
          created_at: f.created_at || new Date().toISOString(),
        }
      })

    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createServerClient()
    const { path } = await request.json()

    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

    const { error } = await supabase.storage.from('media').remove([path])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
