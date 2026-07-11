import { useState } from "react"
import { motion } from "motion/react"
import { HiArrowPath } from "react-icons/hi2"
import Button from "../ui/Button"

export default function FlashcardDeck({ cards = [] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!cards.length) return null

  const card = cards[index]
  const next = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
  }
  const prev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + cards.length) % cards.length)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>Flashcard {index + 1} / {cards.length}</span>
        <button type="button" onClick={() => setFlipped((f) => !f)} className="inline-flex items-center gap-1 hover:text-brand-600">
          <HiArrowPath /> Flip
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full text-left perspective-1000"
      >
        <motion.div
          key={`${index}-${flipped}`}
          initial={{ rotateY: 90, opacity: 0.5 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className={`min-h-[160px] rounded-2xl border p-6 flex items-center justify-center text-center shadow-sm ${
            flipped
              ? "border-brand-500/40 bg-brand-500/5"
              : "border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
          }`}
        >
          <p className="text-base font-medium text-[var(--color-text-primary)] leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
        </motion.div>
      </button>

      <div className="flex gap-2 justify-center">
        <Button size="sm" variant="secondary" onClick={prev}>Previous</Button>
        <Button size="sm" onClick={next}>Next</Button>
      </div>
    </div>
  )
}
