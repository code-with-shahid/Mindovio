import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, Bell, Info, Megaphone, Sparkles, X } from "lucide-react"
import {
  fetchPublishedAnnouncements,
  fetchPublishedNotifications,
} from "../services/api"

const DISMISS_KEY = "mindovio-dismissed-alerts"

const typeStyles = {
  info: "border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300",
  feature: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  release: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  maintenance: "border-amber-500/35 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  warning: "border-rose-500/35 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  promo: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  system: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

const typeIcons = {
  info: Info,
  feature: Sparkles,
  release: Megaphone,
  maintenance: AlertTriangle,
  warning: AlertTriangle,
  success: Sparkles,
  promo: Megaphone,
  system: Bell,
}

function readDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"))
  } catch {
    return new Set()
  }
}

/**
 * Shows published announcements (+ optional in-app notifications on dashboard).
 */
export default function AnnouncementBanner({
  className = "",
  limit = 3,
  includeNotifications = false,
}) {
  const [items, setItems] = useState([])
  const [dismissed, setDismissed] = useState(() => readDismissed())

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const ann = await fetchPublishedAnnouncements()
        let list = (ann?.items || []).map((a) => ({
          ...a,
          kind: "announcement",
          key: `a-${a._id}`,
        }))
        if (includeNotifications) {
          const notes = await fetchPublishedNotifications()
          list = [
            ...(notes?.items || []).map((n) => ({
              ...n,
              kind: "notification",
              key: `n-${n._id}`,
            })),
            ...list,
          ]
        }
        if (alive) setItems(list)
      } catch {
        if (alive) setItems([])
      }
    })()
    return () => {
      alive = false
    }
  }, [includeNotifications])

  const visible = items.filter((a) => !dismissed.has(a.key)).slice(0, limit)
  if (!visible.length) return null

  const dismiss = (key) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(key)
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <AnimatePresence>
        {visible.map((a) => {
          const Icon = typeIcons[a.type] || (a.kind === "notification" ? Bell : Megaphone)
          const style = typeStyles[a.type] || typeStyles.info
          const inner = (
            <div className="flex items-start gap-3">
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">
                  {a.kind === "notification" && (
                    <span className="mr-1.5 type-caption uppercase tracking-wide opacity-70">
                      Notice
                    </span>
                  )}
                  {a.title}
                </p>
                <p className="type-sm mt-0.5 opacity-90 whitespace-pre-wrap">{a.body}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  dismiss(a.key)
                }}
                className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )

          return (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`rounded-2xl border px-3.5 py-3 sm:px-4 ${style}`}
              role="status"
            >
              {a.link ? (
                <Link to={a.link} className="block hover:opacity-95">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
