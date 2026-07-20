import jwt from "jsonwebtoken"

function readBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ""
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || readBearerToken(req)
    if (!token) {
      return res.status(401).json({ message: "Token is not found" })
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!verifyToken?.userId) {
      return res.status(401).json({ message: "user doesn't have valid token" })
    }

    req.userId = verifyToken.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session. Please sign in again." })
  }
}

export default isAuth
