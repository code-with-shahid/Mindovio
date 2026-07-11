const SVGS = {
  architecture: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <rect x="20" y="20" width="280" height="40" rx="8" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <rect x="40" y="80" width="100" height="70" rx="8" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.06" />
      <rect x="180" y="80" width="100" height="70" rx="8" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.06" />
      <path d="M90 60v20M230 60v20" className="stroke-brand-500" strokeWidth="2" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <circle cx="160" cy="90" r="18" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.1" />
      <circle cx="60" cy="50" r="14" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <circle cx="260" cy="50" r="14" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <circle cx="80" cy="140" r="14" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <circle cx="240" cy="140" r="14" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <path d="M72 58L145 80M248 58L175 80M90 128L148 102M230 128L172 102" className="stroke-brand-500" strokeWidth="1.5" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <path d="M110 110h120a35 35 0 0 0 0-70 50 50 0 0 0-95-12 40 40 0 0 0-25 82z" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.08" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <ellipse cx="160" cy="45" rx="70" ry="22" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <path d="M90 45v70c0 12 31 22 70 22s70-10 70-22V45" className="stroke-brand-500" strokeWidth="2" />
      <ellipse cx="160" cy="80" rx="70" ry="18" className="stroke-brand-400" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="160" cy="115" rx="70" ry="18" className="stroke-brand-400" strokeWidth="1.5" opacity="0.6" />
    </svg>
  ),
  os: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <rect x="50" y="20" width="220" height="28" rx="6" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.1" />
      <rect x="50" y="58" width="220" height="28" rx="6" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <rect x="50" y="96" width="220" height="28" rx="6" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.06" />
      <rect x="50" y="134" width="220" height="28" rx="6" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.04" />
    </svg>
  ),
  ml: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <circle cx="60" cy="50" r="10" className="fill-brand-500" opacity="0.5" />
      <circle cx="60" cy="90" r="10" className="fill-brand-500" opacity="0.5" />
      <circle cx="60" cy="130" r="10" className="fill-brand-500" opacity="0.5" />
      <circle cx="160" cy="70" r="12" className="fill-brand-400" opacity="0.5" />
      <circle cx="160" cy="110" r="12" className="fill-brand-400" opacity="0.5" />
      <circle cx="260" cy="90" r="14" className="fill-brand-600" opacity="0.5" />
      <path d="M70 50h76M70 90h76M70 130h76M172 70h72M172 110h72" className="stroke-brand-500" strokeWidth="1.5" />
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <rect x="100" y="40" width="120" height="100" rx="10" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.08" />
      <rect x="125" y="65" width="70" height="50" rx="6" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.1" />
      <path d="M100 60H80M100 90H80M100 120H80M220 60h20M220 90h20M220 120h20M130 40V20M160 40V20M190 40V20M130 140v20M160 140v20M190 140v20" className="stroke-brand-500" strokeWidth="2" />
    </svg>
  ),
  anatomy: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <ellipse cx="160" cy="90" rx="50" ry="70" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.06" />
      <ellipse cx="160" cy="70" rx="28" ry="22" className="stroke-brand-400" strokeWidth="2" fill="currentColor" opacity="0.1" />
      <path d="M160 92v48M140 110h40" className="stroke-brand-500" strokeWidth="2" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" aria-hidden>
      <rect x="40" y="40" width="240" height="100" rx="16" className="stroke-brand-500" strokeWidth="2" fill="currentColor" opacity="0.06" />
      <circle cx="100" cy="90" r="20" className="stroke-brand-400" strokeWidth="2" />
      <path d="M140 70h120M140 90h100M140 110h80" className="stroke-brand-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

export default function IllustrationPlaceholder({ category = "generic", caption }) {
  const svg = SVGS[category] || SVGS.generic

  return (
    <figure className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] overflow-hidden">
      <div className="h-44 p-4 text-brand-600 dark:text-brand-400">{svg}</div>
      {caption && (
        <figcaption className="px-4 py-3 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
