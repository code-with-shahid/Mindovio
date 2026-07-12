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
      <div className="relative flex justify-center">
        <span className="px-3 bg-[var(--color-surface-muted)] type-caption">
          or continue with email
        </span>
      </div>
    </div>
  )
}

export function AuthError({ message }) {
  if (!message) return null
  return (
    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 type-sm text-error">
      {message}
    </div>
  )
}

export function AuthInput({ label, type = "text", value, onChange, placeholder, autoComplete, hint }) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="ui-input bg-[var(--color-surface-elevated)]"
      />
      {hint && <p className="ui-hint">{hint}</p>}
    </div>
  )
}
