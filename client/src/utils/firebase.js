import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "authexamnotes-f0c26.firebaseapp.com",
  projectId: "authexamnotes-f0c26",
  storageBucket: "authexamnotes-f0c26.firebasestorage.app",
  messagingSenderId: "665072514968",
  appId: "1:665072514968:web:2ad2bcabe1e11c0ca05ded",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

setPersistence(auth, browserLocalPersistence).catch(console.error)

export { auth, googleProvider }
