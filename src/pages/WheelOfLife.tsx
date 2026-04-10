import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Target,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  ArrowRight,
  Heart,
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
  Smile,
  Home,
  UserCheck,
  Lightbulb,
  CheckCircle2,
  Circle,
  Pencil,
  Calendar,
  Clock,
  Timer,
  Pause,
  Play,
  Square,
  Bold,
  Italic,
  AtSign,
  ThumbsUp,
  Flag,
  User,
  MoreHorizontal,
  Paperclip,
  Share2,
  Tag,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useWheelStore, DEFAULT_CATEGORIES } from '../stores/wheelStore'
import type { Goal } from '../stores/wheelStore'
import GoalDetailView from '../components/GoalDetailView'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

type Tab = 'checkin' | 'goals' | 'history'

// Category colors and icons
const CATEGORY_META: Record<string, { color: string; icon: React.ElementType; description: string }> = {
  Health: { color: '#22c55e', icon: Heart, description: 'Physical & mental wellbeing' },
  Career: { color: '#1F3649', icon: Briefcase, description: 'Professional growth & satisfaction' },
  Finance: { color: '#f59e0b', icon: DollarSign, description: 'Financial security & freedom' },
  Relationships: { color: '#ef4444', icon: Users, description: 'Romantic & social connections' },
  'Personal Growth': { color: '#8b5cf6', icon: TrendingUp, description: 'Learning & self-improvement' },
  Fun: { color: '#ec4899', icon: Smile, description: 'Recreation & enjoyment' },
  Environment: { color: '#14b8a6', icon: Home, description: 'Living space & surroundings' },
  'Physical Environment': { color: '#14b8a6', icon: Home, description: 'Living space & surroundings' },
  'Family/Friends': { color: '#f97316', icon: UserCheck, description: 'Close relationships & community' },
}

const DEFAULT_META = { color: '#6b63f5', icon: Circle, description: 'Custom category' }

function getCategoryMeta(name: string) {
  return CATEGORY_META[name] ?? DEFAULT_META
}

// Questions for each category (section detail view)
const CATEGORY_QUESTIONS: Record<string, { title: string; description: string }[]> = {
  Health: [
    { title: 'Physical Fitness', description: 'How satisfied are you with your current fitness level?' },
    { title: 'Nutrition', description: 'How well are you eating and maintaining a healthy diet?' },
    { title: 'Sleep Quality', description: 'How restorative and consistent is your sleep?' },
    { title: 'Mental Health', description: 'How well are you managing stress and emotions?' },
    { title: 'Energy Levels', description: 'How energized do you feel throughout the day?' },
  ],
  Career: [
    { title: 'Role Satisfaction', description: 'How satisfied are you with your current role and responsibilities?' },
    { title: 'Learning & Development', description: 'Are you growing your skills and knowledge?' },
    { title: 'Financial Compensation', description: 'How satisfied are you with your compensation?' },
    { title: 'Work-Life Balance', description: 'How well do you balance work with personal life?' },
    { title: 'Career Direction', description: 'Are you heading in the right professional direction?' },
  ],
  Finance: [
    { title: 'Savings', description: 'How well are you saving money regularly?' },
    { title: 'Debt Management', description: 'How well are you managing any existing debt?' },
    { title: 'Income Growth', description: 'Is your income growing over time?' },
    { title: 'Financial Literacy', description: 'How confident are you with financial decisions?' },
    { title: 'Financial Goals', description: 'Are you on track with your financial targets?' },
  ],
  Relationships: [
    { title: 'Communication', description: 'How well are you communicating with loved ones?' },
    { title: 'Quality Time', description: 'Are you spending meaningful time with important people?' },
    { title: 'Trust & Vulnerability', description: 'How open and trusting are your relationships?' },
    { title: 'Boundaries', description: 'How well do you maintain healthy boundaries?' },
    { title: 'Social Connections', description: 'Do you feel connected to a broader community?' },
  ],
  'Personal Growth': [
    { title: 'Self-Awareness', description: 'How well do you understand your strengths and weaknesses?' },
    { title: 'Learning Habits', description: 'Are you consistently learning new things?' },
    { title: 'Mindfulness', description: 'How present and mindful are you day-to-day?' },
    { title: 'Goal Progress', description: 'Are you making progress on personal goals?' },
    { title: 'Resilience', description: 'How well do you bounce back from setbacks?' },
  ],
  Fun: [
    { title: 'Hobbies', description: 'Are you regularly enjoying hobbies and interests?' },
    { title: 'Adventure', description: 'Are you trying new experiences and adventures?' },
    { title: 'Relaxation', description: 'Do you take enough time to relax and recharge?' },
    { title: 'Creativity', description: 'Are you expressing yourself creatively?' },
    { title: 'Joy', description: 'How much joy and laughter is in your daily life?' },
  ],
  Environment: [
    { title: 'Living Space', description: 'How satisfied are you with your home environment?' },
    { title: 'Organization', description: 'How organized and clutter-free is your space?' },
    { title: 'Nature Access', description: 'Do you spend enough time in nature?' },
    { title: 'Comfort', description: 'How comfortable is your daily environment?' },
    { title: 'Safety', description: 'Do you feel safe and secure in your surroundings?' },
  ],
  'Physical Environment': [
    { title: 'Living Space', description: 'How satisfied are you with your home environment?' },
    { title: 'Organization', description: 'How organized and clutter-free is your space?' },
    { title: 'Nature Access', description: 'Do you spend enough time in nature?' },
    { title: 'Comfort', description: 'How comfortable is your daily environment?' },
    { title: 'Safety', description: 'Do you feel safe and secure in your surroundings?' },
  ],
  'Family/Friends': [
    { title: 'Family Bonds', description: 'How strong are your family relationships?' },
    { title: 'Friendships', description: 'Do you have deep, meaningful friendships?' },
    { title: 'Support System', description: 'Do you feel supported by those around you?' },
    { title: 'Quality Time', description: 'Are you spending enough quality time with family and friends?' },
    { title: 'Communication', description: 'How well do you stay in touch with loved ones?' },
  ],
}

// Donut chart component for scores
function ScoreDonut({ score, maxScore = 10, size = 120, color = '#1F3649' }: { score: number; maxScore?: number; size?: number; color?: string }) {
  const percentage = (score / maxScore) * 100
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.33}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#ebeeef" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#2d3435]">{score}<span className="text-sm font-normal text-[#5a6061] opacity-60">/{maxScore}</span></span>
      </div>
    </div>
  )
}

// Point selector (1-10) for section detail view
function PointSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((point) => (
        <button
          key={point}
          onClick={() => onChange(point)}
          className={cn(
            'w-8 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer',
            point <= value
              ? 'bg-[#1F3649] text-white shadow-sm'
              : 'bg-[#f2f4f4] text-[#5a6061] hover:bg-[#ebeeef]'
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
    categories,
    checkins,
    goals,
    tasks,
    fetchAll,
    createCheckin,
    createGoal,
    updateGoal,
    deleteGoal,
    createTask,
    toggleTask,
    deleteTask,
    addCustomCategory,
  } = useWheelStore()

  const [tab, setTab] = useState<Tab>('checkin')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({ categoryId: '', title: '', description: '', targetDate: '' })
  const [newTask, setNewTask] = useState({ goalId: '', categoryId: '', title: '' })
  const [reflectionText, setReflectionText] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [totalLoggedSeconds, setTotalLoggedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Activity / comments
  const [commentText, setCommentText] = useState('')
  const [goalComments, setGoalComments] = useState<{ id: string; text: string; createdAt: Date }[]>([])
  const navigate = useNavigate()

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user])

  const activeCategories = categories.filter((c) => c.is_active).map((c) => c.name)
  const allCategoryNames = activeCategories.length > 0 ? activeCategories : DEFAULT_CATEGORIES

  useEffect(() => {
    const initial: Record<string, number> = {}
    allCategoryNames.forEach((name) => {
      initial[name] = scores[name] ?? 5
    })
    setScores(initial)
  }, [categories])

  // Get latest checkin scores for display
  const latestScores = useMemo(() => {
    if (checkins.length > 0) return checkins[0].scores
    return scores
  }, [checkins, scores])

  const radarData = allCategoryNames.map((name) => ({
    subject: name,
    value: selectedCategory ? scores[name] ?? 5 : (latestScores[name] ?? scores[name] ?? 5),
    fullMark: 10,
  }))

  const overallAverage = useMemo(() => {
    const vals = Object.values(latestScores)
    if (vals.length === 0) return 0
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }, [latestScores])

  const submitCheckin = async () => {
    if (!user) return
    setSubmitting(true)
    await createCheckin({ user_id: user.id, date: format(new Date(), 'yyyy-MM-dd'), scores, notes })
    setSubmitting(false)
    setNotes('')
    setSelectedCategory(null)
  }

  const handleAddGoal = async () => {
    if (!user || !newGoal.title || !newGoal.categoryId) return
    await createGoal({
      user_id: user.id,
      category_id: newGoal.categoryId,
      project_id: null,
      title: newGoal.title,
      description: newGoal.description || null,
      status: 'active',
      target_date: newGoal.targetDate || null,
    })
    setNewGoal({ categoryId: '', title: '', description: '', targetDate: '' })
  }

  const handleAddTask = async (goalId: string, categoryId: string) => {
    if (!user || !newTask.title) return
    await createTask({
      user_id: user.id,
      goal_id: goalId,
      category_id: categoryId,
      project_id: null,
      title: newTask.title,
      completed: false,
      priority: 'normal',
      energy: 2,
      estimated_minutes: null,
      due_date: null,
    })
    setNewTask({ goalId: '', categoryId: '', title: '' })
  }

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return
    await addCustomCategory(user.id, newCategoryName.trim())
    setNewCategoryName('')
  }

  // Section detail view
  if (selectedCategory && tab === 'checkin') {
    const meta = getCategoryMeta(selectedCategory)
    const IconComp = meta.icon
    const questions = CATEGORY_QUESTIONS[selectedCategory] ?? [
      { title: 'Overall Satisfaction', description: 'How satisfied are you in this area?' },
      { title: 'Progress', description: 'How much progress have you made recently?' },
      { title: 'Effort', description: 'How much effort are you putting in?' },
      { title: 'Balance', description: 'How balanced is this area of your life?' },
      { title: 'Vision', description: 'How clear is your vision for this area?' },
    ]
    const categoryScore = scores[selectedCategory] ?? 5
    const questionScores = questions.map((_, i) => {
      // Distribute the overall score across questions with slight variance
      const base = categoryScore
      const variance = Math.sin(i * 1.5) * 1.5
      return Math.max(1, Math.min(10, Math.round(base + variance)))
    })

    return (
      <div className="pb-24 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[#5a6061] hover:text-[#2d3435] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Wheel of Life
          </button>
          <span className="text-[#5a6061]">/</span>
          <span className="text-[#2d3435] font-medium">{selectedCategory}</span>
          <span className="ml-auto text-sm font-semibold" style={{ color: meta.color }}>
            {categoryScore}/10
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Questions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white card p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
                  <IconComp size={20} style={{ color: meta.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#2d3435]">{selectedCategory}</h2>
                  <p className="text-sm text-[#5a6061]">{meta.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={i} className="pb-5 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-[#2d3435]">
                          {i + 1}. {q.title}
                        </h4>
                        <p className="text-xs text-[#5a6061] opacity-60 mt-0.5">{q.description}</p>
                      </div>
                      <span className="text-sm font-bold ml-3" style={{ color: meta.color }}>{questionScores[i]}</span>
                    </div>
                    <PointSelector
                      value={questionScores[i]}
                      onChange={(v) => {
                        // Update the overall category score based on question answers
                        const newAvg = Math.round(
                          questionScores.reduce((sum, s, j) => sum + (j === i ? v : s), 0) / questions.length
                        )
                        setScores((prev) => ({ ...prev, [selectedCategory]: newAvg }))
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedCategory(null)
                }}
                className="mt-6 w-full bg-[#1F3649] hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-[10px] transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Score donut */}
            <div className="bg-white card p-8 flex flex-col items-center">
              <h3 className="text-sm font-medium text-[#5a6061] mb-3">Section Score</h3>
              <ScoreDonut score={categoryScore} color={meta.color} />
            </div>

            {/* Pro tip */}
            <div className="bg-white card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-[#f59e0b]" />
                <h4 className="text-sm font-semibold text-[#2d3435]">Pro Tip</h4>
              </div>
              <p className="text-xs text-[#5a6061] leading-relaxed">
                Rate each question honestly based on how you feel right now, not how you want to feel.
                Tracking your authentic scores over time reveals patterns and helps you focus on what truly matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Goal detail view
  if (selectedGoal && tab === 'goals') {
    return (
      <GoalDetailView
        goal={selectedGoal}
        onClose={() => { setSelectedGoal(null) }}
      />
    )
  }


  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d3435]">Wheel of Life Assessment</h1>
        <p className="text-sm text-[#5a6061] mt-1">
          Rate each area of your life to understand your overall balance and identify areas for growth.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#f2f4f4] p-1.5 rounded-xl w-fit overflow-x-auto scrollbar-hide">
        {([['checkin', 'Check-in'], ['goals', 'Goals & Tasks'], ['history', 'History']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              tab === id ? 'bg-white text-[#2d3435] shadow-sm' : 'text-[#5a6061] hover:text-[#2d3435]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CHECK-IN TAB */}
      {tab === 'checkin' && (
        <div className="space-y-4 md:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Left: Category pills */}
            <div className="bg-white card p-5 md:p-8">
              <h3 className="text-sm font-semibold text-[#2d3435] mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {allCategoryNames.map((name) => {
                  const meta = getCategoryMeta(name)
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedCategory(name)}
                      className={cn(
                        'px-3 py-1.5 rounded-[15px] text-xs font-medium transition-all cursor-pointer',
                        selectedCategory === name
                          ? 'text-white'
                          : 'text-[#5a6061] hover:bg-[#f2f4f4]'
                      )}
                      style={selectedCategory === name ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>

              {/* Overall score */}
              <div className="mt-5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5a6061]">Overall Score</span>
                  <span className="text-lg font-bold text-[#2d3435]">{overallAverage}<span className="text-sm font-normal text-[#5a6061] opacity-60">/10</span></span>
                </div>
              </div>

              {/* Add custom category */}
              <div className="flex gap-2 mt-4 pt-4">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Add category..."
                  className="flex-1 rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="p-2 bg-[#f2f4f4] hover:bg-[#ebeeef] disabled:opacity-50 text-[#5a6061] rounded-lg transition-all cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Center: Radar chart */}
            <div className="lg:col-span-2 bg-white card p-5 md:p-8">
              <h3 className="text-sm font-semibold text-[#2d3435] mb-2">Life Balance Radar</h3>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#ebeeef" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#5a6061', fontSize: 11, fontFamily: 'Manrope' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#1F3649"
                    fill="#1F3649"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      color: '#2d3435',
                      fontSize: '13px',
                      boxShadow: '0 10px 40px rgba(45,52,53,0.06)',
                    }}
                    formatter={(v) => [`${v}/10`, 'Score']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sliders / Rate each area */}
          <div className="bg-white card p-5 md:p-8">
            <h3 className="text-sm font-semibold text-[#2d3435] mb-4">Rate Each Area</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {allCategoryNames.map((name) => {
                const meta = getCategoryMeta(name)
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#5a6061]">{name}</span>
                      <span className="text-sm font-semibold" style={{ color: meta.color }}>{scores[name] ?? 5}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scores[name] ?? 5}
                      onChange={(e) => setScores((prev) => ({ ...prev, [name]: Number(e.target.value) }))}
                      className="w-full h-1.5 rounded-full accent-[#1F3649] cursor-pointer"
                    />
                  </div>
                )
              })}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for this check-in (optional)..."
              className="w-full mt-5 rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10 resize-none h-20"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const csvRows = ['Category,Score']
                Object.entries(scores).forEach(([category, score]) => {
                  csvRows.push(`"${category}",${score}`)
                })
                const csvString = csvRows.join('\n')
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `wheel-of-life-${format(new Date(), 'yyyy-MM-dd')}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download size={15} />
              Download Results
            </button>
            <button
              onClick={submitCheckin}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1F3649] hover:bg-[#162838] disabled:opacity-50 text-white text-sm font-bold rounded-[15px] transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Start New Assessment'}
              {!submitting && <ArrowRight size={15} />}
            </button>
          </div>

          {/* Category cards at the bottom */}
          <div>
            <h3 className="text-sm font-semibold text-[#2d3435] mb-3">Category Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allCategoryNames.map((name) => {
                const meta = getCategoryMeta(name)
                const IconComp = meta.icon
                const score = latestScores[name] ?? scores[name] ?? 5

                return (
                  <button
                    key={name}
                    onClick={() => setSelectedCategory(name)}
                    className="bg-white card p-6 text-left hover:shadow-[0_10px_40px_rgba(45,52,53,0.06)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        <IconComp size={17} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#2d3435] truncate">{name}</h4>
                      </div>
                      <span className="text-lg font-bold" style={{ color: meta.color }}>{score}</span>
                    </div>
                    <p className="text-xs text-[#5a6061] opacity-60 line-clamp-2">{meta.description}</p>
                    <div className="mt-2 h-1 bg-[#f2f4f4] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(score / 10) * 100}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* GOALS & TASKS TAB */}
      {tab === 'goals' && (
        <div className="space-y-8">
          {/* Add goal form */}
          <div className="bg-white card p-8">
            <h3 className="font-semibold text-[#2d3435] mb-4 flex items-center gap-2">
              <Target size={16} className="text-[#1F3649]" />
              Add New Goal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={newGoal.categoryId}
                onChange={(e) => setNewGoal((p) => ({ ...p, categoryId: e.target.value }))}
                className="rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10 cursor-pointer"
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
                className="rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10"
              />
              <input
                value={newGoal.description}
                onChange={(e) => setNewGoal((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)..."
                className="rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10"
              />
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal((p) => ({ ...p, targetDate: e.target.value }))}
                className="rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10 cursor-pointer"
              />
            </div>
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.title || !newGoal.categoryId}
              className="mt-4 bg-[#1F3649] hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 text-sm font-semibold rounded-[10px] transition-all cursor-pointer"
            >
              Add Goal
            </button>
          </div>

          {/* Goals list */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="bg-white card p-12 text-center text-[#5a6061] opacity-60 text-sm">
                No goals yet. Add one above to get started.
              </div>
            ) : goals.map((goal) => {
              const cat = categories.find((c) => c.id === goal.category_id)
              const meta = getCategoryMeta(cat?.name ?? '')
              const goalTasks = tasks.filter((t) => t.goal_id === goal.id)
              const completedCount = goalTasks.filter((t) => t.completed).length
              const isExpanded = expandedGoal === goal.id
              const progress = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : 0

              return (
                <div key={goal.id} className="bg-white card overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#f2f4f4] transition-all"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  >
                    {isExpanded ? <ChevronDown size={14} className="text-[#5a6061] shrink-0" /> : <ChevronRight size={14} className="text-[#5a6061] shrink-0" />}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                      <Target size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-[15px] font-medium" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                          {cat?.name ?? 'Unknown'}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-[15px] font-medium',
                          goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        )}>
                          {goal.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#2d3435] truncate">{goal.title}</h4>
                      {goal.description && <p className="text-xs text-[#5a6061] opacity-60 mt-0.5 truncate">{goal.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Mini progress bar */}
                      <div className="w-16 hidden sm:block">
                        <div className="h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: meta.color }} />
                        </div>
                        <span className="text-[10px] text-[#5a6061] opacity-60">{completedCount}/{goalTasks.length}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedGoal(goal) }}
                        className="text-xs text-[#1F3649] hover:underline cursor-pointer font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateGoal(goal.id, { status: goal.status === 'completed' ? 'active' : 'completed' }) }}
                        className="text-xs text-[#5a6061] hover:text-[#22c55e] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[#22c55e]/10"
                      >
                        {goal.status === 'completed' ? 'Reopen' : 'Complete'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}
                        className="p-1.5 hover:bg-[#9f403d]/10 text-[#5a6061] hover:text-[#9f403d] rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-[#f2f4f4] animate-fade-in">
                      {goalTasks.length === 0 ? (
                        <p className="text-sm text-[#5a6061] opacity-60 mb-3">No tasks yet.</p>
                      ) : (
                        <div className="space-y-1 mb-3">
                          {goalTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg group hover:bg-[#ebeeef] transition-all">
                              <button
                                onClick={() => toggleTask(task.id, !task.completed)}
                                className="cursor-pointer shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle2 size={16} className="text-[#22c55e]" />
                                ) : (
                                  <Circle size={16} className="text-[#5a6061] opacity-60" />
                                )}
                              </button>
                              <span className={cn('text-sm flex-1', task.completed ? 'line-through text-[#5a6061] opacity-60' : 'text-[#2d3435]')}>
                                {task.title}
                              </span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#9f403d]/10 text-[#5a6061] hover:text-[#9f403d] rounded transition-all cursor-pointer"
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
                          className="flex-1 rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10"
                        />
                        <button
                          onClick={() => handleAddTask(goal.id, goal.category_id)}
                          disabled={!newTask.title || newTask.goalId !== goal.id}
                          className="p-2.5 bg-[#1F3649]/10 hover:bg-[#1F3649]/20 disabled:opacity-50 text-[#1F3649] rounded-xl transition-all cursor-pointer"
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

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div className="space-y-4">
          {checkins.length === 0 ? (
            <div className="bg-white card p-12 text-center text-[#5a6061] opacity-60 text-sm">
              No check-ins yet. Do your first check-in!
            </div>
          ) : checkins.map((checkin) => {
            const vals = Object.values(checkin.scores)
            const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0
            const historyRadarData = Object.entries(checkin.scores).map(([name, value]) => ({
              subject: name.length > 12 ? name.slice(0, 12) + '...' : name,
              value,
              fullMark: 10,
            }))

            return (
              <div key={checkin.id} className="bg-white card p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#2d3435]">{format(new Date(checkin.date), 'EEEE, MMMM d, yyyy')}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1F3649]">Avg: {avg}/10</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mini radar */}
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={historyRadarData} cx="50%" cy="50%" outerRadius="65%">
                        <PolarGrid stroke="#ebeeef" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#5a6061', fontSize: 10, fontFamily: 'Manrope' }} />
                        <Radar dataKey="value" stroke="#1F3649" fill="#1F3649" fillOpacity={0.12} strokeWidth={1.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Score bars */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 content-center">
                    {Object.entries(checkin.scores).map(([cat, score]) => {
                      const meta = getCategoryMeta(cat)
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#5a6061] truncate">{cat}</span>
                            <span className="text-xs font-semibold" style={{ color: meta.color }}>{score}</span>
                          </div>
                          <div className="h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(score / 10) * 100}%`, backgroundColor: meta.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {checkin.notes && (
                  <p className="text-sm text-[#5a6061] opacity-60 mt-4 pt-4 italic">"{checkin.notes}"</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
