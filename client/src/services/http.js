import axios from "axios"
import { serverUrl } from "../config"

const TOKEN_KEY = "mindovio_token"

export function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeAuthToken(token) {
  if (!token) return
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAuthToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
