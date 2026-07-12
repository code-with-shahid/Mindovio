import AmbientBackground from "../landing/motion/AmbientBackground"

export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600`}
      />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="app-shell relative min-h-screen flex flex-col items-center justify-center gap-4 overflow-hidden">
      <AmbientBackground variant="app" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading Mindovio…</p>
      </div>
    </div>
  )
}
