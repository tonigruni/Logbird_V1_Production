import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  Plus, Calendar, FileText, Trash2, Save,
  ChevronRight, ChevronLeft, ChevronDown, Layout,
  BarChart2, Hash, TrendingUp, Star, Frown, Meh, Smile,
  MapPin, Cloud, Tag, MoreHorizontal, X,
  Moon, Heart, RefreshCw, Sun, Target, BookOpen, Wind, Zap, Leaf, Sparkles, Search, Wine, Dumbbell,
  type LucideIcon,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import RichEditor from '../components/RichEditor'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore, type JournalEntry } from '../stores/journalStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, subDays } from 'date-fns'
import { cn } from '../lib/utils'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import { GridPattern } from '../components/ui/grid-pattern'
import JournalFilterBar, { type MoodRange, type SortOrder } from '../components/ui/JournalFilterBar'
import { FloatingAiAssistant } from '../components/ui/GlowingAiChatAssistant'
import { FullScreenCalendar, type CalendarDay } from '../components/ui/fullscreen-calendar'
import { ExpandableCard } from '../components/ui/expandable-card'

import { Pagination, PaginationContent, PaginationItem, PaginationButton, PaginationPrev, PaginationNext, PaginationEllipsis } from '../components/ui/pagination'

/* ------------------------------------------------------------------ */
/*  Built-in Templates                                                  */
/* ------------------------------------------------------------------ */

interface BuiltInTemplate {
  id: string
  name: string
  subtitle: string
  category: string
  icon: LucideIcon
  colorFrom: string
  colorTo: string
  howItWorks: string
  principle: string
  focus: string
  benefits: string[]
  quote: string
  prompts: { label: string; placeholder: string; prefix?: string }[]
  footerLeft: string
}

const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'stoic_evening_review',
    name: 'The Stoic Evening Review',
    subtitle: 'A structured end-of-day reflection to help you review your actions, learn from your reactions, and focus on what was within your control.',
    category: 'Personal',
    icon: Moon,
    colorFrom: '#1a2540',
    colorTo: '#003d6b',
    howItWorks: 'The Stoic Evening Review helps you step back and look at your day with clarity. Instead of judging yourself, you reflect like an observer: what you handled well, where you could have responded better, and what was never yours to control. The goal is not perfection, but greater awareness, steadiness, and alignment with your values.',
    principle: 'Reflect with honesty, not self-criticism.',
    focus: 'Separate your response from external events.',
    benefits: [
      'Builds self-awareness through consistent reflection.',
      'Strengthens emotional steadiness in difficult moments.',
      'Helps you respond with more intention and less impulse.',
    ],
    quote: '"You have power over your mind — not outside events. Realize this, and you will find strength." — Marcus Aurelius',
    prompts: [
      { label: 'What did I handle well today?', placeholder: 'Think about moments where you acted with patience, discipline, honesty, courage, or restraint. What did you do well, and what helped you respond that way?' },
      { label: 'Where could I have responded better?', placeholder: 'Notice where emotion, distraction, ego, or impulse influenced your behavior. What happened, and what would a wiser response have looked like?' },
      { label: 'What was outside my control?', placeholder: 'Reflect on what happened that you could not change. What would it look like to accept it fully and focus only on your response?', prefix: 'Acceptance:' },
    ],
    footerLeft: 'Memento Mori . Memento Vivere',
  },
  {
    id: 'emotional_clarity',
    name: 'Emotional Clarity',
    subtitle: 'A guided reflection to help you understand what you feel, what triggered it, and what you need next.',
    category: 'Personal',
    icon: Heart,
    colorFrom: '#7c2d12',
    colorTo: '#c2410c',
    howItWorks: 'This template helps you slow down and put emotions into words. Instead of staying stuck in vague stress or mental overload, you identify what happened, what you feel, and what may be underneath it. The goal is not to fix everything immediately, but to move from confusion to clarity.',
    principle: 'Name the feeling before trying to solve it.',
    focus: 'Move from emotional fog to emotional understanding.',
    benefits: [
      'Helps reduce overwhelm by making emotions more concrete.',
      'Improves self-awareness and emotional vocabulary.',
      'Supports healthier responses instead of emotional avoidance.',
    ],
    quote: '"Feelings need air, language, and time to transform."',
    prompts: [
      { label: 'What am I feeling right now?', placeholder: 'Name the emotions as specifically as you can. Go beyond good, bad, stressed, or fine. What is actually present?' },
      { label: 'What seems to be underneath it?', placeholder: 'Think about what triggered this feeling. Is there a fear, unmet need, frustration, disappointment, or deeper tension behind it?' },
      { label: 'What do I need right now?', placeholder: 'Write what would help most in this moment: rest, distance, clarity, reassurance, action, support, or something else.', prefix: 'Next step:' },
    ],
    footerLeft: 'Feel . Name . Understand',
  },
  {
    id: 'thought_reframing',
    name: 'Thought Reframing',
    subtitle: 'A structured exercise to challenge unhelpful thoughts and replace them with a more balanced perspective.',
    category: 'Personal',
    icon: RefreshCw,
    colorFrom: '#064e3b',
    colorTo: '#059669',
    howItWorks: 'This template is based on cognitive reframing. It helps you notice the story your mind is telling, test whether it is accurate, and create a more realistic interpretation. The aim is not forced positivity, but clearer thinking and more grounded action.',
    principle: 'Thoughts are interpretations, not always facts.',
    focus: 'Challenge distortions before they shape your behavior.',
    benefits: [
      'Reduces the impact of overthinking and negative spirals.',
      'Improves decision-making under stress.',
      'Helps create more realistic and useful self-talk.',
    ],
    quote: '"You don\'t have to believe every thought you think."',
    prompts: [
      { label: 'What thought is shaping how I feel?', placeholder: 'Write the exact thought that is driving your reaction. What are you telling yourself about the situation?' },
      { label: 'What evidence supports or challenges it?', placeholder: 'Look at the facts. What supports this thought, what contradicts it, and what might you be assuming without proof?' },
      { label: 'What is a more balanced perspective?', placeholder: 'Write a version of the thought that feels more realistic, fair, and useful without pretending everything is fine.', prefix: 'Reframe:' },
    ],
    footerLeft: 'Notice . Test . Reframe',
  },
  {
    id: 'gratitude_practice',
    name: 'Gratitude Practice',
    subtitle: 'A simple reflection to help you notice what is already good, meaningful, or supportive in your life.',
    category: 'Gratitude',
    icon: Sun,
    colorFrom: '#78350f',
    colorTo: '#d97706',
    howItWorks: 'Gratitude journaling trains your attention to notice what is working, not just what is missing. This does not mean ignoring problems. It means balancing your focus by recognizing moments, people, and experiences that support your life in ways you may normally overlook.',
    principle: 'What you notice shapes how you feel.',
    focus: 'Shift attention from lack to appreciation.',
    benefits: [
      'Strengthens positive attention and appreciation.',
      'Improves mood without requiring a major life change.',
      'Builds a more grounded sense of enough.',
    ],
    quote: '"Gratitude turns what we have into enough."',
    prompts: [
      { label: 'What am I grateful for today?', placeholder: 'List specific things, moments, people, or experiences that you appreciate today, even if they seem small.' },
      { label: 'Why did these matter to me?', placeholder: 'Go deeper than listing. What made these things meaningful, comforting, helpful, or valuable?' },
      { label: 'What good thing might I have overlooked?', placeholder: 'Think about a small detail, gesture, comfort, or opportunity that could have easily passed unnoticed.', prefix: 'Awareness:' },
    ],
    footerLeft: 'Notice . Appreciate . Ground',
  },
  {
    id: 'daily_focus',
    name: 'Daily Focus',
    subtitle: 'A practical planning reflection to help you decide what matters most and act on it with clarity.',
    category: 'Work',
    icon: Target,
    colorFrom: '#0C1629',
    colorTo: '#2563eb',
    howItWorks: 'This template turns intention into action. Instead of carrying a vague sense of pressure, you define what matters most today, what could get in your way, and where your energy should go first. The goal is not to do more, but to act on what matters most.',
    principle: 'Clarity creates momentum.',
    focus: 'Prioritize impact over activity.',
    benefits: [
      'Helps reduce mental clutter and scattered effort.',
      'Improves follow-through on important tasks.',
      'Creates a more intentional and realistic plan for the day.',
    ],
    quote: '"What is important is seldom urgent, and what is urgent is seldom important." — Dwight D. Eisenhower',
    prompts: [
      { label: 'What matters most today?', placeholder: 'Identify the one result or priority that would make today feel meaningful or successful.' },
      { label: 'What could distract or block me?', placeholder: 'Be honest about likely obstacles, delays, fears, habits, or competing demands that could pull you off track.' },
      { label: 'What is my first concrete step?', placeholder: 'Write the first small, clear action you will take to get moving without overthinking it.', prefix: 'Action:' },
    ],
    footerLeft: 'Prioritize . Act . Progress',
  },
  {
    id: 'reflective_learning',
    name: 'Reflective Learning',
    subtitle: 'A thoughtful review to help you make sense of experiences, extract lessons, and grow from them.',
    category: 'Personal',
    icon: BookOpen,
    colorFrom: '#14532d',
    colorTo: '#15803d',
    howItWorks: 'Reflective journaling helps you pause after an experience and ask what it meant, what it revealed, and what it taught you. Rather than simply replaying the event, you turn it into insight. The purpose is learning through reflection, not just remembering what happened.',
    principle: 'Experience becomes useful when examined.',
    focus: 'Turn events into lessons you can apply.',
    benefits: [
      'Deepens self-awareness through meaning-making.',
      'Helps you learn from both success and difficulty.',
      'Builds stronger patterns of insight and adaptation.',
    ],
    quote: '"We do not learn from experience... we learn from reflecting on experience." — John Dewey',
    prompts: [
      { label: 'What happened that feels worth reflecting on?', placeholder: 'Choose one event, conversation, decision, or moment that stands out today and describe it clearly.' },
      { label: 'What did this reveal or teach me?', placeholder: 'Think about what this experience showed you about yourself, others, your habits, or the situation.' },
      { label: 'What will I carry forward?', placeholder: 'Write one clear lesson, principle, or adjustment you want to remember or apply next time.', prefix: 'Application:' },
    ],
    footerLeft: 'Experience . Reflect . Learn',
  },
  {
    id: 'stream_of_consciousness',
    name: 'Stream of Consciousness',
    subtitle: 'A free-flow writing practice to clear mental noise, uncover patterns, and let your thoughts move without restriction.',
    category: 'Personal',
    icon: Wind,
    colorFrom: '#1f2937',
    colorTo: '#4b5563',
    howItWorks: 'This template is for writing without editing, filtering, or trying to be coherent. The goal is to let your mind empty itself onto the page. Often, what feels scattered at first reveals concerns, tensions, desires, or ideas that were hidden under the surface.',
    principle: 'Write first. Make sense of it later.',
    focus: 'Reduce internal noise by letting thoughts move.',
    benefits: [
      'Helps release mental clutter and pressure.',
      'Can reveal patterns you were not consciously noticing.',
      'Supports creativity, honesty, and unfiltered self-expression.',
    ],
    quote: '"Write what wants to be written."',
    prompts: [
      { label: 'What is taking up space in my mind?', placeholder: 'Start writing whatever is on your mind right now, without organizing it or trying to sound good.' },
      { label: 'What keeps repeating itself?', placeholder: 'As you write, notice any thought, worry, idea, or feeling that comes up more than once.' },
      { label: 'What am I beginning to notice?', placeholder: 'After writing freely, pause and name any pattern, tension, desire, or truth that stands out.', prefix: 'Awareness:' },
    ],
    footerLeft: 'Release . Flow . Notice',
  },
  {
    id: 'affirmation_identity',
    name: 'Affirmation & Identity',
    subtitle: 'A guided reflection to strengthen the identity you want to grow into through believable, grounded self-alignment.',
    category: 'Personal',
    icon: Zap,
    colorFrom: '#3b0764',
    colorTo: '#7e22ce',
    howItWorks: 'This template helps you connect words with identity and action. Instead of repeating empty affirmations, you reflect on the qualities you want to embody, where they are already present, and how to reinforce them through behavior. The goal is to build self-trust, not fantasy.',
    principle: 'Identity grows through repeated evidence.',
    focus: 'Align your self-talk with real action.',
    benefits: [
      'Strengthens self-belief in a realistic way.',
      'Helps define the person you want to become.',
      'Connects mindset with daily behavior.',
    ],
    quote: '"Act as if what you do makes a difference. It does." — William James',
    prompts: [
      { label: 'Who do I want to be more of?', placeholder: 'Choose a quality or identity you want to strengthen, such as calm, disciplined, confident, patient, or courageous.' },
      { label: 'Where is this already true?', placeholder: 'Write about moments, actions, or evidence that show this quality already exists in you in some form.' },
      { label: 'How will I reinforce this identity today?', placeholder: 'Name one concrete action that would make this identity more real through behavior, not just words.', prefix: 'Embodiment:' },
    ],
    footerLeft: 'Believe . Embody . Become',
  },
  {
    id: 'mindfulness_checkin',
    name: 'Mindfulness Check-In',
    subtitle: 'A present-moment reflection to help you notice your thoughts, body, and emotions without judgment.',
    category: 'Personal',
    icon: Leaf,
    colorFrom: '#0c4a6e',
    colorTo: '#0369a1',
    howItWorks: 'This template helps you pause and observe what is happening right now. Rather than analyzing or solving, you practice noticing. By paying attention to your breath, body, thoughts, and emotions as they are, you create more space between what you experience and how you respond.',
    principle: 'Awareness comes before change.',
    focus: 'Observe the present without rushing to fix it.',
    benefits: [
      'Builds calm through present-moment awareness.',
      'Supports emotional regulation and less reactivity.',
      'Creates more space between stimulus and response.',
    ],
    quote: '"Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor." — Thich Nhat Hanh',
    prompts: [
      { label: 'What am I noticing in this moment?', placeholder: 'Describe what you are aware of right now in your surroundings, your thoughts, or your internal state without trying to change it.' },
      { label: 'What do I notice in my body?', placeholder: 'Bring attention to sensations like tension, heaviness, ease, restlessness, warmth, or breath. What feels present physically?' },
      { label: 'Can I let this moment be as it is?', placeholder: 'Write about what becomes possible when you stop resisting this moment and simply observe it with openness.', prefix: 'Non-judgment:' },
    ],
    footerLeft: 'Pause . Notice . Allow',
  },
  {
    id: 'positive_reflection',
    name: 'Positive Reflection',
    subtitle: 'A guided reflection to help you notice what felt good, what gave you energy, and what strengthened you today.',
    category: 'Gratitude',
    icon: Sparkles,
    colorFrom: '#7c2d12',
    colorTo: '#ea580c',
    howItWorks: 'Positive reflection is not about pretending life is perfect. It is about giving attention to moments of strength, joy, progress, connection, or meaning that deserve to be remembered. This helps you build a more balanced internal narrative and recognize what supports your well-being.',
    principle: 'What nourishes you deserves attention too.',
    focus: 'Strengthen awareness of what gives life energy.',
    benefits: [
      'Improves mood by reinforcing positive experiences.',
      'Helps identify what genuinely energizes you.',
      'Supports resilience through a more balanced perspective.',
    ],
    quote: '"The good life is built with small moments of meaning, not just big achievements."',
    prompts: [
      { label: 'What felt genuinely good today?', placeholder: 'Think about moments that brought joy, relief, connection, pride, gratitude, calm, or a sense of progress.' },
      { label: 'What made these moments meaningful?', placeholder: 'Look deeper at why they mattered. What need, value, relationship, or strength did they connect with?' },
      { label: 'What do I want more of in my life?', placeholder: 'Based on today, what kind of moments, habits, or experiences seem worth creating more intentionally?', prefix: 'Reinforce:' },
    ],
    footerLeft: 'Notice Good . Build More',
  },
  {
    id: 'self_inquiry',
    name: 'Self-Inquiry',
    subtitle: 'A deeper reflection to help you understand your patterns, triggers, defenses, and hidden inner conflicts.',
    category: 'Personal',
    icon: Search,
    colorFrom: '#1e1b4b',
    colorTo: '#3730a3',
    howItWorks: 'This template is designed for deeper inner work. It helps you examine the moments that trigger you, the reactions that feel outsized, and the patterns that may be shaping your behavior beneath the surface. The goal is not self-judgment, but honest understanding and greater freedom.',
    principle: 'What is hidden often shapes what is repeated.',
    focus: 'Turn uncomfortable reactions into self-knowledge.',
    benefits: [
      'Reveals patterns behind recurring emotional reactions.',
      'Builds deeper self-awareness and inner honesty.',
      'Helps create more conscious choices over time.',
    ],
    quote: '"Until you make the unconscious conscious, it will direct your life and you will call it fate." — Carl Jung',
    prompts: [
      { label: 'What triggered me or stood out strongly today?', placeholder: 'Describe the moment, person, or situation that brought up a strong reaction in you and what made it stand out.' },
      { label: 'What might this reaction be pointing to?', placeholder: 'Look beneath the surface. Does this connect to fear, shame, insecurity, control, rejection, or an old pattern?' },
      { label: 'What truth about myself am I being invited to face?', placeholder: 'Write honestly about what this reaction may be revealing and what becomes possible if you stop avoiding it.', prefix: 'Awareness:' },
    ],
    footerLeft: 'Trigger . Reveal . Transform',
  },
]

function buildEntryContent(t: BuiltInTemplate, responses: string[]): string {
  return t.prompts.map((p, i) => {
    const heading = p.prefix ? `### ${p.prefix} ${p.label}` : `### ${p.label}`
    const response = responses[i]?.trim() || ''
    return `${heading}\n\n${response}`
  }).join('\n\n')
}

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const ENTRY_CATEGORIES = ['Personal', 'Work', 'Dreams', 'Ideas', 'Travel', 'Health', 'Gratitude']

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Personal:  { bg: 'bg-[#0C1629]/10',  text: 'text-[#0C1629]',  dot: '#0C1629' },
  Work:      { bg: 'bg-[#727A84]/10',  text: 'text-[#727A84]',  dot: '#727A84' },
  Dreams:    { bg: 'bg-[#9f403d]/10',  text: 'text-[#9f403d]',  dot: '#fe8983' },
  Ideas:     { bg: 'bg-[#162838]/10',  text: 'text-[#162838]',  dot: '#3f9eff' },
  Travel:    { bg: 'bg-[#22c55e]/10',  text: 'text-[#22c55e]',  dot: '#22c55e' },
  Health:    { bg: 'bg-[#16a34a]/10',  text: 'text-[#16a34a]',  dot: '#22c55e' },
  Gratitude: { bg: 'bg-[#ca8a04]/10',  text: 'text-[#ca8a04]',  dot: '#eab308' },
}
function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: 'bg-[#F0F3F3]', text: 'text-[#727A84]', dot: '#B5C1C8' }
}
function parseCategories(category: string | null | undefined): string[] {
  return category ? category.split(',').filter(Boolean) : []
}

const MOOD_META: Record<number, { label: string; short: string; chipClass: string; color: string; bg: string; icon: LucideIcon }> = {
  1: { label: 'Very Low', short: 'Very Low', chipClass: 'bg-red-100 text-red-700',         color: '#dc2626', bg: '#fef2f2', icon: Frown },
  2: { label: 'Low',      short: 'Low',      chipClass: 'bg-orange-100 text-orange-700',   color: '#ea580c', bg: '#fff7ed', icon: Frown },
  3: { label: 'Neutral',  short: 'Neutral',  chipClass: 'bg-[#F0F3F3] text-[#727A84]',     color: '#9ca3af', bg: '#f9fafb', icon: Meh   },
  4: { label: 'Good',     short: 'Good',     chipClass: 'bg-green-100 text-green-700',     color: '#16a34a', bg: '#f0fdf4', icon: Smile },
  5: { label: 'Excellent',short: 'Excellent',chipClass: 'bg-emerald-100 text-emerald-800', color: '#065f46', bg: '#ecfdf5', icon: Smile },
}

function stripMd(text: string): string {
  return text.replace(/#{1,6}\s/g, '').replace(/[*_`~]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
}
function countWords(content: string): string {
  const n = content.trim().split(/\s+/).filter(Boolean).length
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k words` : `${n} words`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type View = 'dashboard' | 'journal' | 'editor' | 'calendar' | 'templates'
type TemplateFilter = 'All' | 'Personal' | 'Work' | 'Gratitude'

export default function Journal() {
  const { user } = useAuthStore()
  const { entries, templates, loading, fetchEntries, fetchTemplates, createEntry, updateEntry, deleteEntry, createTemplate } = useJournalStore()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const [view, setView] = useState<View>(() => {
    if (tabParam === 'journal' || tabParam === 'calendar' || tabParam === 'templates') return tabParam
    return 'dashboard'
  })
  const [selected, setSelected] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [entryCategory, setEntryCategory] = useState<string[]>([])
  const [entryLocation, setEntryLocation] = useState('')
  const [entryWeather, setEntryWeather] = useState('')
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [hadAlcohol, setHadAlcohol] = useState<boolean | null>(null)
  const [exercised, setExercised] = useState<boolean | null>(null)
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high' | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedCalDay, setSelectedCalDay] = useState<Date | null>(null)
  const [calRatePeriod, setCalRatePeriod] = useState<'week' | 'month' | 'year'>('month')

  const [searchFilter, setSearchFilter] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Library state
  const [libraryViewMode, setLibraryViewMode] = useState<'list' | 'grid'>('grid')
  const [entriesPage, setEntriesPage] = useState(1)
  const [pageFading, setPageFading] = useState(false)
  const ENTRIES_PER_PAGE = libraryViewMode === 'list' ? 5 : 9

  const changePage = (page: number) => {
    setPageFading(true)
    setTimeout(() => {
      setEntriesPage(page)
      setPageFading(false)
    }, 120)
  }
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '3m'>('all')
  const [moodFilter, setMoodFilter] = useState<MoodRange | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [entryTypeFilter, setEntryTypeFilter] = useState<'template' | 'freewriting' | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  // Templates view
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('All')
  const [activeTemplateDetail, setActiveTemplateDetail] = useState<BuiltInTemplate | null>(null)
  const [promptResponses, setPromptResponses] = useState<string[]>([])
  const [extraThoughts, setExtraThoughts] = useState('')

  // AI chat

  useEffect(() => {
    if (user) { fetchEntries(user.id); fetchTemplates(user.id) }
  }, [user])

  // Sync view from URL tab param (top-bar navigation)
  useEffect(() => {
    const tab = searchParams.get('tab')
    const q = searchParams.get('q')
    if (q) {
      // Preserve tab param when clearing q
      setSearchFilter(q)
      const next = new URLSearchParams(searchParams)
      next.delete('q')
      setSearchParams(next, { replace: true })
      return
    }
    if (view === 'editor' && tab === 'editor') return // already in editor, no-op
    const mapped: Record<string, View> = { journal: 'journal', calendar: 'calendar', templates: 'templates', editor: 'editor' }
    setView(mapped[tab ?? ''] ?? 'dashboard')
  }, [searchParams])

  // Handle location state triggers (prefill from dashboard, openNew from AppLayout)
  useEffect(() => {
    const state = location.state as { prefill?: string; openNew?: boolean } | null
    if (state?.openNew) { openNew(); setView('editor'); window.history.replaceState({}, '') }
    else if (state?.prefill) { openNew(state.prefill); setView('editor'); window.history.replaceState({}, '') }
  }, [location.state])

  // Sync URL tab param when entering/leaving editor view
  useEffect(() => {
    if (view === 'editor') {
      setSearchParams({ tab: 'editor' }, { replace: true })
    } else if (new URLSearchParams(window.location.search).get('tab') === 'editor') {
      setSearchParams(view === 'dashboard' ? {} : { tab: view }, { replace: true })
    }
  }, [view])

  // Navigate to a non-editor view and sync the URL tab param
  const gotoView = (v: Exclude<View, 'editor'>) => {
    setView(v)
    if (v === 'dashboard') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ tab: v }, { replace: true })
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Computed values                                                  */
  /* ---------------------------------------------------------------- */

  const streak = useMemo(() => {
    if (!entries.length) return 0
    const dates = [...new Set(entries.map(e => format(new Date(e.created_at), 'yyyy-MM-dd')))].sort().reverse()
    let count = 0
    let check = new Date(); check.setHours(0,0,0,0)
    for (const ds of dates) {
      const d = new Date(ds)
      const diff = Math.round((check.getTime() - d.getTime()) / 86400000)
      if (diff <= 1) { count++; check = d } else break
    }
    return count
  }, [entries])

  const moodCounts = useMemo(() => {
    const c: Record<number, number> = {1:0,2:0,3:0,4:0,5:0}
    entries.forEach(e => { if (e.mood_score) c[e.mood_score]++ })
    return c
  }, [entries])

  const totalWords = useMemo(() =>
    entries.reduce((s, e) => s + e.content.trim().split(/\s+/).filter(Boolean).length, 0), [entries])

  const avgMood = useMemo(() => {
    const sc = entries.filter(e => e.mood_score != null)
    return sc.length ? sc.reduce((s, e) => s + (e.mood_score ?? 0), 0) / sc.length : 0
  }, [entries])

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {}
    entries.forEach(e => { parseCategories(e.category).forEach(cat => { c[cat] = (c[cat] || 0) + 1 }) })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [entries])

  const popularWords = useMemo(() => {
    const stop = new Set(['the','a','an','and','or','but','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','to','of','in','on','at','by','for','with','about','from','when','how','all','not','so','than','very','just','my','i','me','we','you','he','she','it','they','this','that','what','if','as','up','out','no','can','more','also','some','each','their','them','its','our'])
    const freq: Record<string, number> = {}
    entries.forEach(e => {
      stripMd(e.title + ' ' + e.content).toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/)
        .filter(w => w.length > 3 && !stop.has(w))
        .forEach(w => { freq[w] = (freq[w]||0)+1 })
    })
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([word,count])=>({word,count}))
  }, [entries])

  const libraryEntries = useMemo(() => {
    let r = [...entries]
    if (dateFilter !== 'all') {
      const days = dateFilter==='7d'?7:dateFilter==='30d'?30:90
      const cut = subDays(new Date(), days)
      r = r.filter(e => new Date(e.created_at) >= cut)
    }
    if (moodFilter !== null) r = r.filter(e => e.mood_score !== null && e.mood_score >= moodFilter.min && e.mood_score <= moodFilter.max)
    if (categoryFilter) r = r.filter(e => parseCategories(e.category).includes(categoryFilter))
    if (entryTypeFilter === 'template') r = r.filter(e => e.content.trimStart().startsWith('#'))
    if (entryTypeFilter === 'freewriting') r = r.filter(e => !e.content.trimStart().startsWith('#'))
    if (favoritesOnly) r = r.filter(e => e.is_favorite === true)
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      r = r.filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q))
    }
    if (sortOrder === 'oldest') r.sort((a,b) => new Date(a.created_at).getTime()-new Date(b.created_at).getTime())
    else if (sortOrder === 'best_mood') r.sort((a,b) => (b.mood_score ?? 0) - (a.mood_score ?? 0))
    else if (sortOrder === 'worst_mood') r.sort((a,b) => (a.mood_score ?? 6) - (b.mood_score ?? 6))
    else if (sortOrder === 'longest') r.sort((a,b) => b.content.length - a.content.length)
    else if (sortOrder === 'shortest') r.sort((a,b) => a.content.length - b.content.length)
    return r
  }, [entries, dateFilter, moodFilter, categoryFilter, entryTypeFilter, favoritesOnly, searchFilter, sortOrder])

  const totalPages = Math.max(1, Math.ceil(libraryEntries.length / ENTRIES_PER_PAGE))
  const pagedEntries = libraryEntries.slice((entriesPage - 1) * ENTRIES_PER_PAGE, entriesPage * ENTRIES_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => { setEntriesPage(1) }, [dateFilter, moodFilter, categoryFilter, entryTypeFilter, favoritesOnly, searchFilter, sortOrder])

  // Rule-based filter insight
  const filterInsight = useMemo(() => {
    const hasFilter = dateFilter !== 'all' || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly || searchFilter
    if (!hasFilter) return null
    const n = libraryEntries.length
    const s = n === 1 ? 'entry' : 'entries'
    if (favoritesOnly) return `${n} starred ${s}`
    if (moodFilter && moodFilter.max <= 2 && categoryFilter === 'Work') return `${n} difficult work ${s} — work may be affecting your mood.`
    if (moodFilter && moodFilter.max <= 2) {
      const workCount = libraryEntries.filter(e => parseCategories(e.category).includes('Work')).length
      if (workCount > n * 0.5) return `${n} difficult ${s} — over half relate to work.`
      return `${n} difficult ${s} found.`
    }
    if (moodFilter && moodFilter.min >= 4) return `${n} of your best ${s}.`
    if (searchFilter) return `${n} ${s} mention "${searchFilter}"`
    return `${n} ${s} match your filters`
  }, [dateFilter, moodFilter, categoryFilter, entryTypeFilter, favoritesOnly, searchFilter, libraryEntries])

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  const openNew = (templateContent = '') => {
    setSelected(null); setTitle(''); setContent(templateContent)
    setMoodScore(null); setEntryCategory([]); setEntryLocation(''); setEntryWeather('')
    setSleepQuality(null); setHadAlcohol(null); setExercised(null); setEnergyLevel(null)
    setSaveStatus('idle'); setActiveTemplateDetail(null); setPromptResponses([]); setExtraThoughts('')
  }

  const openEntry = (entry: JournalEntry) => {
    setSelected(entry); setTitle(entry.title); setContent(entry.content)
    setMoodScore(entry.mood_score); setEntryCategory(parseCategories(entry.category))
    setEntryLocation(entry.location ?? ''); setEntryWeather(entry.weather ?? '')
    setSleepQuality(entry.sleep_quality ?? null)
    setHadAlcohol(entry.had_alcohol ?? null)
    setExercised(entry.exercised ?? null)
    setEnergyLevel(entry.energy_level ?? null)
    setSaveStatus('idle'); setActiveTemplateDetail(null); setPromptResponses([])
  }

  const applyBuiltIn = (tpl: BuiltInTemplate) => {
    setSelected(null)
    setTitle(tpl.name)
    setContent('')
    setMoodScore(null)
    setEntryCategory(tpl.category ? [tpl.category] : [])
    setEntryLocation('')
    setEntryWeather('')
    setSleepQuality(null); setHadAlcohol(null); setExercised(null); setEnergyLevel(null)
    setSaveStatus('idle')
    setActiveTemplateDetail(tpl)
    setPromptResponses(tpl.prompts.map(() => ''))
    setExtraThoughts('')
    setView('editor')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const save = async () => {
    if (!user || !title.trim()) return
    setSaving(true)
    const finalContent = activeTemplateDetail && promptResponses.length > 0
      ? buildEntryContent(activeTemplateDetail, promptResponses) + (extraThoughts.trim() ? `\n\n### Additional Thoughts\n\n${extraThoughts.trim()}` : '')
      : content
    const payload = { title, content: finalContent, mood_score: moodScore, category: entryCategory.length ? entryCategory.join(',') : null, location: entryLocation || null, weather: entryWeather || null, sleep_quality: sleepQuality, had_alcohol: hadAlcohol, exercised, energy_level: energyLevel }
    if (selected) {
      await updateEntry(selected.id, payload)
    } else {
      const entry = await createEntry({ user_id: user.id, template_id: null, ...payload })
      if (entry) setSelected(entry)
    }
    setSaving(false); setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  // ── Autosave: debounce 1.5s after last change to title or content ──────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!user || !title.trim() || activeTemplateDetail) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      setSaving(true)
      const payload = { title, content, mood_score: moodScore, category: entryCategory.length ? entryCategory.join(',') : null, location: entryLocation || null, weather: entryWeather || null, sleep_quality: sleepQuality, had_alcohol: hadAlcohol, exercised, energy_level: energyLevel }
      if (selected) {
        await updateEntry(selected.id, payload)
      } else {
        const entry = await createEntry({ user_id: user.id, template_id: null, ...payload })
        if (entry) setSelected(entry)
      }
      setSaving(false); setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [title, content])

  const remove = async (id: string) => {
    await deleteEntry(id)
    setSelected(null); setTitle(''); setContent(''); setEntryCategory([]); setEntryLocation(''); setEntryWeather('')
    setActiveTemplateDetail(null); setPromptResponses([])
    gotoView('journal')
  }


  const saveTemplate = async () => {
    if (!user || !newTemplateName.trim()) return
    await createTemplate({ user_id: user.id, name: newTemplateName, structure: { content: newTemplateContent } })
    setNewTemplateName(''); setNewTemplateContent('')
  }

  /* ---------------------------------------------------------------- */
  /*  Calendar helpers                                                 */
  /* ---------------------------------------------------------------- */

  const monthStart = startOfMonth(calendarDate)
  const monthEnd   = endOfMonth(calendarDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)
  const entryDates = entries.map(e => format(new Date(e.created_at), 'yyyy-MM-dd'))
  const daysWithEntries = daysInMonth.filter(d => entryDates.includes(format(d, 'yyyy-MM-dd')))
  const consistencyScore = daysInMonth.length > 0
    ? Math.round((daysWithEntries.length / Math.min(daysInMonth.length, new Date() >= monthEnd ? daysInMonth.length : new Date().getDate())) * 100)
    : 0
  const selectedDayEntries = selectedCalDay ? entries.filter(e => isSameDay(new Date(e.created_at), selectedCalDay)) : []


  const [featuredIdx, setFeaturedIdx] = useState(0)
  const [featuredFading, setFeaturedFading] = useState(false)
  const featuredTpl = BUILT_IN_TEMPLATES[featuredIdx]

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedFading(true)
      setTimeout(() => {
        setFeaturedIdx(i => (i + 1) % BUILT_IN_TEMPLATES.length)
        setFeaturedFading(false)
      }, 300)
    }, 8000)
    return () => clearInterval(interval)
  }, [])
  const filteredBuiltIns = templateFilter === 'All'
    ? BUILT_IN_TEMPLATES
    : BUILT_IN_TEMPLATES.filter(t => t.category === templateFilter)

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="pb-24">

      {/* =================== DASHBOARD =================== */}
      {view === 'dashboard' && (
        <div className="animate-fade-in space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-[#727A84] uppercase tracking-wider mb-4"></h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-1 md:col-span-8 relative overflow-hidden card min-h-[220px] md:min-h-[280px] flex flex-col justify-between p-6 md:p-10 bg-[#0C1629]">
                <GradientBarsBackground key={featuredIdx} />
                <div
                  className={cn('flex flex-col justify-between flex-1 relative z-10', featuredFading ? 'slide-out-left' : '')}
                >
                  <div key={featuredIdx} className="slide-in-right">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-4">Featured Template</span>
                    <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{featuredTpl.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed max-w-md">{featuredTpl.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-5 mt-6">
                    <button onClick={() => applyBuiltIn(featuredTpl)}
                      className="bg-white hover:bg-white/90 text-[#0C1629] text-sm font-semibold px-6 py-2.5 rounded-[10px] transition-all cursor-pointer">
                      Apply Template
                    </button>
                    <button onClick={() => gotoView('templates')} className="text-sm text-white/60 hover:text-white font-medium cursor-pointer transition-colors">See all templates</button>
                    <div className="ml-auto flex items-center gap-1.5">
                      {BUILT_IN_TEMPLATES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setFeaturedFading(true); setTimeout(() => { setFeaturedIdx(i); setFeaturedFading(false) }, 300) }}
                          className={cn('transition-all duration-300 rounded-full', i === featuredIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60')}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-4 bg-[#F0F3F3] card p-6 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[280px] !border-2 !border-dashed !border-[#B5C1C8]/30 hover:!border-[#0C1629]/30 transition-colors group">
                <div>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><Plus size={20} className="text-[#727A84]"/></div>
                  <h3 className="text-base font-bold text-[#0C1629] mb-1.5">Blank canvas</h3>
                  <p className="text-sm text-[#727A84] leading-relaxed">No structure, no prompts — just your thoughts.</p>
                </div>
                <button onClick={() => { openNew(); setView('editor') }}
                  className="mt-5 flex items-center justify-center gap-1.5 bg-[#0C1629] hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] transition-all cursor-pointer">
                  <Plus size={13} /> New Entry
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#727A84] uppercase tracking-wider mb-4">Your Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:'All Entries', value:entries.length.toString(), sub:'Browse and edit your writing', icon:FileText, id:'journal' as View },
                { label:'Calendar',    value:`${consistencyScore}%`,    sub:'Consistency this month',    icon:Calendar, id:'calendar' as View },
                { label:'Templates',   value:BUILT_IN_TEMPLATES.length.toString(), sub:'Built-in writing structures',  icon:Layout,   id:'templates' as View },
              ].map(({ label, value, sub, icon: Icon, id }) => (
                <button key={id} onClick={() => gotoView(id as Exclude<View, 'editor'>)}
                  className="bg-white card p-6 text-left hover:shadow-[0_10px_40px_rgba(12,22,41,0.06)] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#0C1629]/10 flex items-center justify-center"><Icon size={16} className="text-[#0C1629]"/></div>
                    <ChevronRight size={14} className="text-[#B5C1C8] group-hover:text-[#0C1629] transition-colors"/>
                  </div>
                  <div className="text-2xl font-extrabold text-[#0C1629] mb-1">{value}</div>
                  <div className="text-sm font-semibold text-[#0C1629] mb-0.5">{label}</div>
                  <p className="text-xs text-[#727A84]">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {entries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#727A84] uppercase tracking-wider">Recent Entries</h2>
                <button onClick={() => gotoView('journal')} className="text-xs text-[#0C1629] hover:underline flex items-center gap-1 cursor-pointer">View all <ChevronRight size={12}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entries.slice(0,3).map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const MoodIcon = meta?.icon
                  const cats = parseCategories(entry.category)
                  return (
                    <div key={entry.id} onClick={() => { openEntry(entry); setView('editor') }}
                      className="bg-white card p-5 text-left hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">{format(new Date(entry.created_at),'MMM d, yyyy')}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1 rounded-lg transition-all cursor-pointer -mt-0.5', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#D6DCE0] hover:text-[#ca8a04]')}
                        >
                          <Star size={12} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-[#0C1629] mb-2 line-clamp-2 group-hover:text-[#0C1629] transition-colors">{entry.title}</h3>
                      <p className="text-xs text-[#727A84] line-clamp-3 leading-relaxed mb-4">{stripMd(entry.content).slice(0,120)}…</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F3]">
                        <span className="text-[10px] font-semibold text-[#B5C1C8]">{countWords(entry.content)}</span>
                        <div className="flex items-center gap-1.5">
                          {cats.map(cat => { const cc = getCatColor(cat); return <span key={cat} className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{cat}</span> })}
                          {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================== JOURNAL LIBRARY =================== */}
      {view === 'journal' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-fade-in">
          {/* Main area */}
          <div className="flex-1 min-w-0 w-full">
            {/* Filter bar */}
            <JournalFilterBar
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              moodFilter={moodFilter}
              setMoodFilter={setMoodFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              entryTypeFilter={entryTypeFilter}
              setEntryTypeFilter={setEntryTypeFilter}
              favoritesOnly={favoritesOnly}
              setFavoritesOnly={setFavoritesOnly}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              libraryViewMode={libraryViewMode}
              setLibraryViewMode={setLibraryViewMode}
            />

            {/* Rule-based insight */}
            {filterInsight && (
              <div className="mb-4 px-3 py-2 bg-[#0C1629]/5 rounded-[10px] text-xs text-[#0C1629] font-medium">
                {filterInsight}
              </div>
            )}

            {/* Entries */}
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow-sm"/>)}</div>
            ) : libraryEntries.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={32} className="text-[#B5C1C8] mx-auto mb-3"/>
                <p className="text-sm text-[#727A84] mb-3">
                  {(searchFilter || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly) ? 'No entries match these filters.' : 'No entries yet.'}
                </p>
                {(searchFilter || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly) ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => { setDateFilter('all'); setMoodFilter(null); setCategoryFilter(null); setEntryTypeFilter(null); setFavoritesOnly(false); setSearchFilter('') }}
                      className="text-sm text-[#0C1629] font-semibold hover:underline cursor-pointer"
                    >
                      Remove all filters
                    </button>
                    <span className="text-[#B5C1C8]">·</span>
                    <button onClick={() => { openNew(); setView('editor') }} className="text-sm text-[#727A84] hover:underline cursor-pointer">
                      Write a new entry
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { openNew(); setView('editor') }}
                    className="bg-[#0C1629] hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] cursor-pointer transition-all">
                    Write your first entry
                  </button>
                )}
              </div>
            ) : libraryViewMode === 'list' ? (
              <div className={cn('space-y-3 transition-opacity duration-150', pageFading ? 'opacity-0' : 'opacity-100')}>
                {pagedEntries.map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const cats = parseCategories(entry.category)
                  const MoodIcon = meta?.icon
                  return (
                    <div key={entry.id} className="bg-white card p-5 hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all group flex items-start gap-4">
                      <div className="shrink-0 text-center w-10 cursor-pointer pt-0.5" onClick={() => { openEntry(entry); setView('editor') }}>
                        <div className="text-lg font-extrabold text-[#0C1629] leading-none">{format(new Date(entry.created_at),'d')}</div>
                        <div className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider mt-0.5">{format(new Date(entry.created_at),'MMM')}</div>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}>
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="text-sm font-bold text-[#0C1629] truncate group-hover:text-[#0C1629] transition-colors">{entry.title}</h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {cats.map(cat => { const cc = getCatColor(cat); return <span key={cat} className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{cat}</span> })}
                            {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                          </div>
                        </div>
                        <p className="text-xs text-[#727A84] line-clamp-2 leading-relaxed">{stripMd(entry.content).slice(0,160)}…</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-semibold text-[#B5C1C8]">{countWords(entry.content)}</span>
                          {entry.location && <><span className="text-[10px] text-[#B5C1C8]">·</span><span className="text-[10px] text-[#B5C1C8] font-medium flex items-center gap-0.5"><MapPin size={9}/>{entry.location}</span></>}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1.5 rounded-lg transition-all cursor-pointer', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#D6DCE0] hover:text-[#ca8a04]')}
                        >
                          <Star size={13} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                        <ChevronRight size={14} className="text-[#B5C1C8] group-hover:text-[#0C1629] transition-colors cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150', pageFading ? 'opacity-0' : 'opacity-100')}>
                {pagedEntries.map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const cats = parseCategories(entry.category)
                  const MoodIcon = meta?.icon
                  return (
                    <div key={entry.id} className="bg-white card p-5 hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all group cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">{format(new Date(entry.created_at),'MMM d, yyyy')}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1 rounded-lg transition-all cursor-pointer -mt-0.5', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#D6DCE0] hover:text-[#ca8a04]')}
                        >
                          <Star size={12} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-[#0C1629] mb-2 line-clamp-2 group-hover:text-[#0C1629] transition-colors">{entry.title}</h3>
                      <p className="text-xs text-[#727A84] line-clamp-3 leading-relaxed mb-4">{stripMd(entry.content).slice(0,120)}…</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F3]">
                        <span className="text-[10px] font-semibold text-[#B5C1C8]">{countWords(entry.content)}</span>
                        <div className="flex items-center gap-1.5">
                          {cats.map(cat => { const cc = getCatColor(cat); return <span key={cat} className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{cat}</span> })}
                          {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination — fixed 7-slot layout so no positions ever shift */}
            {totalPages > 1 && (() => {
              // Build exactly 7 slots: [1] [e1] [L] [C] [R] [e2] [last]
              // Slots that aren't needed render as invisible placeholders to hold space
              const p = entriesPage
              const last = totalPages
              type Slot = { key: string; page?: number; ellipsis?: boolean; empty?: boolean }
              let slots: Slot[]

              if (last <= 7) {
                slots = Array.from({ length: last }, (_, i) => ({ key: String(i + 1), page: i + 1 }))
              } else {
                const L = Math.max(2, Math.min(p - 1, last - 3))
                const C = Math.max(2, Math.min(p,     last - 2))
                const R = Math.max(3, Math.min(p + 1, last - 1))
                slots = [
                  { key: 'first', page: 1 },
                  L > 2         ? { key: 'e1', ellipsis: true } : { key: 'e1', empty: true },
                  L !== 1 && L !== last ? { key: 'L', page: L } : { key: 'L', empty: true },
                  { key: 'C', page: C },
                  R !== 1 && R !== last && R !== C ? { key: 'R', page: R } : { key: 'R', empty: true },
                  R < last - 1  ? { key: 'e2', ellipsis: true } : { key: 'e2', empty: true },
                  { key: 'last', page: last },
                ]
              }

              return (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrev onClick={() => changePage(Math.max(1, entriesPage - 1))} disabled={entriesPage === 1} />
                    </PaginationItem>
                    {slots.map(slot => (
                      <PaginationItem key={slot.key}>
                        {slot.ellipsis  ? <PaginationEllipsis /> :
                         slot.empty     ? <span className="w-10 h-10 inline-block" /> :
                         <PaginationButton isActive={entriesPage === slot.page} onClick={() => changePage(slot.page!)}>{slot.page}</PaginationButton>}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => changePage(Math.min(totalPages, entriesPage + 1))} disabled={entriesPage === totalPages} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )
            })()}
          </div>

          {/* Stats Sidebar */}
          <div className="w-full lg:w-72 lg:shrink-0 space-y-4">
            {/* Quick Stats */}
            <div className="bg-white card p-5">
              <div className="flex items-center gap-2 mb-4"><BarChart2 size={14} className="text-[#0C1629]"/><h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Quick Stats</h3></div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label:'Total Entries', value:entries.length.toString() },
                  { label:'Day Streak',    value:`${streak}d` },
                  { label:'Total Words',   value:totalWords>=1000?`${(totalWords/1000).toFixed(1)}k`:totalWords.toString() },
                  { label:'Avg Mood',      value:avgMood>0?avgMood.toFixed(1):'—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F0F3F3] rounded-[10px] p-3 text-center">
                    <div className="text-lg font-extrabold text-[#0C1629]">{value}</div>
                    <div className="text-[10px] font-semibold text-[#727A84] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white card p-5">
              <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-[#0C1629]"/><h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Mood Distribution</h3></div>
              {(() => {
                const total = Object.values(moodCounts).reduce((a,b)=>a+b,0)
                const R=40, CIRC=2*Math.PI*R
                if (!total) return <p className="text-xs text-[#B5C1C8] text-center py-3">No mood data yet</p>
                const segs: {len:number;off:number;color:string;mood:number}[] = []
                let off=0
                for (const k of [5,4,3,2,1]) {
                  const cnt=moodCounts[k]||0; if (!cnt) continue
                  const len=(cnt/total)*CIRC
                  segs.push({mood:k,len,off,color:MOOD_META[k].color}); off+=len
                }
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <svg width={96} height={96} viewBox="0 0 100 100" className="shrink-0">
                        <circle r={R} cx={50} cy={50} fill="none" stroke="#F0F3F3" strokeWidth={12}/>
                        {segs.map((s,i) => <circle key={i} r={R} cx={50} cy={50} fill="none" stroke={s.color} strokeWidth={12} strokeDasharray={`${s.len} ${CIRC}`} strokeDashoffset={-s.off} transform="rotate(-90 50 50)"/>)}
                        <text x={50} y={46} textAnchor="middle" fill="#0C1629" fontSize={15} fontWeight={700}>{total}</text>
                        <text x={50} y={59} textAnchor="middle" fill="#727A84" fontSize={8}>entries</text>
                      </svg>
                      <div className="flex-1 space-y-1">
                        {([5,4,3,2,1] as const).map(k => {
                          const cnt=moodCounts[k]||0; if (!cnt) return null
                          const meta=MOOD_META[k], pct=Math.round((cnt/total)*100)
                          const isActive = moodFilter?.min===k && moodFilter?.max===k
                          return (
                            <button key={k} onClick={() => setMoodFilter(isActive ? null : {min:k,max:k})}
                              className={cn('w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-all cursor-pointer', isActive?'bg-[#F0F3F3]':'hover:bg-[#F0F3F3]/60')}>
                              <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:meta.color}}/>
                              <span className="flex-1 text-left text-[#0C1629] font-medium">{meta.label}</span>
                              <span className="text-[#B5C1C8] text-[10px]">{cnt} · {pct}%</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {moodFilter!==null && <button onClick={() => setMoodFilter(null)} className="mt-2.5 w-full text-xs text-[#9f403d] hover:underline cursor-pointer text-center">Clear filter</button>}
                  </>
                )
              })()}
            </div>

            {/* Category Distribution */}
            {categoryCounts.length > 0 && (
              <div className="bg-white card p-5">
                <div className="flex items-center gap-2 mb-4"><Tag size={14} className="text-[#0C1629]"/><h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Categories</h3></div>
                <div className="space-y-2">
                  {categoryCounts.map(([cat, cnt]) => {
                    const cc = getCatColor(cat)
                    const total = entries.filter(e => e.category).length
                    const pct = total ? Math.round((cnt/total)*100) : 0
                    return (
                      <button key={cat} onClick={() => setCategoryFilter(categoryFilter===cat?null:cat)}
                        className={cn('w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer', categoryFilter===cat?'bg-[#F0F3F3]':'hover:bg-[#F0F3F3]/60')}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:cc.dot}}/>
                        <span className={cn('flex-1 text-left font-semibold', cc.text)}>{cat}</span>
                        <span className="text-[#B5C1C8]">{cnt}</span>
                        <div className="w-12 h-1.5 bg-[#F0F3F3] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${pct}%`, backgroundColor:cc.dot}}/>
                        </div>
                      </button>
                    )
                  })}
                  {categoryFilter && <button onClick={() => setCategoryFilter(null)} className="w-full text-xs text-[#9f403d] hover:underline cursor-pointer text-center mt-1">Clear filter</button>}
                </div>
              </div>
            )}

            {/* Common Themes */}
            <div className="bg-white card p-5">
              <div className="flex items-center gap-2 mb-4"><Hash size={14} className="text-[#0C1629]"/><h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Common Themes</h3></div>
              <div className="flex flex-wrap gap-1.5">
                {popularWords.length === 0 ? (
                  <p className="text-xs text-[#B5C1C8]">Write some entries to see themes</p>
                ) : popularWords.slice(0,12).map(({ word, count }) => (
                  <button key={word} onClick={() => setSearchFilter(searchFilter===word?'':word)}
                    className={cn('px-2.5 py-1 text-xs font-medium rounded-[15px] transition-all cursor-pointer',
                      searchFilter===word ? 'bg-[#0C1629] text-white' : 'bg-[#F0F3F3] text-[#727A84] hover:bg-[#F0F3F3]')}>
                    {word} <span className="opacity-50">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== EDITOR =================== */}
      {view === 'editor' && (
        <div className="animate-fade-in">

          {/* Template detail header */}
          {activeTemplateDetail && (
            <div className="mb-8">
              {/* Hero banner */}
              <div className="relative card overflow-hidden mb-5 p-10 min-h-[200px] flex items-end bg-[#0C1629]">
                <GradientBarsBackground />
                <button onClick={() => setActiveTemplateDetail(null)}
                  className="absolute top-4 right-4 w-7 h-7 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer z-20">
                  <X size={13}/>
                </button>
                <div className="flex items-end justify-between w-full relative z-10">
                  <div>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3 block">Journal Template</span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">{activeTemplateDetail.name}</h2>
                    <p className="text-white/70 text-sm max-w-xl leading-relaxed">{activeTemplateDetail.subtitle}</p>
                  </div>
                  {(() => { const TplIcon = activeTemplateDetail.icon; return <div className="opacity-[0.15] ml-8 shrink-0 text-white"><TplIcon size={72} strokeWidth={1}/></div> })()}
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* How it works */}
                <div className="col-span-1 md:col-span-7 bg-white card p-6">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-3">How it works</h3>
                  <p className="text-sm text-[#0C1629] leading-relaxed mb-4">{activeTemplateDetail.howItWorks}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F0F3F3] rounded-[10px] p-3">
                      <div className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest mb-1">Principle</div>
                      <div className="text-xs font-semibold text-[#0C1629] leading-snug">{activeTemplateDetail.principle}</div>
                    </div>
                    <div className="bg-[#F0F3F3] rounded-[10px] p-3">
                      <div className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest mb-1">Focus</div>
                      <div className="text-xs font-semibold text-[#0C1629] leading-snug">{activeTemplateDetail.focus}</div>
                    </div>
                  </div>
                </div>
                {/* Why use this */}
                <div className="col-span-1 md:col-span-5 bg-[#F0F3F3] card p-6 !border-2 !border-dashed !border-[#B5C1C8]/30">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-3">Why use this</h3>
                  <ul className="space-y-2 mb-4">
                    {activeTemplateDetail.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#0C1629] leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B5C1C8] mt-1.5 shrink-0"/>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-[#727A84] italic leading-relaxed border-t border-[#e5e7e8] pt-3">{activeTemplateDetail.quote}</p>
                </div>
              </div>

              {/* Your Entry divider */}
              <div className="flex items-center gap-4 mt-7">
                <div className="flex-1 h-px bg-[#D6DCE0]"/>
                <span className="text-[11px] font-bold text-[#727A84] uppercase tracking-widest">Your Entry</span>
                <div className="flex-1 h-px bg-[#D6DCE0]"/>
              </div>
            </div>
          )}

          {/* Editor + sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Writing area */}
            <div className="flex-1 min-w-0 w-full">
              {/* Date + title row */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[#0C1629]/70 mb-3">
                  {format(selected ? new Date(selected.created_at) : new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
                <div className="flex items-start gap-3">
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title your reflection..."
                    className="flex-1 min-w-0 bg-transparent text-2xl md:text-3xl font-extrabold text-[#0C1629] placeholder:text-[#B5C1C8] focus:outline-none tracking-tight leading-tight"
                  />
                  {/* Templates dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 mt-1 rounded-[12px] hover:bg-[#F0F3F3] transition-all cursor-pointer text-sm font-semibold text-[#727A84] shrink-0 border border-[#D6DCE0]">
                        <MoreHorizontal size={15}/>
                        <span>Templates</span>
                        <ChevronDown size={13} className="text-[#B5C1C8]"/>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        side="bottom"
                        sideOffset={6}
                        className="z-50 min-w-[260px] rounded-[15px] border border-[#D6DCE0] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.10)] p-1.5 outline-none"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {BUILT_IN_TEMPLATES.map(tpl => (
                          <DropdownMenu.Item
                            key={tpl.id}
                            onClick={() => applyBuiltIn(tpl)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-[10px] cursor-pointer outline-none transition-colors text-[#727A84] hover:bg-[#F0F3F3]"
                          >
                            {(() => { const I = tpl.icon; return <I size={15} strokeWidth={1.5} className="shrink-0"/> })()}
                            {tpl.name}
                          </DropdownMenu.Item>
                        ))}
                        {templates.length > 0 && (
                          <>
                            <div className="my-1 border-t border-[#F0F3F3]"/>
                            {templates.map(t => (
                              <DropdownMenu.Item
                                key={t.id}
                                onClick={() => { setContent(String(t.structure?.content??'')); if (!title.trim()) setTitle(t.name) }}
                                className="flex items-center px-3 py-2 text-sm rounded-[10px] cursor-pointer outline-none transition-colors text-[#727A84] hover:bg-[#F0F3F3]"
                              >
                                {t.name}
                              </DropdownMenu.Item>
                            ))}
                          </>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
                {/* Category + location quick preview row */}
                {(entryCategory.length > 0 || entryLocation || entryWeather) && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {entryCategory.map(cat => { const cc = getCatColor(cat); return <span key={cat} className={cn('text-xs font-bold px-2.5 py-1 rounded-[15px]', cc.bg, cc.text)}>{cat}</span> })}
                    {entryLocation && <span className="text-xs text-[#B5C1C8] flex items-center gap-1"><MapPin size={11}/>{entryLocation}</span>}
                    {entryWeather && <span className="text-xs text-[#B5C1C8] flex items-center gap-1"><Cloud size={11}/>{entryWeather}</span>}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#F0F3F3] mb-8"/>

              {/* Editor — prompt fields when template is active, RichEditor otherwise */}
              {activeTemplateDetail && promptResponses.length > 0 ? (
                <div className="space-y-7">
                  {activeTemplateDetail.prompts.map((p, i) => (
                    <div key={i} className="group">
                      {/* Label row */}
                      <div className="flex items-center gap-2 mb-3">
                        {p.prefix && (
                          <span className="text-[11px] font-extrabold text-[#0C1629] uppercase tracking-widest">{p.prefix}</span>
                        )}
                        <label className="text-[11px] font-bold text-[#727A84] uppercase tracking-widest">
                          {p.label}
                        </label>
                      </div>
                      {/* Textarea */}
                      <textarea
                        value={promptResponses[i]}
                        onChange={e => {
                          const next = [...promptResponses]
                          next[i] = e.target.value
                          setPromptResponses(next)
                        }}
                        placeholder={p.placeholder}
                        rows={4}
                        className="w-full rounded-[15px] border border-[#D6DCE0] bg-white px-5 py-4 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10 resize-none leading-relaxed"
                      />
                    </div>
                  ))}
                  {/* Extra thoughts */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-[11px] font-bold text-[#727A84] uppercase tracking-widest">
                        Additional Thoughts, Feelings &amp; Ideas
                      </label>
                    </div>
                    <textarea
                      value={extraThoughts}
                      onChange={e => setExtraThoughts(e.target.value)}
                      placeholder="Anything else on your mind — feelings, ideas, observations, or loose thoughts you want to capture…"
                      rows={4}
                      className="w-full rounded-[15px] border border-[#D6DCE0] bg-white px-5 py-4 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-2">
                    <button onClick={save} disabled={saving || !title.trim()}
                      className="flex items-center gap-2 bg-[#0C1629] hover:opacity-90 disabled:opacity-40 text-white font-semibold px-8 py-2.5 rounded-[10px] shadow-lg shadow-[#0C1629]/20 transition-all cursor-pointer text-sm">
                      <Save size={14}/>
                      {saving ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[500px]">
                  <RichEditor
                    key={selected?.id ?? 'new'}
                    content={content}
                    onChange={setContent}
                    editable={true}
                    placeholder="Begin your story here…"
                  />
                </div>
              )}
            </div>

            {/* Context sidebar */}
            <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 space-y-0 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)]" style={{ scrollbarWidth: 'none' }}>
              <div className="bg-white card overflow-hidden">

                {/* ── Mood ── */}
                <div className="p-6 border-b border-[#F0F3F3]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Current Mood</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {([1,2,3,4,5] as const).map(score => {
                      const meta = MOOD_META[score]
                      const active = moodScore === score
                      const Icon = meta.icon
                      return (
                        <button key={score} onClick={() => setMoodScore(active ? null : score)} title={meta.label}
                          style={active ? { backgroundColor: meta.bg, borderColor: meta.color + '60' } : {}}
                          className={cn('aspect-square flex items-center justify-center rounded-xl transition-all cursor-pointer border',
                            active ? 'scale-110 shadow-sm border' : 'border-transparent hover:bg-[#F0F3F3]')}>
                          <Icon size={22} color={meta.color} strokeWidth={2.2}/>
                        </button>
                      )
                    })}
                  </div>
                  {moodScore && <p className="text-[10px] text-center font-semibold mt-2 uppercase tracking-wider" style={{ color: MOOD_META[moodScore].color }}>{MOOD_META[moodScore].label}</p>}
                </div>

                {/* ── Category ── */}
                <div className="p-6 border-b border-[#F0F3F3]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Category</h3>
                    <Tag size={13} className="text-[#B5C1C8]"/>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ENTRY_CATEGORIES.map(cat => {
                      const cc = getCatColor(cat)
                      const active = entryCategory.includes(cat)
                      return (
                        <button key={cat} onClick={() => setEntryCategory(active ? entryCategory.filter(c => c !== cat) : [...entryCategory, cat])}
                          className={cn('px-3 py-1.5 rounded-[15px] text-xs font-semibold transition-all cursor-pointer',
                            active ? `${cc.bg} ${cc.text} shadow-sm` : 'bg-[#F0F3F3] text-[#727A84] hover:bg-[#F0F3F3]')}>
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── Quick Context ── */}
                <div className="p-6 border-b border-[#F0F3F3]">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-4">Quick Context</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest block mb-1.5">Location</label>
                      <div className="flex items-center gap-2.5 rounded-[15px] border border-[#D6DCE0] bg-white px-3 py-2.5 shadow-sm shadow-black/5 transition-shadow focus-within:border-[#0C1629]/30 focus-within:ring-[3px] focus-within:ring-[#0C1629]/10">
                        <MapPin size={14} className="text-[#B5C1C8] shrink-0"/>
                        <input
                          value={entryLocation}
                          onChange={e => setEntryLocation(e.target.value)}
                          placeholder="e.g. Coffee shop, Home…"
                          className="flex-1 bg-transparent text-sm text-[#0C1629] placeholder:text-[#B5C1C8] focus:outline-none min-w-0"
                        />
                        {entryLocation && <button onClick={() => setEntryLocation('')} className="text-[#B5C1C8] hover:text-[#727A84] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest block mb-1.5">Weather</label>
                      <div className="flex items-center gap-2.5 rounded-[15px] border border-[#D6DCE0] bg-white px-3 py-2.5 shadow-sm shadow-black/5 transition-shadow focus-within:border-[#0C1629]/30 focus-within:ring-[3px] focus-within:ring-[#0C1629]/10">
                        <Cloud size={14} className="text-[#B5C1C8] shrink-0"/>
                        <input
                          value={entryWeather}
                          onChange={e => setEntryWeather(e.target.value)}
                          placeholder="e.g. Sunny, 22°C…"
                          className="flex-1 bg-transparent text-sm text-[#0C1629] placeholder:text-[#B5C1C8] focus:outline-none min-w-0"
                        />
                        {entryWeather && <button onClick={() => setEntryWeather('')} className="text-[#B5C1C8] hover:text-[#727A84] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Wellness ── */}
                <div className="p-6 border-b border-[#F0F3F3]">
                  <div className="space-y-4">

                    {/* Sleep quality */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Moon size={11}/> Sleep Quality
                      </label>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(v => (
                          <button key={v} onClick={() => setSleepQuality(sleepQuality === v ? null : v)}
                            className={cn('flex-1 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer border',
                              sleepQuality === v
                                ? 'bg-[#0C1629] text-white border-[#0C1629]'
                                : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#F0F3F3]')}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {sleepQuality && (
                        <p className="text-[10px] text-[#B5C1C8] mt-1">{['','Very poor','Poor','Okay','Good','Great'][sleepQuality]}</p>
                      )}
                    </div>

                    {/* Energy level */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Zap size={11}/> Energy Level
                      </label>
                      <div className="flex gap-1.5">
                        {(['low','medium','high'] as const).map(lvl => (
                          <button key={lvl} onClick={() => setEnergyLevel(energyLevel === lvl ? null : lvl)}
                            className={cn('flex-1 h-7 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border',
                              energyLevel === lvl
                                ? 'bg-[#0C1629] text-white border-[#0C1629]'
                                : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#F0F3F3]')}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alcohol & Exercise toggles */}
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setHadAlcohol(hadAlcohol === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          hadAlcohol === true
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#F0F3F3]')}>
                        <Wine size={15} className={hadAlcohol === true ? 'text-orange-500' : 'text-[#B5C1C8]'}/>
                        <span>Drank last night</span>
                      </button>
                      <button onClick={() => setExercised(exercised === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          exercised === true
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#F0F3F3]')}>
                        <Dumbbell size={15} className={exercised === true ? 'text-green-500' : 'text-[#B5C1C8]'}/>
                        <span>Exercised</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* ── Save ── */}
                <div className="p-6 border-b border-[#F0F3F3]">
                  <button onClick={save} disabled={saving || !title.trim()}
                    title={!title.trim() ? 'Add a title to save your entry' : undefined}
                    className="w-full py-2.5 bg-[#0C1629] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[10px] font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Save size={14}/>
                    {saving ? 'Saving…' : saveStatus==='saved' ? 'Saved ✓' : 'Save Entry'}
                  </button>
                  {saveStatus === 'saved' && (
                    <p className="text-center text-[10px] text-[#B5C1C8] mt-2 font-medium uppercase tracking-widest">
                      Saved at {format(new Date(), 'h:mm a')}
                    </p>
                  )}
                  {selected && (
                    <button onClick={() => remove(selected.id)}
                      className="w-full mt-2 py-2 text-xs text-[#9f403d] hover:bg-[#9f403d]/5 rounded-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Trash2 size={12}/> Delete entry
                    </button>
                  )}
                  {/* Spacer so Save Entry scrolls above the floating toolbar */}
                  <div className="h-20" />
                </div>


              </div>
            </aside>
          </div>
        </div>
      )}

      {/* =================== CALENDAR =================== */}
      {view === 'calendar' && (() => {
        const calData: CalendarDay[] = Object.values(
          entries.reduce<Record<string, CalendarDay>>((acc, entry) => {
            const d = new Date(entry.created_at)
            const key = format(d, 'yyyy-MM-dd')
            if (!acc[key]) acc[key] = { day: d, events: [] }
            acc[key].events.push({ id: entry.id, name: entry.title, time: format(d, 'h:mm a') })
            return acc
          }, {})
        )

        // ── Calendar stats ─────────────────────────────────────────────
        const sortedEntries = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        // Avg time between entries
        const avgGapLabel = (() => {
          if (sortedEntries.length < 2) return '—'
          const gaps = sortedEntries.slice(1).map((e, i) =>
            new Date(e.created_at).getTime() - new Date(sortedEntries[i].created_at).getTime()
          )
          const avgMs = gaps.reduce((s, g) => s + g, 0) / gaps.length
          const days = avgMs / (1000 * 60 * 60 * 24)
          if (days < 1) return `${Math.round(days * 24)}h`
          if (days < 7) return `${days.toFixed(1)}d`
          return `${(days / 7).toFixed(1)} wks`
        })()

        // Entries per period
        const entryRatePeriods = ['week', 'month', 'year'] as const
        type RatePeriod = typeof entryRatePeriods[number]

        const calcRate = (period: RatePeriod) => {
          if (sortedEntries.length === 0) return '—'
          const first = new Date(sortedEntries[0].created_at).getTime()
          const now = Date.now()
          const ms = now - first
          const dividers = { week: 7, month: 30.44, year: 365.25 }
          const periods = ms / (1000 * 60 * 60 * 24 * dividers[period])
          if (periods < 1) return String(sortedEntries.length)
          const rate = sortedEntries.length / periods
          return rate >= 10 ? Math.round(rate).toString() : rate.toFixed(1)
        }

        return (
          <div className="flex flex-col lg:flex-row gap-4 animate-fade-in relative">
            {/* Calendar */}
            <div className="flex-1 min-w-0 bg-white border border-[#F0F3F3] overflow-hidden" style={{ borderRadius: 15 }}>
              <FullScreenCalendar
                data={calData}
                onDayClick={day => setSelectedCalDay(day)}
              />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-3">

              {/* Day entries */}
              <div className="space-y-3">
                {!selectedCalDay && (
                  <div className="bg-white card p-5 text-center">
                    <p className="text-xs text-[#727A84] opacity-60">Click a day to see entries</p>
                  </div>
                )}
                {selectedCalDay && !selectedDayEntries.length && (
                  <div className="bg-white card p-5 text-center">
                    <p className="text-xs text-[#727A84] opacity-60 mb-2">No entries on this day</p>
                    <button onClick={() => { openNew(); setView('editor') }} className="text-xs text-[#0C1629] hover:underline cursor-pointer">Write an entry</button>
                  </div>
                )}
                {selectedDayEntries.map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const cc = entry.category ? getCatColor(entry.category) : null
                  const MoodIcon = meta?.icon
                  return (
                    <div key={entry.id} className="bg-white card p-4 hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all group cursor-pointer"
                      onClick={() => { openEntry(entry); setView('editor') }}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-[#0C1629] leading-snug group-hover:text-[#0C1629] transition-colors line-clamp-2">{entry.title}</h3>
                        <button onClick={e => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1 rounded-lg shrink-0 transition-all cursor-pointer', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#D6DCE0] hover:text-[#ca8a04]')}>
                          <Star size={12} fill={entry.is_favorite ? 'currentColor' : 'none'}/>
                        </button>
                      </div>
                      <p className="text-xs text-[#727A84] line-clamp-2 leading-relaxed mb-2">{stripMd(entry.content).slice(0, 120)}…</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-[#B5C1C8] font-medium">{format(new Date(entry.created_at), 'h:mm a')}</span>
                        <span className="text-[10px] text-[#B5C1C8]">·</span>
                        <span className="text-[10px] font-semibold text-[#B5C1C8]">{countWords(entry.content)}</span>
                        {cc && entry.category && <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{entry.category}</span>}
                        {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Stat: Entries per period */}
              <div className="bg-white card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={13} className="text-[#0C1629]"/>
                    <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Entry Rate</h3>
                  </div>
                  <select
                    value={calRatePeriod}
                    onChange={e => setCalRatePeriod(e.target.value as RatePeriod)}
                    className="text-xs font-semibold text-[#727A84] bg-[#F0F3F3] border-none rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="week">/ week</option>
                    <option value="month">/ month</option>
                    <option value="year">/ year</option>
                  </select>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-extrabold text-[#0C1629] leading-none">{calcRate(calRatePeriod)}</span>
                  <span className="text-sm text-[#B5C1C8] font-medium mb-0.5">entries / {calRatePeriod}</span>
                </div>
                <p className="text-[10px] text-[#B5C1C8] mt-1.5">avg since your first entry</p>
              </div>

              {/* Stat: Avg gap between entries */}
              <div className="bg-white card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={13} className="text-[#0C1629]"/>
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider">Avg Gap</h3>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-extrabold text-[#0C1629] leading-none">{avgGapLabel}</span>
                  <span className="text-sm text-[#B5C1C8] font-medium mb-0.5">between entries</span>
                </div>
                <p className="text-[10px] text-[#B5C1C8] mt-1.5">across {sortedEntries.length} total entries</p>
              </div>

            </div>
          </div>
        )
      })()}

      {/* =================== TEMPLATES =================== */}
      {view === 'templates' && (
        <div className="animate-fade-in">

          {/* Header + filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0C1629] tracking-tight">Template Library</h2>
              <p className="text-sm text-[#727A84] mt-0.5">{BUILT_IN_TEMPLATES.length} guided frameworks to deepen your reflection</p>
            </div>
            <div className="flex gap-1 bg-[#F0F3F3] p-1 rounded-[10px] self-start">
              {(['All', 'Personal', 'Work', 'Gratitude'] as TemplateFilter[]).map(f => (
                <button key={f} onClick={() => setTemplateFilter(f)}
                  className={cn('px-4 py-1.5 text-xs font-semibold rounded-[7px] transition-all cursor-pointer',
                    templateFilter===f ? 'bg-white text-[#0C1629] shadow-sm' : 'text-[#727A84] hover:text-[#0C1629]')}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid pattern configs cycling through 3 styles */}
          {(() => {
            type PatternCfg = { width: number; height: number; strokeDasharray?: string; squares?: Array<[number, number]>; cls: string }
            const PATTERN_CFG: PatternCfg[] = [
              // 0 – radial fade + accent squares + skew
              { width: 40, height: 40, squares: [[5,3],[8,6],[3,8],[11,4]] as Array<[number,number]>, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.06] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]' },
              // 1 – linear gradient small grid
              { width: 20, height: 20, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.05] [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]' },
              // 2 – dashed radial
              { width: 30, height: 30, strokeDasharray: '4 2', cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.06] [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]' },
              // 3 – radial + squares, medium
              { width: 35, height: 35, squares: [[4,2],[7,5],[2,7]] as Array<[number,number]>, cls: 'fill-[#0C1629]/[0.04] stroke-[#0C1629]/[0.06] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 [mask-image:radial-gradient(350px_circle_at_center,white,transparent)]' },
              // 4 – linear top-right, small grid
              { width: 20, height: 20, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.05] [mask-image:linear-gradient(to_top_right,white,transparent,transparent)]' },
              // 5 – dashed, tight grid
              { width: 25, height: 25, strokeDasharray: '3 3', cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.05] [mask-image:radial-gradient(280px_circle_at_center,white,transparent)]' },
              // 6 – radial + squares, large cells + skew
              { width: 45, height: 45, squares: [[3,2],[6,4],[2,6],[8,2]] as Array<[number,number]>, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.06] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]' },
              // 7 – linear bottom-left
              { width: 16, height: 16, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.05] [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]' },
              // 8 – dashed radial with squares
              { width: 30, height: 30, strokeDasharray: '4 2', squares: [[3,3],[6,2],[5,5]] as Array<[number,number]>, cls: 'fill-[#0C1629]/[0.04] stroke-[#0C1629]/[0.06] [mask-image:radial-gradient(260px_circle_at_center,white,transparent)]' },
              // 9 – radial + small squares + skew
              { width: 32, height: 32, squares: [[2,4],[5,1],[8,5]] as Array<[number,number]>, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.06] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 [mask-image:radial-gradient(320px_circle_at_center,white,transparent)]' },
              // 10 – linear top-left, medium grid
              { width: 24, height: 24, cls: 'fill-[#0C1629]/[0.03] stroke-[#0C1629]/[0.05] [mask-image:linear-gradient(to_top_left,white,transparent,transparent)]' },
            ]

            const TplCard = ({ tpl, idx, className, iconSize = 32, showSubtitle = true, showApply = false }: {
              tpl: typeof BUILT_IN_TEMPLATES[0]; idx: number; className: string; iconSize?: number; showSubtitle?: boolean; showApply?: boolean
            }) => {
              const pc = PATTERN_CFG[idx % PATTERN_CFG.length]
              const Icon = tpl.icon
              return (
                <button onClick={() => applyBuiltIn(tpl)}
                  className={cn('relative overflow-hidden bg-white card flex flex-col justify-between cursor-pointer group text-left hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all', className)}>
                  <GridPattern width={pc.width} height={pc.height} strokeDasharray={pc.strokeDasharray} squares={pc.squares} className={pc.cls} />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="opacity-[0.12] text-[#0C1629]"><Icon size={iconSize} strokeWidth={1}/></div>
                    <ChevronRight size={14} className="text-[#D6DCE0] group-hover:text-[#0C1629] transition-colors shrink-0"/>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest block mb-1">{tpl.category}</span>
                    <h3 className="font-extrabold text-[#0C1629] tracking-tight leading-snug mb-1.5">{tpl.name}</h3>
                    {showSubtitle && <p className="text-[#727A84] text-xs leading-relaxed">{tpl.subtitle.slice(0, 80)}…</p>}
                    {showApply && (
                      <span className="mt-4 inline-block bg-[#0C1629] group-hover:opacity-90 text-white font-semibold text-xs px-4 py-1.5 rounded-[10px] transition-all">Apply Template</span>
                    )}
                  </div>
                </button>
              )
            }

            return (
              <>
                {/* All — bento grid */}
                {templateFilter === 'All' && (
                  <div className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Large feature */}
                      <button onClick={() => applyBuiltIn(BUILT_IN_TEMPLATES[0])}
                        className="col-span-1 md:col-span-7 relative overflow-hidden bg-white card p-7 md:p-10 flex flex-col justify-between min-h-[240px] md:min-h-[320px] cursor-pointer group text-left hover:shadow-[0_8px_30px_rgba(12,22,41,0.08)] transition-all">
                        <GridPattern width={PATTERN_CFG[0].width} height={PATTERN_CFG[0].height} squares={PATTERN_CFG[0].squares} className={PATTERN_CFG[0].cls} />
                        <div className="relative z-10 flex items-start justify-between">
                          <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest">Featured Template</span>
                          {(() => { const I = BUILT_IN_TEMPLATES[0].icon; return <div className="opacity-[0.10] text-[#0C1629]"><I size={56} strokeWidth={1}/></div> })()}
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-extrabold text-[#0C1629] mb-2 tracking-tight">{BUILT_IN_TEMPLATES[0].name}</h3>
                          <p className="text-[#727A84] text-sm leading-relaxed mb-6 max-w-sm">{BUILT_IN_TEMPLATES[0].subtitle}</p>
                          <div className="flex items-center gap-3">
                            <span className="bg-[#0C1629] group-hover:opacity-90 text-white font-bold text-sm px-5 py-2 rounded-[10px] transition-all">Apply Template</span>
                            <span className="text-[#B5C1C8] text-[10px] font-semibold uppercase tracking-wider">{BUILT_IN_TEMPLATES[0].category}</span>
                          </div>
                        </div>
                      </button>
                      {/* Companion */}
                      <TplCard tpl={BUILT_IN_TEMPLATES[1]} idx={1} iconSize={44} showApply
                        className="col-span-1 md:col-span-5 p-7 md:p-8 min-h-[200px] md:min-h-[320px]" />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {BUILT_IN_TEMPLATES.slice(2, 5).map((tpl, i) => (
                        <TplCard key={tpl.id} tpl={tpl} idx={2 + i} className="p-7 min-h-[200px]" />
                      ))}
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {BUILT_IN_TEMPLATES.slice(5, 8).map((tpl, i) => (
                        <TplCard key={tpl.id} tpl={tpl} idx={5 + i} className="p-7 min-h-[200px]" />
                      ))}
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {BUILT_IN_TEMPLATES.slice(8, 11).map((tpl, i) => (
                        <TplCard key={tpl.id} tpl={tpl} idx={8 + i} iconSize={22} showSubtitle={false} className="p-5 min-h-[160px]" />
                      ))}
                      <button onClick={() => { setNewTemplateName(''); setNewTemplateContent(''); setShowTemplateModal(true) }}
                        className="card p-5 flex flex-col justify-between min-h-[160px] cursor-pointer group text-left border-2 border-dashed border-[#B5C1C8]/30 hover:border-[#0C1629]/40 bg-white transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#F0F3F3] group-hover:bg-[#0C1629]/10 flex items-center justify-center transition-colors">
                          <Plus size={15} className="text-[#B5C1C8] group-hover:text-[#0C1629] transition-colors"/>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0C1629] mb-0.5">Custom Template</h3>
                          <span className="text-[10px] font-semibold text-[#B5C1C8] uppercase tracking-wider">Create your own</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Filtered view */}
                {templateFilter !== 'All' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredBuiltIns.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <p className="text-sm text-[#727A84]">No templates in this category yet.</p>
                      </div>
                    ) : filteredBuiltIns.map((tpl, i) => (
                      <TplCard key={tpl.id} tpl={tpl} idx={i % PATTERN_CFG.length} iconSize={40} showApply
                        className="p-8 min-h-[240px]" />
                    ))}
                  </div>
                )}
              </>
            )
          })()}

          {/* User templates */}
          {templates.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-[#727A84] uppercase tracking-wider mb-4">Your Custom Templates</h3>
              <div className="grid grid-cols-3 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="bg-white card p-5 hover:shadow-[0_10px_40px_rgba(12,22,41,0.06)] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#0C1629] uppercase tracking-wider bg-[#0C1629]/10 px-2 py-0.5 rounded-[15px]">Custom</span>
                    </div>
                    <h4 className="font-semibold text-[#0C1629] mb-1">{t.name}</h4>
                    <p className="text-xs text-[#727A84] opacity-60 mb-4 line-clamp-2 leading-relaxed">{String(t.structure?.content??'').replace(/[#*`]/g,'').slice(0,100)}</p>
                    <button onClick={() => { openNew(String(t.structure?.content??'')); setView('editor') }}
                      className="text-xs text-[#0C1629] font-medium hover:underline cursor-pointer flex items-center gap-1">
                      Apply Template <ChevronRight size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Create Custom Template Modal */}
      <Dialog.Root open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] bg-white rounded-[20px] shadow-[0_24px_80px_rgba(12,22,41,0.18)] outline-none data-[state=open]:animate-fade-in flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#F0F3F3] shrink-0">
              <div>
                <Dialog.Title className="text-base font-bold text-[#0C1629]">Create Custom Template</Dialog.Title>
                <Dialog.Description className="text-xs text-[#727A84] mt-0.5">Design your own reusable writing structure.</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F0F3F3] text-[#B5C1C8] hover:text-[#0C1629] transition-colors cursor-pointer">
                  <X size={15} />
                </button>
              </Dialog.Close>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5" style={{ scrollbarWidth: 'none' }}>
              {/* Template name */}
              <input
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                placeholder="Template name…"
                className="w-full text-xl font-bold text-[#0C1629] bg-transparent border-none outline-none placeholder:text-[#B5C1C8] placeholder:font-bold"
              />
              <div className="h-px bg-[#F0F3F3]" />
              {/* Rich editor */}
              <div className="min-h-[320px]">
                <RichEditor
                  key={showTemplateModal ? 'tpl-modal' : 'tpl-modal-closed'}
                  content={newTemplateContent}
                  onChange={setNewTemplateContent}
                  editable={true}
                  compact={true}
                  placeholder="Write your template structure here… use headings, lists, checkboxes and more."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-7 py-4 border-t border-[#F0F3F3] shrink-0">
              <Dialog.Close asChild>
                <button className="text-sm font-semibold text-[#727A84] hover:text-[#0C1629] px-4 py-2 rounded-[10px] hover:bg-[#F0F3F3] transition-all cursor-pointer">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={async () => { await saveTemplate(); setShowTemplateModal(false) }}
                disabled={!newTemplateName.trim()}
                className="bg-[#0C1629] hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-[10px] transition-all cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <FloatingAiAssistant />
    </div>
  )
}
