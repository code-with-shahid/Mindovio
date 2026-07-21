import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "../utils/firebase"
import api, { clearAuthToken, getStoredToken, storeAuthToken } from "./http"
import { cacheClear } from "./cache"

export const syncBackendSession = async (firebaseUser) => {
  const { data } = await api.post("/api/auth/session", {
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
    email: firebaseUser.email,
    firebaseUid: firebaseUser.uid,
  })
  if (data?.token) storeAuthToken(data.token)
  const { token: _token, ...user } = data
  return user
}

export const fetchBackendUser = async () => {
  if (!getStoredToken()) return null
  try {
    const { data } = await api.get("/api/user/currentuser")
    return data
  } catch {
    return null
  }
}

export const logoutBackend = async () => {
  try {
    await api.get("/api/auth/logout")
  } finally {
    clearAuthToken()
    cacheClear()
  }
}

export const signUpWithEmail = async ({ name, email, password }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  return syncBackendSession(credential.user)
}

export const signInWithEmail = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return syncBackendSession(credential.user)
}

export const signInWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider)
  return syncBackendSession(credential.user)
}

export const logout = async () => {
  await logoutBackend()
  await signOut(auth)
}

export function getFirebaseErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/operation-not-allowed":
      "Email/password sign-in is disabled for this project. Use Google sign-in, or enable Email/Password in the Firebase console.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/invalid-api-key": "Firebase API key is invalid. Check the client configuration.",
    "auth/missing-password": "Please enter your password.",
  }
  return messages[code] || "Authentication failed. Please try again."
}
