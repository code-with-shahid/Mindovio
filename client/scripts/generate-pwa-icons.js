/**
 * Generate PWA icons from public/logo.png (run: node scripts/generate-pwa-icons.js)
 */
import sharp from "sharp"
import { mkdir, copyFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const src = path.join(root, "public", "logo.png")
const outDir = path.join(root, "public", "pwa")

async function makeIcon(size, fileName, { maskable = false } = {}) {
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: maskable ? { r: 7, g: 11, b: 22, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })

  const inset = maskable ? Math.round(size * 0.2) : Math.round(size * 0.08)
  const inner = size - inset * 2
  const logo = await sharp(src).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()

  await canvas
    .composite([{ input: logo, top: inset, left: inset }])
    .png()
    .toFile(path.join(outDir, fileName))
}

await mkdir(outDir, { recursive: true })
await makeIcon(192, "icon-192.png")
await makeIcon(512, "icon-512.png")
await makeIcon(192, "icon-192-maskable.png", { maskable: true })
await makeIcon(512, "icon-512-maskable.png", { maskable: true })
await makeIcon(180, "apple-touch-icon.png")
await copyFile(path.join(outDir, "icon-192.png"), path.join(root, "public", "logo-192.png"))
console.log("PWA icons written to public/pwa/")
