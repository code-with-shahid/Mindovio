import { createContext, useCallback, useContext, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle, HiXMark } from "react-icons/hi2"

const ToastContext = createContext(null)

const icons = {
  success: HiCheckCircle,
  error: HiExclamationTriangle,
  info: HiInformationCircle,
}

const colors = {
  success: "border-emerald-500/30 bg-[var(--color-surface-elevated)] text-emerald-600 dark:text-emerald-400",
  error: "border-red-500/30 bg-[var(--color-surface-elevated)] text-red-600 dark:text-red-400",
  info: "border-brand-500/30 bg-[var(--color-surface-elevated)] text-brand-600 dark:text-brand-400",
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, variant = "info") => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => dismiss(id), 4200)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 z-[100] flex flex-col gap-2 max-w-sm sm:w-[calc(100%-2rem)] mx-auto sm:mx-0 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map(({ id, message, variant }) => {
            const Icon = icons[variant] || icons.info
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${colors[variant] || colors.info}`}
              >
                <Icon className="text-lg shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-[var(--color-text-primary)]">{message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="shrink-0 p-0.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label="Dismiss"
                >
                  <HiXMark />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
