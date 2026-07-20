import jwt from "jsonwebtoken"

export const getToken = async (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("getToken error:", error.message)
    throw error
  }
}
