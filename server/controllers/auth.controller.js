import UserModel from "../models/user.model.js"
import { getToken } from "../utils/token.js"
import { buildCookieOptions, isSecureCookieMode } from "../utils/cookieOptions.js"

export const cookieOptions = buildCookieOptions({
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const findOrCreateUser = async ({ name, email, firebaseUid }) => {
  let user = await UserModel.findOne({ email })

  if (!user) {
    // First-time signup — grant 100 free credits
    user = await UserModel.create({
      name,
      email,
      firebaseUid,
      credits: 100,
      isCreditAvailable: true,
    })
    return user
  }

  if (firebaseUid && !user.firebaseUid) {
    user.firebaseUid = firebaseUid
    await user.save()
  }

  if (name && user.name !== name) {
    user.name = name
    await user.save()
  }

  return user
}

const issueSession = async (res, user) => {
  const token = await getToken(user._id)
  res.cookie("token", token, cookieOptions)
  return token
}

export const syncSession = async (req, res) => {
  try {
    const { name, email, firebaseUid } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const user = await findOrCreateUser({
      name: name || email.split("@")[0],
      email,
      firebaseUid,
    })

    const token = await issueSession(res, user)
    const payload = typeof user.toObject === "function" ? user.toObject() : { ...user }
    // Bearer fallback for cross-site browsers that block third-party cookies
    return res.status(200).json({ ...payload, token })
  } catch (error) {
    console.error("syncSession error:", error)
    return res.status(500).json({ message: "Failed to create session" })
  }
}

export const googleAuth = syncSession

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", buildCookieOptions())
    return res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" })
  }
}

export { isSecureCookieMode }
