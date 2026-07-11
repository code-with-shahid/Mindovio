import PDFDocument from "pdfkit"

function writeList(doc, title, items) {
  if (!Array.isArray(items) || items.length === 0) return
  doc.moveDown()
  doc.fontSize(16).text(title)
  doc.moveDown(0.5)
  items.forEach((item) => {
    const text = typeof item === "string" ? item : item?.q || item?.term || JSON.stringify(item)
    doc.fontSize(12).text(`• ${String(text).replace(/[#*_`]/g, "")}`)
  })
}

export const pdfDownload = async (req, res) => {
  const { result } = req.body

  if (!result) {
    return res.status(400).json({ error: "No content provided" })
  }

  const doc = new PDFDocument({ margin: 50 })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", 'attachment; filename="Mindovio.pdf"')

  doc.pipe(res)

  doc.fontSize(20).text(result.title || "Mindovio", { align: "center" })
  doc.moveDown()

  if (result.overview) {
    doc.fontSize(12).text(String(result.overview).replace(/[#*_`]/g, ""))
    doc.moveDown()
  }

  if (result.importance) {
    doc.fontSize(14).text(`Importance: ${result.importance}`)
    doc.moveDown()
  }

  writeList(doc, "Learning Objectives", result.learningObjectives)

  if (result.subTopics && typeof result.subTopics === "object") {
    doc.moveDown()
    doc.fontSize(16).text("Sub Topics")
    doc.moveDown(0.5)
    Object.entries(result.subTopics).forEach(([star, topics]) => {
      doc.moveDown(0.5)
      doc.fontSize(13).text(`${star} Topics:`)
      ;(topics || []).forEach((t) => {
        doc.fontSize(12).text(`• ${t}`)
      })
    })
  }

  if (result.notes) {
    doc.moveDown()
    doc.fontSize(16).text("Notes")
    doc.moveDown(0.5)
    doc.fontSize(12).text(String(result.notes).replace(/[#*_`]/g, ""))
  }

  writeList(doc, "Key Takeaways", result.keyTakeaways)
  writeList(doc, "Important Points", result.importantPoints)
  writeList(doc, "Revision Points", result.revisionPoints)
  writeList(doc, "Common Mistakes", result.commonMistakes)
  writeList(doc, "Tips & Tricks", result.tipsAndTricks)
  writeList(doc, "Mnemonics", result.mnemonics)
  writeList(doc, "Exam Insights", result.examInsights)

  if (result.summary) {
    doc.moveDown()
    doc.fontSize(16).text("Summary")
    doc.moveDown(0.5)
    doc.fontSize(12).text(String(result.summary).replace(/[#*_`]/g, ""))
  }

  doc.moveDown()
  doc.fontSize(16).text("Important Questions")
  doc.moveDown(0.5)

  if (result.questions?.mcqs?.length) {
    doc.fontSize(13).text("MCQs:")
    result.questions.mcqs.forEach((m, i) => {
      doc.fontSize(12).text(`${i + 1}. ${m.q || ""}`)
      if (m.answer) doc.fontSize(11).text(`   Answer: ${m.answer}`)
    })
    doc.moveDown(0.5)
  }

  if (result.questions?.short?.length) {
    doc.fontSize(13).text("Short Questions:")
    result.questions.short.forEach((q) => {
      doc.fontSize(12).text(`• ${q}`)
    })
    doc.moveDown(0.5)
  }

  if (result.questions?.long?.length) {
    doc.fontSize(13).text("Long Questions:")
    result.questions.long.forEach((q) => {
      doc.fontSize(12).text(`• ${q}`)
    })
    doc.moveDown(0.5)
  }

  if (result.questions?.diagram) {
    doc.fontSize(13).text("Diagram Question:")
    doc.fontSize(12).text(result.questions.diagram)
  }

  writeList(doc, "Viva Questions", result.questions?.viva)
  writeList(doc, "Interview Questions", result.questions?.interview)

  if (result.flashcards?.length) {
    doc.moveDown()
    doc.fontSize(16).text("Flashcards")
    doc.moveDown(0.5)
    result.flashcards.forEach((c, i) => {
      doc.fontSize(12).text(`${i + 1}. ${c.front || ""}`)
      doc.fontSize(11).text(`   → ${c.back || ""}`)
    })
  }

  doc.end()
}
