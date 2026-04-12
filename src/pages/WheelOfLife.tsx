import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Target, Trash2, ChevronDown, ChevronRight, ChevronLeft,
  Download, ArrowRight, Heart, Briefcase, DollarSign, Users,
  TrendingUp, Smile, UserCheck, Lightbulb, CheckCircle2, Circle,
  Frown, Meh, MapPin, Cloud, Moon, Zap, Wine, Dumbbell, X,
} from 'lucide-react'
import { LogbirdDatePicker } from '../components/ui/date-range-picker'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useWheelStore } from '../stores/wheelStore'
import type { Goal } from '../stores/wheelStore'
import GoalDetailView from '../components/GoalDetailView'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

type Tab = 'checkin' | 'goals' | 'history'

// Fixed 8 check-in domains with sub-areas and reflection questions
const CHECK_IN_DOMAINS = [
  {
    id: 'finances',
    name: 'Finances & Money',
    icon: DollarSign,
    color: '#f59e0b',
    description: 'Financial security & freedom',
    subAreas: [
      { key: 'savings', title: 'Savings & Budgeting', description: 'How well are you saving and managing your budget?' },
      { key: 'debt', title: 'Debt Management', description: 'How well are you managing any existing debt?' },
      { key: 'income', title: 'Income Growth', description: 'Is your income growing over time?' },
      { key: 'literacy', title: 'Financial Literacy', description: 'How confident are you with financial decisions?' },
      { key: 'goals', title: 'Financial Goals', description: 'Are you on track with your financial targets?' },
    ],
    questions: [
      'What is your relationship with money? Are you happy with how you currently manage it or spend it?',
      'What are your long-term financial goals, and how on track are you to reach them?',
    ],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: Heart,
    color: '#22c55e',
    description: 'Physical & mental wellbeing',
    subAreas: [
      { key: 'fitness', title: 'Physical Fitness', description: 'How satisfied are you with your current fitness level?' },
      { key: 'nutrition', title: 'Nutrition', description: 'How well are you eating and maintaining a healthy diet?' },
      { key: 'sleep', title: 'Sleep Quality', description: 'How restorative and consistent is your sleep?' },
      { key: 'mental', title: 'Mental Health', description: 'How well are you managing stress and emotions?' },
      { key: 'energy', title: 'Energy Levels', description: 'How energized do you feel throughout the day?' },
    ],
    questions: [
      'How do you feel about your current level of overall health and well-being?',
      'Do you have any fitness goals, and do you feel like you are making progress towards those?',
      'How is your current relationship with sleep, nutrition, and self-care?',
    ],
  },
  {
    id: 'family',
    name: 'Family & Friends',
    icon: UserCheck,
    color: '#f97316',
    description: 'Close relationships & community',
    subAreas: [
      { key: 'family', title: 'Family Bonds', description: 'How strong are your family relationships?' },
      { key: 'friends', title: 'Friendships', description: 'Do you have deep, meaningful friendships?' },
      { key: 'support', title: 'Support System', description: 'Do you feel supported by those around you?' },
      { key: 'time', title: 'Quality Time', description: 'Are you spending enough quality time with loved ones?' },
      { key: 'comm', title: 'Communication', description: 'How well do you stay connected with family and friends?' },
    ],
    questions: [
      'Are you satisfied with the current dynamics within your family and friend circles?',
      'How do you prioritize and spend quality time with your family and friends?',
    ],
  },
  {
    id: 'spirituality',
    name: 'Spirituality & Religion',
    icon: Lightbulb,
    color: '#8b5cf6',
    description: 'Beliefs, purpose & meaning',
    subAreas: [
      { key: 'purpose', title: 'Sense of Purpose', description: 'Do you feel like you are living out your purpose?' },
      { key: 'peace', title: 'Inner Peace', description: 'How much inner peace and calm do you experience?' },
      { key: 'values', title: 'Beliefs & Values', description: 'How aligned are you with your core beliefs and values?' },
      { key: 'mindful', title: 'Mindfulness', description: 'How present and mindful are you in daily life?' },
      { key: 'community', title: 'Spiritual Community', description: 'How connected do you feel to a faith or values community?' },
    ],
    questions: [
      'How would you describe your personal beliefs and spirituality?',
      'What role, if any, does religion play in your life?',
      'Do you feel like you are currently living out your purpose in life?',
    ],
  },
  {
    id: 'recreation',
    name: 'Recreation & Lifestyle',
    icon: Smile,
    color: '#ec4899',
    description: 'Joy, relaxation & balance',
    subAreas: [
      { key: 'hobbies', title: 'Hobbies & Interests', description: 'Are you regularly enjoying hobbies and interests?' },
      { key: 'balance', title: 'Work-Life Balance', description: 'How well do you balance work with personal life?' },
      { key: 'digital', title: 'Digital Balance', description: 'How satisfied are you with your screen/device usage?' },
      { key: 'outdoor', title: 'Outdoor & Travel', description: 'Are you getting enough outdoor activity and travel?' },
      { key: 'social', title: 'Social Activity', description: 'How satisfied are you with your social interactions?' },
    ],
    questions: [
      'What activities bring you joy and relaxation in your leisure time?',
      'How do you currently balance work and recreation in your lifestyle?',
      'How satisfied are you with your current levels of digital device usage, outdoor activity, travel, and social interaction?',
    ],
  },
  {
    id: 'love',
    name: 'Love & Romance',
    icon: Heart,
    color: '#ef4444',
    description: 'Romantic connections & intimacy',
    subAreas: [
      { key: 'emotional', title: 'Emotional Intimacy', description: 'How emotionally connected do you feel in your romantic life?' },
      { key: 'comm', title: 'Communication', description: 'How well do you communicate needs, desires, and boundaries?' },
      { key: 'physical', title: 'Physical Intimacy', description: 'How satisfied are you with physical closeness and affection?' },
      { key: 'conflict', title: 'Conflict Resolution', description: 'How well do you navigate and resolve conflict?' },
      { key: 'balance', title: 'Relationship Balance', description: 'How well does romance fit with the rest of your life?' },
    ],
    questions: [
      'How do you envision a fulfilling romantic relationship in your life?',
      'Do you feel like you adequately communicate your needs, desires, and boundaries in a romantic relationship?',
      'How do you approach dating, and what are your expectations and intentions in the dating process?',
      'If you are in a relationship, how do you feel about the current levels of emotional intimacy, sexual intimacy, conflict resolution, and balance with the rest of your life?',
    ],
  },
  {
    id: 'work',
    name: 'Work & Career',
    icon: Briefcase,
    color: '#0ea5e9',
    description: 'Professional growth & satisfaction',
    subAreas: [
      { key: 'satisfaction', title: 'Role Satisfaction', description: 'How satisfied are you with your current role?' },
      { key: 'growth', title: 'Learning & Development', description: 'Are you growing your skills and knowledge?' },
      { key: 'comp', title: 'Compensation', description: 'How satisfied are you with your income and compensation?' },
      { key: 'balance', title: 'Work-Life Balance', description: 'How well do you balance work with personal life?' },
      { key: 'direction', title: 'Career Direction', description: 'Are you heading in the right professional direction?' },
    ],
    questions: [
      'How satisfied are you with your current job or career path?',
      'What are your key skills and strengths, and how do they align with your current job or desired career? Do you wish to develop additional skills?',
      'How do you currently balance your work with other aspects of your life?',
    ],
  },
  {
    id: 'growth',
    name: 'Growth & Learning',
    icon: TrendingUp,
    color: '#6b63f5',
    description: 'Personal development & lifelong learning',
    subAreas: [
      { key: 'awareness', title: 'Self-Awareness', description: 'How well do you understand your strengths and weaknesses?' },
      { key: 'learning', title: 'Learning Habits', description: 'Are you consistently learning new things?' },
      { key: 'goals', title: 'Goal Progress', description: 'Are you making progress on personal goals?' },
      { key: 'resilience', title: 'Resilience', description: 'How well do you bounce back from setbacks?' },
      { key: 'mindful', title: 'Mindfulness', description: 'How present and self-reflective are you day-to-day?' },
    ],
    questions: [
      'What does success in personal growth look like to you?',
      'How do you approach the concept of lifelong learning?',
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

// Fixed PointSelector — type="button" prevents form submit; value is always direct state
function PointSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((point) => (
        <button
          key={point}
          type="button"
          onClick={() => onChange(point)}
          className={cn(
            'w-9 h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none',
            point <= value
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
  const tab = (searchParams.get('tab') as Tab) || 'checkin'

  // Check-in state
  const [subScores, setSubScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    CHECK_IN_DOMAINS.forEach(d => d.subAreas.forEach(sa => { init[`${d.id}.${sa.key}`] = 5 }))
    return init
  })
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState('')
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high' | null>(null)
  const [hadAlcohol, setHadAlcohol] = useState<boolean | null>(null)
  const [exercised, setExercised] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeDomainId, setActiveDomainId] = useState(CHECK_IN_DOMAINS[0].id)
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string[]>>({})

  // Goals state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({ categoryId: '', title: '', description: '', targetDate: '' })
  const [newTask, setNewTask] = useState({ goalId: '', categoryId: '', title: '' })

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user])

  // Compute per-domain score as average of its sub-area scores
  const scores = useMemo(() => {
    const result: Record<string, number> = {}
    CHECK_IN_DOMAINS.forEach(d => {
      const vals = d.subAreas.map(sa => subScores[`${d.id}.${sa.key}`] ?? 5)
      result[d.name] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
    })
    return result
  }, [subScores])

  const overallAverage = useMemo(() => {
    const vals = CHECK_IN_DOMAINS.map(d => scores[d.name] ?? 5)
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }, [scores])

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
    if (!user) return
    setSubmitting(true)
    await createCheckin({ user_id: user.id, date: format(new Date(), 'yyyy-MM-dd'), scores, notes })
    setSubmitting(false)
    setNotes('')
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
    checkin: { title: 'Check-in',       sub: 'Rate and reflect on each area of your life' },
    goals:   { title: 'Goals & Tasks',  sub: 'Track your goals and milestones' },
    history: { title: 'History',        sub: 'Your past check-ins over time' },
  }

  return (
    <div className="pb-24">

      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0C1629] tracking-tight">{TAB_META[tab].title}</h1>
        <p className="text-sm text-[#727A84] mt-1">{TAB_META[tab].sub}</p>
      </div>

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
                    {scores[activeDomain.name] ?? 5}
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
                  const val = subScores[key] ?? 5
                  return (
                    <div key={sa.key}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-[#0C1629]">{sa.title}</p>
                          <p className="text-xs text-[#727A84] mt-0.5">{sa.description}</p>
                        </div>
                        <span className="text-sm font-bold ml-3 shrink-0" style={{ color: activeDomain.color }}>{val}</span>
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
                        <p className="text-[10px] text-[#B5C1C8] mt-1">{['','Very poor','Poor','Okay','Good','Great'][sleepQuality]}</p>
                      )}
                    </div>

                    {/* Energy */}
                    <div>
                      <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Zap size={11}/> Energy Level
                      </label>
                      <div className="flex gap-1.5">
                        {(['low','medium','high'] as const).map(lvl => (
                          <button key={lvl} type="button"
                            onClick={() => setEnergyLevel(energyLevel === lvl ? null : lvl)}
                            className={cn('flex-1 h-7 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border',
                              energyLevel === lvl
                                ? 'bg-[#0C1629] text-white border-[#0C1629]'
                                : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setHadAlcohol(hadAlcohol === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          hadAlcohol === true
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Wine size={15} className={hadAlcohol === true ? 'text-orange-500' : 'text-[#B5C1C8]'}/>
                        <span>Drank last night</span>
                      </button>
                      <button type="button" onClick={() => setExercised(exercised === true ? null : true)}
                        className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          exercised === true
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-[#F0F3F3] text-[#727A84] border-transparent hover:bg-[#E4E9EC]')}>
                        <Dumbbell size={15} className={exercised === true ? 'text-green-500' : 'text-[#B5C1C8]'}/>
                        <span>Exercised</span>
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
                            style={{ width: `${(score / 10) * 100}%`, backgroundColor: domain.color }}
                          />
                        </div>
                        <span
                          className="text-[11px] font-bold w-4 text-right shrink-0"
                          style={{ color: domain.color }}
                        >
                          {score}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white card p-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const rows = ['Area,Score', ...CHECK_IN_DOMAINS.map(d => `"${d.name}",${scores[d.name] ?? 5}`)]
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `wheel-of-life-${format(new Date(), 'yyyy-MM-dd')}.csv`
                  document.body.appendChild(a); a.click(); document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
                className="flex items-center gap-2 bg-[#F0F3F3] hover:bg-[#D6DCE0] text-[#0C1629] px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer"
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                type="button"
                onClick={submitCheckin}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1629] hover:bg-[#162838] disabled:opacity-50 text-white text-sm font-bold rounded-[15px] transition-all cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Check-in'}
                {!submitting && <ArrowRight size={14} />}
              </button>
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

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-4">
          {checkins.length === 0 ? (
            <div className="bg-white card p-12 text-center text-[#727A84] opacity-60 text-sm">
              No check-ins yet. Do your first check-in!
            </div>
          ) : checkins.map((checkin) => {
            const vals = Object.values(checkin.scores)
            const avg = vals.length > 0
              ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
              : 0
            const historyRadarData = Object.entries(checkin.scores).map(([name, value]) => ({
              subject: name.length > 12 ? name.slice(0, 12) + '…' : name,
              value,
              fullMark: 10,
            }))

            return (
              <div key={checkin.id} className="bg-white card p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#0C1629]">
                    {format(new Date(checkin.date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <span className="text-sm font-bold text-[#0C1629]">Avg: {avg}/10</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={historyRadarData} cx="50%" cy="50%" outerRadius="65%">
                        <PolarGrid stroke="#F0F3F3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#727A84', fontSize: 10, fontFamily: 'Manrope' }} />
                        <Radar dataKey="value" stroke="#0C1629" fill="#0C1629" fillOpacity={0.12} strokeWidth={1.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 content-center">
                    {Object.entries(checkin.scores).map(([cat, score]) => {
                      const color = getCategoryColor(cat)
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#727A84] truncate">{cat}</span>
                            <span className="text-xs font-semibold" style={{ color }}>{score}</span>
                          </div>
                          <div className="h-1.5 bg-[#F0F3F3] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {checkin.notes && (
                  <p className="text-sm text-[#727A84] opacity-60 mt-4 pt-4 italic">"{checkin.notes}"</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
