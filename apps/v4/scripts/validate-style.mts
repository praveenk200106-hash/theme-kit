/*
 * Validates a style token file (registry/styles/style-<name>.css).
 *
 * 1. Parses it with createStyleMap (the same parser the registry build uses)
 *    and compares the cn-* class set against the reference style (vega).
 * 2. Compiles it with Tailwind v4 against app/globals.css so any unknown
 *    utility in an @apply fails here instead of breaking the site build.
 *
 * Usage (from apps/v4):
 *   pnpm exec tsx --tsconfig ./tsconfig.scripts.json ./scripts/validate-style.mts <name> [--reference vega]
 */
import { promises as fs } from "fs"
import path from "path"
import tailwindPostcss from "@tailwindcss/postcss"
import postcss from "postcss"
import { createStyleMap } from "shadcn/utils"

const args = process.argv.slice(2)
const name = args.find((a) => !a.startsWith("--"))
const refIndex = args.indexOf("--reference")
const reference = refIndex >= 0 ? args[refIndex + 1] : "vega"

if (!name) {
  console.error("Usage: validate-style <name> [--reference vega]")
  process.exit(2)
}

const cwd = process.cwd()
const stylePath = path.join(cwd, `registry/styles/style-${name}.css`)
const refPath = path.join(cwd, `registry/styles/style-${reference}.css`)

const [styleCss, refCss] = await Promise.all([
  fs.readFile(stylePath, "utf8"),
  fs.readFile(refPath, "utf8"),
])

let failed = false

// 1. Wrapper selector.
if (!styleCss.trimStart().startsWith(`.style-${name} {`)) {
  console.error(`❌ File must start with ".style-${name} {"`)
  failed = true
}

// 2. Class coverage.
const styleMap = createStyleMap(styleCss)
const refMap = createStyleMap(refCss)
const styleKeys = new Set(Object.keys(styleMap))
const refKeys = new Set(Object.keys(refMap))
const missing = [...refKeys].filter((k) => !styleKeys.has(k))
const extra = [...styleKeys].filter((k) => !refKeys.has(k))

if (missing.length) {
  console.error(`❌ Missing ${missing.length} class(es) present in ${reference}:`)
  for (const k of missing) console.error(`   - ${k}`)
  failed = true
}
if (extra.length) {
  console.warn(`⚠️  ${extra.length} class(es) not in ${reference} (ignored by components unless they use them):`)
  for (const k of extra) console.warn(`   - ${k}`)
}

// 3. Plain CSS declarations are ignored by the build. Flag them.
const plainDecl = styleCss
  .split("\n")
  .map((line, i) => ({ line: line.trim(), n: i + 1 }))
  .filter(
    ({ line }) =>
      /^[a-z-]+\s*:\s*[^;]+;$/.test(line) && !line.startsWith("@apply")
  )
if (plainDecl.length) {
  console.error(
    `❌ ${plainDecl.length} plain CSS declaration(s) found. Only "@apply" lines are compiled into components. Express them as Tailwind utilities (arbitrary values are fine, e.g. shadow-[4px_4px_0_0_var(--foreground)]).`
  )
  for (const { line, n } of plainDecl.slice(0, 20))
    console.error(`   L${n}: ${line}`)
  failed = true
}

// 4. Tailwind compile (same plugin Next uses), against app/globals.css.
const entry = [
  `@reference "./globals.css";`,
  `@import "../registry/styles/style-${name}.css" layer(base);`,
].join("\n")

try {
  const result = await postcss([tailwindPostcss()]).process(entry, {
    from: path.join(cwd, "app", `__validate-${name}__.css`),
    to: path.join(cwd, "app", `__validate-${name}__.out.css`),
  })
  if (!result.css.includes(`.style-${name}`)) {
    console.error("❌ Compiled output does not contain the style wrapper.")
    failed = true
  }
} catch (error) {
  console.error("❌ Tailwind failed to compile the style file:")
  console.error(error instanceof Error ? error.message : error)
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log(
  `✅ style-${name}.css OK — ${styleKeys.size} classes (reference ${reference}: ${refKeys.size})`
)
