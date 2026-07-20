/** Shared cookie flags for cross-site SPA (Firebase) ↔ API (Render). */
export function isSecureCookieMode() {
  if (process.env.NODE_ENV === "production") return true
  if (String(process.env.FORCE_SECURE_COOKIES || "").toLowerCase() === "true") {
    return true
  }
  return String(process.env.CLIENT_URL || "").startsWith("https://")
}

export function buildCookieOptions(extra = {}) {
  const secure = isSecureCookieMode()
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    ...extra,
  }
}
