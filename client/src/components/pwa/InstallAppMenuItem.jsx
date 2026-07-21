import { Download } from "lucide-react"
import { useState } from "react"
import { usePwaInstall } from "../../hooks/usePwaInstall"

/**
 * Menu row to install / download the Mindovio PWA.
 */
export default function InstallAppMenuItem({
  onDone,
  className = "",
  variant = "menu",
}) {
  const { showInstallOption, canInstall, isIosHint, isStandalone, install } =
    usePwaInstall()
  const [hint, setHint] = useState("")

  if (isStandalone || !showInstallOption) return null

  const handleClick = async () => {
    setHint("")
    const result = await install()
    if (result?.reason === "ios" || isIosHint) {
      setHint("On iPhone: tap Share → Add to Home Screen")
      return
    }
    if (result?.reason === "unavailable") {
      setHint("Open this site in Chrome/Edge to install the app")
      return
    }
    onDone?.()
  }

  if (variant === "sidebar") {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
        >
          <Download size={18} className="shrink-0" />
          Download App
        </button>
        {hint && (
          <p className="px-3 pb-2 text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <Download size={16} className="shrink-0" />
        {canInstall ? "Download App" : "Install App"}
      </button>
      {hint && (
        <p className="px-4 pb-2 text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  )
}
