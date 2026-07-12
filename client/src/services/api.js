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

export const generateMockTest = async (payload) => {
  const result = await axios.post(serverUrl + "/api/mock-tests/generate", payload, {
    withCredentials: true,
  })
  return result.data
}

export const getMockTest = async (testId) => {
  const result = await axios.get(serverUrl + `/api/mock-tests/${testId}`, {
    withCredentials: true,
  })
  return result.data
}

export const startMockTest = async (testId) => {
  const result = await axios.post(
    serverUrl + `/api/mock-tests/${testId}/start`,
    {},
    { withCredentials: true }
  )
  return result.data
}

export const submitMockTest = async (testId, payload) => {
  const result = await axios.post(
    serverUrl + `/api/mock-tests/${testId}/submit`,
    payload,
    { withCredentials: true }
  )
  return result.data
}

export const listMockTests = async () => {
  const result = await axios.get(serverUrl + "/api/mock-tests", { withCredentials: true })
  return result.data
}
