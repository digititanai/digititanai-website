import { createServerClient } from '@/lib/supabase'

// Server component — fetches all data at request time and injects into page
export default async function DataPreloader() {
  const supabase = createServerClient()

  // Fetch all collections + home page data in parallel
  const keys = ['col_services', 'col_portfolio', 'col_blog', 'col_testimonials', 'col_categories_v2', 'sabbirahsan_home_page_data', 'page_content_header', 'page_content_footer', 'site_settings_v2', 'site_code_injection']

  const { data: rows } = await supabase
    .from('app_data')
    .select('key, value')
    .in('key', keys)

  const preloadedData: Record<string, unknown> = {}
  for (const row of (rows || [])) {
    preloadedData[row.key] = row.value
  }

  return (
    <script
      id="preloaded-data"
      type="application/json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(preloadedData) }}
    />
  )
}
