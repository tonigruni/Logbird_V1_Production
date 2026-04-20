import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SquaresFour, BookOpen, ChartDonut, CheckSquare, Target, Kanban, Timer, Flame, CaretDown, SidebarSimple, Gear, SignOut, UserCircle, Files, SunHorizon, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { useCheckin } from '../../context/CheckinContext'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverBody, PopoverFooter } from '../ui/popover'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { UpdateCard } from '../UpdateCard'

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
  { to: '/habits', icon: Flame, label: 'Habits' },
  { to: '/projects', icon: Kanban, label: 'Projects' },
  { to: '/timeboxing', icon: Timer, label: 'Timeboxing' },
]

export default function Sidebar() {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuthStore()
  const { openCheckin } = useCheckin()
  const navRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')

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
      'flex items-center gap-2.5 py-2 rounded-[11px] text-sm tracking-tight transition-all duration-200 cursor-pointer mx-1',
      collapsed ? 'justify-center px-2' : 'px-3',
      isActive
        ? 'bg-white text-[#1F3649] font-semibold shadow-[0_1px_4px_rgba(12,22,41,0.14),0_0_0_1px_rgba(12,22,41,0.09)]'
        : 'text-[#586062] hover:bg-[#1F3649]/[0.04] font-medium'
    )

  const userName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'My Account'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside
      className={cn(
        'hidden md:flex shrink-0 flex-col h-screen bg-background border-r border-sidebar-border pb-0 sticky top-0 z-50 transition-all duration-[180ms]',
        isTauri ? 'pt-[52px]' : 'pt-5',
        collapsed ? 'px-2' : 'px-3'
      )}
      style={{ width: collapsed ? '60px' : 'var(--sidebar-width)' }}
    >
      {/* Top row: logo + nav controls */}
      <div
        className={cn('flex items-center mb-4', collapsed ? 'justify-center' : 'justify-between px-1')}
        data-tauri-drag-region
      >
        {!collapsed && (
          <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-8 w-auto" />
        )}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#adb3b4] hover:text-[#586062] hover:bg-[#f2f4f4] transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <SidebarSimple size={15} />
          </button>
        </div>
      </div>

      {/* Nav items — scrollable */}
      <div ref={navRef} className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        {/* Daily Check-in */}
        <div className="mb-2 mx-1">
          <button
            onClick={openCheckin}
            className={cn(
              'w-full flex items-center gap-2.5 py-2 rounded-[11px] text-sm tracking-tight transition-all duration-200 cursor-pointer text-[#586062] hover:bg-[#1F3649]/[0.04] font-medium',
              collapsed ? 'justify-center px-2' : 'px-3'
            )}
            title={collapsed ? 'Daily Check-in' : undefined}
          >
            <SunHorizon size={18} weight="regular" className="shrink-0" />
            {!collapsed && 'Daily Check-in'}
          </button>
        </div>

        <div className="space-y-0.5">
          {topNav.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} end={to === '/'} className={() => linkClass({ isActive: active })} title={collapsed ? label : undefined}>
                <Icon size={18} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                {!collapsed && label}
              </NavLink>
            )
          })}
        </div>

        {/* Reflection section */}
        <div>
          {!collapsed ? (
            <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-3 pt-5 pb-1 block">
              Reflection
            </span>
          ) : (
            <div className="pt-4 mb-1 border-t border-[#f2f4f4] mx-1" />
          )}
          <div className="space-y-0.5">
            {reflectionNav.map(({ to, icon: Icon, label, activeFor }) => {
              const active = activeFor
                ? activeFor.some(p => location.pathname.startsWith(p))
                : location.pathname.startsWith(to)
              return (
                <NavLink key={to} to={to} className={() => linkClass({ isActive: active })} title={collapsed ? label : undefined}>
                  <Icon size={18} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                  {!collapsed && label}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Productivity section */}
        <div>
          {!collapsed ? (
            <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-3 pt-5 pb-1 block">
              Productivity
            </span>
          ) : (
            <div className="pt-4 mb-1 border-t border-[#f2f4f4] mx-1" />
          )}
          <div className="space-y-0.5">
            {productivityNav.map(({ to, icon: Icon, label }) => {
              const active = location.pathname.startsWith(to)
              return (
                <NavLink key={to} to={to} className={() => linkClass({ isActive: active })} title={collapsed ? label : undefined}>
                  <Icon size={18} weight={active ? 'bold' : 'regular'} className="shrink-0" />
                  {!collapsed && label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={cn('flex justify-center py-2 transition-opacity duration-200 pointer-events-none', canScrollDown ? 'opacity-100' : 'opacity-0')}>
        <CaretDown size={13} className="text-[#adb3b4]" />
      </div>



{/* Update card — desktop only, hidden when collapsed */}
      {!collapsed && <UpdateCard />}

      {/* Profile row */}
      <div className="border-t border-[#f2f4f4] pt-2 pb-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-2 rounded-[11px] text-[#586062] hover:bg-[#f2f4f4] transition-colors cursor-pointer',
                collapsed ? 'justify-center p-1.5' : 'px-2 py-1.5'
              )}
              aria-label="Account"
            >
              <div className="w-7 h-7 rounded-full bg-[#1F3649] flex items-center justify-center shrink-0 text-white text-xs font-semibold">
                {userInitial}
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold truncate text-[#1F3649]">
                  {userName}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className="w-60">
            <PopoverHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-[#1F3649] text-white text-sm font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <PopoverTitle className="truncate">{userName}</PopoverTitle>
                  <PopoverDescription className="truncate">{user?.email}</PopoverDescription>
                </div>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-0.5">
              <button
                onClick={() => navigate('/account')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#1F3649] hover:bg-[#f2f4f4] transition-colors cursor-pointer"
                style={{ borderRadius: 10 }}
              >
                <UserCircle size={14} className="text-[#5a6061]" /> View Profile
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#1F3649] hover:bg-[#f2f4f4] transition-colors cursor-pointer"
                style={{ borderRadius: 10 }}
              >
                <Gear size={14} className="text-[#5a6061]" /> Settings
              </button>
              <button
                onClick={() => navigate('/docs')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#1F3649] hover:bg-[#f2f4f4] transition-colors cursor-pointer"
                style={{ borderRadius: 10 }}
              >
                <Files size={14} className="text-[#5a6061]" /> Docs
              </button>
            </PopoverBody>
            <PopoverFooter>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#5a6061] hover:text-[#1F3649] hover:bg-[#f2f4f4] border border-[#f2f4f4] transition-colors cursor-pointer"
                style={{ borderRadius: 10 }}
              >
                <SignOut size={13} /> Sign Out
              </button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
