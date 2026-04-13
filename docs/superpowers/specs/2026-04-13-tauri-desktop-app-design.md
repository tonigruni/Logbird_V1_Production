# Logbird Desktop App — Design Spec
**Date:** 2026-04-13  
**Scope:** Phase 1 — Native window via Tauri v2

---

## Goal

Turn Logbird into a native macOS desktop application with a custom titlebar and native `.app` bundle, while keeping the existing web deployment (Vercel) fully intact.

---

## Architecture

Tauri v2 adds a thin Rust shell around the existing Vite/React frontend. No frontend code changes are required. Two processes run at runtime:

- **Webview process** — the existing React app, unchanged, rendered in macOS WKWebView
- **Core process (Rust)** — manages the native window, titlebar, and app lifecycle

New files added to the repo:
- `src-tauri/` — Rust entry point (`main.rs`), `Cargo.toml`, `tauri.conf.json`, icons
- `@tauri-apps/cli` added as a dev dependency
- `@tauri-apps/api` added as a runtime dependency (for future native API calls)

Existing files untouched:
- All of `src/` — React components, pages, stores, hooks
- `vite.config.ts` — Tauri Vite plugin appended, existing config preserved
- `vercel.json`, web deployment pipeline — unchanged

---

## Window Configuration

- **Titlebar style:** `overlay` (macOS) — hides the default bar, keeps traffic light buttons inset over content
- **Default size:** 1200 × 800
- **Minimum size:** 800 × 600
- **Window state:** Tauri's `window-state` plugin persists position and size across launches
- **Title:** `Logbird`

### Sidebar padding

The sidebar (or leftmost column) gets `padding-top` equal to the titlebar area height so content doesn't render under the traffic lights. Use the CSS env variable `env(titlebar-area-height, 28px)` or a fixed `28px` top padding on the sidebar wrapper.

---

## Build Targets

| Command | Output | Used for |
|---|---|---|
| `npm run dev` | Browser (localhost) | Web development |
| `npm run tauri dev` | Native window + HMR | Desktop development |
| `npm run build` | `dist/` | Vercel web deployment |
| `npm run tauri build` | `src-tauri/target/release/bundle/` | `.app` + `.dmg` |

Both targets share 100% of the frontend codebase. No conditional logic needed in React code for phase 1.

---

## Platform

- **Primary target:** macOS (developer's machine)
- **Cross-platform:** Tauri supports Windows/Linux; not in scope for phase 1 but requires no extra work to enable later

---

## Out of Scope (Phase 1)

The following are explicitly deferred to future phases:

- Offline mode / local data sync
- System tray / menu bar icon
- Global keyboard shortcut (quick capture)
- Auto-updater
- Windows / Linux builds
- Deep linking or protocol handlers

---

## Prerequisites (Developer Machine Only)

Users receive a compiled `.app` with no external dependencies. The developer must have:

- Rust toolchain (`rustup`) installed
- Xcode Command Line Tools
- `tauri-cli` (installed via npm as a dev dependency — no global install needed)

---

## Success Criteria

- [ ] `npm run tauri dev` opens Logbird in a native macOS window
- [ ] Custom titlebar: no browser chrome, traffic lights visible, content does not overlap them
- [ ] `npm run build` still produces a valid web build deployable to Vercel
- [ ] `npm run tauri build` produces a `.app` bundle that launches correctly
- [ ] App window remembers its last size and position on relaunch
