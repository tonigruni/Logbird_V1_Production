# Logbird – Design System

Sourced from Figma file: `aWTiyX4DB1CfCaolgkK7Sr`

## Colors
| Token | Hex | Usage |
|---|---|---|
| `background` | `#ffffff` | Page background |
| `surface` | `#ffffff` | Cards, panels, sidebar |
| `surface-2` | `#f2f4f4` | Inputs, row backgrounds |
| `surface-3` | `#e4e9ea` | Hover states, active nav |
| `primary` | `#1F3649` | Dark navy — brand primary, buttons, active states, links |
| `primary-dark` | `#162838` | Hover on primary |
| `primary-dark-alt` | `#213233` | Dark teal variant |
| `text-primary` | `#2d3435` | Body text |
| `text-muted` | `#5a6061` | Secondary / supporting text |
| `text-faint` | `#adb3b4` | Disabled / placeholder |
| `border` | `#ECEFF2` | Card strokes, sidebar divider |
| `success` | `#22c55e` | Success states |
| `warning` | `#f59e0b` | Warning states |
| `error` | `#9f403d` | Error / danger states |

## Typography
- **Headings (h1–h6):** Satoshi (Fontshare) — token: `--font-heading`
- **Body / paragraphs:** DM Sans (Google Fonts) — token: `--font-sans`
- **Mono:** JetBrains Mono (code blocks, API keys) — token: `--font-mono`

## Component Classes (global CSS)
Use these classes directly — do not recreate them inline.

### `.card`
- Corner radius: 15px (token: `--card-radius`)
- Border: 1px solid `#ECEFF2` (token: `--card-border-color`)
- Shadow: none
- Usage: `<div className="bg-surface card p-8">`

### `.input`
- Width: 100%, border-radius: 15px
- Border: 1px solid `#ECEFF2`, background: `surface`
- Padding: `0.75rem 1rem`, font-size: `0.875rem`
- Subtle shadow, transitions on focus
- Focus ring: `rgba(31,54,73,0.1)` with border `rgba(31,54,73,0.3)`
- Usage: `<input className="input" />` or `<select className="input">`

## Border Radius
- Default: `1rem` (`--radius-default`)
- Large: `2rem` (`--radius-lg`)
- XL / 2XL: `3rem` (`--radius-xl`, `--radius-2xl`)

## Shadows
- Cards: none
- Elevated cards: `0 10px 40px rgba(45,52,53,0.06)` (`--shadow-card`)
- Dropdowns: `0 12px 44px rgba(45,52,53,0.08)` (`--shadow-dropdown`)
- Hover: `0 15px 50px rgba(45,52,53,0.09)` (`--shadow-card-hover`)

## Sidebar
- Width: 288px (token: `--sidebar-width`)
- Background: white (`background`)
- Right border: 1px solid `#ECEFF2` (tokens: `--sidebar-border-color`, `--sidebar-border-width`)
- Logo: `Logo complete dark.png` at `h-12`
- Inactive link: SemiBold, `text-muted`
- Active link: Bold, white text, `bg-[#1F3649]`
- Icons: 18px, strokeWidth 1.5, Lucide

## Background Pattern
- Main content area only (not sidebar, not top bar)
- Dot grid: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)`
- Size: `20px 20px`, offset: `10px 10px`

## Branding
- Platform name: **Logbird**
- Browser tab title: `Logbird — You're the metric.`
- Favicon: `logbird favicon.png`
- Full logo: `Logo complete dark.png`

## Key Patterns
- Clean white aesthetic — NOT dark
- Cards have a thin border, no shadow
- Single brand color `#1F3649` for all interactive elements (buttons, links, active nav)
- Satoshi for headings, DM Sans for body text
- JetBrains Mono for code / monospace content
