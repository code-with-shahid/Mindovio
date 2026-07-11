import { motion } from "motion/react"
import { HiExclamationTriangle, HiCheckCircle, HiInformationCircle, HiXMark } from "react-icons/hi2"

const styles = {
  error: {
    wrap: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    icon: HiExclamationTriangle,
  },
  success: {
    wrap: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: HiCheckCircle,
  },
  info: {
    wrap: "border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300",
    icon: HiInformationCircle,
  },
}

export default function Alert({ variant = "error", children, onDismiss, className = "" }) {
  const { wrap, icon: Icon } = styles[variant] || styles.error

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${wrap} ${className}`}
    >
      <Icon className="text-lg shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-0.5 rounded-md opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <HiXMark className="text-lg" />
        </button>
      )}
    </motion.div>
  )
}
