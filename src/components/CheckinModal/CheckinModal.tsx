import './checkin.css'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useCheckin } from '../../context/CheckinContext'
import { useAuthStore } from '../../stores/authStore'
import { useWheelStore } from '../../stores/wheelStore'
import { useJournalStore } from '../../stores/journalStore'

// ─── Tiny inline debounce hook (no extra dep needed) ─────────
function useDebounced<T extends (...a: any[]) => any>(fn: T, ms: number) {
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn); fnRef.current = fn
  return useCallback((...args: any[]) => {
    if (tRef.current) clearTimeout(tRef.current)
    tRef.current = setTimeout(() => fnRef.current(...args), ms)
  }, [ms])
}

// Sections
import { Hero, MoodSection, IntentionCard, Priorities, TasksGrouped, Timebox, Gratitude, WheelNudge, Yesterday, Habits, JournalQuick, QuoteCard } from './sections/sections'
import { BodyCheck } from './sections/body_check'
import { Affirmation } from './sections/affirmation'
import { Purpose } from './sections/purpose'
import { GoalsHub } from './sections/goals_hub'
import { Meditation } from './sections/meditation'
import { TweaksPanel } from './sections/tweaks'

// Atoms
import { Btn, Section } from './atoms'
import { CheckIcon, X_Icon, ArrowRight, Settings } from './icons'

// Data
import { INITIAL_TASKS, INITIAL_PRIORITIES, TIMEBOX } from './data'

// ─── Constants ───────────────────────────────────────────────
const STORAGE_KEY = 'logbird_checkin_last_opened'

const DEFAULT_TWEAKS = {
  layout: 'two',
  moodStyle: 'wheel',
  hero: 'navy',
  secMood: true,
  secGrat: true,
  secAffirm: true,
  secGoals: true,
  secBody: true,
  secPurpose: true,
  secHabits: true,
  secJournal: true,
  secMed: true,
  secIntent: true,
  secTop3: true,
  secTasks: true,
  secTimebox: true,
  secWheel: true,
  secYest: true,
  secQuote: true,
}

const PAGES = [
  { id: 'checkin',      label: 'Check-in',  subtitle: 'How you arrive'  },
  { id: 'mind',         label: 'Mind',      subtitle: 'Breathe, reflect' },
  { id: 'goals',        label: 'Goals',     subtitle: 'The bigger arc'  },
  { id: 'productivity', label: 'Today',     subtitle: 'Shape the day'   },
]

// ─── Main Component ───────────────────────────────────────────
export default function CheckinModal() {
  const { isOpen, openCheckin, closeCheckin } = useCheckin()
  const { user } = useAuthStore()
  const { upsertTodayCheckin, goals } = useWheelStore()
  const { upsertTodayMorningPages } = useJournalStore()

  // Auto-open once per day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const last  = localStorage.getItem(STORAGE_KEY)
    if (last !== today) {
      localStorage.setItem(STORAGE_KEY, today)
      openCheckin()
    }
  }, [openCheckin])

  // ── Page & UI state ──
  const [tweaks, setTweaks] = useState<any>(DEFAULT_TWEAKS)
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [closeAsk, setCloseAsk] = useState(false)
  const [breathOpen, setBreathOpen] = useState(false)
  const [nextAttemptToast, setNextAttemptToast] = useState<string | null>(null)

  // ── Checkin page state ──
  const [moodState, setMoodState] = useState<any>({ words: [], emoji: null, slider: null, weather: null })
  const [energy, setEnergy] = useState<number | null>(null)
  const [bodyValid, setBodyValid] = useState(false)
  const [moodValid, setMoodValid] = useState(false)
  const [showCheckinErrors, setShowCheckinErrors] = useState(false)

  // ── Mind page state ──
  const [intention, setIntention] = useState('')
  const [gratitude, setGratitude] = useState(['', '', ''])
  const [journal, setJournal] = useState('')

  // ── Autosave indicator ──
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // ── Checkin page extra ──
  const [affIdx, setAffIdx] = useState(() => Math.floor(Math.random() * 5))
  const [purposeText, setPurposeText] = useState('To build quiet, humane tools — and live a steady life with people I love.')
  const [purposeEditing, setPurposeEditing] = useState(false)

  // ── Today page state (local, per brief) ──
  const [priorities, setPriorities] = useState<any[]>(INITIAL_PRIORITIES)
  const [tasks, setTasks] = useState<any>(INITIAL_TASKS)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const toggleDone = (id: string) => setDone(d => ({ ...d, [id]: !d[id] }))
  const promote = (c: any) => setTasks((t: any) => ({ ...t, normal: [{ id: 'carry-' + c.id, title: c.title, project: null, time: null }, ...t.normal] }))

  // ── Autosave helpers ──
  const persistCheckin = useCallback(async (patch: Record<string, any>) => {
    if (!user) return
    setSaveStatus('saving')
    try {
      await upsertTodayCheckin(patch)
      setSaveStatus('saved')
    } catch (_) {
      setSaveStatus('idle')
    }
  }, [user, upsertTodayCheckin])

  const persistJournal = useCallback(async (text: string) => {
    if (!user) return
    setSaveStatus('saving')
    try {
      await upsertTodayMorningPages(text)
      setSaveStatus('saved')
    } catch (_) {
      setSaveStatus('idle')
    }
  }, [user, upsertTodayMorningPages])

  // Debounced versions
  const debouncedPersistCheckin = useDebounced(persistCheckin, 400)
  const debouncedPersistJournal = useDebounced(persistJournal, 800)

  // ── Mood state: kept for MoodSection UI only ──
  const [moodCommitted, setMoodCommitted] = useState(false)

  const commitMood = useCallback(() => {
    if (moodCommitted) return
    setMoodCommitted(true)
    debouncedPersistCheckin({ energy_level: energy, mood_words: moodState.words })
  }, [moodCommitted, energy, moodState.words, debouncedPersistCheckin])

  // ── Autosave: checkin fields ──
  useEffect(() => {
    if (!user) return
    debouncedPersistCheckin({
      energy_level:         energy,
      mood_words:           moodState.words,
      intention:            intention || null,
      gratitude:            gratitude.some(g => g.trim()) ? gratitude : null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energy, moodState.words, intention, gratitude])

  // ── Autosave: journal ──
  useEffect(() => {
    if (!user || !journal.trim()) return
    debouncedPersistJournal(journal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journal])

  // ── ESC handler ──
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCloseAsk(true) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // ── Close helpers ──
  const confirmClose = () => setCloseAsk(true)
  const doClose = useCallback(() => {
    setCloseAsk(false)
    closeCheckin()
    setPage(0)
  }, [closeCheckin])

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (page === 0) {
      const bodyOk = !tweaks.secBody || bodyValid
      const moodOk = !tweaks.secMood || moodValid
      if (!(bodyOk && moodOk)) {
        setShowCheckinErrors(true)
        const missing: string[] = []
        if (!bodyOk) missing.push('Body check-in')
        if (!moodOk) missing.push('Mood & energy')
        setNextAttemptToast(`Fill in ${missing.join(' and ')} before moving on — the highlighted fields need a pick.`)
        setTimeout(() => setNextAttemptToast(null), 4500)
        return
      }
      setShowCheckinErrors(false)
      setNextAttemptToast(null)
      // Commit mood on first advance past check-in
      commitMood()
    }
    setPage(p => Math.min(PAGES.length - 1, p + 1))
  }, [page, tweaks, bodyValid, moodValid, commitMood])

  const goBack = useCallback(() => {
    if (page === 0) { confirmClose(); return }
    setPage(p => Math.max(0, p - 1))
  }, [page])

  if (!isOpen) return null

  // ─── User name ───
  const userName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Toni'

  // ─── Affirmation list ───
  const AFF_LIST = [
    "I'm allowed to move at my own pace. Steady is still forward.",
    "I don't have to earn rest. I'm allowed to take up space.",
    "I can do hard things and still be gentle with myself.",
    "What I build quietly, compounds loudly. Keep going.",
    "I am not behind. I am exactly where today begins.",
  ]
  const aff = AFF_LIST[affIdx % AFF_LIST.length]

  // ─── Date / time header (checkin page) ───
  const now = new Date()
  const dd  = now.getDate()
  const mon = now.toLocaleDateString('en-GB', { month: 'short' })
  const wk  = now.toLocaleDateString('en-GB', { weekday: 'short' })
  const t24 = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  // ─── Stepper ───
  const Stepper = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {PAGES.map((p, i) => {
        const active    = i === page
        const completed = i < page
        return (
          <button
            key={p.id}
            onClick={() => setPage(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 0, padding: '6px 8px', cursor: 'pointer', borderRadius: 10 }}
          >
            <span style={{
              width: 26, height: 26, borderRadius: 9999,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heading)',
              background: active || completed ? '#1F3649' : '#f2f4f4',
              color: active || completed ? '#fff' : '#5a6061',
              transition: 'all 200ms ease',
              boxShadow: active ? '0 0 0 4px rgba(31,54,73,0.12)' : 'none',
            }}>
              {completed ? <CheckIcon size={13} color="#fff" stroke={3}/> : i + 1}
            </span>
            <span style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: active || completed ? '#2d3435' : '#adb3b4', letterSpacing: '-0.005em', display: 'block' }}>
                {p.label}
              </span>
              <span style={{ fontSize: 10.5, color: '#adb3b4', marginTop: 1, display: 'block' }}>
                {p.subtitle}
              </span>
            </span>
            {i < PAGES.length - 1 && (
              <span style={{ width: 24, height: 1, background: '#ECEFF2', marginLeft: 4 }}/>
            )}
          </button>
        )
      })}
    </div>
  )

  // ─── Footer ───
  const Footer = (
    <div style={{ flexShrink: 0, position: 'relative' }}>
      {nextAttemptToast && (
        <div className="fade-up" style={{
          position: 'absolute', left: '50%', bottom: 'calc(100% + 10px)',
          transform: 'translateX(-50%)',
          background: '#fff', border: '1px solid #fecaca',
          boxShadow: '0 14px 32px rgba(12,22,41,0.16), 0 0 0 4px rgba(254,202,202,0.35)',
          padding: '10px 14px', borderRadius: 12,
          display: 'inline-flex', alignItems: 'center', gap: 10,
          maxWidth: 520, zIndex: 10,
        }}>
          <span style={{ width: 22, height: 22, borderRadius: 9999, background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><path d="M12 16h.01"/>
            </svg>
          </span>
          <span style={{ fontSize: 12.5, color: '#2d3435', fontWeight: 500, lineHeight: 1.4 }}>{nextAttemptToast}</span>
          <button onClick={() => setNextAttemptToast(null)} style={{ background: 'transparent', border: 0, color: '#adb3b4', cursor: 'pointer', padding: 0, marginLeft: 4, display: 'inline-flex' }} aria-label="Dismiss">
            <X_Icon size={12}/>
          </button>
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px',
        borderTop: '1px solid #ECEFF2',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(14px)',
      }}>
        <Btn variant="ghost" onClick={goBack}>
          ← {page === 0 ? 'Close' : PAGES[page - 1].label}
        </Btn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {PAGES.map((_, i) => (
            <span key={i} style={{
              width: i === page ? 22 : 6, height: 6, borderRadius: 9999,
              background: i === page ? '#1F3649' : i < page ? '#1F3649' : '#dde4e5',
              transition: 'all 220ms ease',
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saveStatus !== 'idle' && (
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: saveStatus === 'saved' ? '#22c55e' : '#adb3b4',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'color 200ms ease',
            }}>
              {saveStatus === 'saved'
                ? <><CheckIcon size={11} color="#22c55e" stroke={3}/> Saved</>
                : 'Saving…'}
            </span>
          )}
          {page < PAGES.length - 1 ? (
            <Btn variant="primary" onClick={goNext}>
              Next: {PAGES[page + 1].label} <ArrowRight size={14}/>
            </Btn>
          ) : (
            <Btn variant="primary" onClick={doClose}>
              Start the day <ArrowRight size={14}/>
            </Btn>
          )}
        </div>
      </div>
    </div>
  )

  // ─── Float tweaks button ───
  const floatBtn = (
    <button onClick={() => setTweaksOpen(v => !v)} title="Tweaks" style={{
      position: 'absolute', bottom: 84, right: 20, zIndex: 80,
      width: 40, height: 40, borderRadius: 12,
      background: '#1F3649', color: '#fff', border: 0,
      display: tweaksOpen ? 'none' : 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 10px 30px rgba(31,54,73,0.25)',
    }}>
      <Settings size={18} color="#fff"/>
    </button>
  )

  // ─── Page 1: Check-in ───
  const CheckinHeader = (
    <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #ECEFF2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 5 }}>
            step 1 · check-in
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Good morning, {userName}.
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', color: '#2d3435', lineHeight: 1 }}>{dd} {mon}</div>
            <div style={{ fontSize: 11, color: '#adb3b4', marginTop: 3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{wk}</div>
          </div>
          <span style={{ width: 1, height: 34, background: '#ECEFF2' }}/>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em', color: '#2d3435', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{t24}</div>
            <div style={{ fontSize: 11, color: '#adb3b4', marginTop: 3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Amsterdam</div>
          </div>
        </div>
      </div>

      {/* Affirmation + Purpose strip */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 28, alignItems: 'baseline' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase' }}>Today</span>
            <button onClick={() => setAffIdx(i => i + 1)} style={{ background: 'transparent', border: 0, color: '#adb3b4', fontSize: 10, fontWeight: 600, cursor: 'pointer', padding: 0 }} title="Another affirmation">↻</button>
          </div>
          <p style={{ margin: 0, color: '#5a6061', fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.45 }}>"{aff}"</p>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: '#1F3649', textTransform: 'uppercase' }}>Purpose</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {['#dde4e5','#cdd4d7','#adb3b4'].map((c, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: 9999, background: c }}/>)}
            </span>
            <button onClick={() => setPurposeEditing(v => !v)} style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: '#adb3b4', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              {purposeEditing ? 'Done' : 'Edit'}
            </button>
          </div>
          {purposeEditing ? (
            <textarea value={purposeText} onChange={e => setPurposeText(e.target.value)} rows={2} autoFocus style={{ width: '100%', resize: 'none', padding: 6, borderRadius: 8, background: '#fafbfb', border: '1px solid #ECEFF2', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontStyle: 'italic', color: '#2d3435', lineHeight: 1.45, outline: 'none' }}/>
          ) : (
            <p style={{ margin: 0, color: '#5a6061', fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.45 }}>"{purposeText}"</p>
          )}
        </div>
      </div>
    </div>
  )

  const CheckinPage = (
    <div className="fade-up" key="checkin">
      {CheckinHeader}
      <div className="two-col">
        <div>
          {tweaks.secBody && (
            <Section id="body" title="Body check-in" defaultOpen>
              <BodyCheck showErrors={showCheckinErrors} onValidChange={setBodyValid}/>
            </Section>
          )}
        </div>
        <div>
          {tweaks.secMood && (
            <Section id="mood" title="Mood & energy" defaultOpen>
              <MoodSection
                moodStyle={tweaks.moodStyle}
                moodState={moodState} setMoodState={setMoodState}
                energy={energy} setEnergy={setEnergy}
                committed={moodCommitted}
                onCommit={commitMood}
                showErrors={showCheckinErrors}
                onValidChange={setMoodValid}
              />
            </Section>
          )}
        </div>
      </div>
    </div>
  )

  // ─── Page 2: Mind ───
  const MindPage = (
    <div className="fade-up" key="mind">
      <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #ECEFF2' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 5 }}>
            step 2 · mind
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Quiet the static. Notice what's here.
          </h2>
        </div>
        {tweaks.secQuote && (
          <div style={{ marginTop: 14 }}>
            <QuoteCard inline/>
          </div>
        )}
      </div>

      <div className="two-col">
        <div>
          {tweaks.secJournal && (
            <Section id="journal" title="Morning pages" defaultOpen>
              <JournalQuick value={journal} setValue={setJournal}/>
            </Section>
          )}
          {tweaks.secGrat && (
            <Section id="grat" title="Gratitude" defaultOpen>
              <Gratitude values={gratitude} setValues={setGratitude}/>
            </Section>
          )}
          {tweaks.secMed && (
            <div className="fade-up" style={{ marginBottom: 18 }}>
              <button
                onClick={() => setBreathOpen(true)}
                className="breath-pill"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'linear-gradient(135deg,#f5f7f8,#e9edef)', border: '1px solid #e4e9ea', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 3px rgba(12,22,41,0.04)' }}
                title="Open guided breathwork"
              >
                <span className="breath-orb" style={{ width: 38, height: 38, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%,#a7c2d6,#1F3649 75%)', boxShadow: 'inset -5px -7px 12px rgba(0,0,0,0.18),inset 5px 6px 12px rgba(255,255,255,0.28)', flexShrink: 0 }}/>
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, lineHeight: 1.25 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2d3435' }}>One-minute pause</span>
                  <span style={{ fontSize: 11.5, color: '#5a6061', marginTop: 2, fontWeight: 500 }}>Let the orb guide your breath — in, hold, out.</span>
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a6061" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M15 3h6v6"/><path d="M10 14l11-11"/><path d="M21 14v7H3V3h7"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div>
          {tweaks.secIntent && (
            <Section id="intent" title="Intention" defaultOpen>
              <IntentionCard value={intention} setValue={setIntention}/>
            </Section>
          )}
          {tweaks.secHabits && (
            <Section id="habits" title="Habit streaks" defaultOpen>
              <Habits/>
            </Section>
          )}
        </div>
      </div>
    </div>
  )

  // ─── Page 3: Goals (reads from wheelStore.goals) ───
  const activeGoals = goals.filter((g: any) => g.status === 'active')

  const GoalsPage = (
    <div className="fade-up" key="goals">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #ECEFF2' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 5 }}>
            step 3 · goals
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            The bigger arc.
          </h2>
          <p style={{ marginTop: 3, color: '#5a6061', fontSize: 13, maxWidth: 640, lineHeight: 1.5 }}>
            The whole stack — from the life-shaped ones down to what this week is quietly in service of.
          </p>
        </div>
      </div>

      {tweaks.secGoals && (
        activeGoals.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {activeGoals.map((g: any) => (
              <div
                key={g.id}
                style={{
                  textAlign: 'left',
                  padding: '16px 18px', borderRadius: 14,
                  border: '1px solid #ECEFF2', background: '#fff',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2d3435', letterSpacing: '-0.01em' }}>{g.title}</div>
                  {g.description && <div style={{ fontSize: 12.5, color: '#5a6061', marginTop: 3, lineHeight: 1.4 }}>{g.description}</div>}
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: '#1F3649', color: '#fff',
                }}>
                  {g.status}
                </span>
              </div>
            ))}
            <p style={{ padding: '12px 18px', borderRadius: 14, border: '1px dashed #ECEFF2', background: '#fafbfb', color: '#adb3b4', fontSize: 12.5, fontWeight: 500, textAlign: 'center', margin: 0 }}>
              You can add goals after your check-in.
            </p>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#2d3435' }}>No active goals yet.</p>
            <p style={{ fontSize: 13, color: '#5a6061' }}>Set your first goal to start tracking the bigger arc.</p>
            <p style={{ fontSize: 12.5, color: '#adb3b4', fontWeight: 500 }}>You can add goals after your check-in.</p>
          </div>
        )
      )}
    </div>
  )

  // ─── Page 4: Today ───
  const ProductivityPage = (
    <div className="fade-up" key="prod">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #ECEFF2' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 5 }}>
            step 4 · today
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            What does today ask of you?
          </h2>
          <p style={{ marginTop: 3, color: '#5a6061', fontSize: 13, maxWidth: 640, lineHeight: 1.5 }}>
            A handful of tasks, arranged into the shape of the day.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5a6061' }}>
          <span><strong style={{ color: '#2d3435', fontSize: 17, fontFamily: 'var(--font-heading)' }}>
            {tasks.urgent.length + tasks.high.length + tasks.normal.length}
          </strong> tasks</span>
          <span><strong style={{ color: '#2d3435', fontSize: 17, fontFamily: 'var(--font-heading)' }}>
            {TIMEBOX.length}
          </strong> blocks</span>
        </div>
      </div>

      <div className="two-col">
        {tweaks.secTasks && (
          <Section id="tasks" title="Today's tasks" defaultOpen action={<button className="link-btn">All tasks →</button>}>
            <TasksGrouped tasks={tasks} setTasks={setTasks} done={done} toggleDone={toggleDone}/>
          </Section>
        )}
        <div>
          {tweaks.secTimebox && (
            <Section id="timebox" title="Today's shape" defaultOpen>
              <Timebox/>
            </Section>
          )}
        </div>
      </div>
    </div>
  )

  const pages = [CheckinPage, MindPage, GoalsPage, ProductivityPage]

  // ─── Render ───
  return (
    <>
      <div className="scrim" onClick={confirmClose}/>
      <div className="modal-shell" role="dialog" aria-modal="true" aria-label="Morning check-in">

        {/* Titlebar */}
        <div className="modal-titlebar">
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
            {Stepper}
          </div>
          <button className="modal-close" onClick={confirmClose} aria-label="Close">
            <X_Icon size={14}/> Close
          </button>
        </div>

        {/* Scrollable content */}
        <div className="modal-scroll" key={page}>
          <div className="page-wrap">
            <style>{`@media (max-width: 960px) { .two-col { grid-template-columns: 1fr !important; } }`}</style>
            {pages[page]}
          </div>
        </div>

        {Footer}
        {floatBtn}
        <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} open={tweaksOpen} setOpen={setTweaksOpen}/>

        {/* Breath overlay */}
        {breathOpen && (
          <div
            onClick={() => setBreathOpen(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 180, background: 'rgba(12,22,41,0.40)', backdropFilter: 'blur(8px) saturate(1.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scrimIn 220ms ease both' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: 'min(520px,calc(100% - 48px))', background: '#FAFBFB', borderRadius: 22, boxShadow: '0 30px 80px rgba(12,22,41,0.35),inset 0 0 0 1px rgba(255,255,255,0.6)', overflow: 'hidden', animation: 'modalIn 320ms cubic-bezier(0.22,1,0.36,1) both', position: 'relative' }}>
              <button
                onClick={() => setBreathOpen(false)}
                style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, width: 28, height: 28, borderRadius: 9999, background: 'rgba(255,255,255,0.85)', border: '1px solid #ECEFF2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5a6061' }}
                aria-label="Close breath"
              >
                <X_Icon size={12}/>
              </button>
              <Meditation/>
            </div>
          </div>
        )}

        {/* Close confirmation */}
        {closeAsk && (
          <div
            onClick={() => setCloseAsk(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(15,25,35,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <div onClick={e => e.stopPropagation()} className="fade-up" style={{ maxWidth: 420, width: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 24px 72px rgba(12,22,41,0.28)', padding: 26, textAlign: 'left' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(140deg,#f2f4f4,#e4e9ea)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5a6061" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: '#1a1f20', marginBottom: 8 }}>
                Skip your morning check-in?
              </h3>
              <p style={{ fontSize: 13.5, color: '#5a6061', lineHeight: 1.55, marginBottom: 8 }}>
                It only takes a minute, and it's not really advisable to skip —
                these small daily signals are how Logbird learns what makes <em>your</em> good days good.
              </p>
              <p style={{ fontSize: 13.5, color: '#5a6061', lineHeight: 1.55, marginBottom: 20 }}>
                Stay a minute? Your future self will thank you.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={doClose}
                  style={{ padding: '10px 14px', borderRadius: 10, background: 'transparent', border: '1px solid #ECEFF2', color: '#5a6061', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Yes, I'm sure
                </button>
                <button
                  onClick={() => setCloseAsk(false)}
                  autoFocus
                  style={{ padding: '10px 16px', borderRadius: 10, background: '#1F3649', border: '1px solid #1F3649', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(31,54,73,0.25)' }}
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
