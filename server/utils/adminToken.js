import jwt from "jsonwebtoken"
import crypto from "crypto"
import { buildCookieOptions } from "./cookieOptions.js"

export const adminCookieOptions = buildCookieOptions()

export function getAdminSessionHours() {
  const h = Number(process.env.ADMIN_SESSION_HOURS)
  return Number.isFinite(h) && h > 0 ? h : 8
}

export function signAdminToken(email) {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error("ADMIN_JWT_SECRET is missing")
  const hours = getAdminSessionHours()
  return jwt.sign({ email, role: "admin" }, secret, { expiresIn: `${hours}h` })
}

/** Constant-time string compare (handles unequal lengths). */
export function safeEqualString(a, b) {
  const left = Buffer.from(String(a || ""), "utf8")
  const right = Buffer.from(String(b || ""), "utf8")
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left, left)
    return false
  }
  return crypto.timingSafeEqual(left, right)
}
