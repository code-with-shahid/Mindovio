import { FcGoogle } from "react-icons/fc"
import Button from "../ui/Button"

export default function GoogleAuthButton({ onClick, loading, label = "Continue with Google" }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={loading}
      loading={loading}
      onClick={onClick}
    >
      {!loading && <FcGoogle size={20} />}
      {label}
    </Button>
  )
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--color-border)]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-3 bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
          or continue with email
        </span>
      </div>
    </div>
  )
}

export function AuthError({ message }) {
  if (!message) return null
  return (
    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
      {message}
    </div>
  )
}

export function AuthInput({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all"
      />
    </div>
  )
}
