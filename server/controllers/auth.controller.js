import UserModel from "../models/user.model.js"
import { getToken } from "../utils/token.js"

const isProd = process.env.NODE_ENV === "production"

export const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const findOrCreateUser = async ({ name, email, firebaseUid }) => {
    let user = await UserModel.findOne({ email })

    if (!user) {
        user = await UserModel.create({ name, email, firebaseUid })
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
    return user
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

        await issueSession(res, user)
        return res.status(200).json(user)
    } catch (error) {
        console.error("syncSession error:", error)
        return res.status(500).json({ message: "Failed to create session" })
    }
}

export const googleAuth = syncSession

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        })
        return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Logout failed" })
    }
}
