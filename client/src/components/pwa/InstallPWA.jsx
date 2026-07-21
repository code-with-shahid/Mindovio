import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

const DISMISS_KEY = "mindovio-pwa-install-dismissed"

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  )
}

/**
 * Shows an install prompt when the browser fires `beforeinstallprompt`
 * (Chrome/Edge/Android). iOS users get a short “Add to Home Screen” hint.
 */
export default function InstallPWA({ className = "" }) {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return
    } catch {
      /* ignore */
    }

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    const ua = window.navigator.userAgent || ""
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    if (isIos && isSafari) {
      setIosHint(true)
      setVisible(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setDeferred(null)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    try {
      await deferred.userChoice
    } catch {
      /* ignore */
    }
    setDeferred(null)
    setVisible(false)
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
                {iosHint && !deferred
                  ? "Tap Share, then “Add to Home Screen” to install."
                  : "Install the app for faster access from your home screen."}
              </p>
              {deferred && (
                <button
                  type="button"
                  onClick={install}
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
