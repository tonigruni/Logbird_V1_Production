import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { SquaresFour, BookOpen, ChartDonut, CheckSquare, Target, Kanban, Timer, UserCircle, Gear, SignOut } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

const topNav = [
  { to: '/', icon: SquaresFour, label: 'Dashboard' },
]

const reflectionNav = [
  { to: '/journal', icon: BookOpen, label: 'Journal', activeFor: ['/journal', '/insights'] },
  { to: '/wheel', icon: ChartDonut, label: 'Wheel of Life' },
]

const productivityNav = [
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/projects', icon: Kanban, label: 'Projects' },
  { to: '/timeboxing', icon: Timer, label: 'Timeboxing' },
]

const bottomNav = [
  { to: '/account', icon: UserCircle, label: 'Account' },
  { to: '/settings', icon: Gear, label: 'Settings' },
]

export default function Sidebar() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-[15px] text-base tracking-tight transition-all duration-200 cursor-pointer',
      isActive
        ? 'bg-[#ECEFF2] text-[#1F3649] font-bold'
        : 'text-[#586062] hover:bg-[#1F3649]/[0.03] font-semibold'
    )

  return (
    <aside className="hidden md:flex shrink-0 flex-col h-screen bg-background border-r border-sidebar-border py-8 px-4 sticky top-0 z-50" style={{ width: 'var(--sidebar-width)' }}>
      {/* Logo */}
      <div className="mb-10 px-4">
        <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-12 w-auto" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {topNav.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} end={to === '/'} className={() => linkClass({ isActive: active })}>
                <Icon size={20} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                {label}
              </NavLink>
            )
          })}
        </div>

        {/* Reflection section */}
        <div>
          <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-4 pt-6 pb-2 block">
            Reflection
          </span>
          <div className="space-y-1">
            {reflectionNav.map(({ to, icon: Icon, label, activeFor }) => {
              const active = activeFor
                ? activeFor.some(p => location.pathname.startsWith(p))
                : location.pathname.startsWith(to)
              return (
                <NavLink key={to} to={to} className={() => linkClass({ isActive: active })}>
                  <Icon size={20} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                  {label}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Productivity section */}
        <div>
          <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-4 pt-6 pb-2 block">
            Productivity
          </span>
          <div className="space-y-1">
            {productivityNav.map(({ to, icon: Icon, label }) => {
              const active = location.pathname.startsWith(to)
              return (
                <NavLink key={to} to={to} className={() => linkClass({ isActive: active })}>
                  <Icon size={20} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                  {label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-1">
        {bottomNav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className={() => linkClass({ isActive: active })}>
              <Icon size={20} weight={active ? 'bold' : 'regular'} className="shrink-0" />
              {label}
            </NavLink>
          )
        })}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[15px] text-sm font-medium text-[#586062] hover:bg-[#9f403d]/10 hover:text-[#9f403d] transition-all duration-200 cursor-pointer"
        >
          <SignOut size={20} weight="regular" className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
