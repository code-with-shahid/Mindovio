import {
  adminCookieOptions,
  getAdminSessionHours,
  safeEqualString,
  signAdminToken,
} from "../utils/adminToken.js"
import { writeAdminLog } from "../utils/adminLog.js"

function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ""
  return { email, password }
}

export const adminLogin = async (req, res) => {
  try {
    const { email: envEmail, password: envPassword } = getAdminCredentials()
    if (!envEmail || !envPassword) {
      return res.status(503).json({
        message: "Admin credentials are not configured on the server",
      })
    }

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase()
    const password = String(req.body?.password || "")

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const emailOk = safeEqualString(email, envEmail)
    const passOk = safeEqualString(password, envPassword)
    if (!emailOk || !passOk) {
      await writeAdminLog({
        action: "login_failed",
        actorEmail: email || "unknown",
        meta: { reason: "invalid_credentials" },
        req,
      })
      return res.status(401).json({ message: "Invalid admin credentials" })
    }

    const token = signAdminToken(envEmail)
    const hours = getAdminSessionHours()
    res.cookie("admin_token", token, {
      ...adminCookieOptions,
      maxAge: hours * 60 * 60 * 1000,
    })

    await writeAdminLog({
      action: "login",
      actorEmail: envEmail,
      req,
    })

    return res.status(200).json({
      email: envEmail,
      role: "admin",
      sessionHours: hours,
    })
  } catch (error) {
    console.error("adminLogin:", error)
    return res.status(500).json({ message: "Admin login failed" })
  }
}

export const adminLogout = async (req, res) => {
  try {
    await writeAdminLog({
      action: "logout",
      actorEmail: req.adminEmail || "unknown",
      req,
    })
    res.clearCookie("admin_token", adminCookieOptions)
    return res.status(200).json({ message: "Logged out" })
  } catch (error) {
    console.error("adminLogout:", error)
    return res.status(500).json({ message: "Logout failed" })
  }
}

export const adminMe = async (req, res) => {
  return res.status(200).json({
    email: req.adminEmail,
    role: req.adminRole || "admin",
  })
}
