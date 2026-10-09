import { DEFAULT_CONFIG, STYLES } from "@/registry/config"
import { getPresetCode } from "@/app/(app)/(create)/lib/preset-code"

// Renders one component in every style, using the existing /preview route.
export async function DocsAllStyles({
  base,
  component,
}: {
  base: string
  component: string
}) {
  const { Index } = await import("@/registry/bases/__index__")
  const index = (Index as Record<string, Record<string, unknown>>)[base]
  const item = `${component}-example`

  if (!index?.[item]) {
    return null
  }

  return (
    <section data-not-typeset className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">
        All styles ({STYLES.length})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {STYLES.map((style) => {
          const preset = getPresetCode({
            ...DEFAULT_CONFIG,
            style: style.name,
          } as Parameters<typeof getPresetCode>[0])
          const src = `/preview/${base}/${item}?preset=${preset}&item=${item}&base=${base}`
          return (
            <div
              key={style.name}
              className="flex flex-col overflow-hidden rounded-xl border"
            >
              <div className="flex items-center justify-between border-b px-3 py-1.5 text-sm">
                <span className="font-medium">{style.title}</span>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Open
                </a>
              </div>
              <iframe
                src={src}
                title={`${component} / ${style.name}`}
                loading="lazy"
                className="h-80 w-full bg-background"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
