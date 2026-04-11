import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import { DEMO_MODE, DEMO_USER } from './lib/demo'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import WheelOfLife from './pages/WheelOfLife'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Analysis from './pages/Analysis'
import Insights from './pages/Insights'
import ProjectsOverview from './pages/ProjectsOverview'
import ProjectCreate from './pages/ProjectCreate'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import TaskEdit from './pages/TaskEdit'
import Goals from './pages/Goals'
import GoalDetailPage from './pages/GoalDetailPage'
import Timeboxing from './pages/Timeboxing'
import Docs from './pages/Docs'

export default function App() {
  const { setSession, setLoading, setUser, loadProfile } = useAuthStore()

  useEffect(() => {
    if (DEMO_MODE) {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If user chose not to stay signed in, sign them out when the browser is reopened
      if (session && localStorage.getItem('logbird_keep_signed_in') === 'false') {
        if (!sessionStorage.getItem('logbird_session_active')) {
          supabase.auth.signOut()
          setLoading(false)
          return
        }
      }
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="wheel" element={<WheelOfLife />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="insights" element={<Insights />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskEdit />} />
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:id" element={<GoalDetailPage />} />
          <Route path="timeboxing" element={<Timeboxing />} />
          <Route path="projects" element={<ProjectsOverview />} />
          <Route path="projects/new" element={<ProjectCreate />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="docs" element={<Docs />} />
          <Route path="account" element={<Account />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
