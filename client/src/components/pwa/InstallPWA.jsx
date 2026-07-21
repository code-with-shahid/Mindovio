import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"
import { usePwaInstall } from "../../hooks/usePwaInstall"

const DISMISS_KEY = "mindovio-pwa-install-dismissed"

/**
 * Bottom sheet install prompt (Chrome/Edge/Android + iOS hint).
 * Only auto-shows when install is available or iOS instructions apply.
 */
export default function InstallPWA({ className = "" }) {
  const { canInstall, isIosHint, install } = usePwaInstall()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!(canInstall || isIosHint)) {
      setVisible(false)
      return
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return
    } catch {
      /* ignore */
    }
    setVisible(true)
  }, [canInstall, isIosHint])

  const dismiss = () => {
    setVisible(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  const onInstall = async () => {
    const result = await install()
    if (result?.ok || result?.reason === "ios") {
      /* keep open for iOS hint; close after native prompt */
    }
    if (result?.ok) setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className={`fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md ${className}`}
          role="dialog"
          aria-label="Install Mindovio app"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
              <Download size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Install Mindovio
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                {isIosHint
                  ? "Tap Share, then “Add to Home Screen” to install."
                  : "Install the app for faster access from your home screen."}
              </p>
              {canInstall && (
                <button
                  type="button"
                  onClick={onInstall}
                  className="mt-2 inline-flex items-center rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
                >
                  Install app
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
              aria-label="Dismiss install prompt"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
