# Daily Check-in Popup — Design Spec
**Date:** 2026-04-19  
**Status:** Approved for implementation

---

## Overview

A full-screen modal overlay that launches automatically on the first app load of each day, guiding the user through a structured morning ritual. The same modal can be re-opened any time via a sidebar button. The popup is ported from the provided JSX prototype (`Logbird.zip`) and rewritten in TypeScript, connecting to existing Logbird stores wherever data already exists.

---

## Architecture

### New files

| Path | Purpose |
|------|---------|
| `src/components/CheckinModal/CheckinModal.tsx` | Modal shell — page state, open/close, progress dots, auto-open logic |
| `src/components/CheckinModal/pages/PageCheckin.tsx` | Page 1: Hero + Mood & Energy |
| `src/components/CheckinModal/pages/PageMind.tsx` | Page 2: Intention + Journal + Gratitude + Meditation |
| `src/components/CheckinModal/pages/PageGoals.tsx` | Page 3: Goals list |
| `src/components/CheckinModal/pages/PageToday.tsx` | Page 4: Top 3 + Tasks + Wheel Nudge |
| `src/components/CheckinModal/sections/MoodSection.tsx` | Mood picker (words style, matches existing wheel_checkins) |
| `src/components/CheckinModal/sections/IntentionCard.tsx` | Placeholder textarea |
| `src/components/CheckinModal/sections/GratitudeSection.tsx` | Placeholder 3-field inputs |
| `src/components/CheckinModal/sections/MeditationSection.tsx` | Placeholder breath orb (client-only, no DB) |
| `src/components/CheckinModal/sections/HabitsSection.tsx` | Placeholder habit toggles |
| `src/components/CheckinModal/sections/WheelNudge.tsx` | Mini donut + weakest category from wheelStore |
| `src/components/CheckinModal/sections/QuoteCard.tsx` | Static daily quote (no DB) |

### Modified files

| Path | Change |
|------|--------|
| `src/components/Layout/Sidebar.tsx` | Add "Daily Check-in" button above UpdateCard in bottom section |
| `src/App.tsx` | Mount `<CheckinModal />` at root level so it overlays all pages |

---

## Auto-open Logic

- `localStorage` key: `logbird_checkin_last_opened`
- On app mount, `CheckinModal` reads this key
- If value is absent **or** does not match today's date string (`YYYY-MM-DD`), modal opens automatically and key is written with today's date
- Sidebar button always opens the modal regardless of the key
- Closing the modal mid-flow does **not** reset the key — it won't auto-reopen today

---

## Modal Shell (CheckinModal.tsx)

- Full-screen overlay: `fixed inset-0 z-50 bg-black/40 backdrop-blur-sm`
- Centered card: `max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`
- **Progress indicator**: 4 dots at the top, filled for completed pages
- **Navigation**: Back / Next buttons; final page shows "Start my day →" which closes modal
- **Skip**: Small "Skip for now" link always visible — closes modal without writing any data
- Page state: `useState<0|1|2|3>` — simple integer, no router involvement
- Submit on page 1 (Mood): calls `wheelStore.createCheckin` with scores keyed to user's actual `wheel_categories`

---

## Page 1 — Check-in

Components rendered (top to bottom):

1. **Hero** — greeting, date/time, navy treatment (matches dashboard). Static display only.
2. **MoodSection** — mood word-cloud + energy level 1–5. This is the **only section that persists data on this page**.
   - On first "Next" click: calls `wheelStore.createCheckin({ scores: { [primaryCategory]: moodScore }, mood_words: selected, energy_level: energy })`
   - Uses user's `wheel_categories` to populate scores keys — fixes the existing category mismatch bug
   - Required field: at least one mood word selected + energy set. Shows inline error if user tries to advance without filling.
   - **Idempotency**: checkin is submitted once and the result stored in component state. If user navigates back to page 1 and changes mood, the already-submitted checkin is **not** re-submitted (no double-write). The changed mood state is kept in local UI only.

---

## Page 2 — Mind

All sections on this page are **placeholder** — UI renders but nothing persists until future sprints.

1. **IntentionCard** — textarea "Today I want to…" + quick-fill chips. Placeholder badge: "Saving coming soon"
2. **JournalQuick** — "Morning pages" textarea. Placeholder — full journal wiring in future sprint. Button "Open in Journal →" navigates to `/journal` and closes modal.
3. **GratitudeSection** — 3 numbered inputs. Placeholder.
4. **MeditationSection** — breath orb, 1-minute timer, fully client-side animation. No DB needed. Completing it just shows a checkmark — nothing logged.
5. **QuoteCard** — static hardcoded quote. No DB.

Placeholder sections show a subtle `opacity-50` badge: `· not yet saving` in the section title.

---

## Page 3 — Goals

1. **Goals list** — reads from `wheelStore.goals`. Renders goal cards identically to the Goals page. Each card links to `/goals/:id` and closes the modal.
2. If no goals exist: empty state "No goals yet — add one in Goals."
3. No writes on this page.

---

## Page 4 — Today

1. **Top 3 Priorities** — reads from `wheelStore.tasks` filtered to `priority === 'urgent'`, capped at 3. Drag-to-reorder is visual only (no persist) in this view. Checking a task calls `wheelStore.toggleTask`.
2. **TasksGrouped** — reads all of today's tasks from `wheelStore.tasks`, grouped by priority (urgent / high / normal). Toggle calls `wheelStore.toggleTask`. Quick-add calls `wheelStore.createTask({ title, priority: groupKey, user_id, completed: false })` — no goal_id or category_id attached.
3. **WheelNudge** — reads `wheelStore.categories`, finds lowest-scored category from latest check-in, renders mini donut + nudge copy.
4. **Yesterday recap** — reads yesterday's `wheel_checkins` entry and yesterday's completed tasks. Computed client-side from existing store data. Carry-over tasks: clicking "Move to today" calls `wheelStore.updateTask({ due_date: today })`.

---

## Sidebar Button

- Positioned in the bottom section of `Sidebar.tsx`, above `UpdateCard`
- Icon: `Sun` from `@phosphor-icons/react`
- Label: `Daily Check-in`
- Style: matches existing bottom nav items (inactive state always — it's a trigger, not a route)
- On click: calls `openCheckin()` from a simple context or prop

---

## State Management

No new Zustand store needed. CheckinModal manages its own local UI state:
- `page: number` — current page (0–3)
- `moodState: { words: string[], energy: number | null }` — controlled by MoodSection
- `modalOpen: boolean` — lifted to App level via a simple React context (`CheckinContext`) so sidebar button can trigger it

`CheckinContext` exposes `{ open: boolean, openCheckin: () => void, closeCheckin: () => void }`.

---

## Existing Bug Fixed

The current `wheelStore.createCheckin` call uses a hardcoded/default category set instead of the user's saved `wheel_categories`. This spec fixes that: the Mood section reads `wheelStore.categories` (the user's real list) to populate the `scores` JSONB object before submitting.

---

## Sections NOT wired (placeholder only)

| Section | Status | Future work |
|---------|--------|-------------|
| Intention | Placeholder | Needs `intention` column on `wheel_checkins` |
| Gratitude | Placeholder | Needs `gratitude_entries` table or column |
| Habits | Placeholder | Needs `habits` + `habit_logs` tables |
| Meditation log | Client-only | Optional: `meditation_logs` table |
| Purpose/Pillars | Not included in V1 | Needs columns on `user_profiles` |
| Daily quote | Static hardcoded | Optional: quotes API or table |

---

## Out of Scope (this sprint)

- Tweaks panel (section toggles, mood style selector) — future settings page
- Body check-in — future sprint
- Affirmation — future sprint
- Weather API integration in Hero
- Hero treatment selector (stays navy for now)
