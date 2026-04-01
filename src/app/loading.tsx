export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkest">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-mid/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-gold animate-spin" />
        </div>
        <p className="text-brand-cream/40 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}
