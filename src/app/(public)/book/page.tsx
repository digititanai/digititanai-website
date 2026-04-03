'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';
import { defaultPageContent } from '@/lib/pageContent';
import PageSEO from '@/components/layout/PageSEO';
import { getServices, type ServiceItem } from '@/lib/collections';
import { useData } from '@/lib/useData';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface PricingFeature { text: string; included: boolean }
interface PricingTier { name: string; price: string; features: PricingFeature[]; highlighted?: boolean }

interface BookingService {
  id: string;
  label: string;
  packages: Record<string, string>;
  tiers: PricingTier[];
}

const defaultServices: BookingService[] = [];

function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const STEPS = ['Select Service', 'Choose Date & Time', 'Your Details', 'Confirm'] as const;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function isWeekend(year: number, month: number, day: number) { const d = new Date(year, month, day).getDay(); return d === 0 || d === 6; }
function isPast(year: number, month: number, day: number) { const today = new Date(); today.setHours(0, 0, 0, 0); return new Date(year, month, day) < today; }
function isToday(year: number, month: number, day: number) { const today = new Date(); return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day; }

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  const searchParams = useSearchParams();
  const { loaded } = useData();
  const [services, setServices] = useState<BookingService[]>(defaultServices);
  const [pageContent, setPageContent] = useState(defaultPageContent.book);
  useEffect(() => {
    fetch('/api/data/page_content_book', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPageContent({ ...defaultPageContent.book, ...data }) })
      .catch(() => {});
  }, []);
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [details, setDetails] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [detailTier, setDetailTier] = useState<PricingTier | null>(null);

  const fetchSlots = (date: Date, isInitial: boolean) => {
    if (isInitial) { setLoadingSlots(true); setSelectedTime(''); }
    const y = date.getFullYear();
    const mo = (date.getMonth() + 1).toString().padStart(2, '0');
    const da = date.getDate().toString().padStart(2, '0');
    fetch(`/api/bookings/availability?date=${y}-${mo}-${da}&duration=30&t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.available_slots) {
          let slots = data.available_slots as string[];
          const now = new Date();
          const isTodayDate = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
          if (isTodayDate) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            slots = slots.filter((s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m > currentMinutes; });
          }
          const newSlots = slots.map((s: string) => to12Hour(s));
          setAvailableSlots(newSlots);
          if (selectedTime && !newSlots.includes(selectedTime)) setSelectedTime('');
        }
      })
      .catch(() => {})
      .finally(() => { if (isInitial) setLoadingSlots(false); });
  };

  useEffect(() => {
    if (!selectedDate) return;
    fetchSlots(selectedDate, true);
    const interval = setInterval(() => fetchSlots(selectedDate, false), 15000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    if (!loaded) return;
    const items = getServices().filter((s: ServiceItem) => s.active);
    if (items.length) {
      const mapped: BookingService[] = items.map((s) => ({
        id: s.id, label: s.title,
        packages: Object.fromEntries((s.pricing || []).map((p) => [p.name, p.price])),
        tiers: s.pricing || [],
      }));
      setServices(mapped);
    }
    setServicesLoaded(true);
  }, [loaded]);

  useEffect(() => {
    if (!servicesLoaded || services.length === 0) return;
    const serviceParam = searchParams.get('service');
    const packageParam = searchParams.get('package');
    if (serviceParam) {
      const match = services.find((s) => s.label === serviceParam);
      if (match) {
        setSelectedService(match.id);
        if (packageParam) setSelectedPackage(packageParam);
        setStep(1);
      }
    }
  }, [searchParams, servicesLoaded, services]);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDay]);

  const canGoNext = () => {
    switch (step) {
      case 0: return !!selectedService && !!selectedPackage;
      case 1: return !!selectedDate && !!selectedTime;
      case 2: return !!details.name && !!details.email;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const convertTime = (t: string) => {
        const [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      const formatDate = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

      const payload = {
        client_name: details.name, client_email: details.email, client_phone: details.phone || undefined,
        service_name: serviceName, package_name: selectedPackage || undefined,
        booking_date: selectedDate ? formatDate(selectedDate) : '', booking_time: convertTime(selectedTime),
        duration_minutes: 30, message: details.message || undefined,
      };
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setSubmitted(true); }
      else { const err = await res.json().catch(() => ({ error: 'Unknown error' })); alert(`Booking failed: ${err.error || JSON.stringify(err.details || err)}`); }
    } catch { alert('Booking failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const serviceName = services.find((s) => s.id === selectedService)?.label ?? '';

  const goNext = () => { if (step < 3 && canGoNext()) { setDirection(1); setStep((s) => s + 1); } };
  const goPrev = () => { if (step > 0) { setDirection(-1); setStep((s) => s - 1); } };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const progressPercent = (step / (STEPS.length - 1)) * 100;

  /* ═══ SUCCESS SCREEN ═══ */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-brand-mid/15 border border-brand-mid/20 flex items-center justify-center mx-auto mb-6">
            <CalendarDays className="w-9 h-9 text-brand-mid" />
          </div>
          <h2 className="text-3xl font-display font-bold text-brand-cream mb-4">Booking Confirmed</h2>
          <p className="text-brand-cream-dark mb-8">Your appointment has been scheduled. You will receive a confirmation email shortly.</p>

          <div className="rounded-2xl bg-surface-200 border border-surface-300 p-6 text-left space-y-4 text-[14px] mb-8 relative overflow-hidden">
            <div className="absolute inset-0 card-shine pointer-events-none" />
            <div className="relative z-10 space-y-4">
              {[
                { label: 'Service', value: serviceName },
                { label: 'Date', value: selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Time', value: selectedTime },
                { label: 'Name', value: details.name },
                { label: 'Email', value: details.email },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-brand-cream/60">{item.label}</span>
                  <span className="text-brand-cream font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setSubmitted(false); setStep(0); setSelectedService(''); setSelectedDate(null); setSelectedTime(''); setDetails({ name: '', email: '', phone: '', message: '' }); }} className="btn-secondary">
            Book Another Appointment
          </button>
        </motion.div>
      </main>
    );
  }

  /* ═══ MAIN BOOKING UI ═══ */
  return (
    <main className="min-h-screen">
      <PageSEO title={pageContent.seoTitle} description={pageContent.seoDescription} image={pageContent.seoImage} />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 md:pt-36 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />
        <div className="container-main text-center relative z-10">
          <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="badge mb-6 inline-block">
            {pageContent.badge}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-brand-cream max-w-3xl mx-auto">
            {pageContent.heading}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-6 text-lg text-brand-cream-dark max-w-xl mx-auto">
            {pageContent.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ═══ PROGRESS BAR ═══ */}
      <section className="container-main mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-brand-cream/60">Step {step + 1} of {STEPS.length}</span>
          <span className="text-[13px] text-brand-mid font-medium">{STEPS[step]}</span>
        </div>
        <div className="relative h-1 rounded-full bg-surface-300 overflow-hidden">
          <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-mid to-brand-gold-light rounded-full"
            animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.4, ease: 'easeInOut' }} />
        </div>
      </section>

      {/* ═══ STEP CONTENT + SIDEBAR ═══ */}
      <section className="container-main pb-20">
        <div className="flex flex-col lg:flex-row gap-6">

        {/* Main form area */}
        <div className="flex-1 min-w-0 rounded-2xl bg-surface-200/80 border border-brand-mid/[0.08] p-7 sm:p-9 overflow-hidden relative shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-0 card-shine pointer-events-none" />
          <div className="relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>

              {/* Step 0: Service */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-brand-cream mb-7">Select a Service</h2>

                  {/* Loading state */}
                  {!servicesLoaded && (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-6 h-6 border-2 border-brand-mid/30 border-t-brand-mid rounded-full animate-spin" />
                      <span className="ml-3 text-[14px] text-brand-cream/70">Loading services...</span>
                    </div>
                  )}

                  {/* Empty state */}
                  {servicesLoaded && services.length === 0 && (
                    <div className="text-center py-16 rounded-xl border border-dashed border-surface-300">
                      <CalendarDays className="w-10 h-10 text-brand-cream/20 mx-auto mb-4" />
                      <p className="text-brand-cream/70 text-[15px] font-medium">No services available yet</p>
                      <p className="text-brand-cream/45 text-[13px] mt-2">Services will appear here once configured in the admin panel.</p>
                    </div>
                  )}

                  {/* Services list */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((s) => (
                      <button key={s.id} onClick={() => { setSelectedService(s.id); setSelectedPackage(''); }}
                        className={`rounded-xl border p-5 text-left text-[14px] font-medium transition-all duration-300 ${
                          selectedService === s.id
                            ? 'border-brand-mid/40 bg-brand-mid/10 text-brand-cream shadow-lg shadow-brand-mid/5'
                            : 'border-surface-300 bg-surface-100/50 text-brand-cream/80 hover:border-brand-mid/20 hover:bg-surface-100'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Package selection */}
                  {selectedService && (() => {
                    const svc = services.find((s) => s.id === selectedService);
                    if (!svc) return null;
                    return (
                      <div className="mt-8">
                        <h3 className="text-[16px] font-display font-bold text-brand-cream mb-4">Select Package</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {svc.tiers.map((tier) => (
                            <div key={tier.name} className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                              selectedPackage === tier.name
                                ? 'border-brand-mid/40 bg-brand-mid/10'
                                : 'border-surface-300 hover:border-brand-mid/20'
                            }`}>
                              <button onClick={() => setSelectedPackage(tier.name)}
                                className="w-full py-3 sm:py-4 px-4 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
                                <div className={`text-[14px] font-medium ${selectedPackage === tier.name ? 'text-brand-cream' : 'text-brand-cream/80'}`}>{tier.name}</div>
                                <div className="text-[16px] font-bold gradient-text sm:mt-1">{tier.price}</div>
                                <div className="text-[10px] text-brand-cream/45 sm:mt-1 ml-auto sm:ml-0">{tier.features?.filter(f => f.included).length || 0} features</div>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDetailTier(detailTier?.name === tier.name ? null : tier) }}
                                className="w-full py-2 text-[11px] text-brand-mid/70 hover:text-brand-mid border-t border-surface-300 hover:bg-brand-mid/5 transition-colors flex items-center justify-center gap-1">
                                {detailTier?.name === tier.name ? 'Hide Details' : 'View Details'}
                                <ChevronRight className={`w-3 h-3 transition-transform ${detailTier?.name === tier.name ? 'rotate-90' : ''}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {detailTier && (
                          <div className="mt-3 p-4 rounded-xl border border-surface-300 bg-surface-100/50 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px] font-semibold text-brand-cream">{detailTier.name} - {detailTier.price}</span>
                              <button onClick={() => setDetailTier(null)} className="text-[11px] text-brand-cream/50 hover:text-brand-cream">Close</button>
                            </div>
                            {detailTier.features?.map((f, i) => (
                              <div key={i} className={`flex items-center gap-2.5 text-[13px] ${f.included ? 'text-brand-cream/75' : 'text-brand-cream/25'}`}>
                                {f.included ? <Check className="w-4 h-4 text-brand-mid flex-shrink-0" /> : <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-brand-cream/15">&times;</span>}
                                {f.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 1: Calendar */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-brand-cream mb-7">Choose a Date</h2>
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else { setCalMonth((m) => m - 1); } }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-300 text-brand-cream/50 hover:text-brand-mid hover:border-brand-mid/30 transition">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[15px] font-display font-bold text-brand-cream/80">{MONTHS[calMonth]} {calYear}</span>
                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else { setCalMonth((m) => m + 1); } }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-300 text-brand-cream/50 hover:text-brand-mid hover:border-brand-mid/30 transition">
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[12px] text-brand-cream/50 mb-2 font-semibold">
                    {DAYS.map((d) => (<span key={d} className="py-2">{d}</span>))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((day, i) => {
                      if (day === null) return <div key={`blank-${i}`} />;
                      const weekend = isWeekend(calYear, calMonth, day);
                      const past = isPast(calYear, calMonth, day);
                      const disabled = weekend || past;
                      const today = isToday(calYear, calMonth, day);
                      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === calMonth && selectedDate?.getFullYear() === calYear;

                      return (
                        <button key={day} disabled={disabled} onClick={() => setSelectedDate(new Date(calYear, calMonth, day))}
                          className={`relative rounded-xl py-2.5 text-[14px] font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-brand-mid text-brand-darkest shadow-lg shadow-brand-mid/20'
                              : disabled
                                ? 'text-brand-cream/15 cursor-not-allowed'
                                : 'text-brand-cream/70 hover:bg-brand-mid/10 hover:text-brand-cream'
                          }`}>
                          {day}
                          {today && !isSelected && (<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-mid" />)}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <p className="mt-5 text-[14px] text-brand-cream/60">
                      Selected: <span className="text-brand-cream font-semibold">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                  )}

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="mt-8 pt-6 border-t border-surface-300">
                      <h3 className="text-[16px] font-display font-bold text-brand-cream mb-4">Choose a Time Slot</h3>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-brand-mid/30 border-t-brand-mid rounded-full animate-spin" />
                          <span className="ml-3 text-[13px] text-brand-cream/70">Checking availability...</span>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-brand-cream/70 text-[14px]">No available time slots for this date.</p>
                          <p className="text-brand-cream/45 text-[12px] mt-2">Try selecting a different date.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                          {availableSlots.map((slot) => (
                            <button key={slot} onClick={() => setSelectedTime(slot)}
                              className={`rounded-full border py-2.5 text-[13px] font-medium transition-all duration-300 ${
                                selectedTime === slot
                                  ? 'border-brand-mid/40 bg-brand-mid text-brand-darkest shadow-lg shadow-brand-mid/20'
                                  : 'border-surface-300 text-brand-cream/70 hover:border-brand-mid/30 hover:bg-brand-mid/10'
                              }`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-brand-cream mb-7">Your Details</h2>
                  <div className="space-y-5">
                    {[
                      { label: 'Name', type: 'text', key: 'name', placeholder: 'John Doe', required: true },
                      { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com', required: true },
                      { label: 'Phone (optional)', type: 'tel', key: 'phone', placeholder: '+880 1XXX-XXXXXX', required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="mb-2 block text-[12px] uppercase tracking-widest text-brand-cream/60 font-semibold">{field.label}</label>
                        <input type={field.type} value={details[field.key as keyof typeof details]}
                          onChange={(e) => setDetails((d) => ({ ...d, [field.key]: e.target.value }))}
                          placeholder={field.placeholder} className="input-field" />
                      </div>
                    ))}
                    <div>
                      <label className="mb-2 block text-[12px] uppercase tracking-widest text-brand-cream/60 font-semibold">Message (optional)</label>
                      <textarea rows={3} value={details.message}
                        onChange={(e) => setDetails((d) => ({ ...d, message: e.target.value }))}
                        placeholder="Any additional details..." className="textarea-field" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-brand-cream mb-7">Review &amp; Confirm</h2>
                  <div className="space-y-4 text-[14px]">
                    {[
                      { label: 'Service', value: serviceName },
                      { label: 'Package', value: selectedPackage || 'Not selected' },
                      { label: 'Date', value: selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                      { label: 'Time', value: selectedTime },
                      { label: 'Name', value: details.name },
                      { label: 'Email', value: details.email },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-3 border-b border-surface-300">
                        <span className="text-brand-cream/60">{item.label}</span>
                        <span className="text-brand-cream font-semibold">{item.value}</span>
                      </div>
                    ))}
                    {details.phone && (
                      <div className="flex justify-between py-3 border-b border-surface-300">
                        <span className="text-brand-cream/60">Phone</span>
                        <span className="text-brand-cream font-semibold">{details.phone}</span>
                      </div>
                    )}
                    {details.message && (
                      <div className="py-3">
                        <span className="text-brand-cream/60 block mb-2">Message</span>
                        <p className="text-brand-cream/80">{details.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-9 flex items-center justify-between">
            <button onClick={goPrev} disabled={step === 0} className="btn-ghost disabled:opacity-20 disabled:cursor-not-allowed">
              <ArrowLeft size={14} /> Back
            </button>
            {step < 3 ? (
              <button onClick={goNext} disabled={!canGoNext()} data-track-ignore className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed">
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={() => {
                const svc = services.find((s) => s.id === selectedService);
                const price = svc?.packages[selectedPackage as keyof typeof svc.packages] || '';
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: 'confirm_booking', service_name: serviceName, package_name: selectedPackage, package_amount: price, booking_date: selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '', booking_time: selectedTime, customer_name: details.name, customer_email: details.email, customer_phone: details.phone, customer_message: details.message });
                handleSubmit();
              }} disabled={submitting} data-track-ignore className="btn-primary disabled:opacity-50">
                {submitting ? 'Booking...' : <><Check size={14} /> Confirm Booking</>}
              </button>
            )}
          </div>
          </div>
        </div>

        {/* ═══ SUMMARY SIDEBAR ═══ */}
        <div className="lg:w-[340px] shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl bg-surface-200/80 border border-brand-mid/[0.08] p-6 relative overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 card-shine pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-[14px] font-display font-bold text-brand-cream mb-5">Booking Summary</h3>

              <div className="space-y-4">
                {[
                  { label: 'Service', value: serviceName || '—' },
                  { label: 'Package', value: selectedPackage || '—' },
                  { label: 'Date', value: selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Time', value: selectedTime || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start">
                    <span className="text-[12px] text-brand-cream/55 uppercase tracking-wider">{item.label}</span>
                    <span className="text-[14px] text-brand-cream font-medium text-right max-w-[180px]">{item.value}</span>
                  </div>
                ))}
                {details.name && (
                  <div className="flex justify-between items-start">
                    <span className="text-[12px] text-brand-cream/55 uppercase tracking-wider">Name</span>
                    <span className="text-[14px] text-brand-cream font-medium">{details.name}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              {selectedService && selectedPackage && (() => {
                const svc = services.find((s) => s.id === selectedService);
                const price = svc?.packages[selectedPackage as keyof typeof svc.packages];
                if (!price) return null;
                return (
                  <div className="mt-6 pt-5 border-t border-surface-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[13px] text-brand-cream/70 block">Starting from</span>
                        <span className="text-[11px] text-brand-cream/40">Discussed after meeting</span>
                      </div>
                      <span className="text-[24px] font-display font-bold gradient-text">{price}</span>
                    </div>
                  </div>
                );
              })()}

              {!selectedService && (
                <p className="text-[13px] text-brand-cream/50 italic mt-2">Select a service to see your summary.</p>
              )}

              {/* Reassurance */}
              <div className="mt-6 pt-5 border-t border-surface-300 space-y-3">
                {(pageContent.perks || '100% free consultation — no payment needed\nMeet first, pay only when you\'re ready\nNo commitment, cancel anytime').split('\n').filter(Boolean).map((perk: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-brand-mid shrink-0 mt-0.5" />
                    <span className="text-[12px] text-brand-cream/70">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        </div>
      </section>
    </main>
  );
}
