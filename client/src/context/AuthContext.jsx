import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useDispatch } from "react-redux"
import { auth } from "../utils/firebase"
import { setUserData } from "../redux/userSlice"
import {
  syncBackendSession,
  fetchBackendUser,
  logout as authLogout,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getFirebaseErrorMessage,
} from "../services/auth.service"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const [initializing, setInitializing] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState(null)

  useEffect(() => {
    let resolved = false

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)

      try {
        if (user) {
          const backendUser = await syncBackendSession(user)
          dispatch(setUserData(backendUser))
        } else {
          const backendUser = await fetchBackendUser()
          dispatch(setUserData(backendUser))
        }
      } catch {
        dispatch(setUserData(null))
      } finally {
        if (!resolved) {
          resolved = true
          setInitializing(false)
        }
      }
    })

    return unsubscribe
  }, [dispatch])

  const login = useCallback(async (email, password) => {
    try {
      const user = await signInWithEmail({ email, password })
      dispatch(setUserData(user))
      return { success: true }
    } catch (error) {
      console.error("Login failed:", error.code || error.message, error)
      return { success: false, error: getFirebaseErrorMessage(error.code) }
    }
  }, [dispatch])

  const signup = useCallback(async (name, email, password) => {
    try {
      const user = await signUpWithEmail({ name, email, password })
      dispatch(setUserData(user))
      return { success: true }
    } catch (error) {
      console.error("Signup failed:", error.code || error.message, error)
      return { success: false, error: getFirebaseErrorMessage(error.code) }
    }
  }, [dispatch])

  const loginWithGoogle = useCallback(async () => {
    try {
      const user = await signInWithGoogle()
      dispatch(setUserData(user))
      return { success: true }
    } catch (error) {
      return { success: false, error: getFirebaseErrorMessage(error.code) }
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    await authLogout()
    dispatch(setUserData(null))
    setFirebaseUser(null)
  }, [dispatch])

  const value = {
    initializing,
    firebaseUser,
    login,
    signup,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
