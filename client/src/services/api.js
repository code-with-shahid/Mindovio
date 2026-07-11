import axios from "axios"
import { serverUrl } from "../config"
import { setUserData } from "../redux/userSlice"
import { fetchBackendUser } from "./auth.service"

export const getCurrentUser = async (dispatch) => {
  const user = await fetchBackendUser()
  dispatch(setUserData(user))
}

export const generateNotes = async (payload) => {
  const result = await axios.post(
    serverUrl + "/api/notes/generate-notes",
    payload,
    { withCredentials: true }
  )
  return result.data
}

export const downloadPdf = async (result) => {
  const response = await axios.post(
    serverUrl + "/api/pdf/generate-pdf",
    { result },
    { responseType: "blob", withCredentials: true }
  )
  const blob = new Blob([response.data], { type: "application/pdf" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Mindovio.pdf"
  link.click()
  window.URL.revokeObjectURL(url)
}
