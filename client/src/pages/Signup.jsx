import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AuthLayout from "../components/auth/AuthLayout"
import GoogleAuthButton, { AuthDivider, AuthError, AuthInput } from "../components/auth/AuthForm"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/dashboard"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    const result = await signup(name, email, password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setGoogleLoading(true)
    const result = await loginWithGoogle()
    setGoogleLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get 100 free credits to start generating exam notes"
    >
      <Card glass className="space-y-1">
        <AuthError message={error} />

        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] pt-4">
          Already have an account?{" "}
          <Link to="/login" state={{ from: location.state?.from }} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-[var(--color-text-muted)] pt-2">
          By signing up, you agree to our terms of service
        </p>
      </Card>
    </AuthLayout>
  )
}
