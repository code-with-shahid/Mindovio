/**
 * Shared typography helpers for consistent SaaS-style text.
 * Prefer CSS utility classes from index.css; these wrap them for JSX reuse.
 */
export function Display({ children, className = "", as: Tag = "h1" }) {
  return <Tag className={`type-display ${className}`}>{children}</Tag>
}

export function Heading({ level = 1, children, className = "" }) {
  const map = {
    1: ["h1", "type-h1"],
    2: ["h2", "type-h2"],
    3: ["h3", "type-h3"],
    4: ["h4", "type-h4"],
  }
  const [Tag, cls] = map[level] || map[1]
  return <Tag className={`${cls} ${className}`}>{children}</Tag>
}

export function Body({ children, className = "", size = "md" }) {
  const cls = size === "lg" ? "type-body-lg" : size === "sm" ? "type-sm" : "type-body"
  return <p className={`${cls} ${className}`}>{children}</p>
}

export function Caption({ children, className = "" }) {
  return <span className={`type-caption ${className}`}>{children}</span>
}

export function Label({ children, className = "", htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={`ui-label ${className}`}>
      {children}
    </label>
  )
}

export function Overline({ children, className = "" }) {
  return <p className={`type-overline ${className}`}>{children}</p>
}
