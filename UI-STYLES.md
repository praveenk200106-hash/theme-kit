# UI Styles Reference

A catalog of visual UI styles to support as theme presets, plus layout patterns and modes that cut across every theme.

## Theme presets (expressible as design tokens)

1. **Minimalist / Flat** — Clean layouts, generous whitespace, limited colors, simple typography, no shadows or gradients. Best for SaaS dashboards, productivity apps, business tools. Examples: Linear, Vercel, shadcn default.
2. **Swiss / Editorial** — Structured grids, strong typographic hierarchy, precise alignment, often black and white with one accent. Best for editorial sites, portfolios, documentation.
3. **Monochrome** — Single hue or grayscale with one accent color for actions. Best for focused tools and reading-heavy products.
4. **Material Design** — Layered surfaces, elevation via shadows, bold color, ripple motion, consistent component patterns. Best for Android-adjacent and enterprise apps.
5. **Material You (Material 3)** — Dynamic tonal palettes, large rounded shapes, expressive color. Best for consumer apps.
6. **Neumorphism / Soft UI** — Paired light and dark shadows make elements appear raised from or pressed into the background. Low contrast, pastel. Best for experimental interfaces, control panels, music players.
7. **Skeuomorphic** — Realistic textures, gradients, bevels mimicking physical objects. Best for niche creative tools, nostalgic products.
8. **Claymorphism** — Chunky rounded shapes, inner shadows, pastel 3D clay look. Best for playful landing pages, kids and education apps.
9. **Glassmorphism** — Frosted blur panels, semi-transparency, thin light borders, layered backgrounds. Best for AI products, futuristic dashboards, creative apps. Examples: macOS, visionOS, Windows Acrylic.
10. **Liquid Glass** — Refractive, specular glass with dynamic light response and morphing layers (Apple 2025). Best for premium consumer apps.
11. **Aurora / Mesh Gradient** — Soft blurred color blobs behind translucent cards. Best for SaaS landing pages, hero sections.
12. **Neo-brutalism** — Thick black borders, hard offset shadows, high-saturation flat colors, bold type. Best for creative startups, indie products, marketing sites. Examples: Gumroad, Figma marketing.
12b. **Neo-brutalist Sticker** — Die-cut sticker look. Single ink outline on every element, hard offset shadow with zero blur, flat saturated fills on an off-white paper background, pill and rounded-rect shapes, small random rotation on tags and chips, press-and-lift hover motion, speech-bubble cards, dashed outline for disabled state. Heavy display grotesque plus neutral body font. Best for creator tools, consumer apps, playful brands. Reference: reelbase old-design.html. Related: Cartoon UI, Comic UI, Pop Art UI.

    Token spec from the reference:
    - Border: 2.5px solid ink (2px on small chips)
    - Shadow: offset only, ink color, steps 3 / 4 / 5 / 6 / 9px, no blur
    - Radius: 12, 14, 16, 22, 28, 32, 36px and pill
    - Rotation jitter: -5deg to 5deg on floating tags and piles
    - Hover: translate(-2px,-2px) and shadow grows 2px
    - Active: translate(3px,3px) and shadow shrinks to 1px
    - Motion: 120ms ease
    - Fonts: Bricolage Grotesque 800 display, Hanken Grotesk body
    - Accent mechanic: one CSS variable swaps the stage or surface color per mood

13. **Brutalist** — Raw HTML-like look, default fonts, sharp edges, deliberately unconventional layouts. Best for creative portfolios, experimental and editorial sites.
14. **Memphis / Pop** — Geometric shapes, clashing bright colors, patterns, 80s influence. Best for brand sites, event pages.
15. **Retro / Vintage** — Muted palettes, grain textures, serif or display fonts, aged paper feel. Best for lifestyle brands, blogs.
16. **Y2K** — Chrome, metallic gradients, bubbly shapes, iridescent colors, pixel elements. Best for fashion, music, Gen-Z brands.
17. **Pixel / 8-bit** — Pixel fonts, blocky borders, limited palettes. Best for games, dev tools, hobby projects.
18. **Terminal / Hacker** — Monospace fonts, dark background, green or amber text, ASCII dividers. Best for developer tools, CLIs, security products.
19. **Cyberpunk / Synthwave / Futuristic** — Neon on black, magenta and cyan, glow effects, glitch accents, sci-fi elements. Best for gaming, crypto, entertainment.
20. **Developer / Dashboard** — Dense information, monospace numbers, compact spacing, muted palette. Best for analytics, infra consoles. Examples: Vercel, Supabase, Grafana.
21. **Playful / Rounded** — Large radii, pastel colors, friendly illustrations, bouncy motion and micro-interactions. Best for consumer and education apps. Examples: Duolingo, Notion marketing.
22. **Hand-drawn / Sketchy** — Wobbly borders, marker-like strokes, paper textures. Best for whiteboarding, note-taking, creative tools. Example: Excalidraw.
23. **Luxury / Premium** — Thin serifs, gold or champagne accents, black and cream, wide letter spacing, restrained color, high-quality imagery. Best for fashion, hospitality, finance.
24. **Organic** — Earthy colors, natural shapes, soft curves, nature-inspired visuals. Best for wellness, sustainability, food brands.
25. **Maximalist** — Dense layouts, layered textures, bold type mixing. Best for fashion, culture, art sites.
26. **iOS / Human Interface Guidelines** — Large titles, SF typeface, blurred navigation bars, pill controls. Best for Apple-platform-feeling web apps.
27. **Fluent (Windows 11)** — Mica and Acrylic materials, 8px rounded corners, Segoe UI, reveal highlights. Best for Windows-adjacent tools.
28. **Carbon / Enterprise** — Sharp corners, dense data tables, conservative palette, strict grid. Best for B2B and enterprise software. Examples: IBM Carbon, Atlassian, Ant Design.

## Cross-cutting (not presets)

- **Dark mode / OLED** — A color mode every preset must support. True black or near-black surfaces, elevation via lighter surfaces rather than shadows.
- **Bento Grid** — A layout component: content arranged in rounded tiles of varying size. Works with any preset.
- **Kinetic / Motion-first** — A motion intensity setting (none, subtle, expressive) rather than a visual theme.
- **Microinteraction-heavy** — Hover, press, and transition feedback on controls. Also a motion setting.

## Token dimensions that differentiate presets

- Border radius scale
- Border width and color
- Shadow style (none, soft, hard offset, layered elevation, inner)
- Backdrop blur and surface opacity
- Color saturation and contrast
- Font pairing (sans, serif, mono, display, pixel)
- Spacing density (compact, comfortable, spacious)
- Motion intensity

## Suggested first batch of presets

Default Minimal, Neo-brutalist Sticker, Material, Glassmorphism, Neo-brutalism, Neumorphism, Terminal, Retro, Playful, Luxury, Organic, Cyberpunk.
