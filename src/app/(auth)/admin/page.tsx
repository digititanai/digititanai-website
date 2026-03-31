'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, MessageSquare, Calendar, Clock, CheckCircle2, XCircle, ArrowUpRight, Mail, Loader2, Briefcase } from 'lucide-react'

interface Stats {
  total_contacts: number
  total_bookings: number
  recent_contacts_30d: number
  recent_bookings_30d: number
  pending_bookings: number
  new_contacts: number
  confirmed_bookings: number
  cancelled_bookings: number
}

interface Activity {
  type: 'contact' | 'booking'
  id: string
  name: string
  email: string
  detail: string
  time: string
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [serviceBreakdown, setServiceBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.stats) setStats(data.stats)
        if (data?.activity) setActivity(data.activity)
        if (data?.serviceBreakdown) setServiceBreakdown(data.serviceBreakdown)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const timeAgo = (time: string) => {
    const diff = Date.now() - new Date(time).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-brand-cream/30 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-brand-cream">Dashboard</h1>
        <p className="text-[13px] text-brand-cream/50 mt-0.5">Overview of your website activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: stats?.total_contacts ?? 0, sub: `${stats?.new_contacts ?? 0} new`, icon: MessageSquare, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
          { label: 'Total Bookings', value: stats?.total_bookings ?? 0, sub: `${stats?.pending_bookings ?? 0} pending`, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Last 30 Days Contacts', value: stats?.recent_contacts_30d ?? 0, sub: 'new inquiries', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Last 30 Days Bookings', value: stats?.recent_bookings_30d ?? 0, sub: 'appointments', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5 hover:border-brand-mid/15 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-[28px] font-display font-bold text-brand-cream">{stat.value}</div>
            <div className="text-[12px] text-brand-cream/40 mt-1">{stat.label}</div>
            <div className="text-[11px] text-brand-cream/30 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Booking Status + Service Breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Booking Status */}
        <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-brand-cream mb-4">Booking Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', count: stats?.pending_bookings ?? 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Confirmed', count: stats?.confirmed_bookings ?? 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Cancelled', count: stats?.cancelled_bookings ?? 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-3.5 h-3.5 ${s.color}`} /></div>
                  <span className="text-[13px] text-brand-cream/70">{s.label}</span>
                </div>
                <span className="text-[16px] font-semibold text-brand-cream">{s.count}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/bookings" className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand-gold hover:underline">View all bookings <ArrowUpRight className="w-3 h-3" /></Link>
        </div>

        {/* Contacts by Service */}
        <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-brand-cream mb-4">Contacts by Service</h3>
          <div className="space-y-2.5">
            {Object.entries(serviceBreakdown).sort((a, b) => b[1] - a[1]).map(([service, count]) => {
              const total = Object.values(serviceBreakdown).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={service}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-brand-cream/60">{service}</span>
                    <span className="text-[12px] text-brand-cream/40">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-brand-darkest/40 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gold/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(serviceBreakdown).length === 0 && <p className="text-[12px] text-brand-cream/30">No contacts yet</p>}
          </div>
          <Link href="/admin/contacts" className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand-gold hover:underline">View all contacts <ArrowUpRight className="w-3 h-3" /></Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-brand-cream mb-4">Recent Activity</h3>
        <div className="space-y-0">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b border-brand-mid/[0.04] last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'booking' ? 'bg-emerald-500/10' : 'bg-brand-gold/10'}`}>
                {item.type === 'booking' ? <Calendar className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream/80"><strong>{item.name}</strong> — {item.type === 'booking' ? 'booked' : 'contacted'}</p>
                <p className="text-[11px] text-brand-cream/40 flex items-center gap-2">
                  <span>{item.detail}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                    item.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    item.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.status === 'new' ? 'bg-brand-gold/10 text-brand-gold' :
                    item.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-brand-mid/10 text-brand-cream/50'
                  }`}>{item.status}</span>
                </p>
              </div>
              <span className="text-[11px] text-brand-cream/30 flex-shrink-0">{timeAgo(item.time)}</span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-[12px] text-brand-cream/30 py-4 text-center">No recent activity</p>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'View Bookings', href: '/admin/bookings', icon: Calendar },
          { label: 'View Contacts', href: '/admin/contacts', icon: MessageSquare },
          { label: 'Manage Services', href: '/admin/services', icon: Briefcase },
          { label: 'Edit Pages', href: '/admin/pages', icon: Users },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="bg-surface-100/20 border border-brand-mid/[0.06] rounded-xl p-4 hover:border-brand-mid/15 hover:bg-surface-100/30 transition-all flex items-center gap-3">
            <action.icon className="w-4 h-4 text-brand-cream/40" />
            <span className="text-[13px] text-brand-cream/60">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
