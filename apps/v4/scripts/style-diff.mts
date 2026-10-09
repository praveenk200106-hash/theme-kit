/*
 * Measures how much a style file departs from a base style, per MARK section.
 * Used by reviewers to catch "renamed copy" styles.
 *
 * Usage (from apps/v4):
 *   pnpm exec tsx --tsconfig ./tsconfig.scripts.json ./scripts/style-diff.mts <slug> [--base vega] [--json]
 */
import { promises as fs } from "fs"
import path from "path"
import { createStyleMap } from "shadcn/utils"

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith("--"))
const baseIdx = args.indexOf("--base")
const base = baseIdx >= 0 ? args[baseIdx + 1] : "vega"
const asJson = args.includes("--json")

if (!slug) {
  console.error("Usage: style-diff <slug> [--base vega] [--json]")
  process.exit(2)
}

const cwd = process.cwd()
const read = (name: string) =>
  fs.readFile(path.join(cwd, `registry/styles/style-${name}.css`), "utf8")

const [styleCss, baseCss] = await Promise.all([read(slug), read(base)])
const styleMap = createStyleMap(styleCss) as Record<string, string>
const baseMap = createStyleMap(baseCss) as Record<string, string>

const norm = (s: string | undefined) =>
  (s ?? "").split(/\s+/).filter(Boolean).sort().join(" ")

// Map classes to MARK sections using the style file's text order.
const sections: { name: string; classes: string[] }[] = []
let current: { name: string; classes: string[] } | null = null
for (const line of styleCss.split("\n")) {
  const mark = line.match(/\/\*\s*MARK:\s*(.+?)\s*\*\//)
  if (mark) {
    current = { name: mark[1], classes: [] }
    sections.push(current)
    continue
  }
  if (!current) continue
  for (const m of line.matchAll(/\.(cn-[a-z0-9-]+)/g)) {
    if (m[1] in styleMap && !current.classes.includes(m[1]))
      current.classes.push(m[1])
  }
}

let changedTotal = 0
let total = 0
const rows = sections.map((s) => {
  const changed = s.classes.filter(
    (c) => norm(styleMap[c]) !== norm(baseMap[c])
  ).length
  changedTotal += changed
  total += s.classes.length
  return {
    section: s.name,
    classes: s.classes.length,
    changed,
    pct: s.classes.length ? Math.round((changed / s.classes.length) * 100) : 0,
  }
})

const untouched = rows.filter((r) => r.classes > 0 && r.changed === 0)
const summary = {
  slug,
  base,
  classes: total,
  changed: changedTotal,
  pct: total ? Math.round((changedTotal / total) * 100) : 0,
  untouchedSections: untouched.map((r) => r.section),
  sections: rows,
}

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(
    `style-${slug} vs style-${base}: ${changedTotal}/${total} classes changed (${summary.pct}%)`
  )
  for (const r of rows) {
    const flag = r.classes > 0 && r.changed === 0 ? "  ⚠️ untouched" : ""
    console.log(
      `  ${r.section.padEnd(28)} ${String(r.changed).padStart(3)}/${String(r.classes).padEnd(3)} ${String(r.pct).padStart(3)}%${flag}`
    )
  }
  if (untouched.length) {
    console.log(
      `\n⚠️  ${untouched.length} section(s) identical to ${base}: ${untouched.map((r) => r.section).join(", ")}`
    )
  }
}
