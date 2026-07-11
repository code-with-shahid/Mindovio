import { Link } from "react-router-dom"
import logo from "../../assets/logo.png"
import { BRAND_NAME, BRAND_TAGLINE } from "../../constants/brand"

export default function BrandLogo({
  to = "/",
  showTagline = false,
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: { img: "h-8 w-8", text: "text-base", tag: "text-[10px]" },
    md: { img: "h-9 w-9", text: "text-lg", tag: "text-[10px]" },
    lg: { img: "h-11 w-11", text: "text-xl", tag: "text-xs" },
  }
  const s = sizes[size] || sizes.md

  return (
    <Link to={to} className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img src={logo} alt={BRAND_NAME} className={`${s.img} rounded-lg`} />
      <div className="min-w-0">
        <span className={`${s.text} font-bold text-[var(--color-text-primary)] leading-tight block`}>
          {BRAND_NAME}
        </span>
        {showTagline && (
          <span className={`${s.tag} text-[var(--color-text-muted)] leading-none block`}>
            {BRAND_TAGLINE}
          </span>
        )}
      </div>
    </Link>
  )
}
