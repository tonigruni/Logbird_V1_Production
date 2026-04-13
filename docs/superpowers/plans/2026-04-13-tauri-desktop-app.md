# Logbird Desktop App — Tauri v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing Logbird Vite/React app in a Tauri v2 native macOS window with an overlay titlebar, while keeping the Vercel web build fully intact.

**Architecture:** Tauri adds a `src-tauri/` Rust shell alongside the existing `src/`. The Vite dev server runs as normal; Tauri opens a WKWebView window pointed at it. Production builds produce both a `dist/` (web) and a `.app` bundle (desktop) from the same codebase.

**Tech Stack:** Tauri v2, Rust (developer machine only), `@tauri-apps/cli`, `@tauri-apps/api`, `tauri-plugin-window-state`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src-tauri/tauri.conf.json` | Create | Window config: overlay titlebar, size, identifier |
| `src-tauri/src/main.rs` | Create | Rust entry point, registers window-state plugin |
| `src-tauri/Cargo.toml` | Create | Rust deps: tauri 2, tauri-plugin-window-state |
| `src-tauri/build.rs` | Create | Required Tauri build script |
| `src-tauri/icons/` | Create | App icons (generated from source PNG) |
| `src-tauri/capabilities/default.json` | Create | Tauri v2 permission declarations |
| `package.json` | Modify | Add `"tauri": "tauri"` script |
| `src/components/Layout/Sidebar.tsx` | Modify | Add top clearance for macOS traffic lights |

---

## Task 1: Verify Rust toolchain

This task is manual — no code to write, just prerequisite verification.

- [ ] **Step 1: Check if Rust is installed**

```bash
rustc --version
cargo --version
```

Expected: version numbers printed. If not installed, run:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
Then restart your terminal and re-run the check.

- [ ] **Step 2: Check Xcode Command Line Tools**

```bash
xcode-select -p
```

Expected: a path like `/Library/Developer/CommandLineTools`. If not:
```bash
xcode-select --install
```

- [ ] **Step 3: Commit nothing** — this task has no file changes.

---

## Task 2: Add Tauri npm packages

- [ ] **Step 1: Install packages**

```bash
cd /path/to/Logbird_V1_Staging
npm install --save-dev @tauri-apps/cli@latest
npm install @tauri-apps/api@latest
```

- [ ] **Step 2: Add tauri script to package.json**

In `package.json`, add to the `"scripts"` object:

```json
"tauri": "tauri"
```

So `scripts` now includes:
```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "tauri": "tauri"
}
```

- [ ] **Step 3: Verify CLI works**

```bash
npx tauri --version
```

Expected: `tauri-cli 2.x.x`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tauri v2 cli and api packages"
```

---

## Task 3: Scaffold src-tauri directory

- [ ] **Step 1: Run tauri init**

```bash
npx tauri init
```

Answer the interactive prompts exactly as follows:
- App name: `Logbird`
- Window title: `Logbird`
- Where are your web assets: `../dist`
- What is your dev server URL: `http://localhost:5173`
- What is your frontend dev command: `npm run dev`
- What is your frontend build command: `npm run build`

This creates `src-tauri/` with `tauri.conf.json`, `Cargo.toml`, `build.rs`, `src/main.rs`, and `icons/`.

- [ ] **Step 2: Verify the scaffold**

```bash
ls src-tauri/
```

Expected output (at minimum):
```
Cargo.toml  build.rs  icons  src  tauri.conf.json
```

- [ ] **Step 3: Commit the scaffold**

```bash
git add src-tauri/
git commit -m "chore: scaffold tauri v2 src-tauri directory"
```

---

## Task 4: Configure tauri.conf.json

Replace the generated `src-tauri/tauri.conf.json` with the following. This sets the overlay titlebar, window dimensions, and bundle identifier.

- [ ] **Step 1: Overwrite tauri.conf.json**

Write this to `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Logbird",
  "version": "0.1.0",
  "identifier": "com.logbird.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "Logbird",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "titleBarStyle": "Overlay"
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/tauri.conf.json
git commit -m "feat: configure tauri window — overlay titlebar, 1200x800, logbird identifier"
```

---

## Task 5: Add window-state plugin (remember window size/position)

- [ ] **Step 1: Update src-tauri/Cargo.toml**

Open `src-tauri/Cargo.toml`. Find the `[dependencies]` section and add `tauri-plugin-window-state`:

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-window-state = "2"
```

(Keep any other lines that `tauri init` generated — just add the plugin line.)

- [ ] **Step 2: Register the plugin in src-tauri/src/main.rs**

Replace the contents of `src-tauri/src/main.rs` with:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Create the capabilities file**

Tauri v2 uses a permissions system. Create `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default permissions for Logbird desktop",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "window-state:default"
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/src/main.rs src-tauri/capabilities/
git commit -m "feat: add window-state plugin — persists window size and position"
```

---

## Task 6: Add traffic lights clearance to Sidebar

The macOS overlay titlebar places the traffic lights (red/yellow/green dots) at approximately 10px from the top and 12px from the left of the window. The Sidebar occupies the left column, so its top must clear ~30px to avoid content sitting under the dots.

We only apply this padding when running inside Tauri (not in the browser).

- [ ] **Step 1: Add Tauri detection to src/main.tsx**

Open `src/main.tsx`. At the top of the file (before `ReactDOM.createRoot`), add:

```ts
// Mark the document when running inside Tauri desktop app
if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
  document.documentElement.setAttribute('data-tauri', '')
}
```

- [ ] **Step 2: Open Sidebar.tsx and find the top wrapper element**

Read `src/components/Layout/Sidebar.tsx` and locate the outermost `<div>` or `<nav>` that wraps the sidebar content. It will be something like:

```tsx
<aside className="...">
  {/* logo / app name at top */}
  ...
</aside>
```

- [ ] **Step 3: Add CSS clearance for the traffic lights zone**

In `src/index.css` (or wherever global styles live), add:

```css
/* Desktop: clear space for macOS traffic lights on overlay titlebar */
[data-tauri] aside,
[data-tauri] nav[data-sidebar] {
  padding-top: 30px;
}
```

If the sidebar element uses a specific className (e.g. `class="w-64 ..."`), use a more targeted selector. The goal is: when `data-tauri` is on `<html>`, the sidebar's top gets 30px extra padding.

Alternatively, apply it directly in `Sidebar.tsx` using a conditional class:

```tsx
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

// In JSX, on the outermost sidebar element:
<aside className={cn('...existing classes...', isTauri && 'pt-[30px]')}>
```

Use whichever approach fits the existing code style.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/components/Layout/Sidebar.tsx src/index.css
git commit -m "feat: add traffic lights clearance to sidebar for tauri desktop mode"
```

---

## Task 7: Generate app icons

Tauri requires icons in multiple sizes. If you have a Logbird logo PNG (at least 1024×1024), use the Tauri icon generator. Otherwise use a placeholder for now.

- [ ] **Step 1: Place a source icon**

Copy or create a square PNG (1024×1024 or larger) as `src-tauri/icons/app-icon.png`.

If you don't have one yet, create a simple placeholder:
```bash
# Quick placeholder — a 1024x1024 solid color PNG using ImageMagick (if installed)
magick -size 1024x1024 xc:'#0C1629' src-tauri/icons/app-icon.png
```

- [ ] **Step 2: Generate all required icon sizes**

```bash
npx tauri icon src-tauri/icons/app-icon.png
```

This overwrites `src-tauri/icons/` with all required formats (32x32, 128x128, .icns, .ico, etc.).

- [ ] **Step 3: Commit**

```bash
git add src-tauri/icons/
git commit -m "chore: add tauri app icons"
```

---

## Task 8: Verify dev workflow

- [ ] **Step 1: Confirm web build still works**

```bash
npm run build
```

Expected: exits with no errors, `dist/` is populated.

- [ ] **Step 2: Run Tauri dev (first run compiles Rust — takes 2-5 min)**

```bash
npm run tauri dev
```

Expected:
1. Vite dev server starts on port 5173
2. Rust compiles (first time only — subsequent runs are fast)
3. A native macOS window opens showing the Logbird app
4. No browser chrome — just the app content with traffic lights in the top-left corner
5. Sidebar content starts below the traffic lights (30px clearance)
6. HMR still works — edit a component and see it update live

- [ ] **Step 3: Verify window state persists**

Resize and move the window, then quit with Cmd+Q. Run `npm run tauri dev` again — the window should reopen at the same size and position.

- [ ] **Step 4: Verify web deploy is unaffected**

```bash
npm run build
```

Expected: same output as step 1 — Tauri changes have no effect on the web build.

---

## Task 9: Verify production build

- [ ] **Step 1: Build the .app bundle**

```bash
npm run tauri build
```

Expected (after a longer compile): 
```
    Finished building [bundle target]
    Bundled your app at src-tauri/target/release/bundle/macos/Logbird.app
```

- [ ] **Step 2: Test the .app directly**

```bash
open src-tauri/target/release/bundle/macos/Logbird.app
```

Expected: Logbird opens as a standalone app, no terminal needed, no browser.

- [ ] **Step 3: Commit any final cleanup and tag**

```bash
git add -A
git commit -m "feat: logbird desktop app — tauri v2 native window phase 1"
```

---

## Troubleshooting Reference

| Problem | Likely cause | Fix |
|---|---|---|
| `tauri dev` fails with Rust compile error | Missing Xcode CLT or wrong Rust version | Run `xcode-select --install` and `rustup update` |
| Window content overlaps traffic lights | Sidebar padding not applied | Check `data-tauri` attribute is set on `<html>` in DevTools |
| HMR not working | Vite port conflict | Ensure `devUrl` in `tauri.conf.json` matches actual Vite port |
| `tauri build` fails with signing error | No Apple Developer cert | For personal use: disable signing in tauri.conf.json under `bundle.macOS.signingIdentity: null` |
| `window-state` plugin not found | Cargo.lock mismatch | Run `cargo update` in `src-tauri/` |
