# Logbird Design System

**Figma Source:** `aWTiyX4DB1CfCaolgkK7Sr`
**Last Updated:** April 9, 2026

---

## Colors

### Brand & Surface
| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Primary | `--color-primary` | `#1F3649` | Buttons, links, active states |
| Primary Hover | — | `#2a4a63` | Button hover |
| Primary Dark | `--color-primary-dark` | `#213233` | Darker variant |
| Accent Dark | `--color-accent-dark` | `#162838` | Darker accent |
| Background | `--color-bg` | `#ffffff` | Page background |
| Surface | `--color-surface` | `#ffffff` | Cards, panels |
| Muted | `--color-muted` | `#f2f4f4` | Inputs, secondary backgrounds |
| Container | `--color-container` | `#ebeeef` | Medium gray |
| Container High | `--color-container-high` | `#e4e9ea` | Hover states |
| Container Highest | `--color-container-highest` | `#dde4e5` | Darkest container |

### Text
| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Primary | `--color-text` | `#2d3435` | Body text, headings |
| Muted | `--color-text-muted` | `#5a6061` | Secondary text |
| Faint | `--color-text-faint` | `#adb3b4` | Disabled, placeholder |

### Status
| Token | CSS Variable | Hex |
|---|---|---|
| Success | `--color-success` | `#22c55e` |
| Warning | `--color-warning` | `#f59e0b` |
| Error | `--color-error` | `#9f403d` |

### Borders
| Token | CSS Variable | Hex |
|---|---|---|
| Card Border | `--card-border-color` | `#ECEFF2` |
| Border Light | — | `#e8eaeb` |

---

## Typography

### Font Families
```css
--font-heading: "Satoshi", system-ui, sans-serif   /* Headings */
--font-sans: "DM Sans", system-ui, sans-serif      /* Body, UI labels */
--font-mono: "JetBrains Mono", monospace           /* Code blocks */
```

### Tailwind Font Mapping
```js
sans: ['var(--font-sans)'],       // DM Sans
heading: ['var(--font-heading)'], // Satoshi
mono: ['var(--font-mono)'],       // JetBrains Mono
```

### Text Sizes
| Use | Size |
|---|---|
| Body (editor) | `1.05rem` (16.8px) |
| Small / UI | `text-sm` (14px) |
| Section header | `text-[10px]` |
| Badge | `text-[9px]` |

### Rich Editor (ProseMirror)
- Body: DM Sans, 1.05rem, line-height 1.8, color #5a6061
- h1: 1.6rem, weight 800, #2d3435
- h2: 1.2rem, weight 700, #2d3435
- h3: 1rem, weight 600, #2d3435

---

## Border Radius

| Use | Value | CSS Variable |
|---|---|---|
| Default | `1rem` (16px) | `--radius-default` |
| Cards | `15px` | `--card-radius` |
| Buttons / Nav / Inputs | `15px` | — |
| Small buttons / Icons | `12px` | — |
| Tabs | `10px` | — |
| Large containers | `2rem` (32px) | `--radius-lg` |
| XL | `3rem` (48px) | `--radius-xl` |
| Badges | `9999px` | — |

---

## Shadows

```css
--shadow-sm:          0 2px 12px rgba(45,52,53,0.04);
--shadow-card:        0 10px 40px rgba(45,52,53,0.06);
--shadow-card-hover:  0 15px 50px rgba(45,52,53,0.09);
--shadow-dropdown:    0 12px 44px rgba(45,52,53,0.08);
--shadow-lg:          0 10px 40px rgba(45,52,53,0.10);
--shadow-xl:          0 20px 60px rgba(45,52,53,0.12);
```

**Default cards have NO shadow** — only border.

---

## Copy-Paste Tailwind Classes

### Buttons
```html
<!-- Primary -->
<button class="bg-[#1F3649] text-white px-4 py-2 rounded-[15px] hover:bg-[#2a4a63] transition-colors">

<!-- Secondary -->
<button class="bg-[#f2f4f4] text-[#2d3435] px-4 py-2 rounded-[15px] hover:bg-[#ebeeef]">

<!-- Outline -->
<button class="border border-[#e8eaeb] bg-white px-4 py-2 rounded-[15px] text-[#2d3435] hover:bg-[#f2f4f4]">

<!-- Ghost -->
<button class="text-[#586062] px-4 py-2 hover:bg-[#f2f4f4] rounded-[15px]">
```

### Button Sizes (CVA)
| Size | Classes |
|---|---|
| Default | `h-9 px-4 py-2 rounded-[15px]` |
| Small | `h-8 px-3 text-xs rounded-[12px]` |
| Large | `h-10 px-8 rounded-[15px]` |
| Icon | `h-9 w-9 rounded-[12px]` |

### Cards
```html
<div class="bg-white border border-[#ECEFF2] rounded-[15px] p-4">
```
Or use global `.card` class: `<div class="bg-white card p-4">`

### Inputs
```html
<input class="h-9 rounded-[15px] border border-[#e8eaeb] bg-white px-4 text-sm text-[#2d3435] placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10">
```

### Section Header
```html
<h3 class="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-4 pt-5 pb-2">
```

### Badge / Pill
```html
<span class="text-[9px] px-1.5 py-0.5 bg-[#f2f4f4] text-[#adb3b4] rounded-full font-medium">
```

---

## Layout

### Page Container
```
max-w-[1400px] mx-auto px-4 md:px-12
```

### Sidebar
- Width: `288px` (`--sidebar-width`)
- Background: white, border-right: `1px solid #ECEFF2`
- Padding: `py-8 px-4`
- Logo: `Logo complete dark.png` at `h-12`
- Active link: `bg-[#ECEFF2] text-[#1F3649] font-bold rounded-[15px]`
- Inactive link: `text-[#586062] font-semibold hover:text-[#1F3649]`

### Header
```
bg-white/80 backdrop-blur-xl border-b border-[#f2f4f4] sticky top-0 z-40
max-w-[1400px] mx-auto px-4 md:px-12 py-4 md:py-5
```

### Background Pattern (main content only)
```css
radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)
background-size: 20px 20px; background-position: 10px 10px;
```

### Spacing
| Use | Class |
|---|---|
| Page padding | `px-4 md:px-12` |
| Card padding | `p-4` or `p-6` |
| Item gap | `gap-3` (normal), `gap-1.5` (compact) |
| Section items | `space-y-1` |

### Responsive Breakpoints
- Mobile: default (< 768px)
- Tablet+: `md:` (768px+)
- Desktop: `lg:` (1024px+)

---

## Icons

- **Primary:** `@phosphor-icons/react` — used in sidebar and pages
- **Secondary:** `lucide-react` — used in some layout components

| Context | Size |
|---|---|
| Navigation | `size={20}` |
| Small inline | `size={14}` or `size={15}` |
| Section / UI | `size={16}` or `size={18}` |

---

## Animations

| Class | Duration | Effect |
|---|---|---|
| `animate-pop-in` | 0.3s | Scale + slide in |
| `animate-fade-in` | 0.2s | Fade + slide up |
| `animate-slide-in` | 0.25s | Slide from left |
| `slide-in-right` | 0.38s | Slide from right |
| `slide-out-left` | 0.3s | Slide to left |

---

## Branding

- Platform name: **Logbird**
- Tab title: `Logbird — You're the metric.`
- Favicon: `logbird favicon.png`
- Full logo: `Logo complete dark.png`

---

## Key Source Files

| Purpose | Path |
|---|---|
| Design tokens | `/src/styles/design-system.css` |
| Global CSS | `/src/index.css` |
| Tailwind config | `/tailwind.config.js` |
| Button component | `/src/components/ui/button.tsx` |
| Layout | `/src/components/Layout/AppLayout.tsx` |
| Sidebar | `/src/components/Layout/Sidebar.tsx` |

---

## Rules

- Clean white aesthetic — NOT dark mode
- Cards: thin border, **no shadow**
- Single brand color `#1F3649` for all interactive elements
- Never use `#000000` or pure `#ffffff` for text
- Satoshi for headings, DM Sans for body, JetBrains Mono for code
- Use CSS variables first; only hardcode hex for one-off overrides
