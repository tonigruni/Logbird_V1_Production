# Daily Check-in Popup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-screen daily check-in modal that auto-opens once per day, guides the user through 4 pages of morning ritual content, and connects to the existing Zustand stores (wheelStore, journalStore) for real data persistence.

**Architecture:** A `CheckinContext` React context wraps AppLayout and gives any child component (including Sidebar) the ability to open/close the modal. `CheckinModal` renders as a fixed overlay with 4 page components. The `WheelCheckin` TypeScript interface is extended with new optional fields that match a DB migration adding columns and tables.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Zustand + Supabase + `@phosphor-icons/react`

---

## File Map

**Create:**
- `src/context/CheckinContext.tsx` — open/close state, shared across Sidebar + AppLayout
- `src/components/CheckinModal/CheckinModal.tsx` — modal shell, auto-open logic, page nav
- `src/components/CheckinModal/pages/PageCheckin.tsx` — page 1: Hero + Mood + Energy
- `src/components/CheckinModal/pages/PageMind.tsx` — page 2: Intention + Journal + Gratitude + Meditation
- `src/components/CheckinModal/pages/PageGoals.tsx` — page 3: goals from wheelStore
- `src/components/CheckinModal/pages/PageToday.tsx` — page 4: priorities, tasks, wheel nudge, yesterday
- `src/components/CheckinModal/sections/MoodSection.tsx` — mood word cloud + energy 1–5
- `src/components/CheckinModal/sections/IntentionCard.tsx` — intention textarea (wired to wheel_checkins.intention)
- `src/components/CheckinModal/sections/GratitudeSection.tsx` — 3 gratitude inputs (wired to wheel_checkins.gratitude)
- `src/components/CheckinModal/sections/MeditationSection.tsx` — 1-min breath orb (wired to wheel_checkins.meditation_completed)
- `src/components/CheckinModal/sections/QuoteCard.tsx` — static daily quote
- `src/components/CheckinModal/sections/JournalQuick.tsx` — morning pages textarea, wired to journalStore.createEntry
- `src/components/CheckinModal/sections/HabitsSection.tsx` — placeholder showing habits from DB (empty state if none)
- `src/components/CheckinModal/sections/WheelNudge.tsx` — mini donut + weakest category nudge
- `src/components/CheckinModal/sections/YesterdayRecap.tsx` — yesterday's check-in + carry-over tasks
- `src/components/CheckinModal/sections/PrioritiesSection.tsx` — top 3 urgent tasks
- `src/components/CheckinModal/sections/CheckinTasksGrouped.tsx` — all tasks grouped by priority
- `supabase/migrations/20260419000001_checkin_enhancements.sql` — new columns + tables

**Modify:**
- `src/stores/wheelStore.ts` — extend `WheelCheckin` interface with 5 new optional fields
- `src/components/Layout/AppLayout.tsx` — wrap with `CheckinProvider`, render `<CheckinModal />`
- `src/components/Layout/Sidebar.tsx` — add "Daily Check-in" button above UpdateCard

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260419000001_checkin_enhancements.sql`

- [ ] **Step 1: Write the migration SQL file**

```sql
-- supabase/migrations/20260419000001_checkin_enhancements.sql

-- ─── wheel_checkins: new columns ───────────────────────────────────────────
ALTER TABLE wheel_checkins
  ADD COLUMN IF NOT EXISTS energy_level        SMALLINT,
  ADD COLUMN IF NOT EXISTS mood_words          TEXT[],
  ADD COLUMN IF NOT EXISTS intention           TEXT,
  ADD COLUMN IF NOT EXISTS gratitude           JSONB,
  ADD COLUMN IF NOT EXISTS meditation_completed BOOLEAN DEFAULT FALSE;

-- ─── habits ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_habits_select" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_habits_insert" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_habits_update" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_habits_delete" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- ─── habit_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  logged_date DATE        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, logged_date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_habit_logs_select" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_habit_logs_insert" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "user_habit_logs_delete" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ─── user_profiles: purpose columns ─────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS purpose_statement TEXT,
  ADD COLUMN IF NOT EXISTS purpose_pillars   JSONB;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with:
- `name`: `checkin_enhancements`
- `query`: paste the full SQL above

- [ ] **Step 3: Verify columns exist**

Use `mcp__supabase__execute_sql` with this query to confirm:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'wheel_checkins'
  AND column_name IN ('energy_level','mood_words','intention','gratitude','meditation_completed');
```
Expected: 5 rows returned.

- [ ] **Step 4: Commit the SQL file**

```bash
cd /Users/tonigrunwald/Documents/Jobs/Claude\ Code/Logbird_V1_Staging
git add supabase/migrations/20260419000001_checkin_enhancements.sql
git commit -m "feat: add checkin enhancement migration — wheel_checkins columns, habits, habit_logs, purpose"
```

---

## Task 2: Extend WheelCheckin TypeScript Interface

**Files:**
- Modify: `src/stores/wheelStore.ts` (lines 26–36, the `WheelCheckin` interface)

- [ ] **Step 1: Add 5 optional fields to `WheelCheckin`**

Find the `WheelCheckin` interface (currently ends at line 36) and replace it with:

```ts
export interface WheelCheckin {
  id: string
  user_id: string
  date: string
  scores: Record<string, number>
  sub_scores: Record<string, number> | null
  reflection_answers: Record<string, string[]> | null
  notes: string | null
  context: CheckinContext | null
  created_at: string
  // Daily check-in popup fields (added 2026-04-19)
  energy_level?: number | null       // 1–5
  mood_words?: string[] | null       // selected mood word strings
  intention?: string | null
  gratitude?: string[] | null        // array of up to 3 strings
  meditation_completed?: boolean | null
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/wheelStore.ts
git commit -m "feat: extend WheelCheckin interface with daily check-in popup fields"
```

---

## Task 3: CheckinContext

**Files:**
- Create: `src/context/CheckinContext.tsx`

- [ ] **Step 1: Create the context file**

```tsx
// src/context/CheckinContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CheckinContextValue {
  isOpen: boolean
  openCheckin: () => void
  closeCheckin: () => void
}

const CheckinContext = createContext<CheckinContextValue>({
  isOpen: false,
  openCheckin: () => {},
  closeCheckin: () => {},
})

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const openCheckin  = useCallback(() => setIsOpen(true),  [])
  const closeCheckin = useCallback(() => setIsOpen(false), [])

  return (
    <CheckinContext.Provider value={{ isOpen, openCheckin, closeCheckin }}>
      {children}
    </CheckinContext.Provider>
  )
}

export function useCheckin() {
  return useContext(CheckinContext)
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/context/CheckinContext.tsx
git commit -m "feat: add CheckinContext for modal open/close state"
```

---

## Task 4: CheckinModal Shell

**Files:**
- Create: `src/components/CheckinModal/CheckinModal.tsx`

- [ ] **Step 1: Create the modal shell with page routing, auto-open, and stub pages**

```tsx
// src/components/CheckinModal/CheckinModal.tsx
import { useEffect, useState, useCallback } from 'react'
import { X } from '@phosphor-icons/react'
import { useCheckin } from '../../context/CheckinContext'

const STORAGE_KEY = 'logbird_checkin_last_opened'
const PAGE_LABELS = ['Check-in', 'Mind', 'Goals', 'Today'] as const

// Lazy imports — replaced with real pages in later tasks
import PageCheckin from './pages/PageCheckin'
import PageMind    from './pages/PageMind'
import PageGoals   from './pages/PageGoals'
import PageToday   from './pages/PageToday'

export default function CheckinModal() {
  const { isOpen, openCheckin, closeCheckin } = useCheckin()
  const [page, setPage] = useState(0)
  const [checkinId, setCheckinId] = useState<string | null>(null)

  // Auto-open once per day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const last  = localStorage.getItem(STORAGE_KEY)
    if (last !== today) {
      localStorage.setItem(STORAGE_KEY, today)
      openCheckin()
    }
  }, [openCheckin])

  const goNext = useCallback(() => setPage(p => Math.min(PAGE_LABELS.length - 1, p + 1)), [])
  const goBack = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const handleClose = useCallback(() => {
    closeCheckin()
    setPage(0)
  }, [closeCheckin])

  if (!isOpen) return null

  const isLast = page === PAGE_LABELS.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ECEFF2] shrink-0">
          <div className="flex items-center gap-3">
            {PAGE_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setPage(i)}
                className="flex items-center gap-2 group"
                aria-label={`Go to ${label}`}
              >
                <span
                  className={[
                    'block rounded-full transition-all duration-200',
                    i === page
                      ? 'w-5 h-2 bg-[#1F3649]'
                      : i < page
                      ? 'w-2 h-2 bg-[#1F3649]/35'
                      : 'w-2 h-2 bg-[#ECEFF2]',
                  ].join(' ')}
                />
              </button>
            ))}
            <span className="ml-1 text-[10px] font-bold text-[#adb3b4] tracking-[0.12em] uppercase">
              {PAGE_LABELS[page]}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#adb3b4] hover:text-[#2d3435] hover:bg-[#f2f4f4] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable page content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {page === 0 && (
            <PageCheckin
              onCheckinCreated={(id) => setCheckinId(id)}
              checkinId={checkinId}
            />
          )}
          {page === 1 && <PageMind checkinId={checkinId} />}
          {page === 2 && <PageGoals onClose={handleClose} />}
          {page === 3 && <PageToday onClose={handleClose} />}
        </div>

        {/* ── Sticky footer nav ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ECEFF2] shrink-0">
          <button
            onClick={goBack}
            disabled={page === 0}
            className="text-sm font-semibold text-[#5a6061] hover:text-[#2d3435] transition-colors disabled:opacity-0"
          >
            ← Back
          </button>
          <button
            onClick={isLast ? handleClose : goNext}
            className="px-5 py-2.5 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors"
          >
            {isLast ? 'Start my day →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create stub page files so the imports resolve**

Create these four minimal stub files (they will be replaced in later tasks):

`src/components/CheckinModal/pages/PageCheckin.tsx`:
```tsx
export default function PageCheckin(_: { onCheckinCreated: (id: string) => void; checkinId: string | null }) {
  return <div className="py-4 text-[#adb3b4]">Page 1 – Check-in (coming)</div>
}
```

`src/components/CheckinModal/pages/PageMind.tsx`:
```tsx
export default function PageMind(_: { checkinId: string | null }) {
  return <div className="py-4 text-[#adb3b4]">Page 2 – Mind (coming)</div>
}
```

`src/components/CheckinModal/pages/PageGoals.tsx`:
```tsx
export default function PageGoals(_: { onClose: () => void }) {
  return <div className="py-4 text-[#adb3b4]">Page 3 – Goals (coming)</div>
}
```

`src/components/CheckinModal/pages/PageToday.tsx`:
```tsx
export default function PageToday(_: { onClose: () => void }) {
  return <div className="py-4 text-[#adb3b4]">Page 4 – Today (coming)</div>
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/CheckinModal/
git commit -m "feat: add CheckinModal shell with auto-open logic and page navigation"
```

---

## Task 5: MoodSection

**Files:**
- Create: `src/components/CheckinModal/sections/MoodSection.tsx`

- [ ] **Step 1: Create MoodSection with word cloud and energy bar**

```tsx
// src/components/CheckinModal/sections/MoodSection.tsx
import { Lightning } from '@phosphor-icons/react'

const MOOD_WORDS: { w: string; tone: 'positive' | 'neutral' | 'negative' }[] = [
  { w: 'Focused',      tone: 'positive' },
  { w: 'Energised',    tone: 'positive' },
  { w: 'Grateful',     tone: 'positive' },
  { w: 'Calm',         tone: 'positive' },
  { w: 'Motivated',    tone: 'positive' },
  { w: 'Creative',     tone: 'positive' },
  { w: 'Hopeful',      tone: 'positive' },
  { w: 'Confident',    tone: 'positive' },
  { w: 'Content',      tone: 'positive' },
  { w: 'Inspired',     tone: 'positive' },
  { w: 'Neutral',      tone: 'neutral'  },
  { w: 'Tired',        tone: 'neutral'  },
  { w: 'Distracted',   tone: 'neutral'  },
  { w: 'Restless',     tone: 'neutral'  },
  { w: 'Uncertain',    tone: 'neutral'  },
  { w: 'Pensive',      tone: 'neutral'  },
  { w: 'Anxious',      tone: 'negative' },
  { w: 'Stressed',     tone: 'negative' },
  { w: 'Overwhelmed',  tone: 'negative' },
  { w: 'Sad',          tone: 'negative' },
  { w: 'Frustrated',   tone: 'negative' },
  { w: 'Drained',      tone: 'negative' },
]

const TONE_ACTIVE: Record<string, string> = {
  positive: 'bg-[#1F3649] border-[#1F3649] text-white',
  neutral:  'bg-[#5a6061] border-[#5a6061] text-white',
  negative: 'bg-[#9f403d] border-[#9f403d] text-white',
}

interface MoodSectionProps {
  words: string[]
  energy: number | null
  onWordsChange: (words: string[]) => void
  onEnergyChange: (energy: number) => void
  showErrors?: boolean
}

export default function MoodSection({
  words, energy, onWordsChange, onEnergyChange, showErrors = false,
}: MoodSectionProps) {
  const toggle = (w: string) => {
    onWordsChange(words.includes(w) ? words.filter(x => x !== w) : [...words, w])
  }

  const wordsMissing  = words.length === 0
  const energyMissing = energy == null

  return (
    <div className={[
      'rounded-2xl border p-5',
      showErrors && wordsMissing ? 'border-red-300 bg-red-50/30' : 'border-[#ECEFF2] bg-white',
    ].join(' ')}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-[#2d3435]">
            How's the weather inside?
          </h3>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">
            {showErrors && wordsMissing
              ? 'Pick at least one — there are no wrong answers.'
              : 'No wrong answers. Just honest weather.'}
          </p>
        </div>
        {showErrors && wordsMissing && (
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full tracking-wide uppercase">
            Required
          </span>
        )}
      </div>

      {/* Word cloud */}
      <div className="flex flex-wrap gap-2">
        {MOOD_WORDS.map(({ w, tone }) => {
          const on = words.includes(w)
          return (
            <button
              key={w}
              onClick={() => toggle(w)}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold transition-all duration-150 cursor-pointer',
                on ? TONE_ACTIVE[tone] : 'border-[#ECEFF2] bg-white text-[#5a6061] hover:border-[#1F3649]/30',
              ].join(' ')}
            >
              <span className={[
                'w-1.5 h-1.5 rounded-full shrink-0',
                on
                  ? 'bg-white opacity-80'
                  : tone === 'positive' ? 'bg-[#1F3649] opacity-50'
                  : tone === 'neutral'  ? 'bg-[#5a6061] opacity-50'
                  : 'bg-[#9f403d] opacity-50',
              ].join(' ')} />
              {w}
            </button>
          )
        })}
      </div>

      {/* Energy */}
      <div className={['mt-5 pt-4 border-t border-[#ECEFF2]', showErrors && energyMissing ? 'animate-[shake_420ms_ease]' : ''].join(' ')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-bold text-[#2d3435]">Energy level</span>
            {showErrors && energyMissing && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full tracking-wide uppercase">
                Required
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#adb3b4]">where are you starting from?</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(i => {
            const on = energy != null && i <= energy
            return (
              <button
                key={i}
                onClick={() => onEnergyChange(i)}
                className={[
                  'flex-1 h-9 rounded-[10px] border-2 flex items-center justify-center transition-all duration-150 cursor-pointer',
                  on
                    ? 'border-amber-400 bg-amber-50'
                    : showErrors && energyMissing
                    ? 'border-red-300 bg-white'
                    : 'border-[#ECEFF2] bg-white hover:border-amber-200',
                ].join(' ')}
              >
                <Lightning size={15} weight={on ? 'fill' : 'regular'} className={on ? 'text-amber-400' : 'text-[#D6DCE0]'} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CheckinModal/sections/MoodSection.tsx
git commit -m "feat: add MoodSection — word cloud + energy bar for daily check-in"
```

---

## Task 6: PageCheckin (Page 1)

**Files:**
- Modify: `src/components/CheckinModal/pages/PageCheckin.tsx` (replace stub)

- [ ] **Step 1: Replace PageCheckin stub with real implementation**

```tsx
// src/components/CheckinModal/pages/PageCheckin.tsx
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { useWheelStore } from '../../../stores/wheelStore'
import MoodSection from '../sections/MoodSection'

interface PageCheckinProps {
  onCheckinCreated: (id: string) => void
  checkinId: string | null
}

function Hero({ name }: { name: string }) {
  const now     = new Date()
  const hr      = now.getHours()
  const greet   = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-8 py-10 text-white mb-5"
      style={{ background: 'linear-gradient(180deg, #162838 0%, #1F3649 100%)' }}
    >
      {/* Gradient bars */}
      <div className="absolute inset-0 flex gap-1 pointer-events-none overflow-hidden opacity-30">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              background: 'linear-gradient(to top, rgba(255,255,255,0.18), transparent)',
              height: `${42 + (i % 5) * 10}%`,
              alignSelf: 'flex-end',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        <div className="text-[11px] font-bold tracking-[0.14em] text-white/55 uppercase mb-2">
          {dateStr} · {timeStr}
        </div>
        <h1 className="text-[40px] font-extrabold tracking-tight leading-[1.08] text-white">
          {greet}, {name}.
        </h1>
        <p className="mt-2.5 text-white/60 text-[15px] max-w-sm leading-relaxed">
          A quiet moment before the day asks anything of you. Let's set the shape of it.
        </p>
      </div>
    </div>
  )
}

export default function PageCheckin({ onCheckinCreated, checkinId }: PageCheckinProps) {
  const { user }        = useAuthStore()
  const { createCheckin } = useWheelStore()
  const [words,  setWords]  = useState<string[]>([])
  const [energy, setEnergy] = useState<number | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const handleSubmit = useCallback(async () => {
    if (checkinId) return // already submitted — idempotent
    if (words.length === 0 || energy == null) {
      setShowErrors(true)
      return
    }
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await createCheckin({
        user_id:              user!.id,
        date:                 today,
        scores:               {},
        sub_scores:           null,
        reflection_answers:   null,
        notes:                null,
        context:              null,
        energy_level:         energy,
        mood_words:           words,
        intention:            null,
        gratitude:            null,
        meditation_completed: null,
      })
      // Pull the newly created checkin id from the store
      const { checkins } = useWheelStore.getState()
      const newest = checkins[0]
      if (newest) onCheckinCreated(newest.id)
    } finally {
      setSubmitting(false)
    }
  }, [checkinId, words, energy, user, createCheckin, onCheckinCreated])

  return (
    <div>
      <Hero name={name} />
      <MoodSection
        words={words}
        energy={energy}
        onWordsChange={setWords}
        onEnergyChange={setEnergy}
        showErrors={showErrors}
      />
      {/* Submit is triggered by the modal's "Next" button — we expose it via a data attr */}
      <button
        id="checkin-page-submit"
        onClick={handleSubmit}
        disabled={submitting}
        className="sr-only"
        aria-hidden
      />
    </div>
  )
}
```

> **Note on "Next" triggering submit:** The modal's Next button calls `goNext()` which just advances the page. PageCheckin exposes `handleSubmit` via a hidden button with id `checkin-page-submit`. We connect them in the next step by updating CheckinModal to call submit programmatically before advancing from page 0.

- [ ] **Step 2: Update CheckinModal to trigger PageCheckin submit before advancing from page 0**

In `src/components/CheckinModal/CheckinModal.tsx`, replace the `goNext` handler in the footer with:

```tsx
const handleNext = useCallback(() => {
  if (page === 0) {
    // Trigger PageCheckin's hidden submit button; it validates and submits
    const btn = document.getElementById('checkin-page-submit') as HTMLButtonElement | null
    btn?.click()
    // PageCheckin itself calls onCheckinCreated which sets checkinId in state.
    // We advance only if no errors — detect by checking if the mood section
    // shows errors (btn.disabled after click). Simple: advance immediately
    // and let the validation state inside PageCheckin surface the red outlines.
    // The "Next" nav is intentionally non-blocking (user can skip).
    setPage(p => Math.min(PAGE_LABELS.length - 1, p + 1))
    return
  }
  setPage(p => Math.min(PAGE_LABELS.length - 1, p + 1))
}, [page])
```

And in the footer JSX, change `onClick={isLast ? handleClose : goNext}` to `onClick={isLast ? handleClose : handleNext}`.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/CheckinModal/pages/PageCheckin.tsx \
        src/components/CheckinModal/CheckinModal.tsx
git commit -m "feat: implement PageCheckin with Hero greeting and wired MoodSection"
```

---

## Task 7: Mind Sections (Intention, Gratitude, Meditation, Quote)

**Files:**
- Create: `src/components/CheckinModal/sections/IntentionCard.tsx`
- Create: `src/components/CheckinModal/sections/GratitudeSection.tsx`
- Create: `src/components/CheckinModal/sections/MeditationSection.tsx`
- Create: `src/components/CheckinModal/sections/QuoteCard.tsx`

- [ ] **Step 1: Create IntentionCard**

```tsx
// src/components/CheckinModal/sections/IntentionCard.tsx
import { Target } from '@phosphor-icons/react'

const QUICK_FILLS = [
  'Move slowly.',
  'Finish the hard thing first.',
  'Be kind in writing.',
  'Say no once.',
]

interface IntentionCardProps {
  value: string
  onChange: (v: string) => void
}

export default function IntentionCard({ value, onChange }: IntentionCardProps) {
  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-6 relative overflow-hidden">
      <div className="absolute right-4 top-4 opacity-[0.04] pointer-events-none">
        <Target size={120} />
      </div>
      <div className="relative">
        <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-2">
          Intention for today
        </div>
        <textarea
          rows={2}
          placeholder="Today I want to…"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-[#ECEFF2] bg-[#fafbfb] px-4 py-3 text-[14px] text-[#2d3435] leading-relaxed outline-none focus:border-[#1F3649]/30 focus:ring-2 focus:ring-[#1F3649]/10 transition-all"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_FILLS.map(s => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-[#ECEFF2] bg-white text-[#5a6061] hover:border-[#1F3649]/25 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create GratitudeSection**

```tsx
// src/components/CheckinModal/sections/GratitudeSection.tsx
import { Heart } from '@phosphor-icons/react'

const PLACEHOLDERS = [
  'the coffee this morning',
  'someone who made you smile',
  'something easy you take for granted',
]

interface GratitudeSectionProps {
  values: [string, string, string]
  onChange: (values: [string, string, string]) => void
}

export default function GratitudeSection({ values, onChange }: GratitudeSectionProps) {
  const set = (i: number, v: string) => {
    const next = [...values] as [string, string, string]
    next[i] = v
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-[#f5ecd6] bg-[#fefcf7] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart size={16} weight="fill" className="text-yellow-600" />
        <h3 className="text-[16px] font-bold tracking-tight text-[#78350f]">
          Three things, small or loud.
        </h3>
      </div>
      {([0, 1, 2] as const).map(i => (
        <div key={i} className={['relative', i < 2 ? 'mb-2.5' : ''].join(' ')}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-semibold text-yellow-600">
            0{i + 1}
          </span>
          <input
            value={values[i]}
            onChange={e => set(i, e.target.value)}
            placeholder={PLACEHOLDERS[i]}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-[#f5ecd6] bg-white text-[13.5px] text-[#2d3435] outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100 transition-all"
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create MeditationSection (animated breath orb)**

```tsx
// src/components/CheckinModal/sections/MeditationSection.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Leaf, ArrowRight } from '@phosphor-icons/react'

interface MeditationSectionProps {
  onComplete: () => void
  completed: boolean
}

type Phase = 'ready' | 'in' | 'hold' | 'out' | 'done'

const TOTAL = 60 // seconds

export default function MeditationSection({ onComplete, completed }: MeditationSectionProps) {
  const [running,  setRunning]  = useState(false)
  const [elapsed,  setElapsed]  = useState(0)
  const [phase,    setPhase]    = useState<Phase>('ready')
  const rafRef     = useRef<number>(0)
  const startedAt  = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    startedAt.current = performance.now() - elapsed * 1000
    const tick = (t: number) => {
      const secs = (t - startedAt.current) / 1000
      if (secs >= TOTAL) {
        setElapsed(TOTAL); setRunning(false); setPhase('done'); onComplete(); return
      }
      setElapsed(secs)
      const s = secs % 8
      setPhase(s < 4 ? 'in' : s < 6 ? 'hold' : 'out')
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, onComplete])

  const reset = useCallback(() => { setRunning(false); setElapsed(0); setPhase('ready') }, [])

  const pct  = elapsed / TOTAL
  const done = elapsed >= TOTAL || completed
  const mm   = Math.floor((TOTAL - elapsed) / 60)
  const ss   = Math.max(0, Math.floor(TOTAL - elapsed) % 60)
  const cue  = done ? 'nicely done' : phase === 'in' ? 'breathe in' : phase === 'hold' ? 'hold' : phase === 'out' ? 'let it go' : 'ready when you are'

  const orbScale = phase === 'in'
    ? 0.78 + ((elapsed % 8) / 4) * 0.32
    : phase === 'hold' ? 1.10
    : phase === 'out'  ? 1.10 - (((elapsed % 8) - 6) / 2) * 0.32
    : 0.85

  return (
    <div className="rounded-2xl border border-[#e4e9ea] bg-gradient-to-br from-[#f5f7f8] to-[#ebf0f2] p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[18px] font-bold tracking-tight flex items-center gap-2">
          <Leaf size={16} className="text-green-500" /> One-minute pause
        </h3>
        <span className="font-mono text-[12px] text-[#5a6061]">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      </div>
      <p className="text-[13px] text-[#5a6061] mb-5">
        Let the orb guide your breath. In, hold, out. That's the whole trick.
      </p>

      {/* Orb */}
      <div className="flex items-center justify-center relative h-48 mb-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute w-36 h-36 rounded-full border border-[#1F3649]/10 transition-all duration-700"
            style={{ transform: `scale(${1 + i * 0.18 + orbScale * 0.2})`, opacity: running ? 0.6 - i * 0.18 : 0.2 }} />
        ))}
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center text-white text-[14px] font-semibold tracking-wide transition-transform duration-[900ms]"
          style={{
            transform: `scale(${orbScale})`,
            background: 'radial-gradient(circle at 35% 30%, #a7c2d6, #1F3649 75%)',
            boxShadow: '0 20px 60px rgba(31,54,73,0.25), inset -20px -30px 60px rgba(0,0,0,0.2), inset 20px 25px 50px rgba(255,255,255,0.3)',
          }}
        >
          <span className="opacity-90">{cue}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-[#e4e9ea] rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-green-400 to-[#1F3649] rounded-full transition-all duration-300"
          style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="flex gap-2.5 justify-center">
        {!running && !done && (
          <button
            onClick={() => setRunning(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors cursor-pointer"
          >
            {elapsed > 0 ? 'Resume' : 'Begin'} <ArrowRight size={14} />
          </button>
        )}
        {running && (
          <button onClick={() => setRunning(false)} className="px-4 py-2 rounded-xl border border-[#ECEFF2] text-sm font-semibold text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer">
            Pause
          </button>
        )}
        {elapsed > 0 && !done && (
          <button onClick={reset} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#adb3b4] hover:text-[#5a6061] transition-colors cursor-pointer">
            Reset
          </button>
        )}
        {done && (
          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
            ✓ One minute of quiet, logged.
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create QuoteCard**

```tsx
// src/components/CheckinModal/sections/QuoteCard.tsx

// Static daily quote — rotates by day of year
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
]

function todaysQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff  = Date.now() - start.getTime()
  const day   = Math.floor(diff / 86_400_000)
  return QUOTES[day % QUOTES.length]
}

export default function QuoteCard() {
  const { text, author } = todaysQuote()
  return (
    <div className="relative rounded-2xl border border-[#ECEFF2] bg-[#f7f9fa] px-7 py-6">
      <div className="absolute top-3 left-5 text-[56px] font-extrabold text-[#dde4e5] leading-none select-none">"</div>
      <p className="relative pl-4 font-semibold text-[17px] leading-[1.45] text-[#2d3435] tracking-[-0.01em]">
        {text}
      </p>
      <p className="mt-2.5 pl-4 text-[11px] text-[#adb3b4] uppercase tracking-[0.1em] font-bold">
        — {author}
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/CheckinModal/sections/IntentionCard.tsx \
        src/components/CheckinModal/sections/GratitudeSection.tsx \
        src/components/CheckinModal/sections/MeditationSection.tsx \
        src/components/CheckinModal/sections/QuoteCard.tsx
git commit -m "feat: add mind sections — intention, gratitude, meditation orb, quote"
```

---

## Task 8: JournalQuick

**Files:**
- Create: `src/components/CheckinModal/sections/JournalQuick.tsx`

- [ ] **Step 1: Create JournalQuick wired to journalStore.createEntry**

```tsx
// src/components/CheckinModal/sections/JournalQuick.tsx
import { useState, useCallback } from 'react'
import { BookOpen, ArrowRight } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useJournalStore } from '../../../stores/journalStore'
import { useAuthStore } from '../../../stores/authStore'

interface JournalQuickProps {
  onClose: () => void
}

export default function JournalQuick({ onClose }: JournalQuickProps) {
  const navigate      = useNavigate()
  const { user }      = useAuthStore()
  const { createEntry } = useJournalStore()
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length

  const save = useCallback(async () => {
    if (!value.trim() || !user || saving || saved) return
    setSaving(true)
    try {
      const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      await createEntry({
        user_id:      user.id,
        title:        `Morning Pages — ${today}`,
        content:      value.trim(),
        mood_score:   null,
        template_id:  null,
        category:     'morning-pages',
        location:     null,
        weather:      null,
        is_favorite:  false,
        sleep_quality:null,
        had_alcohol:  null,
        exercised:    null,
        energy_level: null,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }, [value, user, createEntry, saving, saved])

  const openInJournal = () => {
    onClose()
    navigate('/journal', { state: { openNew: true } })
  }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-bold tracking-tight flex items-center gap-2">
          <BookOpen size={16} className="text-[#1F3649]" /> Morning pages
        </h3>
        <span className="text-[11px] text-[#adb3b4]">{wordCount} words</span>
      </div>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        placeholder="Write freely. Nothing here needs to be good. Just true."
        rows={5}
        className="w-full resize-none rounded-xl border border-[#ECEFF2] bg-[#fafbfb] px-4 py-3 text-[14px] text-[#2d3435] leading-relaxed outline-none focus:border-[#1F3649]/30 focus:ring-2 focus:ring-[#1F3649]/10 transition-all"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-[#adb3b4]">
          {saved ? '✓ Saved to Journal' : 'Saves to Journal'}
        </span>
        <div className="flex gap-2">
          {value.trim() && !saved && (
            <button
              onClick={save}
              disabled={saving}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1F3649] text-white hover:bg-[#162838] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
          <button
            onClick={openInJournal}
            className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECEFF2] text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
          >
            Expand <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CheckinModal/sections/JournalQuick.tsx
git commit -m "feat: add JournalQuick section wired to journalStore.createEntry"
```

---

## Task 9: HabitsSection Placeholder

**Files:**
- Create: `src/components/CheckinModal/sections/HabitsSection.tsx`

- [ ] **Step 1: Create HabitsSection placeholder (reads from habits table — empty state when no habits configured)**

```tsx
// src/components/CheckinModal/sections/HabitsSection.tsx
import { Flame, Gear } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

// Placeholder: habits are read from DB in future sprint.
// For now, the section shows an empty state prompting the user to configure habits.
// When habits exist, this will map over them with toggle functionality.

interface HabitsSectionProps {
  onClose: () => void
}

export default function HabitsSection({ onClose }: HabitsSectionProps) {
  const navigate = useNavigate()

  const openSettings = () => {
    onClose()
    navigate('/settings')
  }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-3 flex items-center gap-1.5">
        <Flame size={12} className="text-amber-400" />
        Habit streaks
      </div>
      <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-[#f2f4f4] flex items-center justify-center">
          <Flame size={20} className="text-[#adb3b4]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#2d3435]">No habits configured yet</p>
          <p className="text-[12.5px] text-[#5a6061] mt-1 max-w-[200px]">
            Add habits in Settings to start tracking your streaks here.
          </p>
        </div>
        <button
          onClick={openSettings}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECEFF2] text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
        >
          <Gear size={13} /> Open Settings
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CheckinModal/sections/HabitsSection.tsx
git commit -m "feat: add HabitsSection placeholder with empty-state and settings link"
```

---

## Task 10: PageMind (Page 2)

**Files:**
- Modify: `src/components/CheckinModal/pages/PageMind.tsx` (replace stub)

- [ ] **Step 1: Replace PageMind stub with full implementation**

```tsx
// src/components/CheckinModal/pages/PageMind.tsx
import { useState, useCallback } from 'react'
import { useWheelStore } from '../../../stores/wheelStore'
import IntentionCard    from '../sections/IntentionCard'
import JournalQuick     from '../sections/JournalQuick'
import GratitudeSection from '../sections/GratitudeSection'
import MeditationSection from '../sections/MeditationSection'
import HabitsSection    from '../sections/HabitsSection'
import QuoteCard        from '../sections/QuoteCard'
import { useCheckin }   from '../../../context/CheckinContext'

interface PageMindProps {
  checkinId: string | null
}

export default function PageMind({ checkinId }: PageMindProps) {
  const { closeCheckin } = useCheckin()
  const { updateCheckin } = useWheelStore() as any // updateCheckin is optional; only persist if checkinId exists
  const [intention,         setIntention]         = useState('')
  const [gratitude,         setGratitude]         = useState<[string,string,string]>(['','',''])
  const [meditationDone,    setMeditationDone]    = useState(false)

  // Persist fields to wheel_checkins when checkinId is available
  const persist = useCallback(async (patch: Record<string, unknown>) => {
    if (!checkinId) return
    // wheelStore.updateCheckin doesn't exist yet — this is a no-op placeholder.
    // When updateCheckin is added to wheelStore, replace this with the real call.
    console.debug('[PageMind] would persist to checkin', checkinId, patch)
  }, [checkinId])

  const handleIntentionBlur = () => persist({ intention })
  const handleGratitudeBlur = () => persist({ gratitude: gratitude.filter(Boolean) })
  const handleMeditationComplete = () => {
    setMeditationDone(true)
    persist({ meditation_completed: true })
  }

  return (
    <div className="space-y-4">
      <IntentionCard
        value={intention}
        onChange={setIntention}
        // @ts-expect-error — onBlur wiring via wrapper div below
      />
      {/* Wrap IntentionCard to catch blur for persistence */}
      <div onBlur={handleIntentionBlur} className="-mt-4">
        <IntentionCard value={intention} onChange={setIntention} />
      </div>

      <JournalQuick onClose={closeCheckin} />

      <div onBlur={handleGratitudeBlur}>
        <GratitudeSection values={gratitude} onChange={setGratitude} />
      </div>

      <MeditationSection onComplete={handleMeditationComplete} completed={meditationDone} />

      <HabitsSection onClose={closeCheckin} />

      <QuoteCard />
    </div>
  )
}
```

> **Note on IntentionCard double render:** The above approach double-renders IntentionCard. Fix by adding an `onBlur` prop to IntentionCard directly.

- [ ] **Step 2: Add `onBlur` prop to IntentionCard**

In `src/components/CheckinModal/sections/IntentionCard.tsx`, update the interface and the textarea:

```tsx
// Replace the IntentionCardProps interface:
interface IntentionCardProps {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
}

// Add onBlur to the function signature:
export default function IntentionCard({ value, onChange, onBlur }: IntentionCardProps) {

// Add onBlur to the textarea:
<textarea
  rows={2}
  placeholder="Today I want to…"
  value={value}
  onChange={e => onChange(e.target.value)}
  onBlur={onBlur}
  className="w-full resize-none rounded-xl border border-[#ECEFF2] bg-[#fafbfb] px-4 py-3 text-[14px] text-[#2d3435] leading-relaxed outline-none focus:border-[#1F3649]/30 focus:ring-2 focus:ring-[#1F3649]/10 transition-all"
/>
```

- [ ] **Step 3: Fix PageMind — remove the duplicate IntentionCard**

Replace the double-render section in PageMind with a single clean call:

```tsx
// Replace this entire block:
//   <IntentionCard value={intention} onChange={setIntention} />
//   {/* Wrap IntentionCard to catch blur for persistence */}
//   <div onBlur={handleIntentionBlur} className="-mt-4">
//     <IntentionCard value={intention} onChange={setIntention} />
//   </div>

// With this:
<IntentionCard
  value={intention}
  onChange={setIntention}
  onBlur={handleIntentionBlur}
/>
```

Also remove the `// @ts-expect-error` line and the import of `useWheelStore` if not used for anything else in PageMind (the `persist` function is a stub):

```tsx
// src/components/CheckinModal/pages/PageMind.tsx — clean version
import { useState, useCallback } from 'react'
import IntentionCard     from '../sections/IntentionCard'
import JournalQuick      from '../sections/JournalQuick'
import GratitudeSection  from '../sections/GratitudeSection'
import MeditationSection from '../sections/MeditationSection'
import HabitsSection     from '../sections/HabitsSection'
import QuoteCard         from '../sections/QuoteCard'
import { useCheckin }    from '../../../context/CheckinContext'

interface PageMindProps {
  checkinId: string | null
}

export default function PageMind({ checkinId }: PageMindProps) {
  const { closeCheckin } = useCheckin()
  const [intention,      setIntention]   = useState('')
  const [gratitude,      setGratitude]   = useState<[string,string,string]>(['','',''])
  const [meditationDone, setMeditationDone] = useState(false)

  const persist = useCallback((patch: Record<string, unknown>) => {
    if (!checkinId) return
    console.debug('[PageMind] pending persist:', patch) // wired in future sprint
  }, [checkinId])

  return (
    <div className="space-y-4">
      <IntentionCard
        value={intention}
        onChange={setIntention}
        onBlur={() => persist({ intention })}
      />
      <JournalQuick onClose={closeCheckin} />
      <div onBlur={() => persist({ gratitude: gratitude.filter(Boolean) })}>
        <GratitudeSection values={gratitude} onChange={setGratitude} />
      </div>
      <MeditationSection
        onComplete={() => { setMeditationDone(true); persist({ meditation_completed: true }) }}
        completed={meditationDone}
      />
      <HabitsSection onClose={closeCheckin} />
      <QuoteCard />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/CheckinModal/pages/PageMind.tsx \
        src/components/CheckinModal/sections/IntentionCard.tsx
git commit -m "feat: implement PageMind — intention, journal, gratitude, meditation, habits, quote"
```

---

## Task 11: PageGoals (Page 3)

**Files:**
- Modify: `src/components/CheckinModal/pages/PageGoals.tsx` (replace stub)

- [ ] **Step 1: Replace PageGoals stub with goals list from wheelStore**

```tsx
// src/components/CheckinModal/pages/PageGoals.tsx
import { useNavigate } from 'react-router-dom'
import { Target, Plus } from '@phosphor-icons/react'
import { useWheelStore } from '../../../stores/wheelStore'

interface PageGoalsProps {
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-[#1F3649] text-white',
  completed: 'bg-green-100 text-green-700',
  archived:  'bg-[#f2f4f4] text-[#adb3b4]',
}

export default function PageGoals({ onClose }: PageGoalsProps) {
  const navigate = useNavigate()
  const { goals } = useWheelStore()

  const activeGoals = goals.filter(g => g.status === 'active')

  const openGoal = (id: string) => {
    onClose()
    navigate(`/goals/${id}`)
  }

  const createGoal = () => {
    onClose()
    navigate('/goals/new')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-[#2d3435]">Your goals</h2>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">
            {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
        <button
          onClick={createGoal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#ECEFF2] text-[13px] font-semibold text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
        >
          <Plus size={14} /> New goal
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center rounded-2xl border border-dashed border-[#ECEFF2]">
          <div className="w-12 h-12 rounded-full bg-[#f2f4f4] flex items-center justify-center">
            <Target size={24} className="text-[#adb3b4]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#2d3435]">No goals yet</p>
            <p className="text-[13px] text-[#5a6061] mt-1">Set your first goal to start tracking progress.</p>
          </div>
          <button
            onClick={createGoal}
            className="px-5 py-2 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors cursor-pointer"
          >
            Set a goal →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => openGoal(goal.id)}
              className="w-full text-left rounded-2xl border border-[#ECEFF2] bg-white px-5 py-4 hover:border-[#1F3649]/20 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#2d3435] leading-tight truncate">
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="text-[12.5px] text-[#5a6061] mt-1 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                  {goal.target_date && (
                    <p className="text-[11px] text-[#adb3b4] mt-2 font-semibold">
                      Due {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={[
                  'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0',
                  STATUS_COLORS[goal.status] ?? STATUS_COLORS.active,
                ].join(' ')}>
                  {goal.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CheckinModal/pages/PageGoals.tsx
git commit -m "feat: implement PageGoals — active goals from wheelStore with navigation"
```

---

## Task 12: PageToday Sections

**Files:**
- Create: `src/components/CheckinModal/sections/WheelNudge.tsx`
- Create: `src/components/CheckinModal/sections/YesterdayRecap.tsx`
- Create: `src/components/CheckinModal/sections/PrioritiesSection.tsx`
- Create: `src/components/CheckinModal/sections/CheckinTasksGrouped.tsx`

- [ ] **Step 1: Create WheelNudge**

```tsx
// src/components/CheckinModal/sections/WheelNudge.tsx
import { useNavigate } from 'react-router-dom'
import { useWheelStore } from '../../../stores/wheelStore'

interface WheelNudgeProps {
  onClose: () => void
}

export default function WheelNudge({ onClose }: WheelNudgeProps) {
  const navigate  = useNavigate()
  const { checkins, categories } = useWheelStore()

  // Find latest check-in that has real category scores (not empty from popup)
  const latestScored = checkins.find(c => c.scores && Object.keys(c.scores).length > 0)

  if (!latestScored || categories.length === 0) return null

  const scoreEntries = Object.entries(latestScored.scores)
  if (scoreEntries.length === 0) return null

  const [weakestName, weakestScore] = scoreEntries.sort(([,a],[,b]) => a - b)[0]
  const total = scoreEntries.reduce((s, [,v]) => s + v, 0)

  const openWheel = () => { onClose(); navigate('/wheel') }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5 flex gap-4 items-center">
      {/* Mini donut */}
      <svg width="72" height="72" viewBox="0 0 100 100" className="shrink-0">
        {(() => {
          let angle = -90
          return scoreEntries.map(([name, score], i) => {
            const sweep = (score / total) * 360
            const x1 = 50 + 36 * Math.cos((angle * Math.PI) / 180)
            const y1 = 50 + 36 * Math.sin((angle * Math.PI) / 180)
            const a2 = angle + sweep
            const x2 = 50 + 36 * Math.cos((a2 * Math.PI) / 180)
            const y2 = 50 + 36 * Math.sin((a2 * Math.PI) / 180)
            const large = sweep > 180 ? 1 : 0
            const isWeak = name === weakestName
            angle = a2
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 36 36 0 ${large} 1 ${x2} ${y2} Z`}
                fill="#1F3649"
                opacity={isWeak ? 1 : 0.15}
              />
            )
          })
        })()}
        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="46" textAnchor="middle" fontWeight="800" fontSize="14" fill="#2d3435">
          {weakestScore.toFixed(1)}
        </text>
        <text x="50" y="57" textAnchor="middle" fontSize="8" fill="#adb3b4">/10</text>
      </svg>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-1">Needs tending</div>
        <h3 className="text-[17px] font-bold tracking-tight text-[#2d3435]">
          {weakestName} feels a little thin.
        </h3>
        <p className="text-[13px] text-[#5a6061] mt-1 leading-relaxed">
          One small act today? A text to someone you miss counts.
        </p>
        <button
          onClick={openWheel}
          className="mt-2 text-[12.5px] font-bold text-[#1F3649] hover:underline cursor-pointer"
        >
          Open Wheel of Life →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create YesterdayRecap**

```tsx
// src/components/CheckinModal/sections/YesterdayRecap.tsx
import { useWheelStore } from '../../../stores/wheelStore'
import { useAuthStore }  from '../../../stores/authStore'

export default function YesterdayRecap() {
  const { checkins, tasks, updateTask } = useWheelStore()
  const { user } = useAuthStore()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const lastCheckin = checkins.find(c => c.date === yesterdayStr)
  const yesterdayTasks  = tasks.filter(t => t.due_date === yesterdayStr)
  const completedCount  = yesterdayTasks.filter(t => t.completed).length
  const carryOvers      = yesterdayTasks.filter(t => !t.completed)

  if (!lastCheckin && yesterdayTasks.length === 0) return null

  const today = new Date().toISOString().split('T')[0]
  const promote = (id: string) => updateTask(id, { due_date: today })

  const moodLabel = lastCheckin?.mood_words?.slice(0, 2).join(', ') ?? null

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-3">
        Yesterday, briefly
      </div>
      <div className="flex gap-4 items-start mb-4">
        <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#e4e9ea] to-[#f2f4f4] flex flex-col items-center justify-center shrink-0">
          <span className="font-extrabold text-[20px] text-[#1F3649] leading-none">{completedCount}</span>
          <span className="text-[9px] text-[#5a6061] font-semibold">of {yesterdayTasks.length}</span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#2d3435]">
            {completedCount === yesterdayTasks.length && yesterdayTasks.length > 0
              ? 'All done — clean slate today.'
              : `${yesterdayTasks.length - completedCount} tasks carried over.`}
          </p>
          {moodLabel && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-[#adb3b4] uppercase tracking-wider">Mood:</span>
              <span className="text-[11.5px] font-semibold text-[#2d3435] bg-[#f2f4f4] px-2.5 py-0.5 rounded-full">
                {moodLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {carryOvers.length > 0 && (
        <div className="border-t border-[#ECEFF2] pt-3">
          <div className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider mb-2">Carry-overs</div>
          {carryOvers.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#adb3b4] shrink-0" />
              <span className="flex-1 text-[13px] text-[#2d3435]">{t.title}</span>
              <button
                onClick={() => promote(t.id)}
                className="text-[11.5px] font-semibold text-[#1F3649] hover:underline cursor-pointer shrink-0"
              >
                Move to today →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create PrioritiesSection (top 3 urgent tasks)**

```tsx
// src/components/CheckinModal/sections/PrioritiesSection.tsx
import { useWheelStore } from '../../../stores/wheelStore'
import { CheckSquare, Square } from '@phosphor-icons/react'

export default function PrioritiesSection() {
  const { tasks, toggleTask } = useWheelStore()

  const top3 = tasks
    .filter(t => !t.completed && t.priority === 'urgent')
    .slice(0, 3)

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold tracking-tight text-[#2d3435]">Today's top 3</h3>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">If only these got done, today is a win.</p>
        </div>
      </div>

      {top3.length === 0 ? (
        <p className="text-[13px] text-[#adb3b4] italic py-2">No urgent tasks — breathe.</p>
      ) : (
        <ol className="space-y-1">
          {top3.map((task, idx) => (
            <li key={task.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f7f9fa] transition-colors">
              <div className="w-7 h-7 rounded-[8px] bg-[#f2f4f4] text-[#5a6061] flex items-center justify-center font-bold text-[13px] shrink-0">
                {idx + 1}
              </div>
              <span className="flex-1 text-[15px] font-semibold text-[#2d3435] leading-tight">{task.title}</span>
              <button
                onClick={() => toggleTask(task.id, true)}
                className="text-[#adb3b4] hover:text-[#1F3649] transition-colors cursor-pointer"
                aria-label="Complete task"
              >
                <Square size={20} weight="regular" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create CheckinTasksGrouped**

```tsx
// src/components/CheckinModal/sections/CheckinTasksGrouped.tsx
import { useState } from 'react'
import { useWheelStore } from '../../../stores/wheelStore'
import { useAuthStore }  from '../../../stores/authStore'
import { Plus, CheckSquare, Square } from '@phosphor-icons/react'
import type { TaskPriority } from '../../../stores/wheelStore'

type Group = { key: TaskPriority; label: string; hint: string; pillClass: string }

const GROUPS: Group[] = [
  { key: 'urgent', label: 'Urgent', hint: 'Do these first',        pillClass: 'bg-red-50 text-red-700' },
  { key: 'high',   label: 'High',   hint: 'Important, not fires',  pillClass: 'bg-amber-50 text-amber-700' },
  { key: 'normal', label: 'Normal', hint: 'If time allows',        pillClass: 'bg-[#f2f4f4] text-[#5a6061]' },
]

export default function CheckinTasksGrouped() {
  const { tasks, toggleTask, createTask } = useWheelStore()
  const { user } = useAuthStore()
  const [adding, setAdding] = useState<TaskPriority | null>(null)
  const [draft,  setDraft]  = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => !t.completed)

  const addTask = async (priority: TaskPriority) => {
    if (!draft.trim() || !user) { setAdding(null); return }
    await createTask({
      user_id:            user.id,
      title:              draft.trim(),
      priority,
      completed:          false,
      goal_id:            null,
      category_id:        null,
      project_id:         null,
      energy:             2,
      estimated_minutes:  null,
      due_date:           today,
    })
    setDraft('')
    setAdding(null)
  }

  return (
    <div className="space-y-4">
      {GROUPS.map(g => {
        const list = todayTasks.filter(t => t.priority === g.key)
        return (
          <div key={g.key}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className={['text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', g.pillClass].join(' ')}>
                  {g.label}
                </span>
                <span className="text-[12px] text-[#adb3b4]">{g.hint}</span>
                <span className="text-[11px] text-[#adb3b4]">· {list.length}</span>
              </div>
              <button
                onClick={() => setAdding(g.key)}
                className="text-[12px] font-semibold text-[#5a6061] hover:text-[#2d3435] inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="rounded-2xl border border-[#ECEFF2] bg-white divide-y divide-[#f2f4f4]">
              {list.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f9fa] transition-colors">
                  <button
                    onClick={() => toggleTask(task.id, true)}
                    className="text-[#adb3b4] hover:text-[#1F3649] transition-colors cursor-pointer shrink-0"
                  >
                    <Square size={18} />
                  </button>
                  <span className="flex-1 text-[14px] font-medium text-[#2d3435]">{task.title}</span>
                </div>
              ))}

              {adding === g.key && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Square size={18} className="text-[#adb3b4] shrink-0" />
                  <input
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addTask(g.key)
                      if (e.key === 'Escape') { setAdding(null); setDraft('') }
                    }}
                    onBlur={() => addTask(g.key)}
                    placeholder={`New ${g.label.toLowerCase()} task — Enter to add`}
                    className="flex-1 text-[14px] text-[#2d3435] bg-transparent border-none outline-none placeholder:text-[#adb3b4]"
                  />
                </div>
              )}

              {list.length === 0 && adding !== g.key && (
                <div className="px-4 py-3 text-[13px] text-[#adb3b4] italic">Nothing here — breathe.</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/CheckinModal/sections/WheelNudge.tsx \
        src/components/CheckinModal/sections/YesterdayRecap.tsx \
        src/components/CheckinModal/sections/PrioritiesSection.tsx \
        src/components/CheckinModal/sections/CheckinTasksGrouped.tsx
git commit -m "feat: add PageToday sections — wheel nudge, yesterday recap, priorities, task groups"
```

---

## Task 13: PageToday (Page 4)

**Files:**
- Modify: `src/components/CheckinModal/pages/PageToday.tsx` (replace stub)

- [ ] **Step 1: Replace PageToday stub**

```tsx
// src/components/CheckinModal/pages/PageToday.tsx
import PrioritiesSection    from '../sections/PrioritiesSection'
import CheckinTasksGrouped  from '../sections/CheckinTasksGrouped'
import WheelNudge           from '../sections/WheelNudge'
import YesterdayRecap       from '../sections/YesterdayRecap'

interface PageTodayProps {
  onClose: () => void
}

export default function PageToday({ onClose }: PageTodayProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[20px] font-bold tracking-tight text-[#2d3435] mb-0.5">Shape your day</h2>
        <p className="text-[13px] text-[#5a6061]">What matters today, and what to carry forward.</p>
      </div>

      <YesterdayRecap />
      <WheelNudge onClose={onClose} />
      <PrioritiesSection />
      <CheckinTasksGrouped />
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CheckinModal/pages/PageToday.tsx
git commit -m "feat: implement PageToday — yesterday recap, wheel nudge, priorities, task groups"
```

---

## Task 14: Wire AppLayout + Sidebar Button

**Files:**
- Modify: `src/components/Layout/AppLayout.tsx`
- Modify: `src/components/Layout/Sidebar.tsx`

- [ ] **Step 1: Wrap AppLayout with CheckinProvider and render CheckinModal**

In `src/components/Layout/AppLayout.tsx`:

Add imports at the top of the file (after existing imports):
```tsx
import { CheckinProvider } from '../../context/CheckinContext'
import CheckinModal from '../CheckinModal/CheckinModal'
```

Wrap the entire return value of `AppLayout` in `<CheckinProvider>` and add `<CheckinModal />` just before the closing `</CheckinProvider>` tag:

```tsx
// The AppLayout return becomes:
return (
  <CheckinProvider>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ... all existing content unchanged ... */}
    </div>
    <CheckinModal />
  </CheckinProvider>
)
```

The full modified return (replace only the outer wrapper, everything inside the `<div className="flex h-screen...">` stays exactly as it is):

```tsx
  return (
    <CheckinProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Narrow drag strip — only covers the ~40px traffic light zone, nothing below */}
        {isTauri && (
          <div
            onMouseDown={handleDragMouseDown}
            onDoubleClick={handleDragDoubleClick}
            className="fixed top-0 right-0 h-[40px] z-[39]"
            style={{ left: '80px' }}
          />
        )}
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top App Bar — unchanged */}
          <header className="w-full bg-background/80 backdrop-blur-xl sticky top-0 z-40 shrink-0 border-b border-[#F0F3F3]">
            {/* ... all header content unchanged ... */}
          </header>

          {/* Main content — unchanged */}
          <main
            className="flex-1 overflow-y-auto pb-16 md:pb-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)',
              backgroundSize: '20px 20px',
              backgroundPosition: '10px 10px',
            }}
          >
            <div className="max-w-[1400px] mx-auto px-4 md:px-12 w-full pt-10">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation — unchanged */}
        {/* ... mobile nav unchanged ... */}
      </div>
      <CheckinModal />
    </CheckinProvider>
  )
```

> **Practical instruction:** Do not retype the entire file. Use the Edit tool to:
> 1. Add the two new imports after the last existing import line
> 2. Replace `return (` + the opening `<div className="flex h-screen...">` with `return ( <CheckinProvider> <div className="flex h-screen...">`
> 3. Replace the closing `</div>` + `)` at the end of the return with `</div> <CheckinModal /> </CheckinProvider> )`

- [ ] **Step 2: Add check-in button to Sidebar**

In `src/components/Layout/Sidebar.tsx`:

Add import at the top (after existing phosphor imports):
```tsx
import { SunHorizon } from '@phosphor-icons/react'
import { useCheckin }  from '../../context/CheckinContext'
```

Inside the `Sidebar` function, add after the existing destructuring:
```tsx
const { openCheckin } = useCheckin()
```

Add the button between the `<UpdateCard />` and the `{/* Bottom bar */}` comment. Replace:
```tsx
      {/* Update card — only shown in Tauri desktop app when update is available */}
      <UpdateCard />

      {/* Bottom bar: settings + profile name */}
```

With:
```tsx
      {/* Daily check-in trigger */}
      <button
        onClick={openCheckin}
        className="w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-[15px] text-[#727A84] hover:bg-[#0C1629]/[0.03] font-semibold transition-all duration-200 cursor-pointer"
      >
        <SunHorizon size={20} weight="regular" className="shrink-0" />
        Daily Check-in
      </button>

      {/* Update card — only shown in Tauri desktop app when update is available */}
      <UpdateCard />

      {/* Bottom bar: settings + profile name */}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout/AppLayout.tsx \
        src/components/Layout/Sidebar.tsx
git commit -m "feat: wire CheckinModal into AppLayout and add Daily Check-in sidebar button"
```

---

## Task 15: Integration Verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```
Open http://localhost:5174 (or whichever port Vite picks).

- [ ] **Step 2: Verify auto-open**

On first load, the check-in modal should open automatically.
Check DevTools → Application → Local Storage → `logbird_checkin_last_opened` = today's date (e.g. `2026-04-19`).

- [ ] **Step 3: Verify localStorage prevents double-open**

Refresh the page. Modal should NOT auto-open again (today's date already stored).

- [ ] **Step 4: Verify sidebar button**

Click "Daily Check-in" in the sidebar → modal opens. Click X → modal closes.

- [ ] **Step 5: Verify progress dots and page navigation**

Navigate through all 4 pages using Next/Back. Confirm:
- Page 1: Hero greeting shows first name, mood word cloud and energy bars render
- Page 2: All mind sections render (intention, journal, gratitude, orb, habits empty state, quote)
- Page 3: Goals list renders (or empty state if no goals)
- Page 4: Yesterday recap, wheel nudge (if prior scored checkin exists), priorities, task groups

- [ ] **Step 6: Verify mood submit**

On Page 1, select at least 1 mood word and an energy level, then click Next.
Check Supabase → `wheel_checkins` table: a new row should appear with `mood_words` and `energy_level` populated and `scores = {}`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: daily check-in popup — complete implementation"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Auto-open once per day (Task 4 — localStorage)
- ✅ Sidebar button (Task 14)
- ✅ 4-page flow with progress dots (Task 4)
- ✅ Mood words + energy wired to wheelStore.createCheckin (Task 6)
- ✅ Category mismatch bug fixed — scores submitted as `{}`, not hardcoded defaults (Task 6)
- ✅ Journal quick-entry wired to journalStore.createEntry (Task 8)
- ✅ Goals from wheelStore (Task 11)
- ✅ Tasks grouped by priority with add/toggle (Task 12)
- ✅ Yesterday recap with carry-overs (Task 12)
- ✅ Wheel nudge from latest scored checkin (Task 12)
- ✅ Habits placeholder with empty state (Task 9)
- ✅ DB migration — new columns + tables (Task 1)
- ✅ Intention, Gratitude, Meditation, Purpose columns added to DB (Task 1)
- ✅ Idempotent checkin submit (Task 6 — checkinId guard)
- ✅ Skip (X button) closes without blocking (Task 4)

**Type consistency:** All store method names (`createCheckin`, `createTask`, `toggleTask`, `updateTask`, `createEntry`) match the actual store interfaces read from source.

**Known stubs for future sprints:**
- `persist()` in PageMind logs to console — needs `wheelStore.updateCheckin` method
- HabitsSection always shows empty state — needs habits fetch + toggle logic
- Purpose section not built — needs `user_profiles.purpose_statement/pillars` columns (DB ready)
