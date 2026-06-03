import axios from "axios"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "../utils/firebase"
import { serverUrl } from "../config"

const sessionApi = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
})

export const syncBackendSession = async (firebaseUser) => {
  const { data } = await sessionApi.post("/api/auth/session", {
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
    email: firebaseUser.email,
    firebaseUid: firebaseUser.uid,
  })
  return data
}

export const fetchBackendUser = async () => {
  try {
    const { data } = await sessionApi.get("/api/user/currentuser")
    return data
  } catch {
    return null
  }
}

export const logoutBackend = async () => {
  await sessionApi.get("/api/auth/logout")
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
  }
  return messages[code] || "Authentication failed. Please try again."
}
