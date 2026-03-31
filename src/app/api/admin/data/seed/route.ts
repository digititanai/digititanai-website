import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/auth'
import { getServices, getPortfolio, getBlog, getTestimonials, getCategories } from '@/lib/collections'
import { defaultHomePageData } from '@/lib/homePageData'

const SEED_ENTRIES: { key: string; getValue: () => unknown }[] = [
  { key: 'col_services', getValue: () => getServices() },
  { key: 'col_portfolio', getValue: () => getPortfolio() },
  { key: 'col_blog', getValue: () => getBlog() },
  { key: 'col_testimonials', getValue: () => getTestimonials() },
  { key: 'col_categories_v2', getValue: () => getCategories() },
  { key: 'sabbirahsan_home_page_data', getValue: () => defaultHomePageData },
]

export async function POST() {
  try {
    const supabase = createServerClient()
    const seeded: string[] = []

    for (const entry of SEED_ENTRIES) {
      // Check if key already exists
      const { data } = await supabase
        .from('app_data')
        .select('key')
        .eq('key', entry.key)
        .single()

      if (data) {
        // Already exists, skip
        continue
      }

      // Insert default value
      const { error } = await supabase
        .from('app_data')
        .insert({
          key: entry.key,
          value: entry.getValue(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        return NextResponse.json(
          { error: `Failed to seed "${entry.key}": ${error.message}` },
          { status: 500 }
        )
      }

      seeded.push(entry.key)
    }

    return NextResponse.json({ seeded })
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
