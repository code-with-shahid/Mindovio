import axios from "axios"
import { serverUrl } from "../../config"

const adminApi = axios.create({
  baseURL: `${serverUrl}/api/admin`,
  withCredentials: true,
})

export const adminLogin = (email, password) =>
  adminApi.post("/login", { email, password }).then((r) => r.data)

/** Soft admin check for the main /login page (non-admin emails return { admin: false }). */
export const tryAdminLogin = (email, password) =>
  adminApi.post("/try-login", { email, password }).then((r) => r.data)

export const adminLogout = () => adminApi.post("/logout").then((r) => r.data)

export const adminMe = () => adminApi.get("/me").then((r) => r.data)

export const fetchStats = () => adminApi.get("/stats").then((r) => r.data)

export const fetchAnalytics = () => adminApi.get("/analytics").then((r) => r.data)

export const fetchUsers = (params) =>
  adminApi.get("/users", { params }).then((r) => r.data)

export const fetchUser = (id) => adminApi.get(`/users/${id}`).then((r) => r.data)

export const patchUserStatus = (id, body) =>
  adminApi.patch(`/users/${id}/status`, body).then((r) => r.data)

export const patchUserCredits = (id, credits) =>
  adminApi.patch(`/users/${id}/credits`, { credits }).then((r) => r.data)

export const deleteUser = (id) => adminApi.delete(`/users/${id}`).then((r) => r.data)

export const fetchNotes = (params) =>
  adminApi.get("/notes", { params }).then((r) => r.data)

export const deleteNote = (id) => adminApi.delete(`/notes/${id}`).then((r) => r.data)

export const fetchMockTests = (params) =>
  adminApi.get("/mock-tests", { params }).then((r) => r.data)

export const fetchPayments = () => adminApi.get("/payments").then((r) => r.data)

export const fetchAnnouncements = () =>
  adminApi.get("/announcements").then((r) => r.data)

export const createAnnouncement = (body) =>
  adminApi.post("/announcements", body).then((r) => r.data)

export const deleteAnnouncement = (id) =>
  adminApi.delete(`/announcements/${id}`).then((r) => r.data)

export const fetchFeedback = (params) =>
  adminApi.get("/feedback", { params }).then((r) => r.data)

export const createFeedback = (body) =>
  adminApi.post("/feedback", body).then((r) => r.data)

export const updateFeedback = (id, body) =>
  adminApi.patch(`/feedback/${id}`, body).then((r) => r.data)

export const deleteFeedback = (id) =>
  adminApi.delete(`/feedback/${id}`).then((r) => r.data)

export const fetchNotifications = () =>
  adminApi.get("/notifications").then((r) => r.data)

export const createNotification = (body) =>
  adminApi.post("/notifications", body).then((r) => r.data)

export const updateNotification = (id, body) =>
  adminApi.patch(`/notifications/${id}`, body).then((r) => r.data)

export const deleteNotification = (id) =>
  adminApi.delete(`/notifications/${id}`).then((r) => r.data)

export const fetchSubscriptions = () =>
  adminApi.get("/subscriptions").then((r) => r.data)

export const fetchLogs = (params) =>
  adminApi.get("/logs", { params }).then((r) => r.data)

export const searchAdmin = (q) =>
  adminApi.get("/search", { params: { q } }).then((r) => r.data)

export const fetchSettings = () => adminApi.get("/settings").then((r) => r.data)

export const exportReport = async (type) => {
  const res = await adminApi.get("/reports/export", {
    params: { type },
    responseType: "blob",
  })
  return res.data
}

export const exportReportUrl = (type) =>
  `${serverUrl}/api/admin/reports/export?type=${encodeURIComponent(type)}`

export default adminApi
