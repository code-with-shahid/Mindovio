import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

let deferredPrompt = null
let iosHint = false
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return deferredPrompt
}

function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  )
}

function detectIosHint() {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent || ""
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
  return isIos && isSafari && !isStandalone()
}

/** Call once at app startup (main.jsx). */
export function initPwaInstall() {
  if (typeof window === "undefined" || window.__mindovioPwaInit) return
  window.__mindovioPwaInit = true

  iosHint = detectIosHint()

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e
    emit()
  })

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
    emit()
  })
}

export async function promptPwaInstall() {
  if (!deferredPrompt) return { ok: false, reason: "unavailable" }
  const event = deferredPrompt
  deferredPrompt = null
  emit()
  event.prompt()
  try {
    const choice = await event.userChoice
    return { ok: choice?.outcome === "accepted", outcome: choice?.outcome }
  } catch {
    return { ok: false, reason: "error" }
  }
}

export function usePwaInstall() {
  const deferred = useSyncExternalStore(subscribe, getSnapshot, () => null)
  const [standalone, setStandalone] = useState(() => isStandalone())
  const [showIosHint, setShowIosHint] = useState(() => iosHint || detectIosHint())

  useEffect(() => {
    setStandalone(isStandalone())
    setShowIosHint(detectIosHint())
  }, [])

  const canInstall = Boolean(deferred) && !standalone
  // Always offer download in menus unless already running as installed app
  const showInstallOption = !standalone

  const install = useCallback(async () => {
    if (deferred) return promptPwaInstall()
    return { ok: false, reason: showIosHint ? "ios" : "unavailable" }
  }, [deferred, showIosHint])

  return {
    canInstall,
    showInstallOption,
    isIosHint: showIosHint && !canInstall,
    isStandalone: standalone,
    install,
  }
}
