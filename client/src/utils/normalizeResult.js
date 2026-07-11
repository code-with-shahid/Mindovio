const asArray = (v) => (Array.isArray(v) ? v : [])
const asString = (v, fallback = "") => (typeof v === "string" ? v : fallback)

/** Safe defaults for legacy History notes + new study guides */
export function normalizeResult(raw) {
  if (!raw || typeof raw !== "object") return raw

  const questions = raw.questions && typeof raw.questions === "object" ? raw.questions : {}

  return {
    ...raw,
    title: asString(raw.title, "Study Guide"),
    overview: asString(raw.overview),
    learningObjectives: asArray(raw.learningObjectives),
    tableOfContents: asArray(raw.tableOfContents),
    estimatedMinutes: typeof raw.estimatedMinutes === "number" ? raw.estimatedMinutes : 0,
    subTopics: raw.subTopics || { "⭐": [], "⭐⭐": [], "⭐⭐⭐": [] },
    importance: asString(raw.importance, "⭐⭐"),
    notes: asString(raw.notes),
    definitions: asArray(raw.definitions),
    coreConcepts: asArray(raw.coreConcepts),
    callouts: asArray(raw.callouts),
    formulas: asArray(raw.formulas),
    tables: asArray(raw.tables),
    diagram: {
      type: asString(raw.diagram?.type, "flowchart"),
      data: asString(raw.diagram?.data),
    },
    diagrams: asArray(raw.diagrams),
    charts: asArray(raw.charts),
    commonMistakes: asArray(raw.commonMistakes),
    tipsAndTricks: asArray(raw.tipsAndTricks),
    mnemonics: asArray(raw.mnemonics),
    examInsights: asArray(raw.examInsights),
    faqs: asArray(raw.faqs),
    summary: asString(raw.summary),
    keyTakeaways: asArray(raw.keyTakeaways),
    importantPoints: asArray(raw.importantPoints),
    revisionPoints: asArray(raw.revisionPoints),
    flashcards: asArray(raw.flashcards),
    codeBlocks: asArray(raw.codeBlocks),
    illustrations: asArray(raw.illustrations),
    questions: {
      short: asArray(questions.short),
      long: asArray(questions.long),
      diagram: asString(questions.diagram),
      mcqs: asArray(questions.mcqs),
      viva: asArray(questions.viva),
      interview: asArray(questions.interview),
    },
  }
}
