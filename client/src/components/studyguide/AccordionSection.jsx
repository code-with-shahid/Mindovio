import { useState } from "react"
import { HiChevronDown } from "react-icons/hi2"
import { motion, AnimatePresence } from "motion/react"

export default function AccordionSection({ items = [], getTitle, getBody, emptyText = "Nothing here yet" }) {
  const [open, setOpen] = useState(0)

  if (!items.length) {
    return <p className="text-sm text-[var(--color-text-muted)]">{emptyText}</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {getTitle(item, i)}
              </span>
              <HiChevronDown
                className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-3">
                    {getBody(item, i)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
