import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { adminLogin as apiLogin, adminLogout as apiLogout, adminMe } from "../services/adminApi"

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const me = await adminMe()
        if (alive) setAdmin(me)
      } catch {
        if (alive) setAdmin(null)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    setAdmin({ email: data.email, role: data.role })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      /* still clear local session */
    }
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}
