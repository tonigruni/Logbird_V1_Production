import type { User } from '@supabase/supabase-js'
import type { JournalEntry, JournalTemplate } from '../stores/journalStore'
import type { WheelCategory, WheelCheckin, Goal, Task } from '../stores/wheelStore'

// Default to demo mode when Supabase env vars aren't configured (e.g. Vercel without secrets)
// Production safety: never allow demo mode in production builds
const _rawDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL

if (_rawDemoMode && import.meta.env.PROD) {
  console.error(
    '[SECURITY] DEMO_MODE was enabled in a production build. ' +
    'This bypasses authentication and is a security risk. ' +
    'Forcing DEMO_MODE to false. Check your environment variables.'
  )
}

export const DEMO_MODE = _rawDemoMode && !import.meta.env.PROD

export const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@personalos.app',
  user_metadata: { full_name: 'Alex Johnson' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User

export const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    user_id: 'demo-user-id',
    title: 'Morning reflection — feeling focused',
    content: `Started the day with 20 minutes of meditation. Mind feels clear.\n\nGrateful for: the quiet morning, coffee, and a clear to-do list.\n\nIntentions for today:\n- Deep work block 9–12\n- Call with team at 2pm\n- Evening walk`,
    mood_score: 4,
    template_id: null,
    category: 'Personal',
    location: 'Home office',
    weather: 'Sunny, 22°C',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-id',
    title: 'Weekly review — progress on goals',
    content: `This week was productive. Shipped two features, had a great workout session on Thursday.\n\nWhat went well:\n- Stayed consistent with journaling\n- Hit my sleep target 5/7 nights\n\nWhat to improve:\n- Need to reduce screen time after 9pm`,
    mood_score: 5,
    template_id: null,
    category: 'Work',
    location: null,
    weather: 'Cloudy, 17°C',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-id',
    title: 'New chapter — setting big goals',
    content: `Took some time to think about where I want to be in 12 months. Wrote down 3 major goals:\n\n1. Launch the side project\n2. Get to 80kg (lean)\n3. Build stronger relationships with family\n\nFeeling motivated and clear.`,
    mood_score: 5,
    template_id: null,
    category: 'Personal',
    location: 'Coffee shop',
    weather: 'Rainy, 14°C',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_TEMPLATES: JournalTemplate[] = [
  {
    id: 't1',
    user_id: 'demo-user-id',
    name: 'Morning Routine',
    structure: {
      content: `## Morning Reflection\n\n**Gratitude (3 things):**\n1. \n2. \n3. \n\n**Intentions for today:**\n- \n- \n\n**How am I feeling?**\n\n**One thing that would make today great:**`,
    },
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't2',
    user_id: 'demo-user-id',
    name: 'Weekly Review',
    structure: {
      content: `## Weekly Review\n\n**What went well this week?**\n\n**What could have gone better?**\n\n**Key wins:**\n- \n\n**Focus for next week:**\n- `,
    },
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_CATEGORIES: WheelCategory[] = [
  { id: 'c1', user_id: 'demo-user-id', name: 'Health', is_custom: false, is_active: true },
  { id: 'c2', user_id: 'demo-user-id', name: 'Career', is_custom: false, is_active: true },
  { id: 'c3', user_id: 'demo-user-id', name: 'Finance', is_custom: false, is_active: true },
  { id: 'c4', user_id: 'demo-user-id', name: 'Relationships', is_custom: false, is_active: true },
  { id: 'c5', user_id: 'demo-user-id', name: 'Personal Growth', is_custom: false, is_active: true },
  { id: 'c6', user_id: 'demo-user-id', name: 'Fun', is_custom: false, is_active: true },
  { id: 'c7', user_id: 'demo-user-id', name: 'Environment', is_custom: false, is_active: true },
  { id: 'c8', user_id: 'demo-user-id', name: 'Family/Friends', is_custom: false, is_active: true },
]

export const DEMO_CHECKINS: WheelCheckin[] = [
  {
    id: 'ch1',
    user_id: 'demo-user-id',
    date: new Date().toISOString().split('T')[0],
    scores: {
      Health: 7,
      Career: 8,
      Finance: 6,
      Relationships: 7,
      'Personal Growth': 8,
      Fun: 5,
      Environment: 7,
      'Family/Friends': 8,
    },
    notes: 'Good week overall. Need to focus more on fun and rest.',
    created_at: new Date().toISOString(),
  },
]

export const DEMO_GOALS: Goal[] = [
  {
    id: 'g1',
    user_id: 'demo-user-id',
    category_id: 'c1',
    project_id: 'proj-focus-mastery',
    title: 'Get to 80kg lean body weight',
    description: 'Consistent gym + nutrition',
    status: 'active',
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'g2',
    user_id: 'demo-user-id',
    category_id: 'c2',
    project_id: 'proj-identity-redesign',
    title: 'Launch personal side project',
    description: 'Build and ship by end of quarter',
    status: 'active',
    target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'g3',
    user_id: 'demo-user-id',
    category_id: 'c2',
    project_id: 'proj-senior-track',
    title: 'Scale Infrastructure',
    description: 'Quarterly architecture review and system optimization',
    status: 'active',
    target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'g4',
    user_id: 'demo-user-id',
    category_id: 'c1',
    project_id: 'proj-focus-mastery',
    title: 'Longevity Protocol',
    description: 'Nutrition, sleep, and recovery optimization',
    status: 'active',
    target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'g5',
    user_id: 'demo-user-id',
    category_id: 'c5',
    project_id: 'proj-identity-redesign',
    title: 'Brand Authority',
    description: 'Build public portfolio and thought leadership',
    status: 'active',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_TASKS: Task[] = [
  {
    id: 'tk1', user_id: 'demo-user-id', goal_id: 'g1', category_id: 'c1', project_id: 'proj-focus-mastery',
    title: 'Gym session — upper body', completed: true,
    priority: 'normal', energy: 3, estimated_minutes: 60,
    due_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk2', user_id: 'demo-user-id', goal_id: 'g4', category_id: 'c1', project_id: 'proj-focus-mastery',
    title: 'Weekly Meal Planning', completed: false,
    priority: 'normal', energy: 2, estimated_minutes: 45,
    due_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk3', user_id: 'demo-user-id', goal_id: 'g2', category_id: 'c2', project_id: 'proj-identity-redesign',
    title: 'Write landing page copy', completed: false,
    priority: 'high', energy: 3, estimated_minutes: 180,
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk4', user_id: 'demo-user-id', goal_id: 'g2', category_id: 'c2', project_id: 'proj-identity-redesign',
    title: 'Set up deployment pipeline', completed: false,
    priority: 'high', energy: 3, estimated_minutes: 120,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk5', user_id: 'demo-user-id', goal_id: 'g3', category_id: 'c2', project_id: 'proj-senior-track',
    title: 'Quarterly Architecture Review', completed: false,
    priority: 'urgent', energy: 3, estimated_minutes: 150,
    due_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk6', user_id: 'demo-user-id', goal_id: 'g5', category_id: 'c5', project_id: 'proj-identity-redesign',
    title: 'Update Portfolio Case Studies', completed: false,
    priority: 'high', energy: 3, estimated_minutes: 180,
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk7', user_id: 'demo-user-id', goal_id: 'g3', category_id: 'c2', project_id: 'proj-senior-track',
    title: 'Deep Work: Design Tokens Refactor', completed: true,
    priority: 'normal', energy: 1, estimated_minutes: 75,
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tk8', user_id: 'demo-user-id', goal_id: null, category_id: 'c6', project_id: null,
    title: 'Book weekend hiking trip', completed: false,
    priority: 'low', energy: 1, estimated_minutes: 15,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
