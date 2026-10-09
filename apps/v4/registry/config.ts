import {
  iconLibraries,
  type IconLibrary,
  type IconLibraryName,
} from "shadcn/icons"
import { registryItemSchema, type RegistryItem } from "shadcn/schema"
import { z } from "zod"

import { BASE_COLORS, type BaseColor } from "@/registry/base-colors"
import { BASES, type Base } from "@/registry/bases"
import { bodyFonts, fonts, headingFonts } from "@/registry/fonts"
import { STYLES, type Style } from "@/registry/styles"
import { THEMES, type Theme } from "@/registry/themes"

const SHADCN_VERSION = "latest"
const DEFAULT_RADIUS_VALUE = "0.625rem"

export { BASES, type Base }
export { STYLES, type Style }
export { THEMES, type Theme }
export { BASE_COLORS, type BaseColor }
export { bodyFonts, headingFonts, fonts }
export { iconLibraries, type IconLibrary, type IconLibraryName }

export type BaseName = Base["name"]
export type StyleName = Style["name"]
export type ThemeName = Theme["name"]
export type BaseColorName = BaseColor["name"]
export type ChartColorName = Theme["name"]
export const REGISTRY_BASE_PARTS = ["theme", "font"] as const
export type RegistryBasePart = (typeof REGISTRY_BASE_PARTS)[number]
export const POINTER_CURSOR_SELECTOR =
  'button:not(:disabled), [role="button"]:not(:disabled)'

// Derive font values from registry fonts (e.g., "font-inter" -> "inter").
const fontValues = bodyFonts.map((f) => f.name.replace("font-", "")) as [
  string,
  ...string[],
]
const fontHeadingValues = ["inherit", ...fontValues] as const

export type FontValue = (typeof fontValues)[number]
export type FontHeadingValue = (typeof fontHeadingValues)[number]

export function getBodyFont(font: FontValue) {
  return bodyFonts.find((item) => item.name === `font-${font}`)
}

export function getHeadingFont(
  fontHeading: Exclude<FontHeadingValue, "inherit">
) {
  return headingFonts.find(
    (item) => item.name === `font-heading-${fontHeading}`
  )
}

export function getInheritedHeadingFontValue(font: FontValue) {
  return `var(${getBodyFont(font)?.font.variable ?? "--font-sans"})`
}

export const MENU_ACCENTS = [
  { value: "subtle", label: "Subtle" },
  { value: "bold", label: "Bold" },
] as const

export type MenuAccent = (typeof MENU_ACCENTS)[number]
export type MenuAccentValue = MenuAccent["value"]

export const MENU_COLORS = [
  { value: "default", label: "Default" },
  { value: "inverted", label: "Inverted" },
  { value: "default-translucent", label: "Default Translucent" },
  { value: "inverted-translucent", label: "Inverted Translucent" },
] as const

export type MenuColor = (typeof MENU_COLORS)[number]

export type MenuColorValue = MenuColor["value"]

export const RADII = [
  { name: "default", label: "Default", value: "" },
  { name: "none", label: "None", value: "0" },
  { name: "small", label: "Small", value: "0.45rem" },
  { name: "medium", label: "Medium", value: "0.625rem" },
  { name: "large", label: "Large", value: "0.875rem" },
] as const

export type Radius = (typeof RADII)[number]

export type RadiusValue = Radius["name"]

export const designSystemConfigSchema = z
  .object({
    base: z.enum(BASES.map((b) => b.name) as [BaseName, ...BaseName[]]),
    style: z.enum(STYLES.map((s) => s.name) as [StyleName, ...StyleName[]]),
    iconLibrary: z.enum(
      Object.keys(iconLibraries) as [IconLibraryName, ...IconLibraryName[]]
    ),
    baseColor: z
      .enum(
        BASE_COLORS.map((c) => c.name) as [BaseColorName, ...BaseColorName[]]
      )
      .default("neutral"),
    theme: z.enum(THEMES.map((t) => t.name) as [ThemeName, ...ThemeName[]]),
    chartColor: z
      .enum(THEMES.map((t) => t.name) as [ChartColorName, ...ChartColorName[]])
      .optional(),
    font: z.enum(fontValues).default("inter"),
    fontHeading: z.enum(fontHeadingValues).default("inherit"),
    item: z.string().optional(),
    rtl: z.boolean().default(false),
    pointer: z.boolean().default(false),
    menuAccent: z
      .enum(
        MENU_ACCENTS.map((a) => a.value) as [
          MenuAccentValue,
          ...MenuAccentValue[],
        ]
      )
      .default("subtle"),
    menuColor: z
      .enum(
        MENU_COLORS.map((m) => m.value) as [MenuColorValue, ...MenuColorValue[]]
      )
      .default("default"),
    radius: z
      .enum(RADII.map((r) => r.name) as [RadiusValue, ...RadiusValue[]])
      .default("default"),
    template: z
      .enum([
        "next",
        "next-monorepo",
        "start",
        "react-router",
        "vite",
        "vite-monorepo",
        "react-router-monorepo",
        "start-monorepo",
        "astro",
        "astro-monorepo",
        "laravel",
      ])
      .default("next")
      .optional(),
  })
  .transform((data) => ({
    ...data,
    chartColor: data.chartColor ?? data.theme,
  }))
  .refine(
    (data) => {
      const availableThemes = getThemesForBaseColor(data.baseColor)
      return availableThemes.some((t) => t.name === data.theme)
    },
    (data) => ({
      message: `Theme "${data.theme}" is not available for base color "${data.baseColor}"`,
      path: ["theme"],
    })
  )
  .refine(
    (data) => {
      const availableThemes = getThemesForBaseColor(data.baseColor)
      return availableThemes.some((t) => t.name === data.chartColor)
    },
    (data) => ({
      message: `Chart color "${data.chartColor}" is not available for base color "${data.baseColor}"`,
      path: ["chartColor"],
    })
  )

export type DesignSystemConfig = z.infer<typeof designSystemConfigSchema>

export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "base",
  style: "nova",
  baseColor: "neutral",
  theme: "neutral",
  chartColor: "neutral",
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inherit",
  item: "Item",
  rtl: false,
  pointer: false,
  menuAccent: "subtle",
  menuColor: "default",
  radius: "default",
  template: "next",
}

export type Preset = {
  name: string
  title: string
  description: string
} & Omit<DesignSystemConfig, "pointer">

export const PRESETS: Preset[] = [
  // Radix.
  {
    name: "radix-nova",
    title: "Nova (Radix)",
    description: "Nova / Lucide / Geist",
    base: "radix",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-mira",
    title: "Mira (Radix)",
    description: "Mira / Hugeicons / Inter",
    base: "radix",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-luma",
    title: "Luma (Radix)",
    description: "Luma / Lucide / Inter",
    base: "radix",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Aria.
  {
    name: "base-nova",
    title: "Nova (Base)",
    description: "Nova / Lucide / Geist",
    base: "base",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-mira",
    title: "Mira (Base)",
    description: "Mira / Hugeicons / Inter",
    base: "base",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-luma",
    title: "Luma (Base)",
    description: "Luma / Lucide / Inter",
    base: "base",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Base.
  {
    name: "aria-nova",
    title: "Nova (Aria)",
    description: "Nova / Lucide / Geist",
    base: "aria",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-mira",
    title: "Mira (Aria)",
    description: "Mira / Hugeicons / Inter",
    base: "aria",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-luma",
    title: "Luma (Aria)",
    description: "Luma / Lucide / Inter",
    base: "aria",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Rhea.
  // Sera.
  {
    name: "radix-sera",
    title: "Sera (Radix)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "radix",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-sera",
    title: "Sera (Base)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "base",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-sera",
    title: "Sera (Aria)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "aria",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Minimal.
  // Swiss.
  {
    name: "base-swiss",
    title: "Swiss (Base)",
    description: "Swiss / Lucide / IBM Plex Sans",
    base: "base",
    style: "swiss",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-swiss",
    title: "Swiss (Radix)",
    description: "Swiss / Lucide / IBM Plex Sans",
    base: "radix",
    style: "swiss",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-swiss",
    title: "Swiss (Aria)",
    description: "Swiss / Lucide / IBM Plex Sans",
    base: "aria",
    style: "swiss",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Monochrome.
  {
    name: "base-monochrome",
    title: "Monochrome (Base)",
    description: "Monochrome / Lucide / Geist",
    base: "base",
    style: "monochrome",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-monochrome",
    title: "Monochrome (Radix)",
    description: "Monochrome / Lucide / Geist",
    base: "radix",
    style: "monochrome",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-monochrome",
    title: "Monochrome (Aria)",
    description: "Monochrome / Lucide / Geist",
    base: "aria",
    style: "monochrome",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Material.
  {
    name: "base-material",
    title: "Material (Base)",
    description: "Material / Lucide / Roboto",
    base: "base",
    style: "material",
    baseColor: "neutral",
    theme: "indigo",
    chartColor: "indigo",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-material",
    title: "Material (Radix)",
    description: "Material / Lucide / Roboto",
    base: "radix",
    style: "material",
    baseColor: "neutral",
    theme: "indigo",
    chartColor: "indigo",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-material",
    title: "Material (Aria)",
    description: "Material / Lucide / Roboto",
    base: "aria",
    style: "material",
    baseColor: "neutral",
    theme: "indigo",
    chartColor: "indigo",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Material You.
  {
    name: "base-materialyou",
    title: "Material You (Base)",
    description: "Material You / Lucide / Roboto",
    base: "base",
    style: "materialyou",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-materialyou",
    title: "Material You (Radix)",
    description: "Material You / Lucide / Roboto",
    base: "radix",
    style: "materialyou",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-materialyou",
    title: "Material You (Aria)",
    description: "Material You / Lucide / Roboto",
    base: "aria",
    style: "materialyou",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "roboto",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Neumorphism.
  {
    name: "base-neumorphism",
    title: "Neumorphism (Base)",
    description: "Neumorphism / Lucide / Nunito Sans",
    base: "base",
    style: "neumorphism",
    baseColor: "mist",
    theme: "mist",
    chartColor: "mist",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-neumorphism",
    title: "Neumorphism (Radix)",
    description: "Neumorphism / Lucide / Nunito Sans",
    base: "radix",
    style: "neumorphism",
    baseColor: "mist",
    theme: "mist",
    chartColor: "mist",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-neumorphism",
    title: "Neumorphism (Aria)",
    description: "Neumorphism / Lucide / Nunito Sans",
    base: "aria",
    style: "neumorphism",
    baseColor: "mist",
    theme: "mist",
    chartColor: "mist",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Skeuomorphic.
  {
    name: "base-skeuomorphic",
    title: "Skeuomorphic (Base)",
    description: "Skeuomorphic / Lucide / Noto Sans",
    base: "base",
    style: "skeuomorphic",
    baseColor: "stone",
    theme: "stone",
    chartColor: "stone",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-skeuomorphic",
    title: "Skeuomorphic (Radix)",
    description: "Skeuomorphic / Lucide / Noto Sans",
    base: "radix",
    style: "skeuomorphic",
    baseColor: "stone",
    theme: "stone",
    chartColor: "stone",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-skeuomorphic",
    title: "Skeuomorphic (Aria)",
    description: "Skeuomorphic / Lucide / Noto Sans",
    base: "aria",
    style: "skeuomorphic",
    baseColor: "stone",
    theme: "stone",
    chartColor: "stone",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Claymorphism.
  {
    name: "base-clay",
    title: "Claymorphism (Base)",
    description: "Claymorphism / Lucide / Outfit",
    base: "base",
    style: "clay",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-clay",
    title: "Claymorphism (Radix)",
    description: "Claymorphism / Lucide / Outfit",
    base: "radix",
    style: "clay",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-clay",
    title: "Claymorphism (Aria)",
    description: "Claymorphism / Lucide / Outfit",
    base: "aria",
    style: "clay",
    baseColor: "mauve",
    theme: "violet",
    chartColor: "violet",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Glassmorphism.
  {
    name: "base-glass",
    title: "Glassmorphism (Base)",
    description: "Glassmorphism / Lucide / Inter",
    base: "base",
    style: "glass",
    baseColor: "neutral",
    theme: "sky",
    chartColor: "sky",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-glass",
    title: "Glassmorphism (Radix)",
    description: "Glassmorphism / Lucide / Inter",
    base: "radix",
    style: "glass",
    baseColor: "neutral",
    theme: "sky",
    chartColor: "sky",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-glass",
    title: "Glassmorphism (Aria)",
    description: "Glassmorphism / Lucide / Inter",
    base: "aria",
    style: "glass",
    baseColor: "neutral",
    theme: "sky",
    chartColor: "sky",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Liquid Glass.
  {
    name: "base-liquid",
    title: "Liquid Glass (Base)",
    description: "Liquid Glass / Lucide / Inter",
    base: "base",
    style: "liquid",
    baseColor: "neutral",
    theme: "cyan",
    chartColor: "cyan",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-liquid",
    title: "Liquid Glass (Radix)",
    description: "Liquid Glass / Lucide / Inter",
    base: "radix",
    style: "liquid",
    baseColor: "neutral",
    theme: "cyan",
    chartColor: "cyan",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-liquid",
    title: "Liquid Glass (Aria)",
    description: "Liquid Glass / Lucide / Inter",
    base: "aria",
    style: "liquid",
    baseColor: "neutral",
    theme: "cyan",
    chartColor: "cyan",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Aurora.
  {
    name: "base-aurora",
    title: "Aurora (Base)",
    description: "Aurora / Lucide / Manrope",
    base: "base",
    style: "aurora",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "manrope",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-aurora",
    title: "Aurora (Radix)",
    description: "Aurora / Lucide / Manrope",
    base: "radix",
    style: "aurora",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "manrope",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-aurora",
    title: "Aurora (Aria)",
    description: "Aurora / Lucide / Manrope",
    base: "aria",
    style: "aurora",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "manrope",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Neo-brutalism.
  {
    name: "base-neobrutal",
    title: "Neo-brutalism (Base)",
    description: "Neo-brutalism / Lucide / Space Grotesk",
    base: "base",
    style: "neobrutal",
    baseColor: "neutral",
    theme: "yellow",
    chartColor: "yellow",
    iconLibrary: "lucide",
    font: "space-grotesk",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-neobrutal",
    title: "Neo-brutalism (Radix)",
    description: "Neo-brutalism / Lucide / Space Grotesk",
    base: "radix",
    style: "neobrutal",
    baseColor: "neutral",
    theme: "yellow",
    chartColor: "yellow",
    iconLibrary: "lucide",
    font: "space-grotesk",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-neobrutal",
    title: "Neo-brutalism (Aria)",
    description: "Neo-brutalism / Lucide / Space Grotesk",
    base: "aria",
    style: "neobrutal",
    baseColor: "neutral",
    theme: "yellow",
    chartColor: "yellow",
    iconLibrary: "lucide",
    font: "space-grotesk",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Sticker.
  {
    name: "base-sticker",
    title: "Sticker (Base)",
    description: "Sticker / Lucide / Hanken Grotesk + Bricolage Grotesque",
    base: "base",
    style: "sticker",
    baseColor: "neutral",
    theme: "rose",
    chartColor: "rose",
    iconLibrary: "lucide",
    font: "hanken-grotesk",
    fontHeading: "bricolage-grotesque",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-sticker",
    title: "Sticker (Radix)",
    description: "Sticker / Lucide / Hanken Grotesk + Bricolage Grotesque",
    base: "radix",
    style: "sticker",
    baseColor: "neutral",
    theme: "rose",
    chartColor: "rose",
    iconLibrary: "lucide",
    font: "hanken-grotesk",
    fontHeading: "bricolage-grotesque",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-sticker",
    title: "Sticker (Aria)",
    description: "Sticker / Lucide / Hanken Grotesk + Bricolage Grotesque",
    base: "aria",
    style: "sticker",
    baseColor: "neutral",
    theme: "rose",
    chartColor: "rose",
    iconLibrary: "lucide",
    font: "hanken-grotesk",
    fontHeading: "bricolage-grotesque",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Brutalist.
  {
    name: "base-brutalist",
    title: "Brutalist (Base)",
    description: "Brutalist / Lucide / Noto Serif",
    base: "base",
    style: "brutalist",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "noto-serif",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-brutalist",
    title: "Brutalist (Radix)",
    description: "Brutalist / Lucide / Noto Serif",
    base: "radix",
    style: "brutalist",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "noto-serif",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-brutalist",
    title: "Brutalist (Aria)",
    description: "Brutalist / Lucide / Noto Serif",
    base: "aria",
    style: "brutalist",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "noto-serif",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Memphis.
  {
    name: "base-memphis",
    title: "Memphis (Base)",
    description: "Memphis / Lucide / Outfit",
    base: "base",
    style: "memphis",
    baseColor: "neutral",
    theme: "pink",
    chartColor: "pink",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-memphis",
    title: "Memphis (Radix)",
    description: "Memphis / Lucide / Outfit",
    base: "radix",
    style: "memphis",
    baseColor: "neutral",
    theme: "pink",
    chartColor: "pink",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-memphis",
    title: "Memphis (Aria)",
    description: "Memphis / Lucide / Outfit",
    base: "aria",
    style: "memphis",
    baseColor: "neutral",
    theme: "pink",
    chartColor: "pink",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Retro.
  {
    name: "base-retro",
    title: "Retro (Base)",
    description: "Retro / Lucide / Lora + Playfair Display",
    base: "base",
    style: "retro",
    baseColor: "stone",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "lora",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-retro",
    title: "Retro (Radix)",
    description: "Retro / Lucide / Lora + Playfair Display",
    base: "radix",
    style: "retro",
    baseColor: "stone",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "lora",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-retro",
    title: "Retro (Aria)",
    description: "Retro / Lucide / Lora + Playfair Display",
    base: "aria",
    style: "retro",
    baseColor: "stone",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "lora",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Y2K.
  {
    name: "base-y2k",
    title: "Y2K (Base)",
    description: "Y2K / Lucide / Outfit",
    base: "base",
    style: "y2k",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-y2k",
    title: "Y2K (Radix)",
    description: "Y2K / Lucide / Outfit",
    base: "radix",
    style: "y2k",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-y2k",
    title: "Y2K (Aria)",
    description: "Y2K / Lucide / Outfit",
    base: "aria",
    style: "y2k",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "outfit",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Pixel.
  {
    name: "base-pixel",
    title: "Pixel (Base)",
    description: "Pixel / Lucide / JetBrains Mono + Silkscreen",
    base: "base",
    style: "pixel",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "jetbrains-mono",
    fontHeading: "silkscreen",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-pixel",
    title: "Pixel (Radix)",
    description: "Pixel / Lucide / JetBrains Mono + Silkscreen",
    base: "radix",
    style: "pixel",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "jetbrains-mono",
    fontHeading: "silkscreen",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-pixel",
    title: "Pixel (Aria)",
    description: "Pixel / Lucide / JetBrains Mono + Silkscreen",
    base: "aria",
    style: "pixel",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "jetbrains-mono",
    fontHeading: "silkscreen",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Terminal.
  {
    name: "base-terminal",
    title: "Terminal (Base)",
    description: "Terminal / Lucide / Geist Mono",
    base: "base",
    style: "terminal",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "geist-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-terminal",
    title: "Terminal (Radix)",
    description: "Terminal / Lucide / Geist Mono",
    base: "radix",
    style: "terminal",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "geist-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-terminal",
    title: "Terminal (Aria)",
    description: "Terminal / Lucide / Geist Mono",
    base: "aria",
    style: "terminal",
    baseColor: "neutral",
    theme: "green",
    chartColor: "green",
    iconLibrary: "lucide",
    font: "geist-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Cyberpunk.
  {
    name: "base-cyberpunk",
    title: "Cyberpunk (Base)",
    description: "Cyberpunk / Lucide / Oxanium",
    base: "base",
    style: "cyberpunk",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "oxanium",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-cyberpunk",
    title: "Cyberpunk (Radix)",
    description: "Cyberpunk / Lucide / Oxanium",
    base: "radix",
    style: "cyberpunk",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "oxanium",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-cyberpunk",
    title: "Cyberpunk (Aria)",
    description: "Cyberpunk / Lucide / Oxanium",
    base: "aria",
    style: "cyberpunk",
    baseColor: "neutral",
    theme: "fuchsia",
    chartColor: "fuchsia",
    iconLibrary: "lucide",
    font: "oxanium",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Dashboard.
  {
    name: "base-dashboard",
    title: "Dashboard (Base)",
    description: "Dashboard / Lucide / Geist",
    base: "base",
    style: "dashboard",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-dashboard",
    title: "Dashboard (Radix)",
    description: "Dashboard / Lucide / Geist",
    base: "radix",
    style: "dashboard",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-dashboard",
    title: "Dashboard (Aria)",
    description: "Dashboard / Lucide / Geist",
    base: "aria",
    style: "dashboard",
    baseColor: "zinc",
    theme: "zinc",
    chartColor: "zinc",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Playful.
  {
    name: "base-playful",
    title: "Playful (Base)",
    description: "Playful / Lucide / Nunito Sans",
    base: "base",
    style: "playful",
    baseColor: "neutral",
    theme: "orange",
    chartColor: "orange",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-playful",
    title: "Playful (Radix)",
    description: "Playful / Lucide / Nunito Sans",
    base: "radix",
    style: "playful",
    baseColor: "neutral",
    theme: "orange",
    chartColor: "orange",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-playful",
    title: "Playful (Aria)",
    description: "Playful / Lucide / Nunito Sans",
    base: "aria",
    style: "playful",
    baseColor: "neutral",
    theme: "orange",
    chartColor: "orange",
    iconLibrary: "lucide",
    font: "nunito-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Sketchy.
  {
    name: "base-sketchy",
    title: "Sketchy (Base)",
    description: "Sketchy / Lucide / Patrick Hand",
    base: "base",
    style: "sketchy",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "patrick-hand",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-sketchy",
    title: "Sketchy (Radix)",
    description: "Sketchy / Lucide / Patrick Hand",
    base: "radix",
    style: "sketchy",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "patrick-hand",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-sketchy",
    title: "Sketchy (Aria)",
    description: "Sketchy / Lucide / Patrick Hand",
    base: "aria",
    style: "sketchy",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "patrick-hand",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Luxury.
  {
    name: "base-luxury",
    title: "Luxury (Base)",
    description: "Luxury / Lucide / EB Garamond + Playfair Display",
    base: "base",
    style: "luxury",
    baseColor: "taupe",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "eb-garamond",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-luxury",
    title: "Luxury (Radix)",
    description: "Luxury / Lucide / EB Garamond + Playfair Display",
    base: "radix",
    style: "luxury",
    baseColor: "taupe",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "eb-garamond",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-luxury",
    title: "Luxury (Aria)",
    description: "Luxury / Lucide / EB Garamond + Playfair Display",
    base: "aria",
    style: "luxury",
    baseColor: "taupe",
    theme: "amber",
    chartColor: "amber",
    iconLibrary: "lucide",
    font: "eb-garamond",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Organic.
  {
    name: "base-organic",
    title: "Organic (Base)",
    description: "Organic / Lucide / DM Sans + Lora",
    base: "base",
    style: "organic",
    baseColor: "olive",
    theme: "olive",
    chartColor: "olive",
    iconLibrary: "lucide",
    font: "dm-sans",
    fontHeading: "lora",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-organic",
    title: "Organic (Radix)",
    description: "Organic / Lucide / DM Sans + Lora",
    base: "radix",
    style: "organic",
    baseColor: "olive",
    theme: "olive",
    chartColor: "olive",
    iconLibrary: "lucide",
    font: "dm-sans",
    fontHeading: "lora",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-organic",
    title: "Organic (Aria)",
    description: "Organic / Lucide / DM Sans + Lora",
    base: "aria",
    style: "organic",
    baseColor: "olive",
    theme: "olive",
    chartColor: "olive",
    iconLibrary: "lucide",
    font: "dm-sans",
    fontHeading: "lora",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Maximalist.
  {
    name: "base-maximalist",
    title: "Maximalist (Base)",
    description: "Maximalist / Lucide / Montserrat + Playfair Display",
    base: "base",
    style: "maximalist",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "montserrat",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-maximalist",
    title: "Maximalist (Radix)",
    description: "Maximalist / Lucide / Montserrat + Playfair Display",
    base: "radix",
    style: "maximalist",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "montserrat",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-maximalist",
    title: "Maximalist (Aria)",
    description: "Maximalist / Lucide / Montserrat + Playfair Display",
    base: "aria",
    style: "maximalist",
    baseColor: "neutral",
    theme: "red",
    chartColor: "red",
    iconLibrary: "lucide",
    font: "montserrat",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // iOS.
  {
    name: "base-ios",
    title: "iOS (Base)",
    description: "iOS / Lucide / Inter",
    base: "base",
    style: "ios",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-ios",
    title: "iOS (Radix)",
    description: "iOS / Lucide / Inter",
    base: "radix",
    style: "ios",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-ios",
    title: "iOS (Aria)",
    description: "iOS / Lucide / Inter",
    base: "aria",
    style: "ios",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Fluent.
  {
    name: "base-fluent",
    title: "Fluent (Base)",
    description: "Fluent / Lucide / Public Sans",
    base: "base",
    style: "fluent",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "public-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-fluent",
    title: "Fluent (Radix)",
    description: "Fluent / Lucide / Public Sans",
    base: "radix",
    style: "fluent",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "public-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-fluent",
    title: "Fluent (Aria)",
    description: "Fluent / Lucide / Public Sans",
    base: "aria",
    style: "fluent",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "public-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Carbon.
  {
    name: "base-carbon",
    title: "Carbon (Base)",
    description: "Carbon / Lucide / IBM Plex Sans",
    base: "base",
    style: "carbon",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-carbon",
    title: "Carbon (Radix)",
    description: "Carbon / Lucide / IBM Plex Sans",
    base: "radix",
    style: "carbon",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-carbon",
    title: "Carbon (Aria)",
    description: "Carbon / Lucide / IBM Plex Sans",
    base: "aria",
    style: "carbon",
    baseColor: "neutral",
    theme: "blue",
    chartColor: "blue",
    iconLibrary: "lucide",
    font: "ibm-plex-sans",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
]

export function getThemesForBaseColor(baseColorName: string) {
  const baseColorNames = BASE_COLORS.map((bc) => bc.name)

  return THEMES.filter((theme) => {
    if (theme.name === baseColorName) {
      return true
    }
    return !baseColorNames.includes(theme.name)
  })
}

export function getBase(name: BaseName) {
  return BASES.find((base) => base.name === name)
}

export function getStyle(name: StyleName) {
  return STYLES.find((style) => style.name === name)
}

export function getTheme(name: ThemeName) {
  return THEMES.find((theme) => theme.name === name)
}

export function getBaseColor(name: BaseColorName) {
  return BASE_COLORS.find((color) => color.name === name)
}

export function getIconLibrary(name: IconLibraryName) {
  return iconLibraries[name]
}

export function parseRegistryBaseParts(value: string | null) {
  if (value === null) {
    return { success: true as const, parts: undefined }
  }

  const aliases: Record<string, RegistryBasePart> = {
    theme: "theme",
    font: "font",
    fonts: "font",
  }
  const rawParts = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
  const invalid = rawParts.filter((part) => !aliases[part])

  if (!rawParts.length || invalid.length) {
    return {
      success: false as const,
      error: `Invalid only value. Use one or more of: ${REGISTRY_BASE_PARTS.join(", ")}`,
    }
  }

  return {
    success: true as const,
    parts: Array.from(new Set(rawParts.map((part) => aliases[part]))),
  }
}

// Builds a registry:theme item from a design system config.
export function buildRegistryTheme(config: DesignSystemConfig) {
  const baseColor = getBaseColor(config.baseColor)
  const theme = getTheme(config.theme)

  if (!baseColor || !theme) {
    throw new Error(
      `Base color "${config.baseColor}" or theme "${config.theme}" not found`
    )
  }

  // Merge base color and theme CSS vars.
  const lightVars: Record<string, string> = {
    ...(baseColor.cssVars?.light as Record<string, string>),
    ...(theme.cssVars?.light as Record<string, string>),
  }
  const darkVars: Record<string, string> = {
    ...(baseColor.cssVars?.dark as Record<string, string>),
    ...(theme.cssVars?.dark as Record<string, string>),
  }
  const themeVars: Record<string, string> = {}

  // Apply chart color override.
  const chartTheme = getTheme(config.chartColor)
  if (chartTheme) {
    const chartLight = chartTheme.cssVars?.light as Record<string, string>
    const chartDark = chartTheme.cssVars?.dark as Record<string, string>
    for (let i = 1; i <= 5; i++) {
      const key = `chart-${i}`
      if (chartLight?.[key]) lightVars[key] = chartLight[key]
      if (chartDark?.[key]) darkVars[key] = chartDark[key]
    }
  }

  // Apply menu accent transformation.
  if (config.menuAccent === "bold") {
    lightVars.accent = lightVars.primary
    lightVars["accent-foreground"] = lightVars["primary-foreground"]
    darkVars.accent = darkVars.primary
    darkVars["accent-foreground"] = darkVars["primary-foreground"]
    // lightVars["sidebar-accent"] = lightVars.primary
    // lightVars["sidebar-accent-foreground"] = lightVars["primary-foreground"]
    // darkVars["sidebar-accent"] = darkVars.primary
    // darkVars["sidebar-accent-foreground"] = darkVars["primary-foreground"]
  }

  // Apply radius transformation.
  if (config.radius && config.radius !== "default") {
    const radius = RADII.find((r) => r.name === config.radius)
    if (radius && radius.value) {
      lightVars.radius = radius.value
    }
  }

  return {
    name: `${config.baseColor}-${config.theme}`,
    type: "registry:theme" as const,
    cssVars: {
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
      light: lightVars,
      dark: darkVars,
    },
  }
}

export function buildThemeForPreset(config: DesignSystemConfig) {
  const registryTheme = buildRegistryTheme(config)
  const radius = RADII.find((r) => r.name === config.radius)
  const radiusValue =
    config.radius === "default"
      ? (registryTheme.cssVars?.light?.radius ?? DEFAULT_RADIUS_VALUE)
      : (radius?.value ?? registryTheme.cssVars?.light?.radius)

  return registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: registryTheme.name,
    type: "registry:theme",
    cssVars: {
      ...registryTheme.cssVars,
      light: {
        ...registryTheme.cssVars.light,
        ...(radiusValue && { radius: radiusValue }),
      },
    },
  })
}

// Builds a registry:base item from a design system config.
export function buildRegistryBase(config: DesignSystemConfig) {
  const baseItem = getBase(config.base)
  const iconLibraryItem = getIconLibrary(config.iconLibrary)
  const normalizedFontHeading =
    config.fontHeading === config.font ? "inherit" : config.fontHeading

  if (!baseItem || !iconLibraryItem) {
    throw new Error(
      `Base "${config.base}" or icon library "${config.iconLibrary}" not found`
    )
  }

  const registryTheme = buildRegistryTheme(config)

  // Build dependencies.
  const dependencies = [
    `shadcn@${SHADCN_VERSION}`,
    "class-variance-authority",
    "cn",
    "tw-animate-css",
    ...(baseItem.dependencies ?? []),
    ...iconLibraryItem.packages,
  ]

  const registryDependencies = ["utils"]
  const themeVars = {
    ...(registryTheme.cssVars?.theme ?? {}),
    ...(normalizedFontHeading === "inherit"
      ? { "--font-heading": getInheritedHeadingFontValue(config.font) }
      : {}),
  }

  if (config.font) {
    registryDependencies.push(`font-${config.font}`)
  }

  if (normalizedFontHeading !== "inherit") {
    registryDependencies.push(`font-heading-${normalizedFontHeading}`)
  }

  return {
    name: `${config.base}-${config.style}`,
    extends: "none",
    type: "registry:base" as const,
    config: {
      style: `${config.base}-${config.style}`,
      iconLibrary: iconLibraryItem.name,
      rtl: config.rtl,
      menuColor: config.menuColor,
      menuAccent: config.menuAccent,
      tailwind: {
        baseColor: config.baseColor,
      },
    },
    dependencies,
    registryDependencies,
    cssVars: {
      ...registryTheme.cssVars,
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
    },
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
        ...(config.pointer && {
          [POINTER_CURSOR_SELECTOR]: {
            cursor: "pointer",
          },
        }),
      },
    },
    ...(config.rtl && {
      docs: `To learn how to set up the RTL provider and fonts for your app, see https://ui.shadcn.com/docs/rtl/${config.template === "next-monorepo" ? "next" : (config.template ?? "next")}`,
    }),
  }
}

export function buildPartialRegistryBase(
  config: DesignSystemConfig,
  parts: RegistryBasePart[]
) {
  const uniqueParts = Array.from(new Set(parts))
  const normalizedFontHeading =
    config.fontHeading === config.font ? "inherit" : config.fontHeading
  const partialConfig: {
    menuColor?: DesignSystemConfig["menuColor"]
    menuAccent?: DesignSystemConfig["menuAccent"]
    tailwind?: {
      baseColor?: string
    }
  } = {}
  const registryDependencies: string[] = []
  const cssVars: NonNullable<RegistryItem["cssVars"]> = {}

  if (uniqueParts.includes("theme")) {
    const registryTheme = buildRegistryTheme(config)

    partialConfig.menuColor = config.menuColor
    partialConfig.menuAccent = config.menuAccent
    partialConfig.tailwind = {
      baseColor: config.baseColor,
    }

    if (registryTheme.cssVars.theme) {
      cssVars.theme = {
        ...(cssVars.theme ?? {}),
        ...registryTheme.cssVars.theme,
      }
    }
    cssVars.light = {
      ...(cssVars.light ?? {}),
      ...registryTheme.cssVars.light,
    }
    cssVars.dark = {
      ...(cssVars.dark ?? {}),
      ...registryTheme.cssVars.dark,
    }
  }

  if (uniqueParts.includes("font")) {
    registryDependencies.push(`font-${config.font}`)

    if (normalizedFontHeading !== "inherit") {
      registryDependencies.push(`font-heading-${normalizedFontHeading}`)
    } else {
      cssVars.theme = {
        ...(cssVars.theme ?? {}),
        "--font-heading": getInheritedHeadingFontValue(config.font),
      }
    }
  }

  return {
    name: `${config.base}-${config.style}-${uniqueParts.join("-")}`,
    extends: "none",
    type: "registry:base" as const,
    ...(Object.keys(partialConfig).length > 0 && { config: partialConfig }),
    ...(registryDependencies.length > 0 && { registryDependencies }),
    ...(Object.keys(cssVars).length > 0 && { cssVars }),
  } satisfies RegistryItem
}
