import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Target, Trash2, ChevronDown, ChevronRight, ChevronLeft,
  ArrowRight, Heart, Briefcase, DollarSign, Users,
  TrendingUp, Smile, UserCheck, Lightbulb, CheckCircle2, Circle,
  Frown, Meh, MapPin, Cloud, Moon, Zap, Wine, Dumbbell, X, AlertTriangle,
  Brain, Monitor, ShieldAlert, ShieldCheck, RefreshCw, AlertCircle,
} from 'lucide-react'
import { LogbirdDatePicker } from '../components/ui/date-range-picker'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, YAxis,
} from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useWheelStore } from '../stores/wheelStore'
import type { Goal } from '../stores/wheelStore'
import GoalDetailView from '../components/GoalDetailView'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '../lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/radar-chart'
import type { ChartConfig } from '../components/ui/radar-chart'
import { fetchWheelInsights, loadSavedWheelInsights } from '../lib/aiAnalysis'
import type { WheelAIInsightsData } from '../lib/aiAnalysis'

type Tab = 'dashboard' | 'checkin' | 'goals' | 'history' | 'insights'

// Fixed 8 check-in domains with sub-areas and reflection questions
const CHECK_IN_DOMAINS = [
  {
    id: 'finances',
    name: 'Finances & Money',
    icon: DollarSign,
    color: '#f59e0b',
    description: 'Financial security & freedom',
    subAreas: [
      { key: 'stability', title: 'Financial Stability', description: 'How well are your income and expenses under control?' },
      { key: 'debt', title: 'Debt', description: 'How manageable and under control is your current debt?' },
      { key: 'income', title: 'Income', description: 'How stable and growing is your income?' },
      { key: 'awareness', title: 'Awareness', description: 'How clearly do you understand your financial situation?' },
      { key: 'wealth', title: 'Wealth Building', description: 'How well are you building long-term wealth (saving/investing)?' },
    ],
    questions: [
      'What is currently helping your financial situation the most?',
      'What is currently hurting your finances the most?',
      'Where are you avoiding the truth about your money?',
      'What is one financial action you will take next?',
    ],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: Heart,
    color: '#22c55e',
    description: 'Physical & mental wellbeing',
    subAreas: [
      { key: 'fitness', title: 'Physical Capability', description: 'How strong, mobile, and physically capable does your body feel?' },
      { key: 'nutrition', title: 'Nutrition', description: 'How well does your nutrition support your health and energy?' },
      { key: 'sleep', title: 'Sleep & Recovery', description: 'How restorative and consistent is your sleep?' },
      { key: 'mental', title: 'Stress', description: 'How well are you managing stress and emotions?' },
      { key: 'energy', title: 'Energy', description: 'How energized and stable do you feel throughout the day?' },
      { key: 'habits', title: 'Habits', description: 'How consistent are your daily health habits?' },
    ],
    questions: [
      'What is currently helping your health the most?',
      'What is currently hurting your health the most?',
      'What feels most out of alignment right now?',
      'What is one thing you will improve next?',
    ],
  },
  {
    id: 'family',
    name: 'Family & Friends',
    icon: UserCheck,
    color: '#f97316',
    description: 'Close relationships & community',
    subAreas: [
      { key: 'connection', title: 'Connection', description: 'How deep and meaningful are your relationships?' },
      { key: 'support', title: 'Support', description: 'How much can you rely on people when you need them?' },
      { key: 'time', title: 'Time Together', description: 'How often do you spend meaningful time with people you care about?' },
      { key: 'energy', title: 'Energy', description: 'How positive and energizing are your interactions with others?' },
      { key: 'contribution', title: 'Contribution', description: 'How much effort do you put into maintaining your relationships?' },
    ],
    questions: [
      'What relationship is currently adding the most value to your life?',
      'Where are you neglecting or avoiding a relationship?',
      'Which interactions are draining you the most right now?',
      'What is one relationship you will actively invest in next?',
    ],
  },
  {
    id: 'spirituality',
    name: 'Spirituality & Religion',
    icon: Lightbulb,
    color: '#8b5cf6',
    description: 'Purpose, meaning & inner alignment',
    subAreas: [
      { key: 'purpose', title: 'Purpose', description: 'How clear and meaningful does your direction in life feel?' },
      { key: 'peace', title: 'Inner State', description: 'How calm, grounded, and at peace do you feel?' },
      { key: 'values', title: 'Alignment', description: 'How aligned are your actions with your values?' },
      { key: 'mindful', title: 'Presence', description: 'How present and aware are you in your daily life?' },
      { key: 'connection', title: 'Connection', description: 'How connected do you feel to something greater than yourself?' },
    ],
    questions: [
      'What currently gives your life the most meaning?',
      'Where are you acting out of alignment with your values?',
      'When do you feel most present and at peace?',
      'What would bring more meaning or clarity into your life right now?',
    ],
  },
  {
    id: 'recreation',
    name: 'Recreation & Lifestyle',
    icon: Smile,
    color: '#ec4899',
    description: 'Joy, recovery & balance',
    subAreas: [
      { key: 'joy', title: 'Joy', description: 'How much joy and enjoyment do you experience in your life?' },
      { key: 'balance', title: 'Balance', description: 'How balanced does your life feel between work, rest, and personal time?' },
      { key: 'overload', title: 'Overload', description: 'How overwhelmed vs. mentally clear do you feel in your daily life?' },
      { key: 'recovery', title: 'Recovery', description: 'How well do you rest, relax, and recharge?' },
      { key: 'engagement', title: 'Engagement', description: 'How engaged and interested are you in your life?' },
    ],
    questions: [
      'What has genuinely made you feel alive recently?',
      'Where do you feel drained or overloaded?',
      'What are you not making enough time for?',
      'What would bring more joy or balance into your life right now?',
    ],
  },
  {
    id: 'love',
    name: 'Love & Romance',
    icon: Heart,
    color: '#ef4444',
    description: 'Romantic connection, intimacy & clarity',
    subAreas: [
      { key: 'emotional', title: 'Emotional Connection', description: 'How emotionally connected and understood do you feel?' },
      { key: 'comm', title: 'Communication', description: 'How openly and honestly do you communicate your needs and boundaries?' },
      { key: 'physical', title: 'Physical Intimacy', description: 'How satisfying and connected does your physical intimacy feel?' },
      { key: 'conflict', title: 'Conflict', description: 'How constructively do you handle disagreements and conflict?' },
      { key: 'effort', title: 'Effort', description: 'How much effort do you actively put into the relationship?' },
      { key: 'clarity', title: 'Clarity', description: 'How clear are you about what you want in your romantic life?' },
    ],
    questions: [
      'What is currently working well in your romantic life?',
      'What feels off or unsatisfying right now?',
      'Where are you not showing up the way you want to?',
      'What would improve your romantic life the most right now?',
    ],
  },
  {
    id: 'work',
    name: 'Work & Career',
    icon: Briefcase,
    color: '#0ea5e9',
    description: 'Professional growth, direction & agency',
    subAreas: [
      { key: 'fulfillment', title: 'Fulfillment', description: 'How meaningful and fulfilling does your work feel?' },
      { key: 'growth', title: 'Growth', description: 'How much are you learning and improving your skills?' },
      { key: 'comp', title: 'Compensation', description: 'How fair and rewarding is your compensation?' },
      { key: 'direction', title: 'Direction', description: 'How clear and confident are you in your career direction?' },
      { key: 'control', title: 'Control', description: 'How much control do you feel you have over your career?' },
    ],
    questions: [
      'What is currently working well in your work or career?',
      'What feels frustrating or limiting right now?',
      'Where are you not progressing the way you want to?',
      'What is one step you could take to improve your situation?',
    ],
  },
  {
    id: 'growth',
    name: 'Growth & Learning',
    icon: TrendingUp,
    color: '#6b63f5',
    description: 'Self-awareness, learning & real progress',
    subAreas: [
      { key: 'awareness', title: 'Self-Awareness', description: 'How well do you understand your strengths, weaknesses, and patterns?' },
      { key: 'learning', title: 'Learning', description: 'How consistently are you learning new things?' },
      { key: 'application', title: 'Application', description: 'How much do you apply what you learn in your life?' },
      { key: 'adaptability', title: 'Adaptability', description: 'How well do you adapt and grow from challenges?' },
      { key: 'progress', title: 'Progress', description: 'How much are you actually moving forward in your personal growth?' },
    ],
    questions: [
      'What have you learned recently that actually changed your behavior?',
      'Where are you consuming but not applying?',
      'What is currently slowing down your growth?',
      'What is one thing you will actively work on next?',
    ],
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: MapPin,
    color: '#14b8a6',
    description: 'Your surroundings & their impact on your life',
    subAreas: [
      { key: 'living', title: 'Living Space', description: 'How supportive and comfortable is your living environment?' },
      { key: 'work', title: 'Work Environment', description: 'How well does your environment support your focus and productivity?' },
      { key: 'order', title: 'Order', description: 'How organized and clear does your environment feel?' },
      { key: 'location', title: 'Location', description: 'How well does your location support your lifestyle and goals?' },
      { key: 'influence', title: 'Influence', description: 'How much does your environment positively influence your habits and behavior?' },
    ],
    questions: [
      'What in your environment is currently helping you the most?',
      'What in your environment is holding you back?',
      'What feels out of place or misaligned in your surroundings?',
      'What is one change you could make to improve your environment?',
    ],
  },
]

// Colour map for history tab — handles both old and new category names
const CATEGORY_COLOR: Record<string, string> = {
  Health: '#22c55e',
  'Health & Fitness': '#22c55e',
  Career: '#0C1629',
  'Work & Career': '#0ea5e9',
  Finance: '#f59e0b',
  'Finances & Money': '#f59e0b',
  Relationships: '#ef4444',
  'Love & Romance': '#ef4444',
  'Personal Growth': '#8b5cf6',
  'Growth & Learning': '#6b63f5',
  Fun: '#ec4899',
  'Recreation & Lifestyle': '#ec4899',
  Environment: '#14b8a6',
  'Physical Environment': '#14b8a6',
  'Family/Friends': '#f97316',
  'Family & Friends': '#f97316',
  'Spirituality & Religion': '#8b5cf6',
  'Environment': '#14b8a6',
}
function getCategoryColor(name: string) {
  return CATEGORY_COLOR[name] ?? '#6b63f5'
}

const MOOD_META: Record<number, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  1: { label: 'Very Low',  color: '#dc2626', bg: '#fef2f2', icon: Frown },
  2: { label: 'Low',       color: '#ea580c', bg: '#fff7ed', icon: Frown },
  3: { label: 'Neutral',   color: '#9ca3af', bg: '#f9fafb', icon: Meh   },
  4: { label: 'Good',      color: '#16a34a', bg: '#f0fdf4', icon: Smile },
  5: { label: 'Excellent', color: '#065f46', bg: '#ecfdf5', icon: Smile },
}

// Donut chart component
function ScoreDonut({ score, maxScore = 10, size = 100, color = '#0C1629' }: {
  score: number; maxScore?: number; size?: number; color?: string
}) {
  const pct = (score / maxScore) * 100
  const data = [{ value: pct }, { value: 100 - pct }]
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%"
            innerRadius={size * 0.33} outerRadius={size * 0.45}
            startAngle={90} endAngle={-270} dataKey="value" stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#F0F3F3" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#0C1629]">
          {score}<span className="text-xs font-normal text-[#727A84] opacity-60">/{maxScore}</span>
        </span>
      </div>
    </div>
  )
}

function loadWolDraft(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('wol_draft')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

// Fixed PointSelector — type="button" prevents form submit; value is always direct state
function PointSelector({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((point) => (
        <button
          key={point}
          type="button"
          onClick={() => onChange(point)}
          className={cn(
            'h-9 sm:w-9 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none',
            value !== null && point <= value
              ? 'bg-[#0C1629] text-white shadow-sm'
              : 'bg-[#F0F3F3] text-[#727A84] hover:bg-[#E4E9EC]'
          )}
        >
          {point}
        </button>
      ))}
    </div>
  )
}

export default function WheelOfLife() {
  const { user } = useAuthStore()
  const {
    categories, checkins, goals, tasks, fetchAll, createCheckin,
    createGoal, updateGoal, deleteGoal, createTask, toggleTask,
    deleteTask, addCustomCategory,
  } = useWheelStore()

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = (searchParams.get('tab') as Tab) || 'dashboard'

  // Check-in state — persisted to localStorage so no progress is lost
  const [subScores, setSubScores] = useState<Record<string, number | null>>(() => (loadWolDraft().subScores as Record<string, number | null>) ?? {})
  const [moodScore, setMoodScore] = useState<number | null>(() => (loadWolDraft().moodScore as number | null) ?? null)
  const [location, setLocation] = useState<string>(() => (loadWolDraft().location as string) ?? '')
  const [weather, setWeather] = useState<string>(() => (loadWolDraft().weather as string) ?? '')
  const [sleepQuality, setSleepQuality] = useState<number | null>(() => (loadWolDraft().sleepQuality as number | null) ?? null)
  const [energyLevel, setEnergyLevel] = useState<'low' | 'unstable' | 'good' | 'high' | null>(() => (loadWolDraft().energyLevel as 'low' | 'unstable' | 'good' | 'high' | null) ?? null)
  const [stressLevel, setStressLevel] = useState<'very_low' | 'low' | 'moderate' | 'high' | 'overwhelming' | null>(() => (loadWolDraft().stressLevel as 'very_low' | 'low' | 'moderate' | 'high' | 'overwhelming' | null) ?? null)
  const [hadAlcohol, setHadAlcohol] = useState<boolean | null>(() => (loadWolDraft().hadAlcohol as boolean | null) ?? null)
  const [poorSleep, setPoorSleep] = useState<boolean | null>(() => (loadWolDraft().poorSleep as boolean | null) ?? null)
  const [highScreenTime, setHighScreenTime] = useState<boolean | null>(() => (loadWolDraft().highScreenTime as boolean | null) ?? null)
  const [exercised, setExercised] = useState<boolean | null>(() => (loadWolDraft().exercised as boolean | null) ?? null)
  const [notes, setNotes] = useState<string>(() => (loadWolDraft().notes as string) ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [activeDomainId, setActiveDomainId] = useState(CHECK_IN_DOMAINS[0].id)
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string[]>>(() => (loadWolDraft().reflectionAnswers as Record<string, string[]>) ?? {})

  // Goals state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({ categoryId: '', title: '', description: '', targetDate: '' })
  const [newTask, setNewTask] = useState({ goalId: '', categoryId: '', title: '' })
  const [wheelInsights, setWheelInsights] = useState<WheelAIInsightsData | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiMode, setAiMode] = useState<'quick' | 'deep'>('quick')
  const [insightSubTab, setInsightSubTab] = useState<'keyinsights' | 'dimensions' | 'ai' | 'breakdown'>('keyinsights')
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user])

  useEffect(() => {
    if (!user) return
    loadSavedWheelInsights(user.id).then((saved) => {
      if (saved) setWheelInsights(saved)
    })
  }, [user])

  // Auto-save draft to localStorage on every change so progress is never lost
  useEffect(() => {
    localStorage.setItem('wol_draft', JSON.stringify({
      subScores, moodScore, location, weather, sleepQuality,
      energyLevel, stressLevel, hadAlcohol, poorSleep, highScreenTime,
      exercised, notes, reflectionAnswers,
    }))
  }, [subScores, moodScore, location, weather, sleepQuality, energyLevel, stressLevel, hadAlcohol, poorSleep, highScreenTime, exercised, notes, reflectionAnswers])

  const runWheelInsights = async () => {
    if (!user) return
    setAiLoading(true)
    setAiError('')
    try {
      const payload = {
        scores: latestCheckinScores,
        dimScores,
        checkinCount: checkins.length,
        latestDate: checkins[0]?.date,
      }
      const data = await fetchWheelInsights(payload, user.id, aiMode)
      setWheelInsights(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (message === 'NO_API_KEY') {
        setAiError('Add your Anthropic API key in Settings to enable AI insights.')
      } else if (message.includes('401')) {
        setAiError('Invalid API key. Please check your Anthropic API key in Settings.')
      } else if (message.includes('429')) {
        setAiError('Rate limited. Please wait a moment and try again.')
      } else {
        setAiError(`Failed to generate insights: ${message.replace('API_ERROR: ', '')}`)
      }
    }
    setAiLoading(false)
  }

  // Compute per-domain score as average of its sub-area scores,
  // falling back to the latest checkin's top-level scores when no sub-area
  // ratings are in progress (i.e. the check-in form is empty).
  const scores = useMemo(() => {
    const result: Record<string, number> = {}
    const topLevel = (checkins[0]?.scores ?? {}) as Record<string, number>
    CHECK_IN_DOMAINS.forEach(d => {
      const vals = d.subAreas
        .map(sa => subScores[`${d.id}.${sa.key}`])
        .filter((v): v is number => v != null)
      result[d.name] = vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : topLevel[d.name] ?? 0
    })
    return result
  }, [subScores, checkins])

  const overallAverage = useMemo(() => {
    const ratedDomains = CHECK_IN_DOMAINS.filter(d =>
      d.subAreas.some(sa => subScores[`${d.id}.${sa.key}`] != null)
    )
    // When no sub-area check-in is in progress, average all domain scores
    // (which already fall back to the latest checkin's top-level scores)
    const domainsToUse = ratedDomains.length > 0 ? ratedDomains : CHECK_IN_DOMAINS
    const vals = domainsToUse.map(d => scores[d.name]).filter(v => v > 0)
    if (vals.length === 0) return 0
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }, [subScores, scores])

  const allRated = CHECK_IN_DOMAINS.every(d =>
    d.subAreas.every(sa => subScores[`${d.id}.${sa.key}`] != null)
  )

  // ── Context signal: bias correction layer ───────────────────────────────
  // Computes whether today's context (stress, sleep, mood, energy) may be
  // distorting check-in scores, and whether low scores are real or noisy.
  const contextSignal = useMemo(() => {
    const signals: number[] = []
    if (moodScore != null)   signals.push(moodScore <= 2 ? -1 : moodScore >= 4 ? 1 : 0)
    if (sleepQuality != null) signals.push(sleepQuality <= 2 ? -1 : sleepQuality >= 4 ? 1 : 0)
    if (energyLevel)         signals.push(energyLevel === 'low' || energyLevel === 'unstable' ? -1 : energyLevel === 'high' ? 1 : 0)
    if (stressLevel)         signals.push(stressLevel === 'high' || stressLevel === 'overwhelming' ? -1 : stressLevel === 'very_low' || stressLevel === 'low' ? 1 : 0)
    if (hadAlcohol)          signals.push(-0.5)
    if (poorSleep)           signals.push(-1)
    if (highScreenTime)      signals.push(-0.3)
    if (exercised)           signals.push(0.5)
    if (signals.length === 0) return null
    const avg = signals.reduce((a, b) => a + b, 0) / signals.length
    if (avg < -0.25) return {
      level: 'low' as const,
      label: 'Low confidence',
      message: "Today's context (stress, low energy, or poor sleep) may be temporarily pulling your scores down. These ratings may not fully reflect your actual life quality.",
    }
    if (avg > 0.25) return {
      level: 'high' as const,
      label: 'High confidence',
      message: avg > 0.5 && overallAverage < 5
        ? "Your context today is positive, yet scores are low — this likely reflects a real pattern worth addressing, not a bad day."
        : null,
    }
    return { level: 'neutral' as const, label: 'Neutral context', message: null }
  }, [moodScore, sleepQuality, energyLevel, stressLevel, hadAlcohol, poorSleep, highScreenTime, exercised, overallAverage])

  // ── Insight engine ──────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const sub = (domainId: string, subKey: string) => subScores[`${domainId}.${subKey}`] ?? 5

    type InsightLevel = 'critical' | 'warning'
    interface Candidate { level: InsightLevel; title: string; body: string; focus: string; weight: number }
    const candidates: Candidate[] = []

    const learning    = sub('growth', 'learning')
    const application = sub('growth', 'application')
    const progress    = sub('growth', 'progress')
    const awareness   = sub('growth', 'awareness')
    const habits      = sub('health', 'habits')
    const energy      = sub('health', 'energy')
    const recovery    = sub('recreation', 'recovery')
    const overload    = sub('recreation', 'overload')
    const fulfillment = sub('work', 'fulfillment')
    const comp        = sub('work', 'comp')
    const direction   = sub('work', 'direction')
    const timeTog     = sub('family', 'time')
    const connection  = sub('family', 'connection')
    const purpose     = sub('spirituality', 'purpose')
    const envInfluence = sub('environment', 'influence')
    const finStability = sub('finances', 'stability')
    const finWealth   = sub('finances', 'wealth')

    // R1: Consuming without applying
    if (learning > 6.5 && application < 5)
      candidates.push({ level: 'critical', weight: learning - application,
        title: 'Consuming without executing',
        body: `You're learning actively (${learning}/10) but not applying it (${application}/10). Input without output doesn't produce growth.`,
        focus: "Pick one thing you've learned and change one behavior around it this week." })

    // R2: Effort not converting into results
    if (habits > 6.5 && (energy < 5 || recovery < 5))
      candidates.push({ level: 'critical', weight: habits - Math.min(energy, recovery),
        title: 'Effort not converting into results',
        body: `You have strong habits (${habits}/10) but low energy (${energy}/10) or recovery (${recovery}/10). Hard work without rest creates diminishing returns.`,
        focus: 'Prioritize sleep and recovery before adding more effort.' })

    // R3: High overload, low recovery
    if (overload < 4 && recovery < 5)
      candidates.push({ level: 'critical', weight: (5 - overload) + (5 - recovery),
        title: 'High overload, low recovery',
        body: `You're mentally overloaded (${overload}/10) with insufficient recovery (${recovery}/10). This is an early burnout signal.`,
        focus: 'Schedule protected recovery time — remove something before adding anything.' })

    // R4: Paid well, unfulfilled
    if (comp > 7 && fulfillment < 5)
      candidates.push({ level: 'warning', weight: comp - fulfillment,
        title: 'Compensated but not fulfilled',
        body: `Compensation is strong (${comp}/10) but work feels unfulfilling (${fulfillment}/10). This gap tends to widen over time.`,
        focus: 'Identify specifically what drains the meaning from your work.' })

    // R5: Around people, not connected
    if (timeTog > 6.5 && connection < 5)
      candidates.push({ level: 'warning', weight: timeTog - connection,
        title: 'Present but not connected',
        body: `You spend time with people (${timeTog}/10) but don't feel deeply connected (${connection}/10). Quantity isn't quality.`,
        focus: 'Invest in one deeper, uninterrupted conversation this week.' })

    // R6: Self-aware but not acting
    if (awareness > 7 && habits < 5)
      candidates.push({ level: 'warning', weight: awareness - habits,
        title: 'Self-aware but not acting on it',
        body: `Strong self-awareness (${awareness}/10) but weak daily habits (${habits}/10). Knowing isn't doing.`,
        focus: 'Take one insight about yourself and design a single habit around it.' })

    // R7: Clear direction, environment blocking it
    if (direction > 7 && envInfluence < 5)
      candidates.push({ level: 'warning', weight: direction - envInfluence,
        title: 'Clear direction, unsupportive environment',
        body: `You know where you're going (${direction}/10) but your environment isn't supporting you (${envInfluence}/10). Setup determines behavior.`,
        focus: 'Identify one environmental change that would make your goals easier.' })

    // R8: Purpose without progress
    if (purpose > 7 && progress < 5)
      candidates.push({ level: 'warning', weight: purpose - progress,
        title: 'Clear purpose, no real progress',
        body: `Strong sense of purpose (${purpose}/10) but not making real progress (${progress}/10). Vision without traction.`,
        focus: 'Define one concrete next step — not a goal, a specific action.' })

    // R9: Financial foundation at risk
    if (finStability < 5 && finWealth < 4)
      candidates.push({ level: 'critical', weight: (5 - finStability) + (5 - finWealth),
        title: 'Financial foundation needs attention',
        body: `Both stability (${finStability}/10) and wealth building (${finWealth}/10) are low. Foundation must come before growth.`,
        focus: 'Focus on stabilizing income and expenses before thinking about investing.' })

    return candidates
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(({ weight: _w, ...rest }) => rest)
  }, [subScores])
  // ────────────────────────────────────────────────────────────────────────

  // Resolve a score key that might be a UUID (old check-ins) or a name string (new check-ins)
  const resolveScoreKey = (key: string): string => {
    const cat = categories.find(c => c.id === key)
    return cat ? cat.name : key
  }

  // Latest check-in domain scores (Insights tab)
  const latestCheckinScores = useMemo(() => {
    const latest = checkins[0]
    if (!latest) return scores
    const resolved: Record<string, number> = {}
    Object.entries(latest.scores as Record<string, number>).forEach(([k, v]) => {
      resolved[resolveScoreKey(k)] = v
    })
    return resolved
  }, [checkins, scores])

  const META_DIMENSIONS = [
    { key: 'energy',     label: 'Energy',     color: '#22c55e', description: 'Physical and mental fuel',              domains: ['Health & Fitness', 'Recreation & Lifestyle'] },
    { key: 'direction',  label: 'Direction',  color: '#6b63f5', description: 'Purpose, growth and career trajectory', domains: ['Work & Career', 'Spirituality & Religion', 'Growth & Learning'] },
    { key: 'stability',  label: 'Stability',  color: '#14b8a6', description: 'Financial and environmental foundation', domains: ['Finances & Money', 'Environment'] },
    { key: 'connection', label: 'Connection', color: '#ef4444', description: 'Relationships and belonging',            domains: ['Family & Friends', 'Love & Romance'] },
  ]

  const dimScores = useMemo(() =>
    META_DIMENSIONS.map(dim => ({
      ...dim,
      score: Math.round(dim.domains.reduce((s, d) => s + (latestCheckinScores[d] ?? 5), 0) / dim.domains.length * 10) / 10,
    }))
  , [latestCheckinScores])

  const domainInsights = useMemo(() => {
    const ds = (name: string) => latestCheckinScores[name] ?? 5
    const health       = ds('Health & Fitness')
    const recreation   = ds('Recreation & Lifestyle')
    const work         = ds('Work & Career')
    const growth       = ds('Growth & Learning')
    const spirituality = ds('Spirituality & Religion')
    const family       = ds('Family & Friends')
    const love         = ds('Love & Romance')
    const finances     = ds('Finances & Money')
    const environment  = ds('Environment')
    const energy       = (health + recreation) / 2
    const direction    = (work + spirituality + growth) / 3
    const stability    = (finances + environment) / 2
    const connection   = (family + love) / 2

    type Level = 'critical' | 'warning'
    const c: { level: Level; title: string; body: string; consequence: string; action: string; weight: number }[] = []

    if (work > 6.5 && energy < 5)
      c.push({ level: 'critical', weight: work - energy,
        title: 'High performance, depleting energy',
        body: `Work is strong (${work}/10) but physical and recovery capacity is low (${energy.toFixed(1)}/10). This is the classic burnout setup — output looks good until the system breaks.`,
        consequence: 'Performance drops sharply within weeks, not gradually. The longer this runs, the longer the recovery.',
        action: 'Cut one non-essential commitment this week and use that time for sleep or movement.' })

    if (direction > 6.5 && stability < 5)
      c.push({ level: 'critical', weight: direction - stability,
        title: 'Moving forward on unstable ground',
        body: `Strong direction (${direction.toFixed(1)}/10) but weak stability (${stability.toFixed(1)}/10). Ambition without foundation stalls — often right before a breakthrough.`,
        consequence: 'Financial or environmental instability caps progress regardless of motivation or skill.',
        action: 'Identify one financial leak or instability you have been avoiding. Start there before adding new goals.' })

    if (energy < 4)
      c.push({ level: 'critical', weight: 10 - energy * 2,
        title: 'Energy at critical level',
        body: `Health (${health}/10) and recovery (${recreation}/10) are both critically low. This is your ceiling right now — everything else is limited by it.`,
        consequence: 'Decision quality, motivation, and relationship capacity all degrade at this level. Nothing else improves until this does.',
        action: 'Fix sleep first. Commit to 7+ hours tonight and protect it for the next 7 days. Everything else follows.' })

    if (connection < 4)
      c.push({ level: 'critical', weight: 10 - connection * 2,
        title: 'Critically isolated',
        body: `Connection is at ${connection.toFixed(1)}/10. Both close relationships (${family}/10) and romantic connection (${love}/10) are below threshold.`,
        consequence: 'Chronic isolation elevates stress hormones, reduces resilience, and accelerates burnout — even in high performers.',
        action: 'Reach out to one specific person today. Not a group message — a real, direct conversation.' })

    if (growth > 7 && connection < 5)
      c.push({ level: 'warning', weight: growth - connection,
        title: 'Growing fast, drifting apart',
        body: `Strong growth momentum (${growth}/10) but relationships are weakening (${connection.toFixed(1)}/10). This pattern is common when personal development becomes the primary focus.`,
        consequence: 'Isolation compounds over time. The longer this gap widens, the harder the relationships become to rebuild.',
        action: 'Schedule one intentional conversation this week — no distractions, full presence, someone who matters.' })

    if (stability > 7 && direction < 5)
      c.push({ level: 'warning', weight: stability - direction,
        title: 'Comfortable but stuck',
        body: `High stability (${stability.toFixed(1)}/10) but unclear direction (${direction.toFixed(1)}/10). Comfort is masking the absence of forward movement.`,
        consequence: 'Prolonged directionlessness becomes identity. The longer it lasts, the harder it is to break.',
        action: 'Write one sentence: where do you want to be in 12 months? Commit to it. Work backward from there.' })

    if (spirituality > 7 && growth < 5)
      c.push({ level: 'warning', weight: spirituality - growth,
        title: 'Strong purpose, no progress',
        body: `High sense of meaning (${spirituality}/10) but stalled growth (${growth}/10). You know why — but not how or what next.`,
        consequence: 'Purpose that never converts to action eventually turns into resentment and self-blame.',
        action: 'Convert one value or belief into a specific, scheduled action this week. No vague intentions.' })

    if (finances < 5 && environment < 5)
      c.push({ level: 'critical', weight: (5 - finances) + (5 - environment),
        title: 'Stability foundation at risk',
        body: `Both finances (${finances}/10) and environment (${environment}/10) are below threshold. The base layer of your life is unstable.`,
        consequence: 'Without a stable foundation, growth, direction, and connection all become much harder to sustain.',
        action: 'Pick the smaller of the two: one financial action or one environmental fix. Do it today.' })

    return c.sort((a, b) => b.weight - a.weight).slice(0, 3).map(({ weight: _w, ...r }) => r)
  }, [latestCheckinScores])

  const systemTensions = useMemo(() => {
    const get = (k: string) => dimScores.find(d => d.key === k)!
    const result: { high: string; highScore: number; low: string; lowScore: number; desc: string }[] = []
    const pairs: [string, string, string][] = [
      ['direction', 'connection', 'Personal progress and relationships pulling in opposite directions.'],
      ['direction', 'energy',     'Ambition is outpacing physical capacity — burnout risk.'],
      ['direction', 'stability',  'Forward momentum on an unstable financial and environmental base.'],
      ['connection', 'energy',    'Relationships are okay but the fuel to maintain them is running low.'],
      ['stability',  'direction', 'Comfort exists but there is no clear path forward.'],
      ['energy',     'connection','Physical energy is present but relationships are being neglected.'],
    ]
    for (const [ak, bk, desc] of pairs) {
      const a = get(ak), b = get(bk)
      if (Math.abs(a.score - b.score) >= 2) {
        const [high, low] = a.score > b.score ? [a, b] : [b, a]
        if (!result.find(r => r.high === high.label && r.low === low.label)) {
          result.push({ high: high.label, highScore: high.score, low: low.label, lowScore: low.score, desc })
        }
      }
    }
    return result.slice(0, 3)
  }, [dimScores])

  const DIM_FOCUS: Record<string, { action: string; why: string }> = {
    energy:     { action: 'Fix your energy base before anything else. Prioritize sleep, movement, and one recovery habit this week.', why: 'Energy is the ceiling on everything else. No amount of planning overcomes a depleted system.' },
    connection: { action: 'Schedule one intentional conversation with someone who matters. Make it real — not a message.', why: 'Connection is the most underinvested dimension. Small actions here compound faster than anywhere else.' },
    stability:  { action: 'Identify one financial or environmental issue you have been avoiding. Start there.', why: 'Instability creates background noise that quietly limits focus, ambition, and relationships.' },
    direction:  { action: 'Write one sentence: where do you want to be in 12 months? Commit to it. Work backward from there.', why: 'Without direction, energy and stability go nowhere specific.' },
  }

  const activeDomainIndex = CHECK_IN_DOMAINS.findIndex(d => d.id === activeDomainId)
  const activeDomain = CHECK_IN_DOMAINS[activeDomainIndex] ?? CHECK_IN_DOMAINS[0]
  const prevDomain = activeDomainIndex > 0 ? CHECK_IN_DOMAINS[activeDomainIndex - 1] : null
  const nextDomain = activeDomainIndex < CHECK_IN_DOMAINS.length - 1 ? CHECK_IN_DOMAINS[activeDomainIndex + 1] : null

  const updateAnswer = (domainId: string, qIdx: number, val: string) => {
    setReflectionAnswers(prev => {
      const arr = [...(prev[domainId] ?? [])]
      arr[qIdx] = val
      return { ...prev, [domainId]: arr }
    })
  }

  const submitCheckin = async () => {
    if (!user || !allRated) return
    setSubmitting(true)
    const context = {
      moodScore, sleepQuality, energyLevel, stressLevel,
      hadAlcohol, poorSleep, highScreenTime, exercised,
      location, weather,
    }
    const sub_scores: Record<string, number> = {}
    CHECK_IN_DOMAINS.forEach(d => {
      d.subAreas.forEach(sa => {
        const v = subScores[`${d.id}.${sa.key}`]
        if (v != null) sub_scores[`${d.id}.${sa.key}`] = v
      })
    })
    const reflection_answers: Record<string, string[]> = {}
    CHECK_IN_DOMAINS.forEach(d => {
      if (reflectionAnswers[d.id]?.some(a => a.trim())) {
        reflection_answers[d.id] = reflectionAnswers[d.id]
      }
    })
    await createCheckin({ user_id: user.id, date: format(new Date(), 'yyyy-MM-dd'), scores: scores as Record<string, number>, sub_scores, reflection_answers, notes, context })
    // Clear draft and reset all check-in state
    localStorage.removeItem('wol_draft')
    setSubScores({})
    setMoodScore(null)
    setLocation('')
    setWeather('')
    setSleepQuality(null)
    setEnergyLevel(null)
    setStressLevel(null)
    setHadAlcohol(null)
    setPoorSleep(null)
    setHighScreenTime(null)
    setExercised(null)
    setNotes('')
    setReflectionAnswers({})
    setActiveDomainId(CHECK_IN_DOMAINS[0].id)
    setSubmitting(false)
  }

  const handleAddGoal = async () => {
    if (!user || !newGoal.title || !newGoal.categoryId) return
    await createGoal({
      user_id: user.id, category_id: newGoal.categoryId, project_id: null,
      title: newGoal.title, description: newGoal.description || null,
      status: 'active', target_date: newGoal.targetDate || null,
    })
    setNewGoal({ categoryId: '', title: '', description: '', targetDate: '' })
  }

  const handleAddTask = async (goalId: string, categoryId: string) => {
    if (!user || !newTask.title) return
    await createTask({
      user_id: user.id, goal_id: goalId, category_id: categoryId, project_id: null,
      title: newTask.title, completed: false, priority: 'normal',
      energy: 2, estimated_minutes: null, due_date: null,
    })
    setNewTask({ goalId: '', categoryId: '', title: '' })
  }

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return
    await addCustomCategory(user.id, newCategoryName.trim())
    setNewCategoryName('')
  }

  // Goal detail
  if (selectedGoal && tab === 'goals') {
    return <GoalDetailView goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
  }

  const TAB_META: Record<Tab, { title: string; sub: string }> = {
    dashboard: { title: 'Dashboard',     sub: 'Your life balance at a glance' },
    checkin:   { title: 'Check-in',      sub: 'Rate and reflect on each area of your life' },
    goals:     { title: 'Goals & Tasks', sub: 'Track your goals and milestones' },
    history:   { title: 'History',       sub: 'Your past check-ins over time' },
    insights:  { title: 'Insights',      sub: 'What your data actually means' },
  }

  // Radar data — shortened names to avoid label overlap
  const radarData = CHECK_IN_DOMAINS.map(d => ({
    area: d.name.split(' ')[0],
    score: scores[d.name] ?? 5,
    fullName: d.name,
    color: d.color,
  }))

  const chartConfig: ChartConfig = {
    score: { label: 'Score', color: '#0C1629' },
  }

  const overallScore = Math.round(
    CHECK_IN_DOMAINS.reduce((s, d) => s + (latestCheckinScores[d.name] ?? 5), 0) / CHECK_IN_DOMAINS.length * 10
  ) / 10

  // Per-domain trend: last 6 check-ins
  const domainHistory = (domainName: string) =>
    checkins.slice(-6).map((c, i) => ({ i, v: (c.scores as Record<string, number>)?.[domainName] ?? 0 }))

  return (
    <div className="pb-24">

      {/* ── Page header ── */}
      <div className="mb-8">
        {tab !== 'insights' && (
          <>
            <h1 className="text-2xl font-extrabold text-[#0C1629] tracking-tight">{TAB_META[tab].title}</h1>
            <p className="text-sm text-[#727A84] mt-1">{TAB_META[tab].sub}</p>
          </>
        )}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">

          {/* Top row: radar + summary sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Radar chart */}
            <div className="lg:col-span-2 bg-white card p-6 md:p-8">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-[#0C1629]">Life Balance</h2>
                  <p className="text-xs text-[#727A84] mt-0.5">Current state across all 8 areas</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#0C1629]">{overallAverage}</span>
                  <span className="text-sm text-[#727A84]">/10</span>
                </div>
              </div>
              <ChartContainer config={chartConfig} className="h-[340px] w-full">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#F0F3F3" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fontSize: 11, fill: '#727A84', fontWeight: 600 }}
                  />
                  <Radar
                    dataKey="score"
                    fill="#0C1629"
                    fillOpacity={0.12}
                    stroke="#0C1629"
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </div>

            {/* Summary sidebar */}
            <div className="space-y-4">
              {/* Overall donut */}
              <div className="bg-white card p-5 flex flex-col items-center gap-3">
                <p className="text-xs font-bold text-[#727A84] uppercase tracking-wider">Overall Score</p>
                <ScoreDonut score={overallAverage} size={110} />
                <p className="text-xs text-[#727A84] text-center">
                  {overallAverage >= 8 ? 'Excellent balance' : overallAverage >= 6 ? 'Good progress' : overallAverage >= 4 ? 'Room to grow' : 'Needs attention'}
                </p>
              </div>

              {/* Top & lowest area */}
              {(() => {
                const sorted = [...CHECK_IN_DOMAINS].sort((a, b) => (scores[b.name] ?? 5) - (scores[a.name] ?? 5))
                const top = sorted[0]
                const low = sorted[sorted.length - 1]
                return (
                  <div className="bg-white card p-5 space-y-3">
                    <p className="text-xs font-bold text-[#727A84] uppercase tracking-wider">Highlights</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: top.color + '20' }}>
                        <top.icon size={15} style={{ color: top.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#0C1629] truncate">{top.name}</p>
                        <p className="text-[10px] text-[#727A84]">Strongest area</p>
                      </div>
                      <span className="text-sm font-black" style={{ color: top.color }}>{scores[top.name] ?? 5}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: low.color + '20' }}>
                        <low.icon size={15} style={{ color: low.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#0C1629] truncate">{low.name}</p>
                        <p className="text-[10px] text-[#727A84]">Needs attention</p>
                      </div>
                      <span className="text-sm font-black" style={{ color: low.color }}>{scores[low.name] ?? 5}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Last check-in */}
              {checkins.length > 0 && (
                <div className="bg-white card p-5">
                  <p className="text-xs font-bold text-[#727A84] uppercase tracking-wider mb-2">Last Check-in</p>
                  <p className="text-sm font-semibold text-[#0C1629]">
                    {format(new Date(checkins[0].date + 'T00:00:00'), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-[#727A84] mt-0.5">{checkins.length} total check-ins</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Insights panel ── */}
          {insights.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#727A84] uppercase tracking-wider mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.map((insight, i) => (
                  <div key={i} className={cn(
                    'bg-white card p-5 flex flex-col gap-3 border-l-4',
                    insight.level === 'critical' ? 'border-l-red-400' : 'border-l-amber-400'
                  )}>
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle
                        size={15}
                        className={cn('mt-0.5 shrink-0', insight.level === 'critical' ? 'text-red-400' : 'text-amber-400')}
                      />
                      <p className="text-xs font-bold text-[#0C1629] leading-snug">{insight.title}</p>
                    </div>
                    <p className="text-[11px] text-[#727A84] leading-relaxed">{insight.body}</p>
                    <div className={cn(
                      'mt-auto text-[10px] font-semibold px-2.5 py-1.5 rounded-lg leading-snug',
                      insight.level === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    )}>
                      → {insight.focus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Area development grid */}
          <div>
            <h2 className="text-sm font-bold text-[#727A84] uppercase tracking-wider mb-4">Area Development</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CHECK_IN_DOMAINS.map(domain => {
                const score = scores[domain.name] ?? 5
                const history = domainHistory(domain.name)
                const prev = history.length >= 2 ? history[history.length - 2].v : null
                const delta = prev !== null ? +(score - prev).toFixed(1) : null
                const hasHistory = history.some(h => h.v > 0)
                return (
                  <div key={domain.id} className="bg-white card p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: domain.color + '18' }}>
                        <domain.icon size={15} style={{ color: domain.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[#0C1629] truncate leading-tight">{domain.name}</p>
                      </div>
                    </div>

                    {/* Score + delta */}
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-black" style={{ color: domain.color }}>{score}</span>
                      {delta !== null && (
                        <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-md',
                          delta > 0 ? 'bg-green-50 text-green-700' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-[#F0F3F3] text-[#727A84]')}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </div>

                    {/* Sparkline */}
                    {hasHistory ? (
                      <ResponsiveContainer width="100%" height={40}>
                        <LineChart data={history} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                          <YAxis domain={[0, 10]} hide />
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={domain.color}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-10 flex items-center">
                        <p className="text-[10px] text-[#B5C1C8]">No history yet</p>
                      </div>
                    )}

                    {/* Score bar */}
                    <div className="h-1 bg-[#F0F3F3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(score / 10) * 100}%`, backgroundColor: domain.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── CHECK-IN TAB ── */}
      {tab === 'checkin' && (
        <div className="space-y-5">

          {/* Domain tab bar */}
          <div className="flex flex-wrap gap-1.5">
            {CHECK_IN_DOMAINS.map((domain) => {
              const isActive = domain.id === activeDomainId
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveDomainId(domain.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border',
                    isActive
                      ? 'text-white border-transparent shadow-sm'
                      : 'text-[#727A84] bg-white border-[#F0F3F3] hover:border-[#D6DCE0]'
                  )}
                  style={isActive ? { backgroundColor: domain.color, borderColor: domain.color } : {}}
                >
                  <domain.icon size={13} />
                  <span className="hidden sm:inline">{domain.name}</span>
                  <span className="sm:hidden">{domain.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Domain card */}
            <div className="lg:col-span-2 bg-white card p-6 md:p-8">

              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${activeDomain.color}18` }}
                >
                  <activeDomain.icon size={20} style={{ color: activeDomain.color }} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#0C1629]">{activeDomain.name}</h2>
                  <p className="text-xs text-[#727A84]">{activeDomain.description}</p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <span className="text-2xl font-black" style={{ color: activeDomain.color }}>
                    {activeDomain.subAreas.some(sa => subScores[`${activeDomain.id}.${sa.key}`] != null) ? scores[activeDomain.name] : '—'}
                  </span>
                  <span className="text-sm text-[#727A84]">/10</span>
                </div>
              </div>

              {/* Sub-area ratings */}
              <div className="mb-8 space-y-5">
                <p className="text-xs font-semibold text-[#727A84] uppercase tracking-wide">
                  Rate each area
                </p>
                {activeDomain.subAreas.map((sa) => {
                  const key = `${activeDomain.id}.${sa.key}`
                  const val = subScores[key] ?? null
                  return (
                    <div key={sa.key}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-[#0C1629]">{sa.title}</p>
                          <p className="text-xs text-[#727A84] mt-0.5">{sa.description}</p>
                        </div>
                        <span className="text-sm font-bold ml-3 shrink-0" style={{ color: activeDomain.color }}>{val ?? '—'}</span>
                      </div>
                      <PointSelector
                        value={val}
                        onChange={(v) => setSubScores(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Reflection questions */}
              <div className="space-y-5">
                <p className="text-xs font-semibold text-[#727A84] uppercase tracking-wide">
                  Reflection
                </p>
                {activeDomain.questions.map((question, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-[#0C1629] mb-2 leading-snug">
                      {question}
                    </label>
                    <textarea
                      value={reflectionAnswers[activeDomain.id]?.[i] ?? ''}
                      onChange={(e) => updateAnswer(activeDomain.id, i, e.target.value)}
                      placeholder="Write your thoughts..."
                      rows={3}
                      className="w-full rounded-[15px] border border-[#D6DCE0] bg-[#FAFBFC] px-4 py-3 text-sm text-[#0C1629] shadow-sm transition-shadow placeholder:text-[#B5C1C8] focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10 resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#727A84] uppercase tracking-wide mb-3">
                  Additional Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional thoughts for this check-in (optional)..."
                  rows={3}
                  className="w-full rounded-[15px] border border-[#D6DCE0] bg-[#FAFBFC] px-4 py-3 text-sm text-[#0C1629] shadow-sm transition-shadow placeholder:text-[#B5C1C8] focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10 resize-none"
                />
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#F0F3F3]">
                {prevDomain ? (
                  <button
                    type="button"
                    onClick={() => setActiveDomainId(prevDomain.id)}
                    className="flex items-center gap-1.5 text-sm text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                    {prevDomain.name}
                  </button>
                ) : <div />}
                {nextDomain ? (
                  <button
                    type="button"
                    onClick={() => setActiveDomainId(nextDomain.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#0C1629] hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    {nextDomain.name}
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[#22c55e]">All areas covered ✓</span>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Save button */}
              <div className="bg-white card p-5">
                <button
                  type="button"
                  onClick={submitCheckin}
                  disabled={submitting || !allRated}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#0C1629] hover:bg-[#162838] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-[15px] transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Check-in'}
                  {!submitting && <ArrowRight size={14} />}
                </button>
                {!allRated && (
                  <p className="text-xs text-[#727A84] text-center mt-3">
                    Rate all sub-areas across every domain to save.
                  </p>
                )}
              </div>

              {/* Context card */}
              <div className="bg-white card overflow-hidden">

                {/* Mood */}
                <div className="p-5 border-b border-[#F0F3F3]">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-4">Current Mood</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {([1,2,3,4,5] as const).map(score => {
                      const meta = MOOD_META[score]
                      const active = moodScore === score
                      const Icon = meta.icon
                      return (
                        <button key={score} type="button"
                          onClick={() => setMoodScore(active ? null : score)}
                          title={meta.label}
                          style={active ? { backgroundColor: meta.bg, borderColor: meta.color + '60' } : {}}
                          className={cn(
                            'aspect-square flex items-center justify-center rounded-xl transition-all cursor-pointer border',
                            active ? 'scale-110 shadow-sm border' : 'border-transparent hover:bg-[#F0F3F3]'
                          )}
                        >
                          <Icon size={22} color={meta.color} strokeWidth={2.2} />
                        </button>
                      )
                    })}
                  </div>
                  {moodScore && (
                    <p className="text-[10px] text-center font-semibold mt-2 uppercase tracking-wider"
                      style={{ color: MOOD_META[moodScore].color }}>
                      {MOOD_META[moodScore].label}
                    </p>
                  )}
                </div>

                {/* Quick Context */}
                <div className="p-5 border-b border-[#F0F3F3]">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-4">Quick Context</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest block mb-1.5">Location</label>
                      <div className="flex items-center gap-2.5 rounded-[15px] border border-[#D6DCE0] bg-white px-3 py-2.5 shadow-sm transition-shadow focus-within:border-[#0C1629]/30 focus-within:ring-[3px] focus-within:ring-[#0C1629]/10">
                        <MapPin size={14} className="text-[#B5C1C8] shrink-0"/>
                        <input value={location} onChange={e => setLocation(e.target.value)}
                          placeholder="e.g. Home, Coffee shop…"
                          className="flex-1 bg-transparent text-sm text-[#0C1629] placeholder:text-[#B5C1C8] focus:outline-none min-w-0"/>
                        {location && <button type="button" onClick={() => setLocation('')} className="text-[#B5C1C8] hover:text-[#727A84] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest block mb-1.5">Weather</label>
                      <div className="flex items-center gap-2.5 rounded-[15px] border border-[#D6DCE0] bg-white px-3 py-2.5 shadow-sm transition-shadow focus-within:border-[#0C1629]/30 focus-within:ring-[3px] focus-within:ring-[#0C1629]/10">
                        <Cloud size={14} className="text-[#B5C1C8] shrink-0"/>
                        <input value={weather} onChange={e => setWeather(e.target.value)}
                          placeholder="e.g. Sunny, 22°C…"
                          className="flex-1 bg-transparent text-sm text-[#0C1629] placeholder:text-[#B5C1C8] focus:outline-none min-w-0"/>
                        {weather && <button type="button" onClick={() => setWeather('')} className="text-[#B5C1C8] hover:text-[#727A84] cursor-pointer"><X size={12}/></button>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wellness */}
                <div className="p-5">
                  <h3 className="text-xs font-bold text-[#0C1629] uppercase tracking-wider mb-4">Wellness</h3>
                  <div className="space-y-4">

                    {/* Sleep */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Moon size={11}/> Sleep Quality
                      </label>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(v => (
                          <button key={v} type="button"
                            onClick={() => setSleepQuality(sleepQuality === v ? null : v)}
                            className={cn('flex-1 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer border',
                              sleepQuality === v
                                ? 'bg-[#0C1629] text-white border-[#0C1629]'
                                : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {sleepQuality && (
                        <p className="text-[10px] text-[#B5C1C8] mt-1">{['','Very Poor','Poor','Okay','Good','Excellent'][sleepQuality]}</p>
                      )}
                    </div>

                    {/* Energy */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Zap size={11}/> Energy Level
                      </label>
                      <div className="flex gap-1">
                        {(['low','unstable','good','high'] as const).map(lvl => (
                          <button key={lvl} type="button"
                            onClick={() => setEnergyLevel(energyLevel === lvl ? null : lvl)}
                            className={cn('flex-1 h-7 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer border',
                              energyLevel === lvl
                                ? 'bg-[#0C1629] text-white border-[#0C1629]'
                                : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stress */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Brain size={11}/> Stress / Load
                      </label>
                      <div className="flex gap-1">
                        {(['very_low','low','moderate','high','overwhelming'] as const).map(lvl => {
                          const labels: Record<string, string> = { very_low: 'V.Low', low: 'Low', moderate: 'Mod', high: 'High', overwhelming: 'Over' }
                          const isHigh = lvl === 'high' || lvl === 'overwhelming'
                          return (
                            <button key={lvl} type="button"
                              onClick={() => setStressLevel(stressLevel === lvl ? null : lvl)}
                              className={cn('flex-1 h-7 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border',
                                stressLevel === lvl
                                  ? isHigh ? 'bg-red-600 text-white border-red-600' : 'bg-[#0C1629] text-white border-[#0C1629]'
                                  : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                              {labels[lvl]}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Behaviors */}
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setExercised(exercised === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          exercised === true ? 'bg-green-50 text-green-700 border-green-200' : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Dumbbell size={15} className={exercised === true ? 'text-green-500' : 'text-[#B5C1C8]'}/>
                        <span>Exercised</span>
                      </button>
                      <button type="button" onClick={() => setHadAlcohol(hadAlcohol === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          hadAlcohol === true ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Wine size={15} className={hadAlcohol === true ? 'text-orange-500' : 'text-[#B5C1C8]'}/>
                        <span>Drank last night</span>
                      </button>
                      <button type="button" onClick={() => setPoorSleep(poorSleep === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          poorSleep === true ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Moon size={15} className={poorSleep === true ? 'text-blue-500' : 'text-[#B5C1C8]'}/>
                        <span>Poor sleep (&lt;6h)</span>
                      </button>
                      <button type="button" onClick={() => setHighScreenTime(highScreenTime === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          highScreenTime === true ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Monitor size={15} className={highScreenTime === true ? 'text-purple-500' : 'text-[#B5C1C8]'}/>
                        <span>High screen time</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Overall */}
              <div className="bg-white card p-6 flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-[#727A84] uppercase tracking-wide">
                  Overall Score
                </p>
                <ScoreDonut score={overallAverage} size={100} />
              </div>

              {/* Confidence signal */}
              {contextSignal && contextSignal.level !== 'neutral' && (
                <div className={cn(
                  'card p-4 flex gap-3',
                  contextSignal.level === 'low' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'
                )}>
                  {contextSignal.level === 'low'
                    ? <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    : <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-1',
                      contextSignal.level === 'low' ? 'text-amber-700' : 'text-green-700')}>
                      {contextSignal.label}
                    </p>
                    <p className={cn('text-[11px] leading-relaxed',
                      contextSignal.level === 'low' ? 'text-amber-800' : 'text-green-800')}>
                      {contextSignal.level === 'low'
                        ? "Today's context may be temporarily pulling scores down. These ratings may not fully reflect your actual life quality."
                        : contextSignal.message ?? "Your context today is positive — scores reflect reality more accurately."}
                    </p>
                  </div>
                </div>
              )}

              {/* All areas */}
              <div className="bg-white card p-5">
                <p className="text-xs font-semibold text-[#727A84] uppercase tracking-wide mb-4">
                  All Areas
                </p>
                <div className="space-y-2.5">
                  {CHECK_IN_DOMAINS.map(domain => {
                    const score = scores[domain.name] ?? 5
                    const isActive = domain.id === activeDomainId
                    return (
                      <button
                        key={domain.id}
                        type="button"
                        onClick={() => setActiveDomainId(domain.id)}
                        className={cn(
                          'w-full flex items-center gap-2 cursor-pointer rounded-lg px-1.5 py-1 -mx-1.5 transition-colors text-left',
                          isActive ? 'bg-[#F0F3F3]' : 'hover:bg-[#F8F9FA]'
                        )}
                      >
                        <domain.icon size={11} style={{ color: domain.color }} className="shrink-0" />
                        <span className="text-[11px] text-[#727A84] flex-1 truncate">{domain.name}</span>
                        <div className="w-14 h-1 bg-[#F0F3F3] rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: domain.subAreas.some(sa => subScores[`${domain.id}.${sa.key}`] != null) ? `${(score / 10) * 100}%` : '0%', backgroundColor: domain.color }}
                          />
                        </div>
                        <span
                          className="text-[11px] font-bold w-4 text-right shrink-0"
                          style={{ color: domain.color }}
                        >
                          {domain.subAreas.some(sa => subScores[`${domain.id}.${sa.key}`] != null) ? score : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── GOALS & TASKS TAB ── */}
      {tab === 'goals' && (
        <div className="space-y-8">
          {/* Add goal form */}
          <div className="bg-white card p-8">
            <h3 className="font-semibold text-[#0C1629] mb-4 flex items-center gap-2">
              <Target size={16} className="text-[#0C1629]" />
              Add New Goal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={newGoal.categoryId}
                onChange={(e) => setNewGoal((p) => ({ ...p, categoryId: e.target.value }))}
                className="rounded-[15px] border border-[#D6DCE0] bg-white px-4 py-3 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10 cursor-pointer"
              >
                <option value="">Select category...</option>
                {categories.filter((c) => c.is_active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                value={newGoal.title}
                onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
                placeholder="Goal title..."
                className="rounded-[15px] border border-[#D6DCE0] bg-white px-4 py-3 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10"
              />
              <input
                value={newGoal.description}
                onChange={(e) => setNewGoal((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)..."
                className="rounded-[15px] border border-[#D6DCE0] bg-white px-4 py-3 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10"
              />
              <LogbirdDatePicker
                value={newGoal.targetDate || null}
                onChange={(v) => setNewGoal((p) => ({ ...p, targetDate: v ?? '' }))}
              />
            </div>
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.title || !newGoal.categoryId}
              className="mt-4 bg-[#0C1629] hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 text-sm font-semibold rounded-[10px] transition-all cursor-pointer"
            >
              Add Goal
            </button>
          </div>

          {/* Goals list */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="bg-white card p-12 text-center text-[#727A84] opacity-60 text-sm">
                No goals yet. Add one above to get started.
              </div>
            ) : goals.map((goal) => {
              const cat = categories.find((c) => c.id === goal.category_id)
              const color = getCategoryColor(cat?.name ?? '')
              const goalTasks = tasks.filter((t) => t.goal_id === goal.id)
              const completedCount = goalTasks.filter((t) => t.completed).length
              const isExpanded = expandedGoal === goal.id
              const progress = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : 0

              return (
                <div key={goal.id} className="bg-white card overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F0F3F3] transition-all"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  >
                    {isExpanded ? <ChevronDown size={14} className="text-[#727A84] shrink-0" /> : <ChevronRight size={14} className="text-[#727A84] shrink-0" />}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                      <Target size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-[15px] font-medium" style={{ backgroundColor: `${color}15`, color }}>
                          {cat?.name ?? 'Unknown'}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-[15px] font-medium',
                          goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        )}>
                          {goal.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#0C1629] truncate">{goal.title}</h4>
                      {goal.description && <p className="text-xs text-[#727A84] opacity-60 mt-0.5 truncate">{goal.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-16 hidden sm:block">
                        <div className="h-1.5 bg-[#F0F3F3] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-[10px] text-[#727A84] opacity-60">{completedCount}/{goalTasks.length}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedGoal(goal) }}
                        className="text-xs text-[#0C1629] hover:underline cursor-pointer font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateGoal(goal.id, { status: goal.status === 'completed' ? 'active' : 'completed' }) }}
                        className="text-xs text-[#727A84] hover:text-[#22c55e] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[#22c55e]/10"
                      >
                        {goal.status === 'completed' ? 'Reopen' : 'Complete'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}
                        className="p-1.5 hover:bg-[#9f403d]/10 text-[#727A84] hover:text-[#9f403d] rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-[#F0F3F3] animate-fade-in">
                      {goalTasks.length === 0 ? (
                        <p className="text-sm text-[#727A84] opacity-60 mb-3">No tasks yet.</p>
                      ) : (
                        <div className="space-y-1 mb-3">
                          {goalTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg group hover:bg-white transition-all">
                              <button onClick={() => toggleTask(task.id, !task.completed)} className="cursor-pointer shrink-0">
                                {task.completed
                                  ? <CheckCircle2 size={16} className="text-[#22c55e]" />
                                  : <Circle size={16} className="text-[#727A84] opacity-60" />
                                }
                              </button>
                              <span className={cn('text-sm flex-1', task.completed ? 'line-through text-[#727A84] opacity-60' : 'text-[#0C1629]')}>
                                {task.title}
                              </span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#9f403d]/10 text-[#727A84] hover:text-[#9f403d] rounded transition-all cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={newTask.goalId === goal.id ? newTask.title : ''}
                          onChange={(e) => setNewTask({ goalId: goal.id, categoryId: goal.category_id, title: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(goal.id, goal.category_id) }}
                          placeholder="Add task..."
                          className="flex-1 rounded-[15px] border border-[#D6DCE0] bg-white px-4 py-3 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10"
                        />
                        <button
                          onClick={() => handleAddTask(goal.id, goal.category_id)}
                          disabled={!newTask.title || newTask.goalId !== goal.id}
                          className="p-2.5 bg-[#0C1629]/10 hover:bg-[#0C1629]/20 disabled:opacity-50 text-[#0C1629] rounded-xl transition-all cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── INSIGHTS TAB ── */}
      {tab === 'insights' && (
        <div className="space-y-6 md:space-y-8">
          {checkins.length === 0 && (
            <div className="bg-white card p-12 text-center">
              <Target size={32} className="text-[#0C1629] mx-auto opacity-30 mb-4" />
              <p className="text-sm font-semibold text-[#0C1629] mb-1">No check-in data yet</p>
              <p className="text-sm text-[#727A84] mb-4">Complete a check-in to see your life system insights</p>
              <button type="button" onClick={() => navigate('/wheel?tab=checkin')} className="px-5 py-2.5 rounded-[10px] bg-[#0C1629] text-white text-sm font-semibold">
                Start Check-in
              </button>
            </div>
          )}

          {checkins.length > 0 && (() => {
            const weakestDim = [...dimScores].sort((a, b) => a.score - b.score)[0]
            const strongestDim = [...dimScores].sort((a, b) => b.score - a.score)[0]
            const focusInsight = domainInsights[0] ?? null
            const dimInterp = (key: string, score: number) => {
              const t: Record<string, string[]> = {
                energy:     ['Critically low. Your output, mood, and focus are all limited by this right now.', 'Moderate — enough to function, but not to thrive. Fatigue may be quietly limiting your decisions.', 'Solid. Health and recovery are actively supporting your overall performance.', 'Strong. Your physical capacity is giving you a real edge right now.'],
                direction:  ['No clear direction. Without knowing where you are going, energy and stability go nowhere specific.', 'Some clarity, but gaps in purpose, work, or growth are creating friction.', 'Good alignment between work, growth, and meaning. Direction is pulling in roughly the same way.', 'Strong direction. You know where you are going and are actively moving there.'],
                stability:  ['Unstable foundation. Financial or environmental stress is creating background noise that limits everything else.', 'Partially stable. Some areas need attention before you can sustainably scale your effort.', 'Stable enough to build on. Your foundation is mostly solid.', 'Strong base. Financial security and environment are actively supporting your progress.'],
                connection: ['Critically disconnected. Isolation at this level affects resilience, mood, and long-term health.', 'Weak connection. Relationships exist but may lack depth or consistent investment.', 'Reasonable. Close relationships and romance are providing moderate support.', 'Strong connections. Your relationships are a genuine asset right now.'],
              }
              return t[key]?.[score < 4 ? 0 : score < 6 ? 1 : score < 8 ? 2 : 3] ?? ''
            }
            return (
              <>
                {/* Header */}
                <header className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0C1629]">Wheel of Life Insights</h1>
                      <p className="text-[#727A84] max-w-lg mt-2">What your scores mean, how your dimensions connect, and where to focus next.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <p className="text-sm text-[#727A84]">Based on <span className="font-semibold text-[#0C1629]">{format(new Date(checkins[0].date + 'T00:00:00'), 'MMMM d, yyyy')}</span></p>
                      <button type="button" onClick={() => navigate('/wheel?tab=checkin')} className="bg-[#F0F3F3] hover:bg-[#D6DCE0] text-[#0C1629] px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors">
                        New Check-in
                      </button>
                    </div>
                  </div>
                </header>

                {/* Sub-tab nav */}
                <div className="flex gap-1 bg-[#F0F3F3] p-1 rounded-[12px] w-fit overflow-x-auto scrollbar-hide">
                  {(['keyinsights', 'dimensions', 'ai', 'breakdown'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setInsightSubTab(st)}
                      className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        insightSubTab === st ? 'bg-white text-[#0C1629] shadow-sm' : 'text-[#727A84] hover:text-[#0C1629]'
                      }`}
                    >
                      {st === 'keyinsights' ? 'Key Insights' : st === 'dimensions' ? 'Life Dimensions' : st === 'ai' ? 'AI Insights' : 'Full Breakdown'}
                    </button>
                  ))}
                </div>

                {/* ── KEY INSIGHTS SUB-TAB ── */}
                {insightSubTab === 'keyinsights' && (
                <div className="space-y-6 md:space-y-8">

                {/* Confidence banner from saved context */}
                {(() => {
                  const ctx = checkins[0]?.context
                  if (!ctx) return null
                  const signals: number[] = []
                  if (ctx.moodScore != null)   signals.push(ctx.moodScore <= 2 ? -1 : ctx.moodScore >= 4 ? 1 : 0)
                  if (ctx.sleepQuality != null) signals.push(ctx.sleepQuality <= 2 ? -1 : ctx.sleepQuality >= 4 ? 1 : 0)
                  if (ctx.energyLevel)          signals.push(ctx.energyLevel === 'low' || ctx.energyLevel === 'unstable' ? -1 : ctx.energyLevel === 'high' ? 1 : 0)
                  if (ctx.stressLevel)          signals.push(ctx.stressLevel === 'high' || ctx.stressLevel === 'overwhelming' ? -1 : ctx.stressLevel === 'very_low' || ctx.stressLevel === 'low' ? 1 : 0)
                  if (ctx.hadAlcohol)           signals.push(-0.5)
                  if (ctx.poorSleep)            signals.push(-1)
                  if (ctx.highScreenTime)       signals.push(-0.3)
                  if (ctx.exercised)            signals.push(0.5)
                  if (signals.length === 0) return null
                  const avg = signals.reduce((a, b) => a + b, 0) / signals.length
                  if (Math.abs(avg) < 0.25) return null
                  const isLow = avg < 0
                  return (
                    <div className={cn(
                      'flex gap-3 p-4 rounded-[15px] border',
                      isLow ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                    )}>
                      {isLow
                        ? <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        : <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-1', isLow ? 'text-amber-700' : 'text-green-700')}>
                          {isLow ? 'Low confidence — context may be skewing scores' : 'High confidence — context supports these scores'}
                        </p>
                        <p className={cn('text-xs leading-relaxed', isLow ? 'text-amber-800' : 'text-green-800')}>
                          {isLow
                            ? 'This check-in was recorded during low energy, high stress, or poor sleep. Scores may be temporarily deflated — compare with your trend before acting on them.'
                            : avg > 0.5 && overallScore < 50
                              ? 'Context was positive but scores are still low — this likely reflects a real pattern, not a bad day. Worth addressing directly.'
                              : 'This check-in was recorded in a stable context. These scores are a reliable signal.'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white card p-5 text-center">
                    <div className="w-10 h-10 bg-[#0C1629]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target size={18} className="text-[#0C1629]" />
                    </div>
                    <span className="block text-2xl font-bold text-[#0C1629]">{overallScore}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#727A84]">Overall Score</span>
                  </div>
                  <div className="bg-white card p-5 text-center">
                    <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp size={18} className="text-[#22c55e]" />
                    </div>
                    <span className="block text-base font-bold text-[#0C1629]">{strongestDim.label}</span>
                    <span className="block text-xl font-black" style={{ color: strongestDim.color }}>{strongestDim.score}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#727A84]">Strongest</span>
                  </div>
                  <div className="bg-white card p-5 text-center">
                    <div className="w-10 h-10 bg-[#9f403d]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle size={18} className="text-[#9f403d]" />
                    </div>
                    <span className="block text-base font-bold text-[#0C1629]">{weakestDim.label}</span>
                    <span className="block text-xl font-black" style={{ color: weakestDim.color }}>{weakestDim.score}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#727A84]">Needs Attention</span>
                  </div>
                  <div className="bg-white card p-5 text-center">
                    <div className="w-10 h-10 bg-[#0C1629]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={18} className="text-[#0C1629]" />
                    </div>
                    <span className="block text-2xl font-bold text-[#0C1629]">{checkins.length}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#727A84]">Check-ins</span>
                  </div>
                </div>

                {/* ── YOUR FOCUS RIGHT NOW ── */}
                <section className="bg-white card p-5 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#9f403d]/10 rounded-full flex items-center justify-center shrink-0">
                      <Target size={18} className="text-[#9f403d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#727A84] mb-1">Your Focus Right Now</p>
                      <h3 className="text-xl font-extrabold text-[#0C1629] mb-2">
                        {focusInsight ? focusInsight.title : `Your ${weakestDim.label} needs attention`}
                      </h3>
                      <p className="text-[#727A84] mb-6">
                        {focusInsight ? focusInsight.consequence : DIM_FOCUS[weakestDim.key].why}
                      </p>
                      <div className="bg-[#F0F3F3] rounded-xl p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#727A84] mb-2">Action this week</p>
                        <p className="text-[#0C1629] font-semibold">
                          {focusInsight ? focusInsight.action : DIM_FOCUS[weakestDim.key].action}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── KEY INSIGHTS ── */}
                <div>
                  <h3 className="text-lg font-bold text-[#0C1629] mb-1">Key Insights</h3>
                  <p className="text-sm text-[#727A84] mb-6">Patterns detected in your system — what is happening, why it matters, and what to do.</p>
                  {domainInsights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {domainInsights.map((insight, i) => (
                        <div key={i} className={cn('bg-white card p-5 md:p-8 flex flex-col gap-5 border-l-4', insight.level === 'critical' ? 'border-l-red-400' : 'border-l-amber-400')}>
                          <div className="flex items-start gap-4">
                            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', insight.level === 'critical' ? 'bg-red-50' : 'bg-amber-50')}>
                              <AlertTriangle size={16} className={insight.level === 'critical' ? 'text-red-400' : 'text-amber-400'} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-[#0C1629] mb-2">{insight.title}</p>
                              <p className="text-[#727A84]">{insight.body}</p>
                            </div>
                          </div>
                          <div className="space-y-3 pt-4 border-t border-[#F0F3F3]">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-[#B5C1C8] mb-1">If unaddressed</p>
                              <p className="text-[#727A84]">{insight.consequence}</p>
                            </div>
                            <div className={cn('px-4 py-3 rounded-xl', insight.level === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}>
                              <span className="font-bold">Action: </span>{insight.action}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white card p-5 md:p-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="text-[#22c55e]" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#0C1629]">No critical patterns detected</p>
                        <p className="text-[#727A84] mt-1">Your scores are balanced. The system found no major contradictions. Keep it up — consistency compounds.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SYSTEM TENSION ── */}
                {systemTensions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#0C1629] mb-1">System Tension</h3>
                    <p className="text-sm text-[#727A84] mb-6">Where your life is pulling against itself. These gaps create drag even when individual scores look fine.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {systemTensions.map((t, i) => (
                        <div key={i} className="bg-white card p-5 md:p-8">
                          <div className="flex items-center gap-3 flex-wrap mb-3">
                            <span className="text-base font-bold text-[#0C1629]">{t.high}</span>
                            <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#16a34a]">{t.highScore} ↑</span>
                            <span className="text-[#B5C1C8] font-bold">vs</span>
                            <span className="text-base font-bold text-[#0C1629]">{t.low}</span>
                            <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#9f403d]/10 text-[#9f403d]">{t.lowScore} ↓</span>
                          </div>
                          <p className="text-[#727A84]">→ {t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PRIORITY ORDER ── */}
                <div>
                  <h3 className="text-lg font-bold text-[#0C1629] mb-1">Priority Order</h3>
                  <p className="text-sm text-[#727A84] mb-6">What to work on first. One constraint always matters more than the rest right now.</p>
                  <div className="bg-white card divide-y divide-[#F0F3F3]">
                    {[...dimScores].sort((a, b) => a.score - b.score).map((dim, i) => {
                      const priority = dim.score < 5 ? { label: 'Fix now', cls: 'bg-[#9f403d]/10 text-[#9f403d]' } : dim.score < 7 ? { label: 'Develop', cls: 'bg-[#f59e0b]/10 text-[#d97706]' } : { label: 'Maintain', cls: 'bg-[#22c55e]/10 text-[#16a34a]' }
                      return (
                        <div key={dim.key} className="flex items-start gap-4 p-5 md:p-6">
                          <span className="text-3xl font-black text-[#F0F3F3] w-8 shrink-0 leading-none mt-1">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-bold text-[#0C1629]">{dim.label}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priority.cls}`}>{priority.label}</span>
                            </div>
                            <p className="text-[#727A84]">{DIM_FOCUS[dim.key].action}</p>
                          </div>
                          <span className="text-2xl font-black shrink-0" style={{ color: dim.color }}>{dim.score}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                </div>
                )}

                {/* ── DIMENSIONS SUB-TAB ── */}
                {insightSubTab === 'dimensions' && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-[#0C1629] mb-1">Life Dimensions</h3>
                    <p className="text-sm text-[#727A84] mb-6">Four composite views built from your 9 areas. Each captures a different layer of how your life is functioning right now.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {dimScores.map(dim => {
                        const status = dim.score >= 7 ? 'Strong' : dim.score >= 5 ? 'Moderate' : 'Needs Work'
                        const statusCls = dim.score >= 7 ? 'bg-[#22c55e]/10 text-[#16a34a]' : dim.score >= 5 ? 'bg-[#f59e0b]/10 text-[#d97706]' : 'bg-[#9f403d]/10 text-[#9f403d]'
                        const dimDomains = CHECK_IN_DOMAINS.filter(d => dim.domains.includes(d.name))
                        return (
                          <div key={dim.key} className="bg-white card p-5 md:p-8">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-lg font-bold text-[#0C1629]">{dim.label}</p>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCls}`}>{status}</span>
                                </div>
                                <p className="text-sm text-[#727A84]">{dim.description}</p>
                              </div>
                              <span className="text-3xl font-black ml-4 shrink-0" style={{ color: dim.color }}>{dim.score}</span>
                            </div>
                            <div className="h-2 bg-[#F0F3F3] rounded-full overflow-hidden mb-4">
                              <div className="h-full rounded-full transition-all" style={{ width: `${(dim.score / 10) * 100}%`, backgroundColor: dim.color }} />
                            </div>
                            <p className="text-[#727A84] mb-6">{dimInterp(dim.key, dim.score)}</p>
                            <div className="space-y-3 pt-4 border-t border-[#F0F3F3]">
                              <p className="text-xs font-bold uppercase tracking-widest text-[#B5C1C8]">Contributing Areas</p>
                              {dimDomains.map(domain => {
                                const s = latestCheckinScores[domain.name] ?? 5
                                return (
                                  <div key={domain.id} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: domain.color + '18' }}>
                                      <domain.icon size={13} style={{ color: domain.color }} />
                                    </div>
                                    <span className="text-sm text-[#727A84] flex-1">{domain.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="w-24 h-2 bg-[#F0F3F3] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(s / 10) * 100}%`, backgroundColor: dim.color + 'cc' }} />
                                      </div>
                                      <span className="text-sm font-bold text-[#0C1629] w-5 text-right">{s}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                )}

                {/* ── AI INSIGHTS SUB-TAB ── */}
                {insightSubTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex gap-1 bg-[#F0F3F3] p-1 rounded-[12px]">
                        {(['quick', 'deep'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setAiMode(m)}
                            className={`px-4 py-1.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                              aiMode === m ? 'bg-white text-[#0C1629] shadow-sm' : 'text-[#727A84] hover:text-[#0C1629]'
                            }`}
                          >
                            {m === 'quick' ? 'Quick Insight' : 'Deep Strategy'}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={runWheelInsights}
                        disabled={aiLoading}
                        className="bg-[#0C1629] hover:opacity-90 text-white px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#0C1629]/20 disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={aiLoading ? 'animate-spin' : ''} />
                        {aiLoading ? 'Generating...' : wheelInsights ? 'Refresh' : 'Generate AI Insights'}
                      </button>
                    </div>
                    {aiError && (
                      <div className="bg-[#9f403d]/10 border border-[#9f403d]/20 rounded-[15px] p-4 flex items-center gap-3">
                        <AlertCircle size={18} className="text-[#9f403d] shrink-0" />
                        <p className="text-sm text-[#0C1629] flex-1">{aiError}</p>
                        {aiError.includes('Settings') && (
                          <button type="button" onClick={() => navigate('/settings')} className="text-sm text-[#0C1629] font-semibold hover:underline cursor-pointer shrink-0">
                            Go to Settings
                          </button>
                        )}
                      </div>
                    )}
                    {wheelInsights ? (
                      <>
                        <p className="text-sm text-[#727A84]">
                          {wheelInsights.mode === 'quick' ? 'Quick Insight' : 'Deep Strategy'} · Generated {format(new Date(wheelInsights.generatedAt), 'MMM d, yyyy')}
                        </p>
                        <div className="space-y-4">
                          {wheelInsights.sections.map((section, i) => (
                            <div key={i} className="bg-white card p-5 md:p-8">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-[#0C1629]/10 rounded-xl flex items-center justify-center shrink-0">
                                  <Brain size={14} className="text-[#0C1629]" />
                                </div>
                                <h4 className="text-base font-bold text-[#0C1629]">{section.title}</h4>
                              </div>
                              <p className="text-sm text-[#727A84] leading-relaxed whitespace-pre-wrap">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-white card p-12 text-center">
                        <div className="w-14 h-14 bg-[#0C1629]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Brain size={24} className="text-[#0C1629] opacity-40" />
                        </div>
                        <p className="text-sm font-semibold text-[#0C1629] mb-1">No AI insights yet</p>
                        <p className="text-sm text-[#727A84]">Select Quick Insight or Deep Strategy above and click Generate AI Insights.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── FULL BREAKDOWN SUB-TAB ── */}
                {insightSubTab === 'breakdown' && (
                  <div className="space-y-4">
                    {checkins[0].notes && (
                      <div className="bg-white card p-5 md:p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#727A84] mb-2">Check-in Notes</p>
                        <p className="text-[#0C1629] leading-relaxed">{checkins[0].notes}</p>
                      </div>
                    )}
                    <p className="text-sm text-[#727A84]">All 9 areas from your latest check-in. Click any area to expand sub-dimensions.</p>
                    <div className="bg-white card divide-y divide-[#F0F3F3] overflow-hidden">
                      {CHECK_IN_DOMAINS.map(domain => {
                        const s = latestCheckinScores[domain.name] ?? 5
                        const isOpen = expandedBreakdown === domain.id
                        const status = s >= 7 ? 'Strong' : s >= 5 ? 'Moderate' : 'Needs Work'
                        const statusCls = s >= 7 ? 'bg-[#22c55e]/10 text-[#16a34a]' : s >= 5 ? 'bg-[#f59e0b]/10 text-[#d97706]' : 'bg-[#9f403d]/10 text-[#9f403d]'
                        return (
                          <div key={domain.id}>
                            <button
                              type="button"
                              onClick={() => setExpandedBreakdown(isOpen ? null : domain.id)}
                              className="w-full flex items-center gap-3 p-5 text-left hover:bg-[#F0F3F3]/50 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: domain.color + '18' }}>
                                <domain.icon size={16} style={{ color: domain.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-base font-semibold text-[#0C1629]">{domain.name}</span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCls}`}>{status}</span>
                                    <span className="text-base font-bold" style={{ color: domain.color }}>{s}</span>
                                    <ChevronDown size={16} className={`text-[#727A84] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>
                                <p className="text-sm text-[#727A84]">{domain.description}</p>
                              </div>
                            </button>
                            {isOpen && (
                              <div className="pb-5 px-5 ml-12 space-y-4 border-t border-[#F0F3F3] pt-4">
                                <div className="h-2 bg-[#F0F3F3] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(s / 10) * 100}%`, backgroundColor: domain.color }} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#B5C1C8]">Sub-area Ratings</p>
                                <div className="space-y-3">
                                  {domain.subAreas.map(area => {
                                    const subScore = checkins[0].sub_scores?.[`${domain.id}.${area.key}`]
                                    return (
                                      <div key={area.key} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: domain.color }} />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-[#0C1629]">{area.title}</p>
                                            {subScore != null ? (
                                              <span className="text-sm font-bold shrink-0" style={{ color: domain.color }}>{subScore}/10</span>
                                            ) : (
                                              <span className="text-xs text-[#B5C1C8] shrink-0">—</span>
                                            )}
                                          </div>
                                          <p className="text-xs text-[#727A84]">{area.description}</p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                {(() => {
                                  const answers = checkins[0].reflection_answers?.[domain.id]
                                  if (!answers?.some(a => a.trim())) return null
                                  return (
                                    <div className="pt-4 border-t border-[#F0F3F3]">
                                      <p className="text-xs font-bold uppercase tracking-widest text-[#B5C1C8] mb-3">Your Reflections</p>
                                      <div className="space-y-3">
                                        {domain.questions.map((q, qi) => {
                                          const answer = answers[qi]
                                          if (!answer?.trim()) return null
                                          return (
                                            <div key={qi}>
                                              <p className="text-xs font-semibold text-[#727A84] mb-1">· {q}</p>
                                              <p className="text-sm text-[#0C1629] leading-relaxed pl-3">{answer}</p>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-5">
          {checkins.length === 0 ? (
            <div className="bg-white card p-12 text-center text-[#727A84] opacity-60 text-sm">
              No check-ins yet. Complete your first check-in!
            </div>
          ) : (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const allAvgs = checkins.map(c => {
                    const v = Object.values(c.scores as Record<string, number>)
                    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
                  })
                  const overallAvg = allAvgs.length ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length * 10) / 10 : 0
                  const best = allAvgs.length ? Math.max(...allAvgs).toFixed(1) : '—'
                  return (
                    <>
                      <div className="bg-white card p-4 text-center">
                        <p className="text-2xl font-black text-[#0C1629]">{checkins.length}</p>
                        <p className="text-[11px] text-[#727A84] mt-0.5 font-medium">Total Check-ins</p>
                      </div>
                      <div className="bg-white card p-4 text-center">
                        <p className="text-2xl font-black text-[#0C1629]">{overallAvg}</p>
                        <p className="text-[11px] text-[#727A84] mt-0.5 font-medium">Avg Score</p>
                      </div>
                      <div className="bg-white card p-4 text-center">
                        <p className="text-2xl font-black text-[#0C1629]">{best}</p>
                        <p className="text-[11px] text-[#727A84] mt-0.5 font-medium">Best Session</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Check-in timeline */}
              {[...checkins].reverse().map((checkin, idx) => {
                // Resolve UUID keys (old check-ins) → category names
                const scoreEntries = Object.entries(checkin.scores as Record<string, number>)
                  .map(([key, v]) => [resolveScoreKey(key), v] as [string, number])
                const vals = scoreEntries.map(([, v]) => v)
                const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0
                const sorted = [...scoreEntries].sort((a, b) => b[1] - a[1])
                const strongest = sorted.slice(0, 2)
                const weakest = sorted.slice(-2).reverse()
                const isFirst = idx === 0

                // Map stored name → domain short name (first word) for radar axis
                const historyRadarData = scoreEntries.map(([name, value]) => ({
                  subject: name.split(' ')[0],
                  value,
                  fullMark: 10,
                }))

                return (
                  <div key={checkin.id} className="bg-white card overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F3F3]">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#0C1629]">
                            {format(new Date(checkin.date + 'T00:00:00'), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-[11px] text-[#727A84] mt-0.5">
                            {format(new Date(checkin.date + 'T00:00:00'), 'EEEE')}
                          </p>
                        </div>
                        {isFirst && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0C1629] text-white uppercase tracking-wide">Latest</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#0C1629]">{avg}<span className="text-xs font-normal text-[#727A84]">/10</span></p>
                        <p className="text-[10px] text-[#727A84]">Overall</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#F0F3F3]">
                      {/* Left: radar + scores */}
                      <div className="p-5 flex flex-col gap-4">
                        {/* Mini radar */}
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={historyRadarData} cx="50%" cy="50%" outerRadius="65%">
                              <PolarGrid stroke="#F0F3F3" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#727A84', fontSize: 10 }} />
                              <Radar dataKey="value" stroke="#0C1629" fill="#0C1629" fillOpacity={0.12} strokeWidth={1.5} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Score bars */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {scoreEntries.map(([cat, score]) => {
                            const color = getCategoryColor(cat)
                            const shortName = cat.split(' ')[0]
                            return (
                              <div key={cat}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-[#727A84] font-medium truncate">{shortName}</span>
                                  <span className="text-[10px] font-bold ml-1 shrink-0" style={{ color }}>{score}</span>
                                </div>
                                <div className="h-1 bg-[#F0F3F3] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Right: strongest / opportunities / notes */}
                      <div className="p-5 flex flex-col gap-4">
                        {/* Strongest */}
                        <div>
                          <p className="text-[10px] font-bold text-[#727A84] uppercase tracking-wider mb-2">Strongest Areas</p>
                          <div className="space-y-2">
                            {strongest.map(([cat, score]) => {
                              const color = getCategoryColor(cat)
                              const domain = CHECK_IN_DOMAINS.find(d => d.name === cat || d.name.startsWith(cat.split(' ')[0]))
                              const Icon = domain?.icon
                              return (
                                <div key={cat} className="flex items-center gap-2.5">
                                  {Icon && (
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
                                      <Icon size={13} style={{ color }} />
                                    </div>
                                  )}
                                  <span className="text-xs font-semibold text-[#0C1629] flex-1 truncate">{cat}</span>
                                  <span className="text-xs font-black shrink-0" style={{ color }}>{score}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Opportunities */}
                        <div>
                          <p className="text-[10px] font-bold text-[#727A84] uppercase tracking-wider mb-2">Opportunities</p>
                          <div className="space-y-2">
                            {weakest.map(([cat, score]) => {
                              const color = getCategoryColor(cat)
                              const domain = CHECK_IN_DOMAINS.find(d => d.name === cat || d.name.startsWith(cat.split(' ')[0]))
                              const Icon = domain?.icon
                              return (
                                <div key={cat} className="flex items-center gap-2.5">
                                  {Icon && (
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
                                      <Icon size={13} style={{ color }} />
                                    </div>
                                  )}
                                  <span className="text-xs font-semibold text-[#0C1629] flex-1 truncate">{cat}</span>
                                  <span className="text-xs font-black shrink-0" style={{ color }}>{score}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Notes */}
                        {checkin.notes && (
                          <div className="mt-auto pt-3 border-t border-[#F0F3F3]">
                            <p className="text-[11px] text-[#727A84] italic leading-relaxed">"{checkin.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
