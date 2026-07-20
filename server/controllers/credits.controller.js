import Stripe from "stripe"
import UserModel from "../models/user.model.js"
import dotenv from "dotenv"
dotenv.config()

const CREDIT_MAP = {
  100: 50,
  200: 120,
  500: 300,
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("Stripe secret key missing in .env")
  }
  if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY must be a Stripe secret key (sk_test_… or sk_live_…)")
  }
  return new Stripe(key)
}

function isTestMode() {
  return String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_")
}

async function grantCreditsFromSession(session) {
  const userId = session?.metadata?.userId
  const creditsToAdd = Number(session?.metadata?.credits)
  const sessionId = session?.id

  if (!userId || !creditsToAdd || !sessionId) {
    return { ok: false, status: 400, message: "Invalid session metadata" }
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { ok: false, status: 400, message: "Payment not completed" }
  }

  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      creditedStripeSessions: { $ne: sessionId },
    },
    {
      $inc: { credits: creditsToAdd },
      $set: { isCreditAvailable: true },
      $addToSet: { creditedStripeSessions: sessionId },
    },
    { new: true }
  )

  if (!user) {
    const existing = await UserModel.findById(userId).select("credits creditedStripeSessions")
    if (!existing) {
      return { ok: false, status: 404, message: "User not found" }
    }
    // Already credited this session (idempotent)
    return {
      ok: true,
      status: 200,
      message: "Credits already applied",
      credits: existing.credits,
      alreadyApplied: true,
    }
  }

  return {
    ok: true,
    status: 200,
    message: "Credits added",
    credits: user.credits,
    alreadyApplied: false,
  }
}

export const createCreditsOrder = async (req, res) => {
  try {
    const stripe = getStripe()
    const userId = req.userId
    const { amount } = req.body

    if (!CREDIT_MAP[amount]) {
      return res.status(400).json({
        message: "Invalid credit plan",
      })
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment-failed`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${CREDIT_MAP[amount]} Credits`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(userId),
        credits: String(CREDIT_MAP[amount]),
        mode: isTestMode() ? "test" : "live",
      },
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error("createCreditsOrder:", error.message)
    res.status(500).json({ message: "Stripe error" })
  }
}

/** Confirm Checkout session after redirect (works in Stripe test mode without a live webhook). */
export const confirmCreditsSession = async (req, res) => {
  try {
    const stripe = getStripe()
    const sessionId = req.body?.sessionId || req.query?.session_id
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" })
    }

    const session = await stripe.checkout.sessions.retrieve(String(sessionId))

    if (String(session.metadata?.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Session does not belong to this user" })
    }

    const result = await grantCreditsFromSession(session)
    return res.status(result.status).json({
      message: result.message,
      credits: result.credits,
      alreadyApplied: result.alreadyApplied || false,
      testMode: isTestMode(),
    })
  } catch (error) {
    console.error("confirmCreditsSession:", error.message)
    return res.status(500).json({ message: "Failed to confirm payment" })
  }
}

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || webhookSecret.includes("xxxxx") || webhookSecret === "your_stripe_webhook_secret") {
    console.warn("Stripe webhook skipped: set a real STRIPE_WEBHOOK_SECRET (test mode whsec_… from Dashboard or CLI)")
    return res.status(503).send("Webhook not configured")
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (error) {
    console.log("❌ Webhook signature error:", error.message)
    return res.status(400).send("Webhook Error")
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const result = await grantCreditsFromSession(session)
    if (!result.ok && result.status !== 200) {
      return res.status(result.status).json({ message: result.message })
    }
  }

  res.json({ received: true })
}
