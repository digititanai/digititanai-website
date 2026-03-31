export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-dark-200 dark:border-dark-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
        </div>
        <p className="text-dark-500 dark:text-dark-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}
