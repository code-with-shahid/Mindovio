import jwt from "jsonwebtoken"

const isAdminAuth = (req, res, next) => {
  try {
    const token = req.cookies?.admin_token
    if (!token) {
      return res.status(401).json({ message: "Admin session required" })
    }

    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ message: "Admin JWT secret is not configured" })
    }

    const payload = jwt.verify(token, secret)
    if (!payload || payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" })
    }

    req.adminEmail = payload.email
    req.adminRole = payload.role
    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin session" })
  }
}

export default isAdminAuth
