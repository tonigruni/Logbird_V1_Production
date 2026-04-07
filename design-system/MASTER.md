# Personal OS – Design System

Sourced from Figma file: `aWTiyX4DB1CfCaolgkK7Sr`

## Colors
| Token | Hex | Usage |
|---|---|---|
| `background` | `#eeedeb` | Warm beige-gray page background |
| `surface` | `#ffffff` | Cards, panels, sidebar |
| `surface-2` | `#f4f3f1` | Inputs, row backgrounds |
| `surface-3` | `#e8e7e4` | Hover states, active nav |
| `border` | `#e0dedd` | Default borders |
| `border-light` | `#d0cfcc` | Stronger borders |
| `primary` | `#313344` | Dark navy — main text, buttons, brand |
| `accent` | `#6b63f5` | Purple — highlights, progress bars, active |
| `text-primary` | `#313344` | Body text |
| `text-muted` | `rgba(49,51,68,0.45)` | Secondary/disabled text |

## Typography
- **Font:** Open Sans (Google Fonts)
- **Weights:** 400 Regular, 600 SemiBold, 700 Bold, 800 ExtraBold
- **Headings:** Bold (700)
- **Nav labels:** SemiBold (600), active = Bold (700)
- **Body:** Regular (400)

## Border Radius
- Page containers: `rounded-[40px]` (40px) — Figma `page` token
- Cards / panels: `rounded-2xl` (24px) — Figma `card` token
- Inputs / buttons: `rounded-xl` (12px)
- Small chips: `rounded-lg` (8px)

## Shadows
- Cards: `shadow-card` = `0 2px 12px rgba(49,51,68,0.08)`
- Dropdowns: `shadow-dropdown` = `0 4px 16px rgba(49,51,68,0.12)`

## Sidebar
- Width: `w-52` (208px)
- Background: white (`surface`)
- Inactive link: SemiBold, `text-text-secondary`
- Active link: Bold, `text-text-primary`, `bg-surface-3`
- Icons: 17px, strokeWidth 1.8, Lucide

## Key Patterns
- Warm light aesthetic — NOT dark
- Large rounded containers with soft drop shadows
- Minimal borders, subtle dividers
- Open Sans everywhere — no other font
