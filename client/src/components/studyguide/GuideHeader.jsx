import {
  HiArrowDownTray,
  HiBookmark,
  HiBookmarkSlash,
  HiClipboardDocument,
  HiClock,
  HiPrinter,
  HiBolt,
} from "react-icons/hi2"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

export default function GuideHeader({
  title,
  overview,
  importance,
  estimatedMinutes,
  bookmarked,
  onToggleBookmark,
  onCopy,
  onPrint,
  onPdf,
  quickRevision,
  onToggleRevision,
  copied,
}) {
  return (
    <header className="space-y-4 pb-6 border-b border-[var(--color-border)] print:border-0">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600/15 via-brand-500/5 to-transparent p-5 sm:p-6 border border-brand-500/10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {importance && <Badge color="warning">Importance {importance}</Badge>}
          {estimatedMinutes > 0 && (
            <Badge color="neutral">
              <HiClock className="text-xs" /> {estimatedMinutes} min read
            </Badge>
          )}
        </div>
        <h1 className="type-h1 mb-2.5">
          {title || "Study Guide"}
        </h1>
        {overview && (
          <p className="type-body-lg max-w-3xl">
            {overview}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          variant={quickRevision ? "primary" : "outline"}
          size="sm"
          icon={<HiBolt />}
          onClick={onToggleRevision}
        >
          {quickRevision ? "Full Guide" : "Quick Revision"}
        </Button>
        <Button size="sm" variant="secondary" icon={<HiClipboardDocument />} onClick={onCopy}>
          {copied ? "Copied" : "Copy notes"}
        </Button>
        <Button size="sm" variant="secondary" icon={<HiPrinter />} onClick={onPrint}>
          Print
        </Button>
        <Button size="sm" icon={<HiArrowDownTray />} onClick={onPdf}>
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={bookmarked ? <HiBookmarkSlash /> : <HiBookmark />}
          onClick={onToggleBookmark}
        >
          {bookmarked ? "Saved" : "Bookmark"}
        </Button>
      </div>
    </header>
  )
}
