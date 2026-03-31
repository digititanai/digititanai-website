'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Calendar, Clock, CheckCircle2, XCircle, TrendingUp, Mail, Loader2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [serviceBreakdown, setServiceBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.stats) setStats(data.stats)
        if (data?.serviceBreakdown) setServiceBreakdown(data.serviceBreakdown)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-brand-cream/30 animate-spin" /></div>

  const totalContacts = stats?.total_contacts ?? 0
  const totalBookings = stats?.total_bookings ?? 0
  const conversionRate = totalContacts > 0 ? Math.round((totalBookings / totalContacts) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-brand-cream">Analytics</h1>
        <p className="text-[13px] text-brand-cream/50 mt-0.5">Business metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: totalContacts, icon: MessageSquare, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
          { label: 'Total Bookings', value: totalBookings, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'New Contacts', value: stats?.new_contacts ?? 0, icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div className="text-[28px] font-display font-bold text-brand-cream">{stat.value}</div>
            <div className="text-[12px] text-brand-cream/40 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Booking Breakdown */}
        <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-brand-cream mb-5">Booking Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Pending', value: stats?.pending_bookings ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
              { label: 'Confirmed', value: stats?.confirmed_bookings ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
              { label: 'Cancelled', value: stats?.cancelled_bookings ?? 0, color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div className="text-[22px] font-bold text-brand-cream">{s.value}</div>
                <div className="text-[11px] text-brand-cream/40">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {totalBookings > 0 ? (<>
                <div className="bg-amber-500/40 rounded-l-full" style={{ width: `${((stats?.pending_bookings ?? 0) / totalBookings) * 100}%` }} />
                <div className="bg-emerald-500/40" style={{ width: `${((stats?.confirmed_bookings ?? 0) / totalBookings) * 100}%` }} />
                <div className="bg-red-500/40 rounded-r-full" style={{ width: `${((stats?.cancelled_bookings ?? 0) / totalBookings) * 100}%` }} />
              </>) : <div className="bg-brand-mid/10 flex-1 rounded-full" />}
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-brand-cream/40">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500/60" /> Pending</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500/60" /> Confirmed</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500/60" /> Cancelled</span>
            </div>
          </div>
          <Link href="/admin/bookings" className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand-gold hover:underline">View all bookings <ArrowUpRight className="w-3 h-3" /></Link>
        </div>

        {/* Service Interest */}
        <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-brand-cream mb-5">Service Interest</h3>
          <div className="space-y-3">
            {Object.entries(serviceBreakdown).sort((a, b) => b[1] - a[1]).map(([service, count]) => {
              const total = Object.values(serviceBreakdown).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={service}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-brand-cream/70">{service}</span>
                    <span className="text-[13px] font-semibold text-brand-cream">{count} <span className="text-brand-cream/30 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-brand-darkest/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-gold/40 to-brand-gold/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(serviceBreakdown).length === 0 && <p className="text-[12px] text-brand-cream/30 py-4 text-center">No contact data yet</p>}
          </div>
          <Link href="/admin/contacts" className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand-gold hover:underline">View all contacts <ArrowUpRight className="w-3 h-3" /></Link>
        </div>
      </div>

      {/* 30-Day Summary */}
      <div className="bg-surface-100/30 border border-brand-mid/[0.08] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-brand-cream mb-4">Last 30 Days</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'New Contacts', value: stats?.recent_contacts_30d ?? 0, icon: MessageSquare },
            { label: 'New Bookings', value: stats?.recent_bookings_30d ?? 0, icon: Calendar },
            { label: 'Pending Actions', value: (stats?.pending_bookings ?? 0) + (stats?.new_contacts ?? 0), icon: Clock },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-brand-darkest/30 border border-brand-mid/[0.04]">
              <s.icon className="w-4 h-4 text-brand-cream/30" />
              <div>
                <div className="text-[18px] font-bold text-brand-cream">{s.value}</div>
                <div className="text-[11px] text-brand-cream/40">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
