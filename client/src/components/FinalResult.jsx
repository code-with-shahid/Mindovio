import { HiExclamationTriangle } from "react-icons/hi2"
import StudyGuide from "./studyguide/StudyGuide"
import EmptyState from "./ui/EmptyState"
import { normalizeResult } from "../utils/normalizeResult"

function isValidResult(result) {
  return (
    result &&
    result.subTopics &&
    result.questions &&
    Array.isArray(result.questions.short) &&
    Array.isArray(result.questions.long) &&
    Array.isArray(result.revisionPoints)
  )
}

export default function FinalResult({ result, noteId }) {
  if (!isValidResult(result)) {
    return (
      <EmptyState
        icon={HiExclamationTriangle}
        title="Incomplete note data"
        description="This note is missing required sections and can’t be displayed."
      />
    )
  }

  const data = normalizeResult(result)

  return (
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 min-w-0">
      <StudyGuide result={data} noteId={noteId} />
    </div>
  )
}
