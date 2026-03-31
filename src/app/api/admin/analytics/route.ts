import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // All counts in parallel
    const [contacts, bookings, recentContacts, recentBookings, pendingBookings, newContacts, confirmedBookings, cancelledBookings] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
    ])

    // Recent activity — last 10 contacts + bookings merged
    const [recentContactsList, recentBookingsList] = await Promise.all([
      supabase.from('contacts').select('id, name, email, service_interest, created_at, status').order('created_at', { ascending: false }).limit(5),
      supabase.from('bookings').select('id, client_name, client_email, booking_date, booking_time, message, created_at, status').order('created_at', { ascending: false }).limit(5),
    ])

    // Merge into activity feed
    const activity = [
      ...(recentContactsList.data || []).map(c => ({ type: 'contact' as const, id: c.id, name: c.name, email: c.email, detail: c.service_interest || 'General inquiry', time: c.created_at, status: c.status })),
      ...(recentBookingsList.data || []).map(b => {
        const service = b.message?.match(/^\[([^\]]+)\]/)?.[1] || 'Consultation'
        return { type: 'booking' as const, id: b.id, name: b.client_name, email: b.client_email, detail: service, time: b.created_at, status: b.status }
      }),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    // Contacts by service
    const { data: allContacts } = await supabase.from('contacts').select('service_interest')
    const serviceBreakdown: Record<string, number> = {}
    ;(allContacts || []).forEach(c => {
      const s = c.service_interest || 'Other'
      serviceBreakdown[s] = (serviceBreakdown[s] || 0) + 1
    })

    return NextResponse.json({
      stats: {
        total_contacts: contacts.count ?? 0,
        total_bookings: bookings.count ?? 0,
        recent_contacts_30d: recentContacts.count ?? 0,
        recent_bookings_30d: recentBookings.count ?? 0,
        pending_bookings: pendingBookings.count ?? 0,
        new_contacts: newContacts.count ?? 0,
        confirmed_bookings: confirmedBookings.count ?? 0,
        cancelled_bookings: cancelledBookings.count ?? 0,
      },
      activity,
      serviceBreakdown,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ stats: {}, activity: [], serviceBreakdown: {} }, { status: 500 })
  }
}
