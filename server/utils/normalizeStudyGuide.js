const asArray = (v) => (Array.isArray(v) ? v : [])
const asString = (v, fallback = "") => (typeof v === "string" ? v : fallback)

/**
 * Ensures legacy + premium fields exist so PDF, History, and UI never crash.
 */
export function normalizeStudyGuide(raw) {
  const data = raw && typeof raw === "object" ? raw : {}

  const subTopics = data.subTopics && typeof data.subTopics === "object"
    ? {
        "⭐": asArray(data.subTopics["⭐"]),
        "⭐⭐": asArray(data.subTopics["⭐⭐"]),
        "⭐⭐⭐": asArray(data.subTopics["⭐⭐⭐"]),
      }
    : { "⭐": [], "⭐⭐": [], "⭐⭐⭐": [] }

  const questions = data.questions && typeof data.questions === "object" ? data.questions : {}

  return {
    title: asString(data.title, "Study Guide"),
    overview: asString(data.overview),
    learningObjectives: asArray(data.learningObjectives),
    tableOfContents: asArray(data.tableOfContents),
    estimatedMinutes: typeof data.estimatedMinutes === "number" ? data.estimatedMinutes : 10,
    subTopics,
    importance: asString(data.importance, "⭐⭐"),
    notes: asString(data.notes),
    definitions: asArray(data.definitions),
    coreConcepts: asArray(data.coreConcepts),
    callouts: asArray(data.callouts),
    formulas: asArray(data.formulas),
    tables: asArray(data.tables),
    diagram: {
      type: asString(data.diagram?.type, "flowchart"),
      data: asString(data.diagram?.data),
    },
    diagrams: asArray(data.diagrams),
    charts: asArray(data.charts),
    commonMistakes: asArray(data.commonMistakes),
    tipsAndTricks: asArray(data.tipsAndTricks),
    mnemonics: asArray(data.mnemonics),
    examInsights: asArray(data.examInsights),
    faqs: asArray(data.faqs),
    summary: asString(data.summary),
    keyTakeaways: asArray(data.keyTakeaways),
    importantPoints: asArray(data.importantPoints),
    revisionPoints: asArray(data.revisionPoints),
    flashcards: asArray(data.flashcards),
    codeBlocks: asArray(data.codeBlocks),
    illustrations: asArray(data.illustrations),
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
