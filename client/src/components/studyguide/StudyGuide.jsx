import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import {
  HiAcademicCap,
  HiBookOpen,
  HiBolt,
  HiCheckBadge,
  HiExclamationTriangle,
  HiLightBulb,
  HiListBullet,
  HiSparkles,
} from "react-icons/hi2"
import GuideHeader from "./GuideHeader"
import Callout from "./Callout"
import AccordionSection from "./AccordionSection"
import DataTable from "./DataTable"
import FormulaBlock from "./FormulaBlock"
import FlashcardDeck from "./FlashcardDeck"
import MarkdownBody from "./MarkdownBody"
import IllustrationPlaceholder from "./IllustrationPlaceholder"
import Badge from "../ui/Badge"
import { downloadPdf } from "../../services/api"
import { BRAND_NAME } from "../../constants/brand"

const MermaidSetup = lazy(() => import("../MermaidSetup"))
const RechartSetUp = lazy(() => import("../RechartSetUp"))
const McqQuiz = lazy(() => import("./McqQuiz"))
const CodePanel = lazy(() => import("./CodePanel"))

const BOOKMARK_KEY = "mindovio-bookmarks"

function SectionShell({ id, title, icon: Icon, children, onCopySection }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          {Icon && <Icon className="text-brand-500" />}
          {title}
        </h2>
        {onCopySection && (
          <button
            type="button"
            onClick={onCopySection}
            className="text-xs text-[var(--color-text-muted)] hover:text-brand-600 print:hidden"
          >
            Copy section
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function ListCard({ items, tone = "neutral" }) {
  if (!items?.length) return null
  const tones = {
    neutral: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
    danger: "border-rose-500/30 bg-rose-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
    brand: "border-brand-500/30 bg-brand-500/5",
  }
  return (
    <ul className={`rounded-2xl border p-4 space-y-2 ${tones[tone] || tones.neutral}`}>
      {items.map((item, i) => (
        <li key={i} className="text-sm text-[var(--color-text-secondary)] flex gap-2">
          <span className="text-brand-500 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function StudyGuide({ result }) {
  const containerRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [quickRevision, setQuickRevision] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  const isPremium = Boolean(result?.title || result?.learningObjectives?.length)

  const bookmarkId = useMemo(
    () => result?.title || result?.overview?.slice(0, 40) || "note",
    [result]
  )

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]")
      setBookmarked(raw.includes(bookmarkId))
    } catch {
      setBookmarked(false)
    }
  }, [bookmarkId])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const parent = el.closest(".overflow-y-auto") || window
      let scrollTop
      let scrollHeight
      let clientHeight
      if (parent === window) {
        scrollTop = window.scrollY
        scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        clientHeight = window.innerHeight
      } else {
        scrollTop = parent.scrollTop
        scrollHeight = parent.scrollHeight - parent.clientHeight
        clientHeight = parent.clientHeight
      }
      const pct = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0
      setProgress(pct)

      const sections = el.querySelectorAll("section[id]")
      let current = ""
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect()
        if (rect.top <= 140) current = sec.id
      })
      if (current) setActiveSection(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [result, quickRevision])

  const toc = useMemo(() => {
    if (result?.tableOfContents?.length) {
      return result.tableOfContents.map((label, i) => ({
        id: `toc-${i}`,
        label,
      }))
    }
    const items = [
      { id: "overview", label: "Overview", show: true },
      { id: "objectives", label: "Objectives", show: result?.learningObjectives?.length },
      { id: "concepts", label: "Core concepts", show: result?.coreConcepts?.length || result?.notes },
      { id: "visuals", label: "Visuals", show: result?.diagram?.data || result?.diagrams?.length || result?.charts?.length },
      { id: "exam", label: "Exam practice", show: true },
      { id: "revision", label: "Revision", show: true },
    ]
    return items.filter((x) => x.show)
  }, [result])

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleCopyAll = () => {
    const parts = [
      result.title,
      result.overview,
      result.notes,
      (result.keyTakeaways || []).join("\n"),
      (result.revisionPoints || []).join("\n"),
    ].filter(Boolean)
    copyText(parts.join("\n\n"))
  }

  const toggleBookmark = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]")
      const next = bookmarked
        ? raw.filter((id) => id !== bookmarkId)
        : [...raw, bookmarkId]
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next))
      setBookmarked(!bookmarked)
    } catch {
      /* ignore */
    }
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div ref={containerRef} className="relative study-guide print:p-0">
      {/* Reading progress */}
      <div className="sticky top-0 z-20 h-1 bg-[var(--color-border)] rounded-full overflow-hidden mb-4 print:hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <GuideHeader
        title={isPremium ? result.title : "Generated Notes"}
        overview={result.overview}
        importance={result.importance}
        estimatedMinutes={result.estimatedMinutes}
        bookmarked={bookmarked}
        onToggleBookmark={toggleBookmark}
        onCopy={handleCopyAll}
        onPrint={() => window.print()}
        onPdf={() => downloadPdf(result)}
        quickRevision={quickRevision}
        onToggleRevision={() => setQuickRevision((v) => !v)}
        copied={copied}
      />

      <div className="grid lg:grid-cols-[200px_1fr] gap-6 mt-6">
        {/* Sticky TOC */}
        <nav className="hidden lg:block sticky top-24 self-start space-y-1 print:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            On this page
          </p>
          {toc.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`block w-full text-left text-xs px-2 py-1.5 rounded-lg truncate transition-colors ${
                activeSection === item.id
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-10 min-w-0">
          {quickRevision ? (
            <>
              <SectionShell id="revision" title="Quick revision sheet" icon={HiBolt}>
                <Callout type="important" title="Exam focus" content="Use this sheet for last-minute revision." />
                <div className="mt-4">
                  <ListCard items={result.importantPoints} tone="brand" />
                </div>
                <div className="mt-4">
                  <ListCard items={result.keyTakeaways} tone="success" />
                </div>
                <div className="mt-4">
                  <ListCard items={result.revisionPoints} />
                </div>
              </SectionShell>

              {result.flashcards?.length > 0 && (
                <SectionShell id="flashcards" title="Flashcards" icon={HiSparkles}>
                  <FlashcardDeck cards={result.flashcards} />
                </SectionShell>
              )}

              {result.mnemonics?.length > 0 && (
                <SectionShell id="mnemonics" title="Mnemonics" icon={HiLightBulb}>
                  <ListCard items={result.mnemonics} tone="success" />
                </SectionShell>
              )}
            </>
          ) : (
            <>
              {result.learningObjectives?.length > 0 && (
                <SectionShell id="objectives" title="Learning objectives" icon={HiAcademicCap}>
                  <ol className="list-decimal ml-5 space-y-2 text-sm text-[var(--color-text-secondary)]">
                    {result.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
                  </ol>
                </SectionShell>
              )}

              {result.subTopics && (
                <SectionShell id="priorities" title="Priority topics" icon={HiListBullet}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {Object.entries(result.subTopics).map(([star, topics]) => (
                      <div key={star} className="rounded-2xl border border-[var(--color-border)] p-4 bg-[var(--color-surface-muted)]">
                        <Badge color="brand" className="mb-2">{star}</Badge>
                        <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                          {(topics || []).map((t, i) => <li key={i}>• {t}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.definitions?.length > 0 && (
                <SectionShell id="definitions" title="Definitions" icon={HiBookOpen}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.definitions.map((d, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--color-border)] p-4">
                        <p className="font-semibold text-sm text-[var(--color-text-primary)] mb-1">{d.term}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{d.definition}</p>
                      </div>
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.coreConcepts?.length > 0 && (
                <SectionShell id="concepts" title="Core concepts" icon={HiSparkles}>
                  <div className="space-y-4">
                    {result.coreConcepts.map((c, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 space-y-2 shadow-sm">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">{c.title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{c.explanation}</p>
                        {c.example && (
                          <Callout type="info" title="Example" content={c.example} />
                        )}
                        {c.steps?.length > 0 && (
                          <ol className="list-decimal ml-5 text-sm text-[var(--color-text-secondary)] space-y-1 pt-1">
                            {c.steps.map((s, j) => <li key={j}>{s}</li>)}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.notes && (
                <SectionShell
                  id="notes"
                  title="Detailed notes"
                  icon={HiBookOpen}
                  onCopySection={() => copyText(result.notes)}
                >
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                    <MarkdownBody content={result.notes} />
                  </div>
                </SectionShell>
              )}

              {result.callouts?.length > 0 && (
                <SectionShell id="callouts" title="Teacher callouts" icon={HiLightBulb}>
                  <div className="space-y-3">
                    {result.callouts.map((c, i) => (
                      <Callout key={i} type={c.type} title={c.title} content={c.content} />
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.formulas?.length > 0 && (
                <SectionShell id="formulas" title="Key formulas" icon={HiCheckBadge}>
                  <div className="space-y-3">
                    {result.formulas.map((f, i) => (
                      <FormulaBlock key={i} {...f} />
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.tables?.length > 0 && (
                <SectionShell id="tables" title="Comparison tables" icon={HiListBullet}>
                  <div className="space-y-4">
                    {result.tables.map((t, i) => (
                      <DataTable key={i} title={t.title} headers={t.headers} rows={t.rows} />
                    ))}
                  </div>
                </SectionShell>
              )}

              {(result.diagram?.data || result.diagrams?.length > 0) && (
                <SectionShell id="visuals" title="Diagrams" icon={HiSparkles}>
                  <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading diagram…</p>}>
                    <div className="space-y-4">
                      {result.diagram?.data && (
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Primary diagram</p>
                          <MermaidSetup diagram={result.diagram.data} />
                        </div>
                      )}
                      {(result.diagrams || []).map((d, i) => (
                        <div key={i}>
                          {d.title && <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{d.title}</p>}
                          <MermaidSetup diagram={d.mermaid || d.data} />
                        </div>
                      ))}
                    </div>
                  </Suspense>
                </SectionShell>
              )}

              {result.charts?.length > 0 && (
                <SectionShell id="charts" title="Charts" icon={HiSparkles}>
                  <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading charts…</p>}>
                    <RechartSetUp charts={result.charts} />
                  </Suspense>
                </SectionShell>
              )}

              {result.illustrations?.length > 0 && (
                <SectionShell id="illustrations" title="Visual aids" icon={HiSparkles}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.illustrations.map((ill, i) => (
                      <IllustrationPlaceholder key={i} category={ill.category} caption={ill.caption} />
                    ))}
                  </div>
                </SectionShell>
              )}

              {result.codeBlocks?.length > 0 && (
                <SectionShell id="code" title="Code walkthrough" icon={HiBookOpen}>
                  <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading code…</p>}>
                    <CodePanel blocks={result.codeBlocks} />
                  </Suspense>
                </SectionShell>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {result.commonMistakes?.length > 0 && (
                  <SectionShell id="mistakes" title="Common mistakes" icon={HiExclamationTriangle}>
                    <ListCard items={result.commonMistakes} tone="danger" />
                  </SectionShell>
                )}
                {result.tipsAndTricks?.length > 0 && (
                  <SectionShell id="tips" title="Tips & tricks" icon={HiLightBulb}>
                    <ListCard items={result.tipsAndTricks} tone="success" />
                  </SectionShell>
                )}
              </div>

              {result.mnemonics?.length > 0 && (
                <SectionShell id="mnemonics" title="Mnemonics & memory shortcuts" icon={HiLightBulb}>
                  <ListCard items={result.mnemonics} tone="brand" />
                </SectionShell>
              )}

              {result.examInsights?.length > 0 && (
                <SectionShell id="insights" title="Previous exam insights" icon={HiAcademicCap}>
                  <ListCard items={result.examInsights} />
                </SectionShell>
              )}

              {result.importantPoints?.length > 0 && (
                <SectionShell id="important" title="Important points" icon={HiCheckBadge}>
                  <Callout type="important" title="Must remember">
                    <ul className="mt-2 space-y-1 list-disc ml-5 text-sm text-[var(--color-text-secondary)]">
                      {result.importantPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </Callout>
                </SectionShell>
              )}

              {(result.summary || result.keyTakeaways?.length > 0) && (
                <SectionShell id="summary" title="Summary & takeaways" icon={HiCheckBadge}>
                  {result.summary && (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">{result.summary}</p>
                  )}
                  <ListCard items={result.keyTakeaways} tone="success" />
                </SectionShell>
              )}

              {result.faqs?.length > 0 && (
                <SectionShell id="faqs" title="FAQs" icon={HiBookOpen}>
                  <AccordionSection
                    items={result.faqs}
                    getTitle={(item) => item.q}
                    getBody={(item) => item.a}
                  />
                </SectionShell>
              )}

              <SectionShell id="exam" title="Exam practice" icon={HiAcademicCap}>
                <div className="space-y-6">
                  {result.questions?.mcqs?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                        MCQs ({result.questions.mcqs.length})
                      </h3>
                      <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading quiz…</p>}>
                        <McqQuiz mcqs={result.questions.mcqs} />
                      </Suspense>
                    </div>
                  )}

                  {result.questions?.short?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Short questions</h3>
                      <ol className="list-decimal ml-5 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
                        {result.questions.short.map((q, i) => <li key={i}>{q}</li>)}
                      </ol>
                    </div>
                  )}

                  {result.questions?.long?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Long questions</h3>
                      <ol className="list-decimal ml-5 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
                        {result.questions.long.map((q, i) => <li key={i}>{q}</li>)}
                      </ol>
                    </div>
                  )}

                  {result.questions?.diagram && (
                    <Callout type="info" title="Diagram question" content={result.questions.diagram} />
                  )}

                  {result.questions?.viva?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Viva questions</h3>
                      <AccordionSection
                        items={result.questions.viva.map((q) => ({ q }))}
                        getTitle={(item, i) => `Viva ${i + 1}`}
                        getBody={(item) => item.q}
                      />
                    </div>
                  )}

                  {result.questions?.interview?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Interview questions</h3>
                      <AccordionSection
                        items={result.questions.interview.map((q) => ({ q }))}
                        getTitle={(item, i) => `Interview ${i + 1}`}
                        getBody={(item) => item.q}
                      />
                    </div>
                  )}
                </div>
              </SectionShell>

              {(result.flashcards?.length > 0 || result.revisionPoints?.length > 0) && (
                <SectionShell id="revision" title="Revision kit" icon={HiBolt}>
                  {result.revisionPoints?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-primary)]">Revision notes</h3>
                      <ListCard items={result.revisionPoints} tone="brand" />
                    </div>
                  )}
                  {result.flashcards?.length > 0 && <FlashcardDeck cards={result.flashcards} />}
                </SectionShell>
              )}
            </>
          )}

          <p className="text-center text-xs text-[var(--color-text-muted)] pt-4 print:hidden">
            Generated with {BRAND_NAME}
          </p>
        </div>
      </div>
    </div>
  )
}
