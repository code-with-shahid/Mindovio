import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AuthLayout from "../components/auth/AuthLayout"
import GoogleAuthButton, { AuthDivider, AuthError, AuthInput } from "../components/auth/AuthForm"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await login(email, password)
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
      title="Welcome back"
      subtitle="Sign in to access your dashboard and notes"
    >
      <Card glass className="space-y-1">
        <AuthError message={error} />

        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] pt-4">
          Don't have an account?{" "}
          <Link to="/signup" state={{ from: location.state?.from }} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>

        <p className="text-center text-xs text-[var(--color-text-muted)] pt-2">
          Start with 50 free credits · No card required
        </p>
      </Card>
    </AuthLayout>
  )
}
