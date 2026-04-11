import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SquaresFour, BookOpen, ChartDonut, CheckSquare, Target, Kanban, Timer, CaretDown, Gear, SignOut, UserCircle, Files } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { Popover, PopoverTrigger, PopoverContent, PopoverBody } from '../ui/popover'

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

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const navRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const check = () => setCanScrollDown(el.scrollHeight > el.clientHeight + el.scrollTop + 2)
    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-[15px] text-base tracking-tight transition-all duration-200 cursor-pointer',
      isActive
        ? 'bg-[#F0F3F3] text-[#0C1629] font-bold'
        : 'text-[#727A84] hover:bg-[#0C1629]/[0.03] font-semibold'
    )

  return (
    <aside className="hidden md:flex shrink-0 flex-col h-screen bg-background border-r border-sidebar-border py-8 px-4 sticky top-0 z-50" style={{ width: 'var(--sidebar-width)' }}>
      {/* Logo */}
      <div className="mb-10 px-4">
        <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-12 w-auto" />
      </div>

      {/* Nav items — hidden scrollbar, arrow indicator shows when overflowing */}
      <div ref={navRef} className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
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
          <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider px-4 pt-6 pb-2 block">
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
          <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider px-4 pt-6 pb-2 block">
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
      </div>

      {/* Faint scroll-down indicator */}
      <div className={cn('flex justify-center py-3 transition-opacity duration-200 pointer-events-none', canScrollDown ? 'opacity-100' : 'opacity-0')}>
        <CaretDown size={14} className="text-[#B5C1C8]" />
      </div>

      {/* Bottom bar: settings popover + sign out */}
      <div className="pt-3 border-t border-[#F0F3F3] flex items-center gap-2 px-1">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[#727A84] hover:bg-[#F0F3F3] transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Gear size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className="w-52">
            <PopoverBody className="space-y-0.5 py-1">
              <button
                onClick={() => navigate('/account')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer rounded-[10px]"
              >
                <UserCircle size={14} className="text-[#727A84]" /> Account
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer rounded-[10px]"
              >
                <Gear size={14} className="text-[#727A84]" /> Settings
              </button>
              <button
                onClick={() => navigate('/docs')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer rounded-[10px]"
              >
                <Files size={14} className="text-[#727A84]" /> Docs
              </button>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[#727A84] hover:bg-[#9f403d]/10 hover:text-[#9f403d] transition-colors cursor-pointer"
          aria-label="Sign Out"
        >
          <SignOut size={18} />
        </button>
      </div>
    </aside>
  )
}
