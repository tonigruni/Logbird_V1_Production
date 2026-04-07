import { useState, useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  Plus, Calendar, FileText, Sparkles, Trash2, Save,
  Send, Brain, MessageCircle, ChevronRight, ChevronLeft, Layout,
  BarChart2, Hash, TrendingUp, Star, Frown, Meh, Smile,
  MapPin, Cloud, Tag, MoreHorizontal, X, type LucideIcon,
} from 'lucide-react'
import Anthropic from '@anthropic-ai/sdk'
import ReactMarkdown from 'react-markdown'
import RichEditor from '../components/RichEditor'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore, type JournalEntry } from '../stores/journalStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, subDays } from 'date-fns'
import { cn } from '../lib/utils'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import JournalFilterBar, { type MoodRange, type SortOrder } from '../components/ui/JournalFilterBar'

/* ------------------------------------------------------------------ */
/*  Built-in Templates                                                  */
/* ------------------------------------------------------------------ */

interface BuiltInTemplate {
  id: string
  name: string
  subtitle: string
  category: string
  emoji: string
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
    emoji: '🏛️',
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
    emoji: '💙',
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
    emoji: '🔄',
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
    emoji: '🙏',
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
    emoji: '🎯',
    colorFrom: '#1F3649',
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
    emoji: '📚',
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
    emoji: '🌊',
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
    emoji: '⚡',
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
    emoji: '🧘',
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
    emoji: '✨',
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
    emoji: '🔍',
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
  Personal:  { bg: 'bg-[#1F3649]/10',  text: 'text-[#1F3649]',  dot: '#1F3649' },
  Work:      { bg: 'bg-[#586062]/10',  text: 'text-[#586062]',  dot: '#586062' },
  Dreams:    { bg: 'bg-[#9f403d]/10',  text: 'text-[#9f403d]',  dot: '#fe8983' },
  Ideas:     { bg: 'bg-[#162838]/10',  text: 'text-[#162838]',  dot: '#3f9eff' },
  Travel:    { bg: 'bg-[#0d9488]/10',  text: 'text-[#0d9488]',  dot: '#0d9488' },
  Health:    { bg: 'bg-[#16a34a]/10',  text: 'text-[#16a34a]',  dot: '#22c55e' },
  Gratitude: { bg: 'bg-[#ca8a04]/10',  text: 'text-[#ca8a04]',  dot: '#eab308' },
}
function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: 'bg-[#ebeeef]', text: 'text-[#5a6061]', dot: '#adb3b4' }
}

const MOOD_META: Record<number, { label: string; short: string; chipClass: string; color: string; icon: LucideIcon }> = {
  1: { label: 'Very Low', short: 'Very Low', chipClass: 'bg-[#9f403d]/10 text-[#9f403d]', color: '#fe8983', icon: Frown },
  2: { label: 'Low',      short: 'Low',      chipClass: 'bg-[#adb3b4]/20 text-[#586062]', color: '#adb3b4', icon: Frown },
  3: { label: 'Neutral',  short: 'Neutral',  chipClass: 'bg-[#ebeeef] text-[#5a6061]',    color: '#dde4e5', icon: Meh   },
  4: { label: 'Good',     short: 'Good',     chipClass: 'bg-[#586062]/10 text-[#586062]', color: '#586062', icon: Smile },
  5: { label: 'Excellent',short: 'Excellent',chipClass: 'bg-[#1F3649]/10 text-[#1F3649]', color: '#1F3649', icon: Smile },
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
  const [entryCategory, setEntryCategory] = useState<string | null>(null)
  const [entryLocation, setEntryLocation] = useState('')
  const [entryWeather, setEntryWeather] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedCalDay, setSelectedCalDay] = useState<Date | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showEditorOptions, setShowEditorOptions] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')

  // Library state
  const [libraryViewMode, setLibraryViewMode] = useState<'list' | 'grid'>('grid')
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

  // AI chat
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)

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
    if (view === 'editor') return // don't override editor mode from URL
    const mapped: Record<string, View> = { journal: 'journal', calendar: 'calendar', templates: 'templates' }
    setView(mapped[tab ?? ''] ?? 'dashboard')
  }, [searchParams])

  // Handle location state triggers (prefill from dashboard, openNew from AppLayout)
  useEffect(() => {
    const state = location.state as { prefill?: string; openNew?: boolean } | null
    if (state?.openNew) { openNew(); setView('editor'); window.history.replaceState({}, '') }
    else if (state?.prefill) { openNew(state.prefill); setView('editor'); window.history.replaceState({}, '') }
  }, [location.state])

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
    entries.forEach(e => { if (e.category) c[e.category] = (c[e.category] || 0) + 1 })
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
    if (categoryFilter) r = r.filter(e => e.category === categoryFilter)
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

  // Rule-based filter insight
  const filterInsight = useMemo(() => {
    const hasFilter = dateFilter !== 'all' || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly || searchFilter
    if (!hasFilter) return null
    const n = libraryEntries.length
    const s = n === 1 ? 'entry' : 'entries'
    if (favoritesOnly) return `${n} starred ${s}`
    if (moodFilter && moodFilter.max <= 2 && categoryFilter === 'Work') return `${n} difficult work ${s} — work may be affecting your mood.`
    if (moodFilter && moodFilter.max <= 2) {
      const workCount = libraryEntries.filter(e => e.category === 'Work').length
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
    setMoodScore(null); setEntryCategory(null); setEntryLocation(''); setEntryWeather('')
    setSaveStatus('idle'); setActiveTemplateDetail(null); setPromptResponses([])
  }

  const openEntry = (entry: JournalEntry) => {
    setSelected(entry); setTitle(entry.title); setContent(entry.content)
    setMoodScore(entry.mood_score); setEntryCategory(entry.category)
    setEntryLocation(entry.location ?? ''); setEntryWeather(entry.weather ?? '')
    setSaveStatus('idle'); setActiveTemplateDetail(null); setPromptResponses([])
  }

  const applyBuiltIn = (tpl: BuiltInTemplate) => {
    setSelected(null)
    setTitle(tpl.name)
    setContent('')
    setMoodScore(null)
    setEntryCategory(tpl.category)
    setEntryLocation('')
    setEntryWeather('')
    setSaveStatus('idle')
    setActiveTemplateDetail(tpl)
    setPromptResponses(tpl.prompts.map(() => ''))
    setView('editor')
  }

  const save = async () => {
    if (!user || !title.trim()) return
    setSaving(true)
    const finalContent = activeTemplateDetail && promptResponses.length > 0
      ? buildEntryContent(activeTemplateDetail, promptResponses)
      : content
    const payload = { title, content: finalContent, mood_score: moodScore, category: entryCategory, location: entryLocation || null, weather: entryWeather || null }
    if (selected) {
      await updateEntry(selected.id, payload)
    } else {
      const entry = await createEntry({ user_id: user.id, template_id: null, ...payload })
      if (entry) setSelected(entry)
    }
    setSaving(false); setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  const remove = async (id: string) => {
    await deleteEntry(id)
    setSelected(null); setTitle(''); setContent(''); setEntryCategory(null); setEntryLocation(''); setEntryWeather('')
    setActiveTemplateDetail(null); setPromptResponses([])
    gotoView('journal')
  }

  const askAI = async () => {
    if (!aiQuery.trim() || !user) return
    const apiKey = localStorage.getItem('anthropic_api_key')
    if (!apiKey) { setAiResponse('Please add your Anthropic API key in Settings first.'); return }
    setAiLoading(true); setAiResponse('')
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const context = entries.slice(0,20).map(e => `[${format(new Date(e.created_at),'MMM d, yyyy')}] ${e.title}:\n${e.content}`).join('\n\n---\n\n')
      const response = await client.messages.create({
        model: localStorage.getItem('anthropic_model') || 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: 'You are a thoughtful journal analysis assistant. Analyze the provided journal entries and answer questions about patterns, emotions, progress, and insights. Be warm, insightful, and specific.',
        messages: [{ role: 'user', content: `Here are my recent journal entries:\n\n${context}\n\n---\n\nQuestion: ${aiQuery}` }],
      })
      const block = response.content?.[0]
      setAiResponse(block?.type==='text' ? block.text : 'No response received.')
    } catch (err) {
      setAiResponse(err instanceof Anthropic.APIError ? `AI Error: ${err.message}` : 'Error contacting AI. Please check your API key in Settings.')
    }
    setAiLoading(false)
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

  const suggestedQuestions = ['What are my most common stressors?', 'Summarize my last week.', 'Show me patterns in my mood.']

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
      {/* ── Editor back button ── */}
      {view === 'editor' && (
        <div className="mb-6">
          <button
            onClick={() => gotoView('journal')}
            className="flex items-center gap-1.5 text-sm text-[#5a6061] hover:text-[#2d3435] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            All Entries
          </button>
        </div>
      )}

      {/* =================== DASHBOARD =================== */}
      {view === 'dashboard' && (
        <div className="animate-fade-in space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-[#5a6061] uppercase tracking-wider mb-4"></h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-1 md:col-span-8 relative overflow-hidden card min-h-[220px] md:min-h-[280px] flex flex-col justify-between p-6 md:p-10 bg-[#1F3649]">
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
                      className="bg-white hover:bg-white/90 text-[#2d3435] text-sm font-bold px-6 py-2.5 rounded-[15px] transition-all cursor-pointer">
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
              <div className="col-span-1 md:col-span-4 bg-[#f2f4f4] card p-6 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[280px] !border-2 !border-dashed !border-[#adb3b4]/30 hover:!border-[#1F3649]/30 transition-colors group">
                <div>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><Plus size={20} className="text-[#586062]"/></div>
                  <h3 className="text-base font-bold text-[#2d3435] mb-1.5">Blank canvas</h3>
                  <p className="text-sm text-[#5a6061] leading-relaxed">No structure, no prompts — just your thoughts.</p>
                </div>
                <button onClick={() => { openNew(); setView('editor') }}
                  className="mt-5 flex items-center justify-center gap-1.5 bg-[#1F3649] hover:bg-[#162838] text-white text-sm font-bold px-5 py-2.5 rounded-[15px] transition-all cursor-pointer">
                  <Plus size={13} /> New Entry
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#5a6061] uppercase tracking-wider mb-4">Your Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:'All Entries', value:entries.length.toString(), sub:'Browse and edit your writing', icon:FileText, id:'journal' as View },
                { label:'Calendar',    value:`${consistencyScore}%`,    sub:'Consistency this month',    icon:Calendar, id:'calendar' as View },
                { label:'Templates',   value:BUILT_IN_TEMPLATES.length.toString(), sub:'Built-in writing structures',  icon:Layout,   id:'templates' as View },
              ].map(({ label, value, sub, icon: Icon, id }) => (
                <button key={id} onClick={() => gotoView(id as Exclude<View, 'editor'>)}
                  className="bg-white card p-6 text-left hover:shadow-[0_10px_40px_rgba(45,52,53,0.06)] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#1F3649]/10 flex items-center justify-center"><Icon size={16} className="text-[#1F3649]"/></div>
                    <ChevronRight size={14} className="text-[#adb3b4] group-hover:text-[#1F3649] transition-colors"/>
                  </div>
                  <div className="text-2xl font-extrabold text-[#2d3435] mb-1">{value}</div>
                  <div className="text-sm font-semibold text-[#2d3435] mb-0.5">{label}</div>
                  <p className="text-xs text-[#5a6061]">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {entries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#5a6061] uppercase tracking-wider">Recent Entries</h2>
                <button onClick={() => gotoView('journal')} className="text-xs text-[#1F3649] hover:underline flex items-center gap-1 cursor-pointer">View all <ChevronRight size={12}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entries.slice(0,3).map(entry => {
                  const cat = entry.category
                  const cc = cat ? getCatColor(cat) : null
                  return (
                    <button key={entry.id} onClick={() => { openEntry(entry); setView('editor') }}
                      className="bg-white card p-5 text-left hover:shadow-[0_10px_40px_rgba(45,52,53,0.06)] transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold text-[#1F3649] uppercase tracking-wider">{format(new Date(entry.created_at),'MMM dd, yyyy')}</div>
                        {cc && cat && <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{cat}</span>}
                      </div>
                      <div className="text-sm font-semibold text-[#2d3435] truncate mb-1">{entry.title}</div>
                      <p className="text-xs text-[#5a6061] line-clamp-2 leading-relaxed">{stripMd(entry.content).slice(0,100)}</p>
                    </button>
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
              <div className="mb-4 px-3 py-2 bg-[#1F3649]/5 rounded-[10px] text-xs text-[#1F3649] font-medium">
                {filterInsight}
              </div>
            )}

            {/* Entries */}
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow-sm"/>)}</div>
            ) : libraryEntries.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={32} className="text-[#adb3b4] mx-auto mb-3"/>
                <p className="text-sm text-[#5a6061] mb-3">
                  {(searchFilter || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly) ? 'No entries match these filters.' : 'No entries yet.'}
                </p>
                {(searchFilter || moodFilter || categoryFilter || entryTypeFilter || favoritesOnly) ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => { setDateFilter('all'); setMoodFilter(null); setCategoryFilter(null); setEntryTypeFilter(null); setFavoritesOnly(false); setSearchFilter('') }}
                      className="text-sm text-[#1F3649] font-semibold hover:underline cursor-pointer"
                    >
                      Remove all filters
                    </button>
                    <span className="text-[#adb3b4]">·</span>
                    <button onClick={() => { openNew(); setView('editor') }} className="text-sm text-[#5a6061] hover:underline cursor-pointer">
                      Write a new entry
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { openNew(); setView('editor') }}
                    className="bg-[#1F3649] text-white text-sm font-bold px-5 py-2.5 rounded-[15px] cursor-pointer hover:bg-[#162838] transition-all">
                    Write your first entry
                  </button>
                )}
              </div>
            ) : libraryViewMode === 'list' ? (
              <div className="space-y-3">
                {libraryEntries.map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const cc = entry.category ? getCatColor(entry.category) : null
                  const MoodIcon = meta?.icon
                  return (
                    <div key={entry.id} className="bg-white card p-5 hover:shadow-[0_8px_30px_rgba(45,52,53,0.08)] transition-all group flex items-start gap-4">
                      <div className="shrink-0 text-center w-10 cursor-pointer pt-0.5" onClick={() => { openEntry(entry); setView('editor') }}>
                        <div className="text-lg font-extrabold text-[#2d3435] leading-none">{format(new Date(entry.created_at),'d')}</div>
                        <div className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider mt-0.5">{format(new Date(entry.created_at),'MMM')}</div>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}>
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="text-sm font-bold text-[#2d3435] truncate group-hover:text-[#1F3649] transition-colors">{entry.title}</h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {cc && entry.category && <span className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{entry.category}</span>}
                            {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                          </div>
                        </div>
                        <p className="text-xs text-[#5a6061] line-clamp-2 leading-relaxed">{stripMd(entry.content).slice(0,160)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-semibold text-[#adb3b4]">{countWords(entry.content)}</span>
                          {entry.location && <><span className="text-[10px] text-[#adb3b4]">·</span><span className="text-[10px] text-[#adb3b4] font-medium flex items-center gap-0.5"><MapPin size={9}/>{entry.location}</span></>}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1.5 rounded-lg transition-all cursor-pointer', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#dde4e5] hover:text-[#ca8a04]')}
                        >
                          <Star size={13} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                        <ChevronRight size={14} className="text-[#adb3b4] group-hover:text-[#1F3649] transition-colors cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraryEntries.map(entry => {
                  const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
                  const cc = entry.category ? getCatColor(entry.category) : null
                  const MoodIcon = meta?.icon
                  return (
                    <div key={entry.id} className="bg-white card p-5 hover:shadow-[0_8px_30px_rgba(45,52,53,0.08)] transition-all group cursor-pointer" onClick={() => { openEntry(entry); setView('editor') }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">{format(new Date(entry.created_at),'MMM d, yyyy')}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                          className={cn('p-1 rounded-lg transition-all cursor-pointer -mt-0.5', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#dde4e5] hover:text-[#ca8a04]')}
                        >
                          <Star size={12} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-[#2d3435] mb-2 line-clamp-2 group-hover:text-[#1F3649] transition-colors">{entry.title}</h3>
                      <p className="text-xs text-[#5a6061] line-clamp-3 leading-relaxed mb-4">{stripMd(entry.content).slice(0,120)}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f4]">
                        <span className="text-[10px] font-semibold text-[#adb3b4]">{countWords(entry.content)}</span>
                        <div className="flex items-center gap-1.5">
                          {cc && entry.category && <span className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>{entry.category}</span>}
                          {meta && MoodIcon && <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}><MoodIcon size={9}/>{meta.short}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="w-full lg:w-72 lg:shrink-0 space-y-4">
            {/* Quick Stats */}
            <div className="bg-white card p-5">
              <div className="flex items-center gap-2 mb-4"><BarChart2 size={14} className="text-[#1F3649]"/><h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Quick Stats</h3></div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label:'Total Entries', value:entries.length.toString() },
                  { label:'Day Streak',    value:`${streak}d` },
                  { label:'Total Words',   value:totalWords>=1000?`${(totalWords/1000).toFixed(1)}k`:totalWords.toString() },
                  { label:'Avg Mood',      value:avgMood>0?avgMood.toFixed(1):'—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f2f4f4] rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-[#2d3435]">{value}</div>
                    <div className="text-[10px] font-semibold text-[#5a6061] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white card p-5">
              <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-[#1F3649]"/><h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Mood Distribution</h3></div>
              {(() => {
                const total = Object.values(moodCounts).reduce((a,b)=>a+b,0)
                const R=40, CIRC=2*Math.PI*R
                if (!total) return <p className="text-xs text-[#adb3b4] text-center py-3">No mood data yet</p>
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
                        <circle r={R} cx={50} cy={50} fill="none" stroke="#f2f4f4" strokeWidth={12}/>
                        {segs.map((s,i) => <circle key={i} r={R} cx={50} cy={50} fill="none" stroke={s.color} strokeWidth={12} strokeDasharray={`${s.len} ${CIRC}`} strokeDashoffset={-s.off} transform="rotate(-90 50 50)"/>)}
                        <text x={50} y={46} textAnchor="middle" fill="#2d3435" fontSize={15} fontWeight={700}>{total}</text>
                        <text x={50} y={59} textAnchor="middle" fill="#5a6061" fontSize={8}>entries</text>
                      </svg>
                      <div className="flex-1 space-y-1">
                        {([5,4,3,2,1] as const).map(k => {
                          const cnt=moodCounts[k]||0; if (!cnt) return null
                          const meta=MOOD_META[k], pct=Math.round((cnt/total)*100)
                          const isActive = moodFilter?.min===k && moodFilter?.max===k
                          return (
                            <button key={k} onClick={() => setMoodFilter(isActive ? null : {min:k,max:k})}
                              className={cn('w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-all cursor-pointer', isActive?'bg-[#f2f4f4]':'hover:bg-[#f2f4f4]/60')}>
                              <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:meta.color}}/>
                              <span className="flex-1 text-left text-[#2d3435] font-medium">{meta.label}</span>
                              <span className="text-[#adb3b4] text-[10px]">{cnt} · {pct}%</span>
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
                <div className="flex items-center gap-2 mb-4"><Tag size={14} className="text-[#1F3649]"/><h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Categories</h3></div>
                <div className="space-y-2">
                  {categoryCounts.map(([cat, cnt]) => {
                    const cc = getCatColor(cat)
                    const total = entries.filter(e => e.category).length
                    const pct = total ? Math.round((cnt/total)*100) : 0
                    return (
                      <button key={cat} onClick={() => setCategoryFilter(categoryFilter===cat?null:cat)}
                        className={cn('w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer', categoryFilter===cat?'bg-[#f2f4f4]':'hover:bg-[#f2f4f4]/60')}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:cc.dot}}/>
                        <span className={cn('flex-1 text-left font-semibold', cc.text)}>{cat}</span>
                        <span className="text-[#adb3b4]">{cnt}</span>
                        <div className="w-12 h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
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
              <div className="flex items-center gap-2 mb-4"><Hash size={14} className="text-[#1F3649]"/><h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Common Themes</h3></div>
              <div className="flex flex-wrap gap-1.5">
                {popularWords.length === 0 ? (
                  <p className="text-xs text-[#adb3b4]">Write some entries to see themes</p>
                ) : popularWords.slice(0,12).map(({ word, count }) => (
                  <button key={word} onClick={() => setSearchFilter(searchFilter===word?'':word)}
                    className={cn('px-2.5 py-1 text-xs font-medium rounded-[15px] transition-all cursor-pointer',
                      searchFilter===word ? 'bg-[#1F3649] text-white' : 'bg-[#f2f4f4] text-[#5a6061] hover:bg-[#ebeeef]')}>
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
              <div className="relative card overflow-hidden mb-5 p-10 min-h-[200px] flex items-end"
                   style={{background: `linear-gradient(135deg, ${activeTemplateDetail.colorFrom}, ${activeTemplateDetail.colorTo})`}}>
                <button onClick={() => setActiveTemplateDetail(null)}
                  className="absolute top-4 right-4 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer">
                  <X size={13}/>
                </button>
                <div className="flex items-end justify-between w-full">
                  <div>
                    <span className="text-white/55 text-[10px] font-bold uppercase tracking-widest mb-3 block">Journal Template</span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">{activeTemplateDetail.name}</h2>
                    <p className="text-white/70 text-sm max-w-xl leading-relaxed">{activeTemplateDetail.subtitle}</p>
                  </div>
                  <div className="text-7xl opacity-50 ml-8 shrink-0">{activeTemplateDetail.emoji}</div>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* How it works */}
                <div className="col-span-1 md:col-span-7 bg-white card p-6">
                  <h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider mb-3">How it works</h3>
                  <p className="text-sm text-[#5a6061] leading-relaxed mb-4">{activeTemplateDetail.howItWorks}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f2f4f4] rounded-xl p-3">
                      <div className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest mb-1">Principle</div>
                      <div className="text-xs font-semibold text-[#2d3435] leading-snug">{activeTemplateDetail.principle}</div>
                    </div>
                    <div className="bg-[#f2f4f4] rounded-xl p-3">
                      <div className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest mb-1">Focus</div>
                      <div className="text-xs font-semibold text-[#2d3435] leading-snug">{activeTemplateDetail.focus}</div>
                    </div>
                  </div>
                </div>
                {/* Why use this */}
                <div className="col-span-1 md:col-span-5 bg-[#f2f4f4] card p-6">
                  <h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider mb-3">Why use this</h3>
                  <ul className="space-y-2 mb-4">
                    {activeTemplateDetail.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#5a6061] leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#adb3b4] mt-1.5 shrink-0"/>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-[#5a6061] italic leading-relaxed border-t border-[#e5e7e8] pt-3">{activeTemplateDetail.quote}</p>
                </div>
              </div>

              {/* Your Entry divider */}
              <div className="flex items-center gap-4 mt-7">
                <div className="flex-1 h-px bg-[#f2f4f4]"/>
                <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest">Your Entry</span>
                <div className="flex-1 h-px bg-[#f2f4f4]"/>
              </div>
            </div>
          )}

          {/* Editor + sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Writing area */}
            <div className="flex-1 min-w-0 w-full">
              {/* Date + title row */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[#1F3649]/70 mb-3">
                  {format(selected ? new Date(selected.created_at) : new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title your reflection..."
                  className="w-full bg-transparent text-2xl md:text-3xl font-extrabold text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none tracking-tight leading-tight"
                />
                {/* Category + location quick preview row */}
                {(entryCategory || entryLocation || entryWeather) && (
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {entryCategory && (() => { const cc=getCatColor(entryCategory); return <span className={cn('text-xs font-bold px-2.5 py-1 rounded-[15px]', cc.bg, cc.text)}>{entryCategory}</span> })()}
                    {entryLocation && <span className="text-xs text-[#adb3b4] flex items-center gap-1"><MapPin size={11}/>{entryLocation}</span>}
                    {entryWeather && <span className="text-xs text-[#adb3b4] flex items-center gap-1"><Cloud size={11}/>{entryWeather}</span>}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#f2f4f4] mb-8"/>

              {/* Editor — prompt fields when template is active, RichEditor otherwise */}
              {activeTemplateDetail && promptResponses.length > 0 ? (
                <div className="space-y-7">
                  {activeTemplateDetail.prompts.map((p, i) => (
                    <div key={i} className="group">
                      {/* Label row */}
                      <div className="flex items-center gap-2 mb-3">
                        {p.prefix && (
                          <span className="text-[11px] font-extrabold text-[#1F3649] uppercase tracking-widest">{p.prefix}</span>
                        )}
                        <label className="text-[11px] font-bold text-[#adb3b4] uppercase tracking-widest">
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
                        className="w-full bg-white border-none rounded-2xl px-6 py-5 text-sm text-[#2d3435] placeholder:text-[#adb3b4]/60 focus:outline-none focus:ring-2 focus:ring-[#1F3649]/15 shadow-sm focus:shadow-md transition-all resize-none leading-relaxed"
                      />
                    </div>
                  ))}
                  {/* Complete Reflection button */}
                  <div className="flex justify-end pt-2">
                    <button onClick={save} disabled={saving || !title.trim()}
                      className="flex items-center gap-2 bg-[#1F3649] hover:bg-[#162838] disabled:opacity-40 text-white font-bold px-8 py-3.5 rounded-[15px] shadow-lg shadow-[#1F3649]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-sm">
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
            <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 space-y-0 lg:overflow-y-auto lg:max-h-[calc(100vh-7rem)]">
              <div className="bg-white card overflow-hidden">

                {/* ── Mood ── */}
                <div className="p-6 border-b border-[#f2f4f4]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Current Mood</h3>
                    <span className="text-base">{moodScore ? MOOD_META[moodScore].emoji : '—'}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {([1,2,3,4,5] as const).map(score => {
                      const meta = MOOD_META[score]
                      const active = moodScore === score
                      return (
                        <button key={score} onClick={() => setMoodScore(active ? null : score)} title={meta.label}
                          className={cn('aspect-square flex items-center justify-center rounded-xl text-xl transition-all cursor-pointer',
                            active ? 'bg-[#1F3649]/10 scale-110 shadow-sm' : 'hover:bg-[#f2f4f4] opacity-60 hover:opacity-90')}>
                          {meta.emoji}
                        </button>
                      )
                    })}
                  </div>
                  {moodScore && <p className="text-[10px] text-center text-[#1F3649] font-semibold mt-2 uppercase tracking-wider">{MOOD_META[moodScore].label}</p>}
                </div>

                {/* ── Category ── */}
                <div className="p-6 border-b border-[#f2f4f4]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider">Category</h3>
                    <Tag size={13} className="text-[#adb3b4]"/>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ENTRY_CATEGORIES.map(cat => {
                      const cc = getCatColor(cat)
                      const active = entryCategory === cat
                      return (
                        <button key={cat} onClick={() => setEntryCategory(active ? null : cat)}
                          className={cn('px-3 py-1.5 rounded-[15px] text-xs font-semibold transition-all cursor-pointer',
                            active ? `${cc.bg} ${cc.text} shadow-sm` : 'bg-[#f2f4f4] text-[#5a6061] hover:bg-[#ebeeef]')}>
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── Quick Context ── */}
                <div className="p-6 border-b border-[#f2f4f4]">
                  <h3 className="text-xs font-bold text-[#2d3435] uppercase tracking-wider mb-4">Quick Context</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest block mb-1.5">Location</label>
                      <div className="flex items-center gap-2.5 bg-[#f2f4f4] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1F3649]/20 transition-all">
                        <MapPin size={14} className="text-[#adb3b4] shrink-0"/>
                        <input
                          value={entryLocation}
                          onChange={e => setEntryLocation(e.target.value)}
                          placeholder="e.g. Coffee shop, Home…"
                          className="flex-1 bg-transparent text-sm text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none min-w-0"
                        />
                        {entryLocation && <button onClick={() => setEntryLocation('')} className="text-[#adb3b4] hover:text-[#586062] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest block mb-1.5">Weather</label>
                      <div className="flex items-center gap-2.5 bg-[#f2f4f4] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1F3649]/20 transition-all">
                        <Cloud size={14} className="text-[#adb3b4] shrink-0"/>
                        <input
                          value={entryWeather}
                          onChange={e => setEntryWeather(e.target.value)}
                          placeholder="e.g. Sunny, 22°C…"
                          className="flex-1 bg-transparent text-sm text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none min-w-0"
                        />
                        {entryWeather && <button onClick={() => setEntryWeather('')} className="text-[#adb3b4] hover:text-[#586062] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Save ── */}
                <div className="p-6 border-b border-[#f2f4f4]">
                  <button onClick={save} disabled={saving || !title.trim()}
                    className="w-full py-3.5 bg-[#2d3435] hover:bg-[#1a1f1f] disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Save size={14}/>
                    {saving ? 'Saving…' : saveStatus==='saved' ? 'Saved ✓' : 'Save Entry'}
                  </button>
                  {saveStatus === 'saved' && (
                    <p className="text-center text-[10px] text-[#adb3b4] mt-2 font-medium uppercase tracking-widest">
                      Saved at {format(new Date(), 'h:mm a')}
                    </p>
                  )}
                  {selected && (
                    <button onClick={() => remove(selected.id)}
                      className="w-full mt-2 py-2 text-xs text-[#9f403d] hover:bg-[#9f403d]/5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Trash2 size={12}/> Delete entry
                    </button>
                  )}
                </div>

                {/* ── Options / Templates ── */}
                <div className="p-4 border-b border-[#f2f4f4] relative">
                  <button onClick={() => setShowEditorOptions(!showEditorOptions)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f2f4f4] transition-all cursor-pointer text-xs font-semibold text-[#5a6061]">
                    <div className="flex items-center gap-2"><MoreHorizontal size={14}/>Templates & Prompts</div>
                    <ChevronRight size={12} className={cn('transition-transform', showEditorOptions && 'rotate-90')}/>
                  </button>
                  {showEditorOptions && (
                    <div className="mt-2 space-y-1">
                      <button onClick={() => { setShowTemplatePicker(!showTemplatePicker); setShowEditorOptions(false) }}
                        className="w-full text-left px-3 py-2 text-xs text-[#2d3435] hover:bg-[#f2f4f4] rounded-lg cursor-pointer">Use Template</button>
                      <button onClick={() => { setContent(c => c + '## Events\n\n## Reflections\n\n## Gratitudes\n\n## Plans\n'); if (!title.trim()) setTitle('Prompted Entry'); setShowEditorOptions(false) }}
                        className="w-full text-left px-3 py-2 text-xs text-[#2d3435] hover:bg-[#f2f4f4] rounded-lg cursor-pointer">Prompted Entry</button>
                    </div>
                  )}
                  {showTemplatePicker && (
                    <div className="mt-2 border border-[#f2f4f4] rounded-xl overflow-hidden">
                      {templates.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-[#5a6061] opacity-60">No custom templates yet</div>
                      ) : templates.map(t => (
                        <button key={t.id} onClick={() => { setContent(String(t.structure?.content??'')); if (!title.trim()) setTitle(t.name); setShowTemplatePicker(false) }}
                          className="w-full text-left px-3 py-2 text-xs text-[#2d3435] hover:bg-[#f2f4f4] transition-all cursor-pointer">
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── AI Chat ── */}
                <div className="p-4">
                  <button onClick={() => setShowAiChat(!showAiChat)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f2f4f4] transition-all cursor-pointer text-xs font-semibold text-[#5a6061]">
                    <div className="flex items-center gap-2"><Brain size={14} className="text-[#1F3649]"/>Ask AI about my journal</div>
                    <ChevronRight size={12} className={cn('transition-transform', showAiChat && 'rotate-90')}/>
                  </button>
                  {showAiChat && (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-1.5">
                        {suggestedQuestions.map((q, i) => (
                          <button key={i} onClick={() => setAiQuery(q)}
                            className="w-full text-left text-xs text-[#1F3649] bg-[#f2f4f4] hover:bg-[#ebeeef] rounded-lg px-3 py-2 transition-all cursor-pointer leading-snug">
                            {q}
                          </button>
                        ))}
                      </div>
                      {aiResponse && (
                        <div className="bg-[#f2f4f4] rounded-xl p-3 animate-fade-in">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <MessageCircle size={11} className="text-[#1F3649]"/>
                            <span className="text-[10px] font-semibold text-[#2d3435]">AI Response</span>
                          </div>
                          <div className="text-xs text-[#5a6061] leading-relaxed prose prose-xs prose-stone max-w-none prose-p:my-1 prose-strong:text-[#2d3435] prose-ul:my-1 prose-li:my-0">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                          onKeyDown={e => e.key==='Enter' && askAI()}
                          placeholder="Ask your journal…"
                          className="flex-1 min-w-0 bg-[#f2f4f4] border-none rounded-xl py-2.5 px-3 text-xs text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all"/>
                        <button onClick={askAI} disabled={aiLoading || !aiQuery.trim()}
                          className="p-2 bg-[#1F3649] hover:bg-[#162838] disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shrink-0">
                          {aiLoading ? <Sparkles size={12} className="animate-pulse"/> : <Send size={12}/>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </aside>
          </div>
        </div>
      )}

      {/* =================== CALENDAR =================== */}
      {view === 'calendar' && (
        <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
          <div className="flex-1 min-w-0">
            <div className="bg-white card p-5 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth()-1))} className="text-[#5a6061] hover:text-[#2d3435] cursor-pointer"><ChevronLeft size={16}/></button>
                <h3 className="text-base font-semibold text-[#2d3435]">{format(calendarDate,'MMMM yyyy')}</h3>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth()+1))} className="text-[#5a6061] hover:text-[#2d3435] cursor-pointer"><ChevronRight size={16}/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-xs font-medium text-[#5a6061] py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length:startDayOfWeek},(_,i) => <div key={`e-${i}`} className="aspect-square"/>)}
                {daysInMonth.map(day => {
                  const ds=format(day,'yyyy-MM-dd'), hasEntry=entryDates.includes(ds)
                  const isToday=isSameDay(day,new Date()), isSel=selectedCalDay?isSameDay(day,selectedCalDay):false
                  return (
                    <button key={ds} onClick={() => setSelectedCalDay(day)}
                      className={cn('aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-pointer relative',
                        isSel?'bg-[#1F3649] text-white font-semibold':isToday?'bg-[#1F3649]/15 text-[#1F3649] font-semibold':'text-[#5a6061] hover:bg-[#f2f4f4]')}>
                      {day.getDate()}
                      {hasEntry && !isSel && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#1F3649]"/>}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-[#5a6061] opacity-60">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#1F3649] inline-block"/>Has entry</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1F3649]/15 inline-block"/>Today</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white card p-5">
                <div className="text-xs font-semibold text-[#5a6061] uppercase tracking-wider mb-2">Consistency Score</div>
                <div className="text-3xl font-bold text-[#1F3649]">{consistencyScore}%</div>
                <p className="text-xs text-[#5a6061] opacity-60 mt-1">{daysWithEntries.length} entries in {format(calendarDate,'MMMM')}</p>
              </div>
              <div className="bg-white card p-5">
                <div className="text-xs font-semibold text-[#5a6061] uppercase tracking-wider mb-2">Daily Prompt</div>
                <p className="text-sm text-[#2d3435] leading-relaxed italic">"What is one thing you learned about yourself this week?"</p>
                <button onClick={() => { openNew(); setView('editor'); setTitle('Daily Prompt Reflection') }} className="text-xs text-[#1F3649] hover:underline mt-2 cursor-pointer">Write about this</button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[280px] lg:shrink-0">
            <div className="bg-white card p-5">
              <h3 className="text-sm font-semibold text-[#2d3435] mb-3">{selectedCalDay ? format(selectedCalDay,'EEEE, MMM d') : 'Select a day'}</h3>
              {selectedCalDay && !selectedDayEntries.length && (
                <div className="text-center py-8">
                  <p className="text-xs text-[#5a6061] opacity-60 mb-2">No entries on this day</p>
                  <button onClick={() => { openNew(); setView('editor') }} className="text-xs text-[#1F3649] hover:underline cursor-pointer">Write an entry</button>
                </div>
              )}
              {selectedDayEntries.map(entry => (
                <div key={entry.id} onClick={() => { openEntry(entry); setView('editor') }}
                  className="p-3 bg-[#f2f4f4] rounded-xl mb-2 cursor-pointer hover:bg-[#ebeeef] transition-all">
                  <div className="text-sm font-medium text-[#2d3435] truncate">{entry.title}</div>
                  <p className="text-xs text-[#5a6061] opacity-60 mt-1 line-clamp-3 leading-relaxed">{entry.content.replace(/[#*`]/g,'').slice(0,120)}</p>
                </div>
              ))}
              {!selectedCalDay && <p className="text-xs text-[#5a6061] opacity-60 py-6 text-center">Click a day on the calendar to preview entries</p>}
            </div>
          </div>
        </div>
      )}

      {/* =================== TEMPLATES =================== */}
      {view === 'templates' && (
        <div className="animate-fade-in">

          {/* Header + filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#2d3435] tracking-tight">Template Library</h2>
              <p className="text-sm text-[#5a6061] mt-0.5">{BUILT_IN_TEMPLATES.length} guided frameworks to deepen your reflection</p>
            </div>
            <div className="flex gap-1.5 bg-[#f2f4f4] p-1.5 rounded-xl self-start">
              {(['All', 'Personal', 'Work', 'Gratitude'] as TemplateFilter[]).map(f => (
                <button key={f} onClick={() => setTemplateFilter(f)}
                  className={cn('px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                    templateFilter===f ? 'bg-white text-[#2d3435] shadow-sm' : 'text-[#5a6061] hover:text-[#2d3435]')}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* All — bento grid */}
          {templateFilter === 'All' && (
            <div className="space-y-4">
              {/* Row 1: large feature + companion */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Large feature card */}
                <button onClick={() => applyBuiltIn(BUILT_IN_TEMPLATES[0])}
                  className="col-span-1 md:col-span-7 relative overflow-hidden card p-7 md:p-10 flex flex-col justify-between min-h-[240px] md:min-h-[320px] cursor-pointer group text-left"
                  style={{background: `linear-gradient(135deg, ${BUILT_IN_TEMPLATES[0].colorFrom}, ${BUILT_IN_TEMPLATES[0].colorTo})`}}>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Featured Template</span>
                    <span className="text-5xl opacity-40">{BUILT_IN_TEMPLATES[0].emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{BUILT_IN_TEMPLATES[0].name}</h3>
                    <p className="text-white/65 text-sm leading-relaxed mb-6 max-w-sm">{BUILT_IN_TEMPLATES[0].subtitle}</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white text-[#2d3435] font-bold text-sm px-5 py-2 rounded-[15px] group-hover:bg-white/90 transition-all">Apply Template</span>
                      <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{BUILT_IN_TEMPLATES[0].category}</span>
                    </div>
                  </div>
                </button>

                {/* Companion card */}
                <button onClick={() => applyBuiltIn(BUILT_IN_TEMPLATES[1])}
                  className="col-span-1 md:col-span-5 relative overflow-hidden card p-7 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[320px] cursor-pointer group text-left"
                  style={{background: `linear-gradient(135deg, ${BUILT_IN_TEMPLATES[1].colorFrom}, ${BUILT_IN_TEMPLATES[1].colorTo})`}}>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl opacity-50">{BUILT_IN_TEMPLATES[1].emoji}</span>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors"/>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">{BUILT_IN_TEMPLATES[1].category}</span>
                    <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">{BUILT_IN_TEMPLATES[1].name}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-5">{BUILT_IN_TEMPLATES[1].subtitle.slice(0,90)}…</p>
                    <span className="bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-4 py-2 rounded-[15px] transition-all inline-block">Apply Template</span>
                  </div>
                </button>
              </div>

              {/* Row 2: medium cards [2,3,4] */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BUILT_IN_TEMPLATES.slice(2, 5).map(tpl => (
                  <button key={tpl.id} onClick={() => applyBuiltIn(tpl)}
                    className="relative overflow-hidden card p-7 flex flex-col justify-between min-h-[200px] cursor-pointer group text-left"
                    style={{background: `linear-gradient(135deg, ${tpl.colorFrom}, ${tpl.colorTo})`}}>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl opacity-60">{tpl.emoji}</span>
                      <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors"/>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">{tpl.category}</span>
                      <h3 className="text-base font-extrabold text-white mb-1.5 tracking-tight">{tpl.name}</h3>
                      <p className="text-white/55 text-xs leading-relaxed">{tpl.subtitle.slice(0,70)}…</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 3: medium cards [5,6,7] */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BUILT_IN_TEMPLATES.slice(5, 8).map(tpl => (
                  <button key={tpl.id} onClick={() => applyBuiltIn(tpl)}
                    className="relative overflow-hidden card p-7 flex flex-col justify-between min-h-[200px] cursor-pointer group text-left"
                    style={{background: `linear-gradient(135deg, ${tpl.colorFrom}, ${tpl.colorTo})`}}>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl opacity-60">{tpl.emoji}</span>
                      <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors"/>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">{tpl.category}</span>
                      <h3 className="text-base font-extrabold text-white mb-1.5 tracking-tight">{tpl.name}</h3>
                      <p className="text-white/55 text-xs leading-relaxed">{tpl.subtitle.slice(0,70)}…</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 4: small cards [8,9,10] + create custom */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {BUILT_IN_TEMPLATES.slice(8, 11).map(tpl => (
                  <button key={tpl.id} onClick={() => applyBuiltIn(tpl)}
                    className="relative overflow-hidden card p-5 flex flex-col justify-between min-h-[160px] cursor-pointer group text-left"
                    style={{background: `linear-gradient(135deg, ${tpl.colorFrom}, ${tpl.colorTo})`}}>
                    <div className="flex items-start justify-between">
                      <span className="text-2xl opacity-60">{tpl.emoji}</span>
                      <ChevronRight size={13} className="text-white/30 group-hover:text-white/60 transition-colors"/>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-0.5 leading-tight">{tpl.name}</h3>
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{tpl.category}</span>
                    </div>
                  </button>
                ))}
                {/* Create custom card */}
                <button onClick={() => { setNewTemplateName(''); setNewTemplateContent(''); document.getElementById('create-template-form')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="card p-5 flex flex-col justify-between min-h-[160px] cursor-pointer group text-left border-2 border-dashed border-[#adb3b4]/30 hover:border-[#1F3649]/40 bg-white transition-all">
                  <div className="w-8 h-8 rounded-full bg-[#f2f4f4] group-hover:bg-[#1F3649]/10 flex items-center justify-center transition-colors">
                    <Plus size={15} className="text-[#adb3b4] group-hover:text-[#1F3649] transition-colors"/>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2d3435] mb-0.5">Custom Template</h3>
                    <span className="text-[10px] font-semibold text-[#adb3b4] uppercase tracking-wider">Create your own</span>
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
                  <p className="text-sm text-[#5a6061]">No templates in this category yet.</p>
                </div>
              ) : filteredBuiltIns.map(tpl => (
                <button key={tpl.id} onClick={() => applyBuiltIn(tpl)}
                  className="relative overflow-hidden card p-8 flex flex-col justify-between min-h-[240px] cursor-pointer group text-left"
                  style={{background: `linear-gradient(135deg, ${tpl.colorFrom}, ${tpl.colorTo})`}}>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl opacity-50">{tpl.emoji}</span>
                    <ChevronRight size={15} className="text-white/30 group-hover:text-white/60 transition-colors"/>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">{tpl.category}</span>
                    <h3 className="text-lg font-extrabold text-white mb-2 tracking-tight">{tpl.name}</h3>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{tpl.subtitle.slice(0,90)}…</p>
                    <span className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-4 py-1.5 rounded-[15px] transition-all inline-block">Apply Template</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* User templates */}
          {templates.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-[#5a6061] uppercase tracking-wider mb-4">Your Custom Templates</h3>
              <div className="grid grid-cols-3 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="bg-white card p-5 hover:shadow-[0_10px_40px_rgba(45,52,53,0.06)] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#1F3649] uppercase tracking-wider bg-[#1F3649]/10 px-2 py-0.5 rounded-[15px]">Custom</span>
                    </div>
                    <h4 className="font-semibold text-[#2d3435] mb-1">{t.name}</h4>
                    <p className="text-xs text-[#5a6061] opacity-60 mb-4 line-clamp-2 leading-relaxed">{String(t.structure?.content??'').replace(/[#*`]/g,'').slice(0,100)}</p>
                    <button onClick={() => { openNew(String(t.structure?.content??'')); setView('editor') }}
                      className="text-xs text-[#1F3649] font-medium hover:underline cursor-pointer flex items-center gap-1">
                      Apply Template <ChevronRight size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create template form */}
          <div id="create-template-form" className="mt-8 bg-white card p-6">
            <h3 className="font-semibold text-[#2d3435] mb-1">Create Custom Template</h3>
            <p className="text-xs text-[#5a6061] mb-4">Save a reusable structure for your journal entries.</p>
            <div className="space-y-3">
              <input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Template name..."
                className="w-full bg-[#f2f4f4] border-none rounded-xl py-3 px-4 text-sm text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all"/>
              <textarea value={newTemplateContent} onChange={e => setNewTemplateContent(e.target.value)}
                placeholder="Template content (markdown)..." rows={5}
                className="w-full bg-[#f2f4f4] border-none rounded-xl py-3 px-4 text-sm text-[#5a6061] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all resize-none font-mono"/>
              <button onClick={saveTemplate} disabled={!newTemplateName.trim()}
                className="bg-[#1F3649] hover:bg-[#162838] disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                Save Template
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
